import { Product, PRODUCTS } from './data';
import scrapedRaw from './scrapedDetails.json';

interface ScrapedItem {
  kicker?: string;
  badge?: string;
  gost?: string;
  colorName?: string;
  composition?: string;
  historyHeadline?: string;
  historyText?: string;
  styleText?: string;
  popularity?: string;
  tasteAuthor?: string;
  tasteQuote?: string;
  components?: [string, string][];
  legendTitle?: string;
  legendText?: string;
}

const SCRAPED = scrapedRaw as unknown as Record<string, ScrapedItem>;

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
  tasteAuthor: string;
  tasteQuote: string;
  components: [string, string][];
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
      const sub = item.subtitle ?? '';
      const vol = sub.includes('1,5') || sub.includes('1.5') ? '1,5 л.' : '1,0 л.';
      result.push({ label: vol, sub: 'ПЭТ', product: item });
    } else {
      result.push({ label: '50 л.', sub: 'КЕГ, розлив', product: item });
    }
  }

  const order = { glass: 0, pet: 1, keg: 2 };
  return result.sort((a, b) => order[a.product.container_type] - order[b.product.container_type]);
}

function detectColorLevel(colorName: string, p: Product): number {
  const low = colorName.toLowerCase();
  if (low.includes('тёмн') || low.includes('темн') || low.includes('рубин') || p.mood_tags.includes('dark')) return 5;
  if (low.includes('янтар') || low.includes('медн')) return 4;
  if (low.includes('золот') && !low.includes('светл')) return 3;
  if (low.includes('прозрач') || low.includes('кристал')) return 1;
  return 2;
}

export function getProductDetail(p: Product): ProductDetailData {
  const sc = SCRAPED[String(p.id)] || {};
  const formats = findRelatedFormats(p);
  const numMatch = p.name.match(/№\d+/);
  const isDark = p.mood_tags.includes('dark');
  const isKvass = p.category_id === 8 || p.category_id === 9;
  const isWater = p.category_id === 10;

  const fallbackColor = isDark
    ? 'Тёмно-рубиновый'
    : isKvass
    ? 'Тёмно-хлебный'
    : isWater
    ? 'Кристально прозрачный'
    : 'Золотистый';

  const colorName = sc.colorName || fallbackColor;

  const fallbackComponents: [string, string][] = p.is_alcohol
    ? [
        ['Стиль', p.subtitle || 'Фирменный лагер'],
        ['Содержание алкоголя', `${p.abv.toFixed(1).replace('.', ',')}%`],
        ['Экстрактивность нач. сусла', `${p.og}%`],
        ['Солод', isDark ? 'Светлый, карамельный и жжёный солод' : 'Светлый ячменный солод'],
        ['Хмель', 'Жатецкий (Чехия), Наггет (Германия)'],
        ['Калорийность в 100 см3', `${Math.round(p.og * 3.8)} ккал`],
        ['Углеводы в 100 см3', `${(p.og * 0.41).toFixed(1).replace('.', ',')} г.`],
        ['Цвет', colorName],
        ['Срок годности', p.is_draft ? 'КЕГ (30 сут.)' : 'стекло (90 сут.), ПЭТ (60 сут.)'],
      ]
    : [
        ['Категория', p.subtitle || 'Безалкогольный напиток'],
        ['Содержание алкоголя', '0,0%'],
        ['Цвет', colorName],
        ['Срок годности', p.is_draft ? 'КЕГ (30 сут.)' : '180 суток'],
      ];

  return {
    kicker: sc.kicker || (p.is_alcohol ? 'ГОРОДСКАЯ ЛЕГЕНДА' : isKvass ? 'ЖИВОЕ БРОЖЕНИЕ' : 'ЗОЛОТЫЕ СТАНДАРТЫ'),
    badge: sc.badge || (numMatch ? numMatch[0] : p.is_draft ? 'КЕГ' : 'GOLD'),
    gost: sc.gost || (p.is_alcohol ? 'ГОСТ 31711-2012' : isKvass ? 'ГОСТ 31494-2012' : 'ГОСТ 28188-2014'),
    colorName,
    colorLevel: detectColorLevel(colorName, p),
    composition:
      sc.composition ||
      (p.is_alcohol
        ? 'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ. СОВЕСТЬ ПИВОВАРА.'
        : 'ВОДА АРТЕЗИАНСКАЯ ПОДГОТОВЛЕННАЯ, САХАР, НАТУРАЛЬНЫЕ КОМПОНЕНТЫ.'),
    historyHeadline: sc.historyHeadline || 'Хит вне времени',
    historyText: sc.historyText || p.description,
    popularity: sc.popularity || `№${(p.id % 5) + 1}`,
    styleText: sc.styleText || p.description,
    tasteAuthor: sc.tasteAuthor || 'СТАРШИЙ ТЕХНОЛОГ',
    tasteQuote: sc.tasteQuote || p.description.toUpperCase(),
    components: sc.components && sc.components.length >= 3 ? sc.components : fallbackComponents,
    legendTitle: sc.legendTitle || `ГОРОДСКАЯ ${sc.badge || ''} ЛЕГЕНДА`,
    legendText:
      sc.legendText ||
      `«${p.name}» варится на Кемеровском пивоваренном заводе «Золотая Сова» с 1972 года по традиционным рецептурам.`,
    formats,
  };
}
