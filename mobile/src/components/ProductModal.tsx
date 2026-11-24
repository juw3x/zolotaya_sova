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
  View,
} from 'react-native';
import { Product } from '../data';
import { ContainerArt, OwlLogo } from './Art';
import { ScalePress } from './Motion';
import { ThemeMode, ThemePalette } from '../styles';

interface Props {
  product: Product | null;
  theme: ThemePalette;
  themeMode: ThemeMode;
  draftVolume: number;
  onChangeVolume: (v: number) => void;
  onClose: () => void;
  onAddProduct: (p: Product, vol: number) => void;
  onAddPairing: (p: Product) => void;
  onNavigateProduct: (dir: -1 | 1) => void;
}

function getProductMeta(p: Product) {
  const numMatch = p.name.match(/№\d+/);
  const badge = numMatch ? numMatch[0] : p.is_draft ? 'РАЗЛИВ' : 'GOLD';

  if (p.is_alcohol) {
    const isDark = p.mood_tags.includes('dark');
    const isAmber = p.id === 5 || p.id === 18 || p.id === 16;
    const isRichGold = p.ibu >= 16 || p.og >= 12;

    const colorName = isDark
      ? 'Тёмно-рубиновый'
      : isAmber
      ? 'Янтарный'
      : isRichGold
      ? 'Золотистый'
      : 'Светло-золотистый';
    const colorLevel = isDark ? 5 : isAmber ? 4 : isRichGold ? 3 : 2;

    const composition = isDark
      ? 'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, СОЛОД КАРАМЕЛЬНЫЙ И ЖЖЁНЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ.'
      : 'ВОДА ОЧИЩЕННАЯ, СОЛОД ПИВОВАРЕННЫЙ ЯЧМЕННЫЙ СВЕТЛЫЙ, ХМЕЛЬ ГРАНУЛИРОВАННЫЙ. СОВЕСТЬ ПИВОВАРА.';

    return {
      kicker: p.id === 8 || p.id === 11 || p.id === 26 ? 'ГОРОДСКАЯ ЛЕГЕНДА' : 'ПРОВЕРЕННОЕ КАЧЕСТВО',
      badge,
      gost: 'ГОСТ 31711-2012',
      colorName,
      colorLevel,
      composition,
    };
  }

  if (p.category_id === 8 || p.category_id === 9) {
    return {
      kicker: 'ЖИВОЕ БРОЖЕНИЕ',
      badge: 'КВАС',
      gost: 'ГОСТ 31494-2012',
      colorName: 'Тёмно-хлебный',
      colorLevel: 5,
      composition: 'ВОДА ПОДГОТОВЛЕННАЯ, КОНЦЕНТРАТ КВАСНОГО СУСЛА (РЖАНОЙ И ЯЧМЕННЫЙ СОЛОД), САХАР, ДРОЖЖИ.',
    };
  }

  if (p.category_id === 10) {
    return {
      kicker: 'ПРИРОДНАЯ ЧИСТОТА',
      badge: '1,5 Л',
      gost: 'ГОСТ Р 54316-2020',
      colorName: 'Кристально прозрачный',
      colorLevel: 1,
      composition: 'ВОДА ПИТЬЕВАЯ АРТЕЗИАНСКАЯ ПОДГОТОВЛЕННАЯ, ДИОКСИД УГЛЕРОДА.',
    };
  }

  return {
    kicker: 'ВКУС ДЕТСТВА',
    badge: p.is_draft ? 'КЕГ' : 'ЛИМОНАД',
    gost: 'ГОСТ 28188-2014',
    colorName: 'Солнечный карамельный',
    colorLevel: 3,
    composition: 'ВОДА АРТЕЗИАНСКАЯ ПОДГОТОВЛЕННАЯ, САХАР, НАТУРАЛЬНЫЕ АРОМАТИЧЕСКИЕ ОСНОВЫ, ЛИМОННАЯ КИСЛОТА.',
  };
}

export function ProductModal({
  product,
  theme: t,
  themeMode,
  draftVolume,
  onChangeVolume,
  onClose,
  onAddProduct,
  onAddPairing,
  onNavigateProduct,
}: Props) {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(28)).current;
  const bottleScale = useRef(new Animated.Value(0.84)).current;
  const bottleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!product) return;
    cardOpacity.setValue(0);
    cardSlide.setValue(24);
    bottleScale.setValue(0.84);
    bottleOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 8,
        tension: 75,
        useNativeDriver: true,
      }),
      Animated.timing(bottleOpacity, {
        toValue: 1,
        duration: 320,
        delay: 70,
        useNativeDriver: true,
      }),
      Animated.spring(bottleScale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        delay: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [product?.id, bottleOpacity, bottleScale, cardOpacity, cardSlide]);

  if (!product) return null;

  const meta = getProductMeta(product);
  const isDark = themeMode === 'dark';
  const cardBg = isDark ? '#231912' : '#FAF6EE';
  const subSurface = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(25,24,22,0.04)';
  const lineCol = isDark ? 'rgba(207, 160, 82, 0.24)' : 'rgba(25, 24, 22, 0.12)';
  const finalPrice = product.is_draft ? Math.round(product.base_price * draftVolume) : product.base_price;

  return (
    <Modal visible={!!product} transparent animationType="none" onRequestClose={onClose}>
      <View style={st.overlay}>
        {/* Клик по любой пустой области вокруг карточки закрывает окно */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            st.card,
            {
              backgroundColor: cardBg,
              borderColor: isDark ? 'rgba(207,160,82,0.35)' : '#E5DEC9',
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          {/* Верхняя панель с переключением сортов */}
          <View style={[st.topBar, { borderBottomColor: lineCol }]}>
            <TouchableOpacity style={st.navPill} onPress={() => onNavigateProduct(-1)}>
              <Text style={st.navPillText}>‹ ПРЕД.</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <OwlLogo size={18} />
              <Text style={[st.brandLabel, { color: t.textMuted }]}>ЗОЛОТАЯ СОВА • 1972</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity style={st.navPill} onPress={() => onNavigateProduct(1)}>
                <Text style={st.navPillText}>СЛЕД. ›</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Text style={[st.closeX, { color: t.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
            {/* Витринный блок: крупный номер + фото бутылки на золотистом свечении */}
            <View style={st.heroRow}>
              <View style={st.heroLeft}>
                <Text style={st.kicker}>{meta.kicker}</Text>
                <Text style={[st.bigBadge, { color: t.text }]}>{meta.badge}</Text>
                <Text style={[st.title, { color: t.text }]}>{product.name}</Text>
                {!!product.subtitle && <Text style={st.subtitle}>{product.subtitle}</Text>}
              </View>

              <Animated.View
                style={[
                  st.bottleStage,
                  { opacity: bottleOpacity, transform: [{ scale: bottleScale }] },
                ]}
              >
                <View style={st.haloOuter} />
                <View style={st.haloInner} />
                <ContainerArt
                  productId={product.id}
                  type={product.container_type}
                  visual={product.visual}
                  height={165}
                />
              </Animated.View>
            </View>

            <Text style={[st.desc, { color: t.textSecondary }]}>{product.description}</Text>

            {/* Таблица характеристик (без непонятных длинных полосок) */}
            <View style={[st.specsBox, { borderTopColor: lineCol, borderBottomColor: lineCol }]}>
              <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                <Text style={[st.specLabel, { color: t.text }]}>Проверенное заводское качество</Text>
                <Text style={[st.specVal, { color: t.textMuted }]}>{meta.gost}</Text>
              </View>

              {product.is_alcohol ? (
                <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                  <Text style={[st.specLabel, { color: t.textMuted }]}>
                    Алкоголь   <Text style={[st.specStrong, { color: t.text }]}>{product.abv.toFixed(1)}%</Text>
                  </Text>
                  <Text style={[st.specLabel, { color: t.textMuted }]}>
                    Начальное сусло   <Text style={[st.specStrong, { color: t.text }]}>{product.og}%</Text>
                  </Text>
                </View>
              ) : (
                <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                  <Text style={[st.specLabel, { color: t.textMuted }]}>
                    Крепость   <Text style={[st.specStrong, { color: t.text }]}>0,0%</Text>
                  </Text>
                  <Text style={[st.specLabel, { color: t.textMuted }]}>
                    Формат   <Text style={[st.specStrong, { color: t.text }]}>{product.subtitle || 'Свежий розлив'}</Text>
                  </Text>
                </View>
              )}

              {/* 5-сегментный индикатор цвета напитка */}
              <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                <Text style={[st.specLabel, { color: t.text }]}>Цвет напитка</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[st.specVal, { color: t.textSecondary }]}>{meta.colorName}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <View
                        key={lvl}
                        style={[
                          st.colorSegment,
                          {
                            backgroundColor:
                              lvl <= meta.colorLevel
                                ? '#CFA052'
                                : isDark
                                ? 'rgba(255,255,255,0.16)'
                                : 'rgba(25,24,22,0.16)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Состав */}
              <View style={st.compRow}>
                <Text style={st.wheatIcon}>🌾</Text>
                <Text style={[st.compText, { color: t.textSecondary }]}>
                  <Text style={{ color: '#CFA052', fontFamily: 'Oswald_600SemiBold' }}>СОСТАВ: </Text>
                  {meta.composition}
                </Text>
              </View>
            </View>

            {/* Еда-пейринг */}
            <View style={[st.pairingBox, { backgroundColor: subSurface }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={st.pairingKicker}>ИДЕАЛЬНО К ЗАКУСКЕ</Text>
                <Text style={[st.pairingName, { color: t.text }]}>{product.pairing.name}</Text>
              </View>
              <ScalePress onPress={() => onAddPairing(product)}>
                <View style={st.pairingBtn}>
                  <Text style={st.pairingBtnText}>+ {product.pairing.price} ₽</Text>
                </View>
              </ScalePress>
            </View>

            {/* Выбор объёма для разливного */}
            {product.is_draft && (
              <View style={st.volRow}>
                {[0.5, 1.0, 1.5].map((v) => {
                  const active = draftVolume === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[
                        st.volBtn,
                        { borderColor: active ? '#CFA052' : lineCol },
                        active && { backgroundColor: '#CFA052' },
                      ]}
                      onPress={() => onChangeVolume(v)}
                    >
                      <Text style={[st.volText, { color: active ? '#191816' : t.text }]}>{v} л</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Кнопки действий */}
          <View style={st.actions}>
            <TouchableOpacity style={[st.closeBtn, { borderColor: lineCol }]} onPress={onClose}>
              <Text style={[st.closeBtnText, { color: t.text }]}>ЗАКРЫТЬ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.addBtn} onPress={() => onAddProduct(product, draftVolume)}>
              <Text style={st.addBtnText}>В КОРЗИНУ • {finalPrice} ₽</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 9, 8, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  card: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    borderWidth: 1,
    padding: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  navPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(207, 160, 82, 0.4)',
  },
  navPillText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#CFA052',
    letterSpacing: 0.8,
  },
  brandLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  closeX: {
    fontSize: 17,
    paddingHorizontal: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  kicker: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#CFA052',
    letterSpacing: 1.5,
  },
  bigBadge: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 34,
    lineHeight: 38,
    marginTop: 2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 25,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#CFA052',
    marginTop: 3,
    letterSpacing: 0.6,
  },
  bottleStage: {
    width: 145,
    height: 175,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloOuter: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(207, 160, 82, 0.1)',
  },
  haloInner: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(207, 160, 82, 0.16)',
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  specsBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 6,
  },
  specLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  specStrong: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  specVal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  colorSegment: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 8,
  },
  wheatIcon: {
    fontSize: 15,
    marginTop: 1,
  },
  compText: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  pairingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 11,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#CFA052',
  },
  pairingKicker: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#CFA052',
    letterSpacing: 1,
  },
  pairingName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginTop: 2,
  },
  pairingBtn: {
    backgroundColor: '#191816',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#CFA052',
  },
  pairingBtnText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#D89F5C',
  },
  volRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  volBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 9,
    alignItems: 'center',
  },
  volText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  closeBtn: {
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#CFA052',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#191816',
    letterSpacing: 1,
  },
});
