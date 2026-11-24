export interface Store {
  id: number;
  name: string;
  store_type: 'shop' | 'department';
  address: string;
  work_hours: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  subtitle?: string;
  is_alcohol: boolean;
  is_draft: boolean;
  container_type: 'glass' | 'pet' | 'keg';
  abv: number;
  og: number;
  ibu: number;
  base_price: number;
  mood_tags: string[];
  pairing: { name: string; price: number };
  description: string;
  visual: { top: string; bottom: string; bottle?: string };
}

export interface CategoryBlock {
  id: number;
  name: string;
  products: Product[];
}

export const MOODS = [
  { id: 'football', label: 'ПОД ФУТБОЛ', color: '#CFA052' },
  { id: 'fish', label: 'К РЫБЕ', color: '#2B4C6F' },
  { id: 'bitter', label: 'С ГОРЧИНКОЙ', color: '#1F4B34' },
  { id: 'meat', label: 'К МЯСУ', color: '#8C2F2B' },
  { id: 'light', label: 'ЛЁГКОЕ', color: '#B88435' },
  { id: 'dark', label: 'ТЁМНОЕ', color: '#3D2516' },
];

export const STORES: Store[] = [
  { id: 1, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'Кузнецкий проспект, 80', work_hours: '10:00 – 22:00' },
  { id: 2, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'Шахтеров проспект, 68', work_hours: '10:00 – 22:00' },
  { id: 3, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'Шахтеров проспект, 74 Б', work_hours: '10:00 – 22:00' },
  { id: 4, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'ул. Ю. Двужильного, 10 В', work_hours: '10:00 – 22:00' },
  { id: 5, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'ул. Патриотов, 33', work_hours: '10:00 – 22:00' },
  { id: 6, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'Комсомольский проспект, 38, 1 этаж', work_hours: '10:00 – 22:00' },
  { id: 7, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'ул. Веры Волошиной, 5, Южный м-н', work_hours: '10:00 – 22:00' },
  { id: 8, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'ул. Тухачевского, 56 А, корп. 1', work_hours: '10:00 – 22:00' },
  { id: 9, name: 'Фирменный магазин «GOLD SOVA»', store_type: 'shop', address: 'Молодежный проспект, 7/3', work_hours: '10:00 – 22:00' },
  { id: 10, name: 'Фирменный отдел «Золотая Сова»', store_type: 'department', address: 'Ягуновский, ул. Панаева, 4', work_hours: '10:00 – 21:00' },
  { id: 11, name: 'Фирменный отдел «Золотая Сова»', store_type: 'department', address: 'ул. Мичурина, 58', work_hours: '10:00 – 21:00' },
  { id: 12, name: 'Фирменный отдел «Золотая Сова»', store_type: 'department', address: 'ул. Веры Волошиной, 40, 1 этаж', work_hours: '10:00 – 21:00' },
  { id: 13, name: 'Фирменный отдел «Золотая Сова»', store_type: 'department', address: 'Московский проспект, 11', work_hours: '10:00 – 21:00' },
  { id: 14, name: 'Фирменный отдел «Золотая Сова»', store_type: 'department', address: 'ж.р. Лесная Поляна, б-р Кедровый, 14', work_hours: '10:00 – 22:00' },
];

const CATEGORIES_META = [
  { id: 1, name: 'Пиво 0,5 л' },
  { id: 2, name: 'Пиво ПЭТ 1,5 л' },
  { id: 3, name: 'Пиво разливное 50 л' },
  { id: 4, name: 'Лимонады 0,5 л' },
  { id: 5, name: 'Лимонады ПЭТ 1,0 л' },
  { id: 6, name: 'Лимонады ПЭТ 1,5 л' },
  { id: 7, name: 'Лимонады разливные' },
  { id: 8, name: 'Квас 1,5 л' },
  { id: 9, name: 'Квас разливной' },
  { id: 10, name: 'Вода 1,5 л' },
];

export const PRODUCTS: Product[] = [
  { id: 1, category_id: 1, name: 'Московское Барное №80', subtitle: 'Столичный лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.0, og: 11, ibu: 14, base_price: 95, mood_tags: ['football', 'light'], pairing: { name: 'Арахис жареный солёный', price: 85 }, description: 'Мягкий светлый лагер с чистым солодовым вкусом и лёгкой хмелевой нотой.', visual: { top: '#E8E2D6', bottom: '#9C4A1A', bottle: '#5C2C0C' } },
  { id: 2, category_id: 1, name: 'Лагер №40', subtitle: 'Чешский лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.0, og: 11, ibu: 18, base_price: 95, mood_tags: ['bitter', 'fish'], pairing: { name: 'Вяленая вобла астраханская', price: 190 }, description: 'Классический чешский лежак с благородной хмелевой горчинкой.', visual: { top: '#E8E2D6', bottom: '#222428', bottle: '#5C2C0C' } },
  { id: 3, category_id: 1, name: 'Чешское Классическое №49', subtitle: 'Чешский лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.5, og: 12, ibu: 22, base_price: 100, mood_tags: ['bitter', 'meat'], pairing: { name: 'Охотничьи колбаски копчёные', price: 165 }, description: 'Насыщенный хмелевой профиль, выдержанный 21 день в лагерном отделении.', visual: { top: '#B32624', bottom: '#1D4732', bottle: '#5C2C0C' } },
  { id: 4, category_id: 1, name: 'Баварское №21', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.5, og: 12, ibu: 15, base_price: 100, mood_tags: ['meat', 'football'], pairing: { name: 'Гренки бородинские с чесноком', price: 110 }, description: 'Бархатистый солодовый вкус с лёгким карамельным оттенком.', visual: { top: '#B32624', bottom: '#D4A12A', bottle: '#5C2C0C' } },
  { id: 5, category_id: 1, name: 'Брюнн №02', subtitle: 'Венский лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.5, og: 12, ibu: 17, base_price: 105, mood_tags: ['meat', 'bitter'], pairing: { name: 'Сыр косичка копчёный', price: 140 }, description: 'Австрийский стиль с тёплым янтарным тоном и мягким хмелем.', visual: { top: '#1B5A96', bottom: '#143154', bottle: '#5C2C0C' } },
  { id: 6, category_id: 1, name: 'Колос Сибири №79', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.0, og: 11, ibu: 13, base_price: 90, mood_tags: ['light', 'fish'], pairing: { name: 'Стружка кальмара', price: 130 }, description: 'Лёгкий и освежающий сибирский солодовый лагер на каждый вечер.', visual: { top: '#E8E2D6', bottom: '#D9B832', bottle: '#5C2C0C' } },
  { id: 7, category_id: 1, name: 'Тёмное №23', subtitle: 'Тёмный лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.2, og: 12, ibu: 16, base_price: 105, mood_tags: ['dark', 'meat'], pairing: { name: 'Джерки из говядины', price: 210 }, description: 'Сварено на натуральном карамельном солоде без искусственных красителей.', visual: { top: '#593420', bottom: '#1A1817', bottle: '#3D1D08' } },
  { id: 8, category_id: 1, name: 'Жигулёвское №72', subtitle: 'Венский лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.0, og: 11, ibu: 15, base_price: 90, mood_tags: ['football', 'fish'], pairing: { name: 'Фисташки жареные', price: 180 }, description: 'Городская легенда Кемерова с 1972 года.', visual: { top: '#E8E2D6', bottom: '#1D446E', bottle: '#5C2C0C' } },
  { id: 9, category_id: 1, name: 'СССР №15', subtitle: 'Советский лагер', is_alcohol: true, is_draft: false, container_type: 'glass', abv: 4.0, og: 11, ibu: 14, base_price: 95, mood_tags: ['light', 'football'], pairing: { name: 'Сухарики ржаные с хреном', price: 75 }, description: 'Ностальгический чистый вкус классического лагера.', visual: { top: '#E8E2D6', bottom: '#B82925', bottle: '#5C2C0C' } },

  { id: 10, category_id: 2, name: 'Злата Прага №93', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.0, og: 11, ibu: 16, base_price: 215, mood_tags: ['football', 'light'], pairing: { name: 'Чипсы картофельные', price: 110 }, description: 'Ароматный лагер для компании в удобной таре 1,5 л.', visual: { top: '#C92A2A', bottom: '#1D446E', bottle: '#4A2309' } },
  { id: 11, category_id: 2, name: 'Жигулёвское №72', subtitle: 'Легендарный лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.0, og: 11, ibu: 15, base_price: 205, mood_tags: ['football', 'fish'], pairing: { name: 'Вяленый лещ', price: 220 }, description: 'Классика завода в формате 1,5 л.', visual: { top: '#F2EFE9', bottom: '#1D446E', bottle: '#4A2309' } },
  { id: 12, category_id: 2, name: 'Лагер №40', subtitle: 'Чешский лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.0, og: 11, ibu: 18, base_price: 215, mood_tags: ['bitter', 'fish'], pairing: { name: 'Жёлтый полосатик', price: 145 }, description: 'Свежий чешский лагер с ровной горчинкой.', visual: { top: '#F2EFE9', bottom: '#222428', bottle: '#4A2309' } },
  { id: 13, category_id: 2, name: 'Московское Барное №80', subtitle: 'Столичный лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.0, og: 11, ibu: 14, base_price: 210, mood_tags: ['light', 'football'], pairing: { name: 'Крендельки с солью', price: 90 }, description: 'Мягкий питкий лагер в ПЭТ 1,5 л.', visual: { top: '#F2EFE9', bottom: '#A35224', bottle: '#4A2309' } },
  { id: 14, category_id: 2, name: 'Баварское №21', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.5, og: 12, ibu: 15, base_price: 220, mood_tags: ['meat', 'football'], pairing: { name: 'Колбаски пивчики', price: 170 }, description: 'Насыщенный солодовый вкус.', visual: { top: '#C92A2A', bottom: '#E0B528', bottle: '#4A2309' } },
  { id: 15, category_id: 2, name: 'Колос Сибири №79', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: false, container_type: 'pet', abv: 4.0, og: 11, ibu: 13, base_price: 200, mood_tags: ['light', 'fish'], pairing: { name: 'Кольца кальмара', price: 150 }, description: 'Лёгкий сибирский лагер.', visual: { top: '#F2EFE9', bottom: '#E6C92A', bottle: '#4A2309' } },

  { id: 16, category_id: 3, name: 'Гурмэ разливное', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.8, og: 14, ibu: 20, base_price: 175, mood_tags: ['dark', 'meat'], pairing: { name: 'Вяленая говядина', price: 210 }, description: 'Плотный насыщенный сорт с богатым солодовым послевкусием.', visual: { top: '#C4C7CC', bottom: '#4D120F' } },
  { id: 17, category_id: 3, name: 'Колос Сибири №79', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 13, base_price: 145, mood_tags: ['light', 'fish'], pairing: { name: 'Жёлтый полосатик', price: 145 }, description: 'Свежее разливное прямо с завода в день розлива.', visual: { top: '#C4C7CC', bottom: '#C4A71E' } },
  { id: 18, category_id: 3, name: 'Брюнн №02', subtitle: 'Венский лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.5, og: 12, ibu: 17, base_price: 165, mood_tags: ['meat', 'bitter'], pairing: { name: 'Сыр чечил копчёный', price: 140 }, description: 'Австрийский лагер с выраженным солодом.', visual: { top: '#1B5A96', bottom: '#122E52' } },
  { id: 19, category_id: 3, name: 'Тёмное №23', subtitle: 'Тёмный лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.2, og: 12, ibu: 16, base_price: 165, mood_tags: ['dark', 'meat'], pairing: { name: 'Джерки пряные', price: 210 }, description: 'Карамельный тёмный лагер на кране.', visual: { top: '#6B391C', bottom: '#1A1A1A' } },
  { id: 20, category_id: 3, name: 'Баварское №21', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.5, og: 12, ibu: 15, base_price: 160, mood_tags: ['meat', 'football'], pairing: { name: 'Гренки с чесноком', price: 110 }, description: 'Плотное солодовое разливное.', visual: { top: '#A81E1E', bottom: '#C99D22' } },
  { id: 21, category_id: 3, name: 'Злата Прага №93', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 16, base_price: 155, mood_tags: ['football', 'light'], pairing: { name: 'Фисташки солёные', price: 180 }, description: 'Пражский лагер на розлив.', visual: { top: '#A81E1E', bottom: '#1A3B63' } },
  { id: 22, category_id: 3, name: 'Чешское Классическое №49', subtitle: 'Чешский лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.5, og: 12, ibu: 22, base_price: 165, mood_tags: ['bitter', 'fish'], pairing: { name: 'Вяленая корюшка', price: 240 }, description: 'Классическая чешская горчинка на кране.', visual: { top: '#A81E1E', bottom: '#163D2B' } },
  { id: 23, category_id: 3, name: 'Московское Барное №80', subtitle: 'Столичный лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 14, base_price: 150, mood_tags: ['light', 'football'], pairing: { name: 'Арахис солёный', price: 85 }, description: 'Лёгкое свежее барное.', visual: { top: '#C4C7CC', bottom: '#7D3B18' } },
  { id: 24, category_id: 3, name: 'Лагер №40', subtitle: 'Чешский лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 18, base_price: 155, mood_tags: ['bitter', 'football'], pairing: { name: 'Сухарики ржаные', price: 75 }, description: 'Чешский лагер с крана.', visual: { top: '#C4C7CC', bottom: '#1F2124' } },
  { id: 25, category_id: 3, name: 'Голд Сова', subtitle: 'Солодовый лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 15, base_price: 160, mood_tags: ['light', 'meat'], pairing: { name: 'Сырные шарики', price: 135 }, description: 'Фирменный сорт сети GOLD SOVA.', visual: { top: '#C4C7CC', bottom: '#183622' } },
  { id: 26, category_id: 3, name: 'Жигулёвское №72', subtitle: 'Легендарный лагер', is_alcohol: true, is_draft: true, container_type: 'keg', abv: 4.0, og: 11, ibu: 15, base_price: 145, mood_tags: ['football', 'fish'], pairing: { name: 'Вобла астраханская', price: 190 }, description: 'Тот самый вкус на розлив.', visual: { top: '#C4C7CC', bottom: '#18365C' } },

  { id: 27, category_id: 4, name: 'Кола', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 75, mood_tags: [], pairing: { name: 'Чипсы классические', price: 110 }, description: 'Классическая освежающая кола.', visual: { top: '#1B5A96', bottom: '#123A66', bottle: '#2A1205' } },
  { id: 28, category_id: 4, name: 'Тархун', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 75, mood_tags: [], pairing: { name: 'Сырные палочки', price: 120 }, description: 'Насыщенный вкус эстрагона.', visual: { top: '#4CA844', bottom: '#1F6E2C', bottle: '#228B3B' } },
  { id: 29, category_id: 4, name: 'Лимонад', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 75, mood_tags: [], pairing: { name: 'Крендельки солёные', price: 90 }, description: 'Классический лимонад детства.', visual: { top: '#46A2D4', bottom: '#1E5594', bottle: '#C9A449' } },
  { id: 30, category_id: 4, name: 'Вкус груши', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 75, mood_tags: [], pairing: { name: 'Арахис в глазури', price: 95 }, description: 'Ароматный дюшес.', visual: { top: '#D97254', bottom: '#B83525', bottle: '#C96A4B' } },
  { id: 31, category_id: 4, name: 'Манго и Маракуйя', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 80, mood_tags: [], pairing: { name: 'Кукурузные чипсы', price: 115 }, description: 'Тропический освежающий лимонад.', visual: { top: '#F2D22E', bottom: '#D98A2B', bottle: '#E6A82E' } },
  { id: 32, category_id: 4, name: 'Мохито', subtitle: 'Стекло 0,5 л', is_alcohol: false, is_draft: false, container_type: 'glass', abv: 0, og: 0, ibu: 0, base_price: 80, mood_tags: [], pairing: { name: 'Сухарики с травами', price: 75 }, description: 'Освежающий лайм и мята.', visual: { top: '#C8D93B', bottom: '#257A39', bottle: '#78B87E' } },

  { id: 33, category_id: 5, name: 'Лимонад 1,0 л', subtitle: 'ПЭТ 1,0 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 95, mood_tags: [], pairing: { name: 'Чипсы картофельные', price: 110 }, description: 'Классический лимонад в литровой бутылке.', visual: { top: '#46A2D4', bottom: '#1E5594', bottle: '#C9A449' } },
  { id: 34, category_id: 5, name: 'Тархун 1,0 л', subtitle: 'ПЭТ 1,0 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 95, mood_tags: [], pairing: { name: 'Сырные шарики', price: 135 }, description: 'Освежающий тархун 1,0 л.', visual: { top: '#4CA844', bottom: '#1F6E2C', bottle: '#228B3B' } },

  { id: 35, category_id: 6, name: 'Кола 1,5 л', subtitle: 'ПЭТ 1,5 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 115, mood_tags: [], pairing: { name: 'Гренки с соусом', price: 110 }, description: 'Кола для компании.', visual: { top: '#1B5A96', bottom: '#123A66', bottle: '#2A1205' } },
  { id: 36, category_id: 6, name: 'Сочный апельсин 1,5 л', subtitle: 'ПЭТ 1,5 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 115, mood_tags: [], pairing: { name: 'Чипсы с сыром', price: 110 }, description: 'Яркий цитрусовый вкус.', visual: { top: '#F5D02A', bottom: '#E06324', bottle: '#F29B1D' } },

  { id: 37, category_id: 7, name: 'Лимонад разливной', subtitle: 'На розлив', is_alcohol: false, is_draft: true, container_type: 'keg', abv: 0, og: 0, ibu: 0, base_price: 95, mood_tags: [], pairing: { name: 'Крендельки', price: 90 }, description: 'Свежий разливной лимонад из кега.', visual: { top: '#46A2D4', bottom: '#1E5594' } },
  { id: 38, category_id: 7, name: 'Мохито разливной', subtitle: 'На розлив', is_alcohol: false, is_draft: true, container_type: 'keg', abv: 0, og: 0, ibu: 0, base_price: 105, mood_tags: [], pairing: { name: 'Арахис', price: 85 }, description: 'Освежающий мохито с крана.', visual: { top: '#C8D93B', bottom: '#257A39' } },

  { id: 39, category_id: 8, name: 'Квас Классический', subtitle: 'ПЭТ 1,5 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 120, mood_tags: [], pairing: { name: 'Ржаные гренки', price: 110 }, description: 'Натуральный хлебный квас живого брожения.', visual: { top: '#F5F2EB', bottom: '#C42323', bottle: '#3D1906' } },
  { id: 40, category_id: 9, name: 'Квас разливной', subtitle: 'На розлив', is_alcohol: false, is_draft: true, container_type: 'keg', abv: 0, og: 0, ibu: 0, base_price: 110, mood_tags: [], pairing: { name: 'Сухарики с чесноком', price: 75 }, description: 'Свежий разливной хлебный квас.', visual: { top: '#F5F2EB', bottom: '#C42323' } },
  { id: 41, category_id: 10, name: 'Вода «Алатау»', subtitle: 'Газированная 1,5 л', is_alcohol: false, is_draft: false, container_type: 'pet', abv: 0, og: 0, ibu: 0, base_price: 65, mood_tags: [], pairing: { name: 'Лёгкий перекус', price: 80 }, description: 'Чистая питьевая газированная вода.', visual: { top: '#2354A6', bottom: '#5BA8E0', bottle: '#D4E6F0' } },
];

export const CATALOG: CategoryBlock[] = CATEGORIES_META.map((c) => ({
  ...c,
  products: PRODUCTS.filter((p) => p.category_id === c.id),
}));
