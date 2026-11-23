CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    store_type VARCHAR(20) NOT NULL CHECK (store_type IN ('shop', 'department')),
    city VARCHAR(60) NOT NULL DEFAULT 'Кемерово',
    address VARCHAR(200) NOT NULL,
    work_hours VARCHAR(60) NOT NULL DEFAULT '10:00 – 22:00'
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    subtitle VARCHAR(120),
    is_alcohol BOOLEAN NOT NULL DEFAULT TRUE,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    container_type VARCHAR(20) NOT NULL CHECK (container_type IN ('glass', 'pet', 'keg')),
    abv NUMERIC(3,1),
    og NUMERIC(3,1),
    ibu INT,
    base_price INT NOT NULL,
    mood_tags TEXT[] DEFAULT '{}',
    pairing_text VARCHAR(200),
    description TEXT,
    visual_config JSONB NOT NULL
);

CREATE TABLE store_inventory (
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (store_id, product_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(16) UNIQUE NOT NULL,
    store_id INT NOT NULL REFERENCES stores(id),
    status VARCHAR(20) NOT NULL DEFAULT 'accepted'
        CHECK (status IN ('accepted', 'pouring', 'ready', 'completed', 'cancelled')),
    pickup_time VARCHAR(40) NOT NULL,
    total_price INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    volume_liters NUMERIC(3,1) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_per_unit INT NOT NULL
);

-- Магазины и фирменные отделы (Кемерово)
INSERT INTO stores (name, store_type, address) VALUES
('Фирменный магазин «GOLD SOVA»', 'shop', 'Кузнецкий проспект, 80'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'Шахтеров проспект, 68'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'Шахтеров проспект, 74 Б'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'ул. Ю. Двужильного, 10 В'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'ул. Патриотов, 33'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'Комсомольский проспект, 38, 1 этаж'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'ул. Веры Волошиной, 5, Южный м-н'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'ул. Тухачевского, 56 А, корп. 1'),
('Фирменный магазин «GOLD SOVA»', 'shop', 'Молодежный проспект, 7/3'),
('Фирменный отдел «Золотая Сова»', 'department', 'Ягуновский, ул. Панаева, 4'),
('Фирменный отдел «Золотая Сова»', 'department', 'ул. Мичурина, 58'),
('Фирменный отдел «Золотая Сова»', 'department', 'ул. Веры Волошиной, 40, 1 этаж'),
('Фирменный отдел «Золотая Сова»', 'department', 'Московский проспект, 11'),
('Фирменный отдел «Золотая Сова»', 'department', 'ж.р. Лесная Поляна, б-р Кедровый, 14');

-- 10 категорий
INSERT INTO categories (slug, name, sort_order) VALUES
('beer-05', 'Пиво 0,5 л', 1),
('beer-pet-15', 'Пиво ПЭТ 1,5 л', 2),
('beer-draft', 'Пиво разливное', 3),
('lemonade-05', 'Лимонады 0,5 л', 4),
('lemonade-pet-10', 'Лимонады ПЭТ 1,0 л', 5),
('lemonade-pet-15', 'Лимонады ПЭТ 1,5 л', 6),
('lemonade-draft', 'Лимонады разливные', 7),
('kvass-15', 'Квас 1,5 л', 8),
('kvass-draft', 'Квас разливной', 9),
('water-15', 'Вода 1,5 л', 10);

-- Базовый каталог продукции
INSERT INTO products (category_id, name, subtitle, is_alcohol, is_draft, container_type, abv, og, ibu, base_price, mood_tags, pairing_text, description, visual_config) VALUES
-- Пиво 0,5 л
(1, 'Московское Барное №80', 'Столичный лагер', TRUE, FALSE, 'glass', 4.0, 11.0, 14, 95, ARRAY['football','light'], 'Солёный арахис или сырные палочки', 'Мягкий светлый лагер с чистым солодовым вкусом и лёгкой хмелевой нотой.', '{"top":"#E8E2D6","bottom":"#9C4A1A","bottle":"#5C2C0C"}'),
(1, 'Лагер №40', 'Чешский лагер', TRUE, FALSE, 'glass', 4.0, 11.0, 18, 95, ARRAY['bitter','fish'], 'Вяленая вобла или сухарики с чесноком', 'Классический чешский лежак с благородной горчинкой.', '{"top":"#E8E2D6","bottom":"#222428","bottle":"#5C2C0C"}'),
(1, 'Чешское Классическое №49', 'Чешский лагер', TRUE, FALSE, 'glass', 4.5, 12.0, 22, 100, ARRAY['bitter','meat'], 'Копчёные колбаски к пиву', 'Насыщенный хмелевой профиль по чешской технологии.', '{"top":"#B32624","bottom":"#1D4732","bottle":"#5C2C0C"}'),
(1, 'Баварское №21', 'Солодовый лагер', TRUE, FALSE, 'glass', 4.5, 12.0, 15, 100, ARRAY['meat','football'], 'Баварские сосиски и горчица', 'Бархатистый солодовый вкус с карамельным оттенком.', '{"top":"#B32624","bottom":"#D4A12A","bottle":"#5C2C0C"}'),
(1, 'Брюнн №02', 'Венский лагер', TRUE, FALSE, 'glass', 4.5, 12.0, 17, 105, ARRAY['meat','bitter'], 'Копчёный сыр косичка', 'Австрийский стиль с тёплым янтарным тоном и мягким хмелем.', '{"top":"#1B5A96","bottom":"#143154","bottle":"#5C2C0C"}'),
(1, 'Колос Сибири №79', 'Солодовый лагер', TRUE, FALSE, 'glass', 4.0, 11.0, 13, 90, ARRAY['light','fish'], 'Сушёный кальмар или жёлтый полосатик', 'Лёгкий и освежающий солодовый сорт на каждый вечер.', '{"top":"#E8E2D6","bottom":"#D9B832","bottle":"#5C2C0C"}'),
(1, 'Тёмное №23', 'Тёмный лагер', TRUE, FALSE, 'glass', 4.2, 12.0, 16, 105, ARRAY['dark','meat'], 'Вяленая говядина (джерки)', 'Сварено на натуральном карамельном солоде без красителей.', '{"top":"#593420","bottom":"#1A1817","bottle":"#3D1D08"}'),
(1, 'Жигулёвское №72', 'Венский лагер', TRUE, FALSE, 'glass', 4.0, 11.0, 15, 90, ARRAY['football','fish'], 'Астраханская вобла или фисташки', 'Городская легенда с 1972 года.', '{"top":"#E8E2D6","bottom":"#1D446E","bottle":"#5C2C0C"}'),
(1, 'СССР №15', 'Советский лагер', TRUE, FALSE, 'glass', 4.0, 11.0, 14, 95, ARRAY['light','football'], 'Гренки бородинские с чесноком', 'Ностальгический чистый вкус классического лагера.', '{"top":"#E8E2D6","bottom":"#B82925","bottle":"#5C2C0C"}'),

-- Пиво ПЭТ 1,5 л
(2, 'Злата Прага №93', 'Солодовый лагер', TRUE, FALSE, 'pet', 4.0, 11.0, 16, 215, ARRAY['football','light'], 'Чипсы картофельные или арахис', 'Ароматный лагер для компании в удобной таре 1,5 л.', '{"top":"#C92A2A","bottom":"#1D446E","bottle":"#4A2309"}'),
(2, 'Жигулёвское №72', 'Легендарный лагер', TRUE, FALSE, 'pet', 4.0, 11.0, 15, 205, ARRAY['football','fish'], 'Вяленый лещ или сухарики', 'Классика кемеровского завода в формате 1,5 л.', '{"top":"#F2EFE9","bottom":"#1D446E","bottle":"#4A2309"}'),
(2, 'Лагер №40', 'Чешский лагер', TRUE, FALSE, 'pet', 4.0, 11.0, 18, 215, ARRAY['bitter','fish'], 'Копчёный сыр и сушёная рыбка', 'Свежий чешский лагер с ровной горчинкой.', '{"top":"#F2EFE9","bottom":"#222428","bottle":"#4A2309"}'),
(2, 'Московское Барное №80', 'Столичный лагер', TRUE, FALSE, 'pet', 4.0, 11.0, 14, 210, ARRAY['light','football'], 'Солёные крендельки', 'Мягкий питкий лагер в ПЭТ 1,5 л.', '{"top":"#F2EFE9","bottom":"#A35224","bottle":"#4A2309"}'),
(2, 'Баварское №21', 'Солодовый лагер', TRUE, FALSE, 'pet', 4.5, 12.0, 15, 220, ARRAY['meat','football'], 'Охотничьи колбаски', 'Насыщенный солодовый вкус.', '{"top":"#C92A2A","bottom":"#E0B528","bottle":"#4A2309"}'),
(2, 'Колос Сибири №79', 'Солодовый лагер', TRUE, FALSE, 'pet', 4.0, 11.0, 13, 200, ARRAY['light','fish'], 'Стружка кальмара', 'Лёгкий сибирский лагер.', '{"top":"#F2EFE9","bottom":"#E6C92A","bottle":"#4A2309"}'),

-- Пиво разливное (цена указана за 1.0 л)
(3, 'Гурмэ разливное', 'Солодовый лагер', TRUE, TRUE, 'keg', 4.8, 14.0, 20, 175, ARRAY['dark','meat'], 'Стейк или вяленое мясо', 'Плотный насыщенный лагер с богатым послевкусием.', '{"top":"#C4C7CC","bottom":"#4D120F"}'),
(3, 'Колос Сибири разливное №79', 'Солодовый лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 13, 145, ARRAY['light','fish'], 'Жёлтый полосатик', 'Свежее разливное прямо с завода.', '{"top":"#C4C7CC","bottom":"#C4A71E"}'),
(3, 'Брюнн разливное №02', 'Венский лагер', TRUE, TRUE, 'keg', 4.5, 12.0, 17, 165, ARRAY['meat','bitter'], 'Копчёный сыр чечил', 'Австрийский лагер с выраженным солодом.', '{"top":"#1B5A96","bottom":"#122E52"}'),
(3, 'Тёмное разливное №23', 'Тёмный лагер', TRUE, TRUE, 'keg', 4.2, 12.0, 16, 165, ARRAY['dark','meat'], 'Джерки из говядины', 'Карамельный тёмный лагер на кране.', '{"top":"#6B391C","bottom":"#1A1A1A"}'),
(3, 'Баварское разливное №21', 'Солодовый лагер', TRUE, TRUE, 'keg', 4.5, 12.0, 15, 160, ARRAY['meat','football'], 'Гренки с соусом тартар', 'Плотное солодовое разливное.', '{"top":"#A81E1E","bottom":"#C99D22"}'),
(3, 'Злата Прага разливное №93', 'Солодовый лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 16, 155, ARRAY['football','light'], 'Фисташки жареные', 'Пражский лагер на розлив.', '{"top":"#A81E1E","bottom":"#1A3B63"}'),
(3, 'Чешское Классическое №49', 'Чешский лагер', TRUE, TRUE, 'keg', 4.5, 12.0, 22, 165, ARRAY['bitter','fish'], 'Вяленая корюшка', 'Классическая хмелевая горчинка.', '{"top":"#A81E1E","bottom":"#163D2B"}'),
(3, 'Московское Барное №80', 'Столичный лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 14, 150, ARRAY['light','football'], 'Арахис солёный', 'Лёгкое свежее барное.', '{"top":"#C4C7CC","bottom":"#7D3B18"}'),
(3, 'Лагер разливное №40', 'Чешский лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 18, 155, ARRAY['bitter','football'], 'Сухарики ржаные', 'Чешский лагер с крана.', '{"top":"#C4C7CC","bottom":"#1F2124"}'),
(3, 'Голд Сова разливное', 'Солодовый лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 15, 160, ARRAY['light','meat'], 'Сырные шарики', 'Фирменный сорт сети GOLD SOVA.', '{"top":"#C4C7CC","bottom":"#183622"}'),
(3, 'Жигулёвское разливное №72', 'Легендарный лагер', TRUE, TRUE, 'keg', 4.0, 11.0, 15, 145, ARRAY['football','fish'], 'Вобла астраханская', 'Тот самый вкус на розлив.', '{"top":"#C4C7CC","bottom":"#18365C"}'),

-- Безалкогольные (Лимонады, Квас, Вода)
(4, 'Кола', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 75, ARRAY['nonalc'], 'Бургер или картофель фри', 'Классическая освежающая кола.', '{"top":"#1B5A96","bottom":"#123A66","bottle":"#2A1205"}'),
(4, 'Тархун', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 75, ARRAY['nonalc'], 'Лёгкие снеки', 'Насыщенный вкус эстрагона.', '{"top":"#4CA844","bottom":"#1F6E2C","bottle":"#228B3B"}'),
(4, 'Лимонад', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 75, ARRAY['nonalc'], 'Сырные палочки', 'Классический лимонад детства.', '{"top":"#46A2D4","bottom":"#1E5594","bottle":"#C9A449"}'),
(4, 'Вкус груши', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 75, ARRAY['nonalc'], 'Фруктовая нарезка', 'Ароматный дюшес.', '{"top":"#D97254","bottom":"#B83525","bottle":"#C96A4B"}'),
(4, 'Манго и Маракуйя', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 80, ARRAY['nonalc'], 'Кукурузные чипсы', 'Тропический освежающий лимонад.', '{"top":"#F2D22E","bottom":"#D98A2B","bottle":"#E6A82E"}'),
(4, 'Мохито', 'Стекло 0,5 л', FALSE, FALSE, 'glass', 0.0, 0.0, 0, 80, ARRAY['nonalc'], 'Лёгкие закуски', 'Лайм и свежая мята.', '{"top":"#C8D93B","bottom":"#257A39","bottle":"#78B87E"}'),
(5, 'Лимонад 1,0 л', 'ПЭТ 1,0 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 95, ARRAY['nonalc'], 'Закуски для компании', 'Классический лимонад в литровой бутылке.', '{"top":"#46A2D4","bottom":"#1E5594","bottle":"#C9A449"}'),
(5, 'Тархун 1,0 л', 'ПЭТ 1,0 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 95, ARRAY['nonalc'], 'Закуски для компании', 'Освежающий тархун 1,0 л.', '{"top":"#4CA844","bottom":"#1F6E2C","bottle":"#228B3B"}'),
(6, 'Кола 1,5 л', 'ПЭТ 1,5 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 115, ARRAY['nonalc'], 'Пицца или снеки', 'Кола для большой компании.', '{"top":"#1B5A96","bottom":"#123A66","bottle":"#2A1205"}'),
(6, 'Сочный апельсин 1,5 л', 'ПЭТ 1,5 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 115, ARRAY['nonalc'], 'Сырные снеки', 'Яркий цитрусовый вкус.', '{"top":"#F5D02A","bottom":"#E06324","bottle":"#F29B1D"}'),
(7, 'Лимонад разливной', 'На розлив', FALSE, TRUE, 'keg', 0.0, 0.0, 0, 95, ARRAY['nonalc'], 'К любым закускам', 'Свежий разливной лимонад из кега.', '{"top":"#46A2D4","bottom":"#1E5594"}'),
(7, 'Мохито разливной', 'На розлив', FALSE, TRUE, 'keg', 0.0, 0.0, 0, 105, ARRAY['nonalc'], 'К лёгким закускам', 'Освежающий мохито с крана.', '{"top":"#C8D93B","bottom":"#257A39"}'),
(8, 'Квас Классический', 'ПЭТ 1,5 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 120, ARRAY['nonalc'], 'Ржаные гренки', 'Натуральный хлебный квас живого брожения.', '{"top":"#F5F2EB","bottom":"#C42323","bottle":"#3D1906"}'),
(9, 'Квас Классический разливной', 'На розлив', FALSE, TRUE, 'keg', 0.0, 0.0, 0, 110, ARRAY['nonalc'], 'Сухарики с чесноком', 'Свежий разливной хлебный квас.', '{"top":"#F5F2EB","bottom":"#C42323"}'),
(10, 'Вода «Алатау»', 'Газированная 1,5 л', FALSE, FALSE, 'pet', 0.0, 0.0, 0, 65, ARRAY['nonalc'], 'Освежает вкус', 'Чистая питьевая газированная вода.', '{"top":"#2354A6","bottom":"#5BA8E0","bottle":"#D4E6F0"}');

-- Заполняем наличие всех товаров во всех 14 точках
INSERT INTO store_inventory (store_id, product_id, in_stock)
SELECT s.id, p.id, TRUE FROM stores s CROSS JOIN products p;
