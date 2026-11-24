import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Store } from '../data';
import { OwlLogo } from './Art';
import { ScalePress } from './Motion';
import { ThemeMode } from '../styles';

export type OrderStatus = 'accepted' | 'pouring' | 'ready';

export interface CartItem {
  key: string;
  name: string;
  subtitle?: string;
  unitPrice: number;
  quantity: number;
}

export interface LocalOrder {
  code: string;
  storeAddress: string;
  pickupTime: string;
  totalPrice: number;
  status: OrderStatus;
}

const STATUS_FLOW: OrderStatus[] = ['accepted', 'pouring', 'ready'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  accepted: 'Принят в работу',
  pouring: 'Разливаем и собираем',
  ready: 'Ждёт вас на кассе',
};

interface Props {
  visible: boolean;
  cart: CartItem[];
  activeOrder: LocalOrder | null;
  selectedStore: Store;
  pickupTime: string;
  totalSum: number;
  themeMode: ThemeMode;
  pulseAnim: Animated.Value;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onChangePickupTime: (t: string) => void;
  onSubmitOrder: () => void;
  onClearOrder: () => void;
}

export function CartModal({
  visible,
  cart,
  activeOrder,
  selectedStore,
  pickupTime,
  totalSum,
  themeMode,
  pulseAnim,
  onClose,
  onUpdateQty,
  onChangePickupTime,
  onSubmitOrder,
  onClearOrder,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const drawerW = isWide ? 440 : width;

  const slideX = useRef(new Animated.Value(drawerW)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    slideX.setValue(drawerW);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, drawerW, backdropOpacity, slideX]);

  const isDark = themeMode === 'dark';
  const panelBg = isDark ? '#1D1815' : '#F6F1EA';
  const cardBg = isDark ? '#27201B' : '#FFFFFF';
  const mainText = isDark ? '#FFFFFF' : '#1E1C1A';
  const subText = isDark ? '#CFC7BD' : '#565049';
  const mutedText = isDark ? '#9B9186' : '#8A8176';
  const lineCol = isDark ? 'rgba(207, 160, 82, 0.24)' : 'rgba(25, 24, 22, 0.12)';

  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={st.overlay}>
        <Animated.View style={[st.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            st.drawer,
            {
              width: drawerW,
              backgroundColor: panelBg,
              borderLeftWidth: isWide ? 1 : 0,
              borderLeftColor: lineCol,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {/* Шапка корзины */}
            <View style={[st.header, { borderBottomColor: lineCol }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <OwlLogo size={26} />
                <View>
                  <Text style={st.kicker}>ЗОЛОТАЯ СОВА • 1972</Text>
                  <Text style={[st.headerTitle, { color: mainText }]}>
                    {activeOrder ? 'ТАЛОН САМОВЫВОЗА' : 'КОРЗИНА САМОВЫВОЗА'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={[st.closeSquare, { borderColor: lineCol }]} onPress={onClose}>
                <Text style={[st.closeText, { color: mainText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {activeOrder ? (
              <ScrollView contentContainerStyle={st.bodyPad} showsVerticalScrollIndicator={false}>
                <View style={[st.ticketCard, { backgroundColor: cardBg, borderColor: '#CFA052' }]}>
                  <Text style={st.kicker}>НОМЕР БРОНИ</Text>
                  <Text style={[st.orderCode, { color: mainText }]}>{activeOrder.code}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Animated.View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: activeOrder.status === 'ready' ? '#1E7A4B' : '#CFA052',
                        marginRight: 8,
                        opacity: pulseAnim,
                      }}
                    />
                    <Text style={[st.statusLabel, { color: '#CFA052' }]}>
                      {STATUS_LABELS[activeOrder.status].toUpperCase()}
                    </Text>
                  </View>

                  <View style={st.stepsRow}>
                    {STATUS_FLOW.map((step, idx) => (
                      <View
                        key={step}
                        style={[
                          st.stepSeg,
                          { backgroundColor: lineCol },
                          idx <= STATUS_FLOW.indexOf(activeOrder.status) && { backgroundColor: '#CFA052' },
                        ]}
                      />
                    ))}
                  </View>

                  <View style={st.qrFrame}>
                    <QRCode value={activeOrder.code} size={168} />
                  </View>

                  <View style={[st.infoDivider, { borderTopColor: lineCol }]}>
                    <View style={st.infoRow}>
                      <Text style={[st.infoKey, { color: mutedText }]}>Точка выдачи</Text>
                      <Text style={[st.infoVal, { color: mainText }]}>{activeOrder.storeAddress}</Text>
                    </View>
                    <View style={st.infoRow}>
                      <Text style={[st.infoKey, { color: mutedText }]}>Время готовности</Text>
                      <Text style={[st.infoVal, { color: mainText }]}>{activeOrder.pickupTime}</Text>
                    </View>
                    <View style={st.infoRow}>
                      <Text style={[st.infoKey, { color: mutedText }]}>К оплате на кассе (18+)</Text>
                      <Text style={[st.infoVal, { color: '#CFA052', fontFamily: 'Oswald_600SemiBold', fontSize: 16 }]}>
                        {activeOrder.totalPrice} ₽
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={st.actionsRow}>
                  <TouchableOpacity style={[st.outlineBtn, { borderColor: lineCol }]} onPress={onClose}>
                    <Text style={[st.outlineBtnText, { color: mainText }]}>СКРЫТЬ</Text>
                  </TouchableOpacity>
                  {activeOrder.status === 'ready' ? (
                    <TouchableOpacity style={st.goldBtn} onPress={onClearOrder}>
                      <Text style={st.goldBtnText}>ЗАБРАЛ ЗАКАЗ</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[st.outlineBtn, { flex: 1, borderColor: '#B32624', alignItems: 'center' }]}
                      onPress={onClearOrder}
                    >
                      <Text style={[st.outlineBtnText, { color: '#D94340' }]}>ОТМЕНИТЬ БРОНЬ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : (
              <>
                <ScrollView contentContainerStyle={st.bodyPad} showsVerticalScrollIndicator={false}>
                  {/* Выбранный магазин */}
                  <View style={[st.storeBox, { backgroundColor: cardBg, borderColor: lineCol }]}>
                    <Text style={st.kicker}>ТОЧКА САМОВЫВОЗА • КЕМЕРОВО</Text>
                    <Text style={[st.storeName, { color: mainText }]}>{selectedStore.name}</Text>
                    <Text style={[st.storeAddr, { color: subText }]}>
                      {selectedStore.address} • {selectedStore.work_hours}
                    </Text>
                  </View>

                  {/* Список товаров */}
                  {cart.length === 0 ? (
                    <View style={st.emptyWrap}>
                      <Text style={[st.emptyTitle, { color: mainText }]}>Корзина пока пуста</Text>
                      <Text style={[st.emptySub, { color: mutedText }]}>
                        Выберите напитки или закуски в каталоге, чтобы забронировать самовывоз без очереди.
                      </Text>
                    </View>
                  ) : (
                    <View style={{ marginTop: 18 }}>
                      <Text style={[st.sectionLabel, { color: mutedText }]}>
                        СОСТАВ ЗАКАЗА ({totalCount})
                      </Text>

                      {cart.map((item) => (
                        <View
                          key={item.key}
                          style={[st.cartCard, { backgroundColor: cardBg, borderColor: lineCol }]}
                        >
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[st.itemName, { color: mainText }]}>{item.name.toUpperCase()}</Text>
                            {!!item.subtitle && (
                              <Text style={[st.itemSub, { color: '#CFA052' }]}>{item.subtitle}</Text>
                            )}
                            <Text style={[st.itemPrice, { color: subText }]}>
                              {item.unitPrice} ₽ × {item.quantity} ={' '}
                              <Text style={{ color: mainText, fontWeight: '700' }}>
                                {item.unitPrice * item.quantity} ₽
                              </Text>
                            </Text>
                          </View>

                          <View style={st.qtyBox}>
                            <TouchableOpacity
                              style={[st.qtyBtn, { borderColor: lineCol }]}
                              onPress={() => onUpdateQty(item.key, -1)}
                            >
                              <Text style={[st.qtySign, { color: mainText }]}>−</Text>
                            </TouchableOpacity>
                            <Text style={[st.qtyNum, { color: mainText }]}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={[st.qtyBtn, { borderColor: '#CFA052' }]}
                              onPress={() => onUpdateQty(item.key, 1)}
                            >
                              <Text style={[st.qtySign, { color: '#CFA052' }]}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                      {/* Выбор времени самовывоза */}
                      <Text style={[st.sectionLabel, { color: mutedText, marginTop: 22 }]}>
                        КОГДА ЗАБЕРЁТЕ ЗАКАЗ
                      </Text>
                      <View style={st.timeRow}>
                        {['Через 15 минут', 'Через 30 минут', 'Через 1 час'].map((opt) => {
                          const active = pickupTime === opt;
                          return (
                            <TouchableOpacity
                              key={opt}
                              style={[
                                st.timeChip,
                                { borderColor: active ? '#CFA052' : lineCol, backgroundColor: cardBg },
                                active && { backgroundColor: '#CFA052' },
                              ]}
                              onPress={() => onChangePickupTime(opt)}
                            >
                              <Text style={[st.timeChipText, { color: active ? '#191816' : mainText }]}>
                                {opt.replace('Через ', '')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Нижний итог и кнопка бронирования */}
                <View style={[st.footer, { borderTopColor: lineCol, backgroundColor: panelBg }]}>
                  <View style={st.totalRow}>
                    <Text style={[st.totalLabel, { color: mutedText }]}>ИТОГО К ОПЛАТЕ НА КАССЕ</Text>
                    <Text style={[st.totalVal, { color: mainText }]}>{totalSum} ₽</Text>
                  </View>
                  <Text style={[st.legalText, { color: mutedText }]}>
                    Оплата и выдача алкогольной продукции строго на кассе по паспорту (18+).
                  </Text>
                  <View style={st.actionsRow}>
                    <TouchableOpacity style={[st.outlineBtn, { borderColor: lineCol }]} onPress={onClose}>
                      <Text style={[st.outlineBtnText, { color: mainText }]}>ЗАКРЫТЬ</Text>
                    </TouchableOpacity>
                    <ScalePress
                      style={{ flex: 1 }}
                      onPress={() => {
                        if (cart.length > 0) onSubmitOrder();
                      }}
                    >
                      <View style={[st.goldBtn, cart.length === 0 && { opacity: 0.45 }]}>
                        <Text style={st.goldBtnText}>ЗАБРОНИРОВАТЬ • {totalSum} ₽</Text>
                      </View>
                    </ScalePress>
                  </View>
                </View>
              </>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10, 9, 8, 0.72)' },
  drawer: { height: '100%' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  kicker: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#CFA052', letterSpacing: 1.5 },
  headerTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 18, letterSpacing: 0.8, marginTop: 1 },
  closeSquare: {
    width: 34,
    height: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { fontSize: 15 },

  bodyPad: { padding: 20, paddingBottom: 32 },
  storeBox: {
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#CFA052',
  },
  storeName: { fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 4 },
  storeAddr: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },

  sectionLabel: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.4, marginBottom: 10 },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemName: { fontFamily: 'Oswald_500Medium', fontSize: 14, letterSpacing: 0.5 },
  itemSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  itemPrice: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },

  qtyBox: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtySign: { fontSize: 16, fontWeight: '600' },
  qtyNum: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, marginHorizontal: 10 },

  timeRow: { flexDirection: 'row', gap: 8 },
  timeChip: { flex: 1, borderWidth: 1, paddingVertical: 11, alignItems: 'center' },
  timeChipText: { fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 0.6 },

  emptyWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 18, letterSpacing: 0.6 },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },

  ticketCard: {
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 18,
  },
  orderCode: { fontFamily: 'Oswald_600SemiBold', fontSize: 32, letterSpacing: 2, marginTop: 4 },
  statusLabel: { fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1.2 },
  stepsRow: { flexDirection: 'row', gap: 6, width: '100%', marginTop: 14 },
  stepSeg: { flex: 1, height: 3 },
  qrFrame: {
    marginVertical: 20,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CFA052',
  },
  infoDivider: { width: '100%', borderTopWidth: 1, paddingTop: 14, gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  infoKey: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  infoVal: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textAlign: 'right', flex: 1 },

  footer: { padding: 18, borderTopWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  totalLabel: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.2 },
  totalVal: { fontFamily: 'Oswald_600SemiBold', fontSize: 22 },
  legalText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginBottom: 14 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: { borderWidth: 1, paddingVertical: 13, paddingHorizontal: 16, justifyContent: 'center' },
  outlineBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, letterSpacing: 0.8 },
  goldBtn: { flex: 1, backgroundColor: '#CFA052', paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  goldBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#191816', letterSpacing: 1 },
});
