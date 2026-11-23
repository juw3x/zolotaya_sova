import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="Zolotaya Sova API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)

class OrderItemIn(BaseModel):
    product_id: int
    volume_liters: float = 0.5
    quantity: int = 1

class OrderCreate(BaseModel):
    store_id: int
    pickup_time: str
    items: List[OrderItemIn]

class StatusUpdate(BaseModel):
    status: str

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/stores")
def list_stores():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM stores ORDER BY id")
        return cur.fetchall()

@app.get("/api/catalog")
def get_catalog(store_id: Optional[int] = 1):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM categories ORDER BY sort_order")
        categories = cur.fetchall()
        cur.execute("""
            SELECT p.*, COALESCE(si.in_stock, TRUE) AS in_stock
            FROM products p
            LEFT JOIN store_inventory si
              ON si.product_id = p.id AND si.store_id = %s
            ORDER BY p.category_id, p.id
        """, (store_id,))
        products = cur.fetchall()
    by_cat = {}
    for p in products:
        by_cat.setdefault(p["category_id"], []).append(p)
    return [
        {**c, "products": by_cat.get(c["id"], [])}
        for c in categories
    ]

@app.get("/api/wheel")
def wheel_recommend(mood: str, store_id: Optional[int] = 1):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("""
            SELECT p.*
            FROM products p
            JOIN store_inventory si ON si.product_id = p.id AND si.store_id = %s
            WHERE si.in_stock = TRUE AND %s = ANY(p.mood_tags)
            ORDER BY RANDOM()
            LIMIT 4
        """, (store_id, mood))
        return cur.fetchall()

@app.post("/api/orders")
def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Корзина пуста")
    code = f"SOVA-{random.randint(1000, 9999)}"
    with get_conn() as conn, conn.cursor() as cur:
        total = 0
        resolved = []
        for item in payload.items:
            cur.execute("SELECT id, base_price, is_draft FROM products WHERE id = %s", (item.product_id,))
            prod = cur.fetchone()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Товар {item.product_id} не найден")
            unit_price = round(prod["base_price"] * item.volume_liters) if prod["is_draft"] else prod["base_price"]
            total += unit_price * item.quantity
            resolved.append((item.product_id, item.volume_liters, item.quantity, unit_price))

        cur.execute("""
            INSERT INTO orders (order_code, store_id, pickup_time, total_price)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (code, payload.store_id, payload.pickup_time, total))
        order = cur.fetchone()

        for pid, vol, qty, price in resolved:
            cur.execute("""
                INSERT INTO order_items (order_id, product_id, volume_liters, quantity, price_per_unit)
                VALUES (%s, %s, %s, %s, %s)
            """, (order["id"], pid, vol, qty, price))
        conn.commit()
    return order

@app.get("/api/orders/{order_code}")
def get_order(order_code: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("""
            SELECT o.*, s.name AS store_name, s.address AS store_address
            FROM orders o
            JOIN stores s ON s.id = o.store_id
            WHERE o.order_code = %s
        """, (order_code,))
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        cur.execute("""
            SELECT oi.*, p.name AS product_name
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = %s
        """, (order["id"],))
        order["items"] = cur.fetchall()
        return order

@app.patch("/api/orders/{order_code}/status")
def update_order_status(order_code: str, body: StatusUpdate):
    allowed = {"accepted", "pouring", "ready", "completed", "cancelled"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail="Недопустимый статус")
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "UPDATE orders SET status = %s WHERE order_code = %s RETURNING *",
            (body.status, order_code)
        )
        updated = cur.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        conn.commit()
        return updated
