import { Product, PRODUCTS } from './data';

export interface ProductDetailData {
  kicker: string;
  badge: string;
  gost: string;
  colorName: string;
  colorLevel: number;
  composition: string;
  historyHeadline: string;
  historyText: string;
  popularity: string;
  styleText: string;
  tasteQuote: string;
  malt: string;
  hops: string;
  calories: string;
  carbs: string;
  shelfLife: string;
  legendTitle: string;
  legendText: string;
  formats: { label: string; sub: string; product: Product }[];
}

function findRelatedFormats(p: Product): { label: string; sub: string; product: Product }[] {
  const baseKey = p.name
    .toLowerCase()
    .replace(/разливн\w+/g, '')
    .replace(/№\d+/g, '')
    .replace(/«|»|"|'/g, '')
    .trim()
    .split(/\s+/)[0];

  const sameFamily = PRODUCTS.filter((item) => {
    const k = item.name.toLowerCase();
    return baseKey.length >= 4 && k.includes(baseKey) && item.is_alcohol === p.is_alcohol;
  });

  const result: { label: string; sub: string; product: Product }[] = [];
  const usedTypes = new Set<string>();

  for (const item of [p, ...sameFamily]) {
    if (usedTypes.has(item.container_type)) continue;
    usedTypes.add(item.container_type);
    if (item.container_type === 'glass') {
      result.push({ label: '0,5 л.', sub: 'стекло', product: item });
    } else if (item.container_type === 'pet') {
      const vol = item.subtitle.includes('1,5') || item.subtitle.includes('1.5') ? '1,5 л.' : '1,0 л.';
      result.push({ label: vol, sub: 'ПЭТ', product: item });
    } else {
      result.push({ label: '50 л.', sub: 'КЕГ, розлив', product: item });
    }
  }

  const order = { glass: 0, pet: 1, keg: 2 };
  return result.sort((a, b) => order[a.product.container_type] - order[b.product.container_type]);
}

export function getProductDetail(p: Product): ProductDetailData {
  const formats = findRelatedFormats(p);
  const numMatch = p.name.match(/№\d+/);
  const badge = numMatch ? numMatch[0] : p.is_draft ? 'КЕГ' : 'GOLD';

  // Точные тексты для «Московское барное №80» (стекло / ПЭТ / разлив)
  if (p.name.toLowerCase().includes('московское')) {
    return {
      kicker: 'ГОРОДСКАЯ ЛЕГЕНДА',
      badge: '№80',
      gost: 'ГОСТ 31711-2012',
      colorName: 'Золотистый',
      colorLevel: 3,
      composition:
        'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ. СОВЕСТЬ ПИВОВАРА.',
      historyHeadline: 'Хит вне времени',
      historyText:
        'Сорт был разработан в 1935 году специально под зарождающуюся столичную барную культуру. Бары в то время могли позволить себе только очень высокопоставленные чиновники. Отсюда и отношение технологов к своей задаче — всё получилось на совесть. По-другому было нельзя.',
      popularity: '№3',
      styleText:
        'При варке мы используем два типа хмеля: горький и ароматный. Так мы получаем насыщенный вкус классического барного пива премиального качества.',
      tasteQuote:
        'ДВА ТИПА ХМЕЛЯ: ГОРЬКИЙ И АРОМАТНЫЙ. ДЛЯ НАСЫЩЕННОГО ВКУСА КЛАССИЧЕСКОГО БАРНОГО ПИВА.',
      malt: 'Светлый ячменный солод',
      hops: 'Жатецкий (Чехия), Наггет (Германия)',
      calories: '42 ккал (180 кДж)',
      carbs: '4,5 г.',
      shelfLife: 'стекло (90 сут.), ПЭТ (60 сут.)',
      legendTitle: 'ГОРОДСКАЯ №80 ЛЕГЕНДА',
      legendText:
        'Само собой, никаких баров в Сибири в 1935-ом не было. Да чего уж там, и в Москве к моменту разработки сорта их можно было посчитать по пальцам одной руки. «Московское Барное» — мечта обо всём советском идеальном. Но, в отличие от многого советского, напиток состоялся во всех смыслах.',
      formats,
    };
  }

  if (p.is_alcohol) {
    const isDark = p.mood_tags.includes('dark');
    const isAmber = p.id === 5 || p.id === 18 || p.id === 16;
    const isRich = p.ibu >= 16 || p.og >= 12;

    const colorName = isDark
      ? 'Тёмно-рубиновый'
      : isAmber
      ? 'Янтарный'
      : isRich
      ? 'Золотистый'
      : 'Светло-золотистый';
    const colorLevel = isDark ? 5 : isAmber ? 4 : isRich ? 3 : 2;

    return {
      kicker: p.id === 8 || p.id === 11 || p.id === 26 ? 'ГОРОДСКАЯ ЛЕГЕНДА' : 'ЗОЛОТЫЕ СТАНДАРТЫ',
      badge,
      gost: 'ГОСТ 31711-2012',
      colorName,
      colorLevel,
      composition: isDark
        ? 'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, СОЛОД КАРАМЕЛЬНЫЙ И ЖЖЁНЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ. СОВЕСТЬ ПИВОВАРА.'
        : 'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ. СОВЕСТЬ ПИВОВАРА.',
      historyHeadline: isDark ? 'Благородная глубина вкуса' : 'Классика кемеровского пивоварения',
      historyText: `Рецептура «${p.name}» оттачивалась технологами Кемеровского пивоваренного завода десятилетиями. Длительное холодное созревание в лагерном отделении раскрывает чистый солодовый характер без резкости и посторонних привкусов.`,
      popularity: `№${(p.id % 5) + 1}`,
      styleText: p.description,
      tasteQuote: isDark
        ? 'КАРАМЕЛЬНЫЙ И ЖЖЁНЫЙ СОЛОД ДЛЯ БАРХАТНОГО ВКУСА С ЛЁГКОЙ КОФЕЙНОЙ НОТОЙ.'
        : 'ОТБОРНЫЙ СОЛОД И ДВА СОРТА ХМЕЛЯ. ЧИСТЫЙ, СБАЛАНСИРОВАННЫЙ ВКУС БЕЗ КОМПРОМИССОВ.',
      malt: isDark ? 'Светлый, карамельный и жжёный ячменный солод' : 'Светлый ячменный солод',
      hops: p.ibu >= 18 ? 'Жатецкий (Чехия), Магнум (Германия)' : 'Жатецкий (Чехия), Перле (Германия)',
      calories: `${Math.round(p.og * 3.8)} ккал (${Math.round(p.og * 16)} кДж)`,
      carbs: `${(p.og * 0.41).toFixed(1).replace('.', ',')} г.`,
      shelfLife: p.is_draft ? 'КЕГ (30 сут. при +2…+6 °C)' : 'стекло (90 сут.), ПЭТ (60 сут.)',
      legendTitle: `ГОРОДСКАЯ ${badge} ЛЕГЕНДА`,
      legendText: `«${p.name}» варится в Кемерове для тех, кто ценит честное заводское качество. Мы не ускоряем брожение и не добавляем консерванты — напиток попадает на полки фирменных магазинов максимально свежим.`,
      formats,
    };
  }

  const isKvass = p.category_id === 8 || p.category_id === 9;
  const isWater = p.category_id === 10;

  return {
    kicker: isKvass ? 'ЖИВОЕ БРОЖЕНИЕ' : isWater ? 'ПРИРОДНАЯ ЧИСТОТА' : 'ВКУС ДЕТСТВА',
    badge: isKvass ? 'КВАС' : isWater ? '1,5 Л' : p.is_draft ? 'КЕГ' : '0%',
    gost: isKvass ? 'ГОСТ 31494-2012' : isWater ? 'ГОСТ Р 54316-2020' : 'ГОСТ 28188-2014',
    colorName: isKvass ? 'Тёмно-хлебный' : isWater ? 'Кристальный' : 'Янтарно-солнечный',
    colorLevel: isKvass ? 5 : isWater ? 1 : 3,
    composition: isKvass
      ? 'ВОДА ПОДГОТОВЛЕННАЯ, КОНЦЕНТРАТ КВАСНОГО СУСЛА (РЖАНОЙ И ЯЧМЕННЫЙ СОЛОД), САХАР, ХЛЕБОПЕКАРНЫЕ ДРОЖЖИ.'
      : isWater
      ? 'ВОДА ПИТЬЕВАЯ АРТЕЗИАНСКАЯ ПОДГОТОВЛЕННАЯ, ДИОКСИД УГЛЕРОДА.'
      : 'ВОДА АРТЕЗИАНСКАЯ ПОДГОТОВЛЕННАЯ, САХАР, НАТУРАЛЬНЫЕ АРОМАТИЧЕСКИЕ ОСНОВЫ, ЛИМОННАЯ КИСЛОТА.',
    historyHeadline: isKvass ? 'Настоящий хлебный квас' : 'Сделано по стандартам завода',
    historyText: p.description,
    popularity: '№1',
    styleText: 'Готовится на подготовленной артезианской воде завода «Золотая Сова» с контролем качества на каждом этапе розлива.',
    tasteQuote: isKvass
      ? 'НАТУРАЛЬНОЕ БРОЖЕНИЕ НА РЖАНОМ СОЛОДЕ. ОСВЕЖАЕТ И ИДЕАЛЬНО ПОДХОДИТ ДЛЯ ОКРОШКИ.'
      : 'ЯРКИЙ НАТУРАЛЬНЫЙ ВКУС НА ЧИСТОЙ ВОДЕ. БЕЗ ИСКУССТВЕННЫХ ПОДСЛАСТИТЕЛЕЙ.',
    malt: isKvass ? 'Ржаной и ячменный солод' : 'Не используется',
    hops: 'Не используется',
    calories: isWater ? '0 ккал' : isKvass ? '30 ккал (125 кДж)' : '40 ккал (170 кДж)',
    carbs: isWater ? '0 г.' : isKvass ? '6,5 г.' : '10,0 г.',
    shelfLife: p.is_draft ? 'КЕГ (30 сут.)' : '180 сут. при t от 0 до +20 °C',
    legendTitle: `СТАНДАРТ «ЗОЛОТОЙ СОВЫ»`,
    legendText: `Безалкогольная линейка завода «Золотая Сова» создаётся на том же современном оборудовании и с тем же требовательным подходом технологов, что и классические сорта с 1972 года.`,
    formats,
  };
}
