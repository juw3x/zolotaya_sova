import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product, Store } from '../data';
import { getProductDetail } from '../productDetails';
import { BrandLogo, ContainerArt, OwlLogo } from './Art';
import { ScalePress } from './Motion';
import { ThemeMode, ThemePalette } from '../styles';

type SectionId =
  | 'desc'
  | 'history'
  | 'taste'
  | 'components'
  | 'formats'
  | 'legend'
  | 'technology'
  | 'buy';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'desc', label: 'ОПИСАНИЕ' },
  { id: 'history', label: 'ИСТОРИЯ' },
  { id: 'taste', label: 'ВКУС' },
  { id: 'components', label: 'КОМПОНЕНТЫ' },
  { id: 'formats', label: 'ФОРМАТЫ' },
  { id: 'legend', label: 'ЛЕГЕНДА' },
  { id: 'technology', label: 'ТЕХНОЛОГИЯ' },
  { id: 'buy', label: 'ГДЕ КУПИТЬ' },
];

interface Props {
  product: Product | null;
  prevProduct: Product | null;
  nextProduct: Product | null;
  stores: Store[];
  selectedStore: Store;
  theme: ThemePalette;
  themeMode: ThemeMode;
  draftVolume: number;
  onChangeVolume: (v: number) => void;
  onClose: () => void;
  onAddProduct: (p: Product, vol: number) => void;
  onAddPairing: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onSelectStore: (st: Store) => void;
}

export function ProductModal({
  product,
  prevProduct,
  nextProduct,
  stores,
  selectedStore,
  themeMode,
  draftVolume,
  onChangeVolume,
  onClose,
  onAddProduct,
  onAddPairing,
  onSelectProduct,
  onSelectStore,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Partial<Record<SectionId, number>>>({});
  const [activeSec, setActiveSec] = useState<SectionId>('desc');
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const pageOpacity = useRef(new Animated.Value(0)).current;
  const bottleScale = useRef(new Animated.Value(0.86)).current;
  const bottleShift = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!product) return;
    setActiveSec('desc');
    setScrolledPastHero(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    pageOpacity.setValue(0);
    bottleScale.setValue(0.86);
    bottleShift.setValue(24);

    Animated.parallel([
      Animated.timing(pageOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(bottleScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.spring(bottleShift, { toValue: 0, friction: 7, tension: 75, useNativeDriver: true }),
    ]).start();
  }, [product?.id, bottleScale, bottleShift, pageOpacity]);

  if (!product) return null;

  const d = getProductDetail(product);
  const finalPrice = product.is_draft ? Math.round(product.base_price * draftVolume) : product.base_price;

  // На первом экране («Описание») — фирменный шоколадный фон, ниже — светлый кремовый (или тёмный в dark-режиме)
  const isHeroDark = !scrolledPastHero;
  const pageBg = isHeroDark ? '#342014' : themeMode === 'dark' ? '#1C1917' : '#F3EEE8';
  const mainText = isHeroDark ? '#FFFFFF' : themeMode === 'dark' ? '#FFFFFF' : '#1E1C1A';
  const subText = isHeroDark ? '#D9CFC4' : themeMode === 'dark' ? '#CFC8BE' : '#534E48';
  const mutedText = isHeroDark ? '#AE9A88' : themeMode === 'dark' ? '#9C9489' : '#8A8176';
  const lineCol = isHeroDark
    ? 'rgba(207, 160, 82, 0.35)'
    : themeMode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(25,24,22,0.14)';
  const cardSurface = themeMode === 'dark' && !isHeroDark ? '#26221F' : '#FFFFFF';

  const brandStores = stores.filter((s) => s.name.includes('GOLD SOVA'));
  const deptStores = stores.filter((s) => !s.name.includes('GOLD SOVA'));

  function scrollToSection(id: SectionId) {
    setActiveSec(id);
    const y = offsets.current[id] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const historyY = offsets.current.history ?? 360;
    setScrolledPastHero(y > historyY * 0.55);

    let current: SectionId = 'desc';
    for (const sec of SECTIONS) {
      const top = offsets.current[sec.id];
      if (top !== undefined && y + 140 >= top) current = sec.id;
    }
    if (current !== activeSec) setActiveSec(current);
  }

  return (
    <Modal visible={!!product} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={[st.root, { backgroundColor: pageBg }]} edges={['top', 'bottom']}>
        <Animated.View style={{ flex: 1, opacity: pageOpacity }}>
          {/* Верхняя шапка как на сайте */}
          <View style={[st.topHeader, { borderBottomColor: lineCol }]}>
            <TouchableOpacity onPress={onClose}>
              <BrandLogo compact />
            </TouchableOpacity>
            <View style={st.topHeaderRight}>
              <TouchableOpacity style={st.topLink} onPress={onClose}>
                <Text style={[st.topLinkText, { color: mainText }]}>ВСЯ ПРОДУКЦИЯ</Text>
                <View style={st.dotsGrid}>
                  <View style={[st.dotSq, { backgroundColor: mainText }]} />
                  <View style={[st.dotSq, { backgroundColor: mainText }]} />
                  <View style={[st.dotSq, { backgroundColor: mainText }]} />
                  <View style={[st.dotSq, { backgroundColor: mainText }]} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.closeCircle, { borderColor: lineCol }]}
                onPress={onClose}
                accessibilityLabel="Закрыть карточку"
              >
                <Text style={[st.closeCircleText, { color: mainText }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Мобильное горизонтальное меню разделов (на узких экранах) */}
          {!isWide && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 42, borderBottomWidth: 1, borderBottomColor: lineCol }}
              contentContainerStyle={{ paddingHorizontal: 14, alignItems: 'center', gap: 14 }}
            >
              {SECTIONS.map((sec) => {
                const active = activeSec === sec.id;
                return (
                  <TouchableOpacity key={sec.id} onPress={() => scrollToSection(sec.id)} style={{ paddingVertical: 8 }}>
                    <Text
                      style={[
                        st.sideMenuText,
                        { color: active ? '#CFA052' : mutedText, fontSize: 11 },
                      ]}
                    >
                      {active ? '— ' : ''}
                      {sec.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Основная рабочая область */}
          <View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>
            {/* Левая фиксированная колонка (только на широких экранах — точь-в-точь как на сайте) */}
            {isWide && (
              <View style={st.leftCol}>
                {prevProduct && (
                  <TouchableOpacity
                    style={st.edgeNavLeft}
                    onPress={() => onSelectProduct(prevProduct)}
                  >
                    <Text style={[st.edgeNavText, { color: mutedText }]} numberOfLines={1}>
                      ‹ {prevProduct.name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={{ paddingLeft: 44, paddingTop: 24 }}>
                  <Text style={st.kicker}>{d.kicker}</Text>
                  <Text style={[st.bigNumber, { color: isHeroDark ? '#FFFFFF' : '#CFA052' }]}>
                    {d.badge}
                    <Text style={{ fontSize: 22 }}>°</Text>
                  </Text>

                  <View style={{ marginTop: 34, gap: 10 }}>
                    {SECTIONS.map((sec) => {
                      const active = activeSec === sec.id;
                      return (
                        <TouchableOpacity
                          key={sec.id}
                          style={st.sideMenuItem}
                          onPress={() => scrollToSection(sec.id)}
                        >
                          <View
                            style={[
                              st.sideDash,
                              { opacity: active ? 1 : 0 },
                            ]}
                          />
                          <Text
                            style={[
                              st.sideMenuText,
                              { color: active ? mainText : mutedText },
                            ]}
                          >
                            {sec.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Центральная фиксированная бутылка (на широких экранах) */}
            {isWide && (
              <View style={st.centerBottleCol}>
                <Animated.View
                  style={{
                    alignItems: 'center',
                    transform: [{ scale: bottleScale }, { translateY: bottleShift }],
                  }}
                >
                  <ContainerArt
                    productId={product.id}
                    type={product.container_type}
                    visual={product.visual}
                    height={390}
                  />
                </Animated.View>
              </View>
            )}

            {/* Правая прокручиваемая колонка со всеми 8 разделами */}
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={[
                st.scrollContent,
                { paddingHorizontal: isWide ? 36 : 18 },
              ]}
              scrollEventThrottle={16}
              onScroll={handleScroll}
            >
              {/* 1. ОПИСАНИЕ */}
              <View
                onLayout={(e) => { offsets.current.desc = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { minHeight: isWide ? 520 : undefined, justifyContent: 'center' }]}
              >
                {!isWide && (
                  <View style={st.mobileHeroTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.kicker}>{d.kicker}</Text>
                      <Text style={[st.bigNumber, { fontSize: 42, color: isHeroDark ? '#FFFFFF' : '#CFA052' }]}>
                        {d.badge}°
                      </Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: bottleScale }] }}>
                      <ContainerArt
                        productId={product.id}
                        type={product.container_type}
                        visual={product.visual}
                        height={175}
                      />
                    </Animated.View>
                  </View>
                )}

                <Text style={[st.heroTitle, { color: mainText }]}>{product.name}</Text>

                <View style={[st.specTable, { borderTopColor: lineCol }]}>
                  <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                    <Text style={[st.specKey, { color: mainText }]}>Проверенное заводское качество</Text>
                    <Text style={[st.specVal, { color: mutedText }]}>{d.gost}</Text>
                  </View>

                  <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                    <View style={st.halfCell}>
                      <Text style={[st.specKey, { color: mainText }]}>Алкоголь</Text>
                      <Text style={[st.specVal, { color: '#CFA052', fontWeight: '700' }]}>
                        {product.is_alcohol ? `${product.abv.toFixed(1).replace('.', ',')}%` : '0,0%'}
                      </Text>
                    </View>
                    <View style={[st.halfCell, { borderLeftWidth: 1, borderLeftColor: lineCol, paddingLeft: 12 }]}>
                      <Text style={[st.specKey, { color: mainText }]}>Экстрактивность нач. сусла</Text>
                      <Text style={[st.specVal, { color: mainText }]}>
                        {product.is_alcohol ? `${product.og}%` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={[st.specRow, { borderBottomColor: lineCol }]}>
                    <Text style={[st.specKey, { color: mainText }]}>Цвет напитка</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={[st.specVal, { color: subText }]}>{d.colorName}</Text>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <View
                            key={lvl}
                            style={[
                              st.colorSeg,
                              {
                                backgroundColor:
                                  lvl <= d.colorLevel ? '#CFA052' : 'rgba(160,150,140,0.35)',
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={[st.compBox, { borderBottomColor: lineCol }]}>
                    <Text style={{ fontSize: 18 }}>🌾</Text>
                    <Text style={[st.compText, { color: mainText }]}>
                      <Text style={{ color: '#CFA052', fontFamily: 'Oswald_600SemiBold' }}>СОСТАВ: </Text>
                      {d.composition}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={st.downCue} onPress={() => scrollToSection('history')}>
                  <Text style={st.downCueText}>ПОЗНАКОМИТЬСЯ С СОРТОМ</Text>
                  <View style={st.downCueLine} />
                  <View style={st.downCueCircle} />
                </TouchableOpacity>
              </View>

              {/* 2. ИСТОРИЯ */}
              <View
                onLayout={(e) => { offsets.current.history = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol }]}
              >
                <Text style={[st.sectionTitle, { color: mainText }]}>{d.historyHeadline}</Text>
                <View style={st.twoColWrap}>
                  <View style={{ flex: 2 }}>
                    <Text style={st.goldSubTitle}>История сорта</Text>
                    <Text style={[st.bodyText, { color: subText }]}>{d.historyText}</Text>

                    <Text style={[st.goldSubTitle, { marginTop: 22 }]}>Стиль пива</Text>
                    <Text style={[st.bodyText, { color: subText }]}>{d.styleText}</Text>
                  </View>
                  <View style={[st.popBox, { borderTopColor: lineCol, borderBottomColor: lineCol }]}>
                    <Text style={st.popNum}>{d.popularity}</Text>
                    <Text style={[st.popLabel, { color: mutedText }]}>Популярность сорта</Text>
                  </View>
                </View>
              </View>

              {/* 3. ВКУС */}
              <View
                onLayout={(e) => { offsets.current.taste = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol, alignItems: 'center' }]}
              >
                <Text style={st.kicker}>СТАРШИЙ ТЕХНОЛОГ</Text>
                <Text style={[st.quoteText, { color: mainText }]}>{d.tasteQuote}</Text>

                {/* Еда-пейринг внутри блока вкуса */}
                <View style={[st.pairingCard, { borderColor: lineCol, backgroundColor: cardSurface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.kicker}>ЕДА-ПЕЙРИНГ ОТ ТЕХНОЛОГА</Text>
                    <Text style={[st.specKey, { color: themeMode === 'dark' && !isHeroDark ? '#FFFFFF' : '#1E1C1A', marginTop: 3 }]}>
                      {product.pairing.name}
                    </Text>
                  </View>
                  <ScalePress onPress={() => onAddPairing(product)}>
                    <View style={st.pairingBtn}>
                      <Text style={st.pairingBtnText}>+ {product.pairing.price} ₽</Text>
                    </View>
                  </ScalePress>
                </View>
              </View>

              {/* 4. КОМПОНЕНТЫ */}
              <View
                onLayout={(e) => { offsets.current.components = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol }]}
              >
                <Text style={st.kicker}>КОМПОНЕНТЫ И ХАРАКТЕРИСТИКИ</Text>
                <View style={{ marginTop: 14 }}>
                  {[
                    ['Стиль', product.subtitle || 'Фирменный сорт'],
                    ['Содержание алкоголя', product.is_alcohol ? `${product.abv.toFixed(1).replace('.', ',')}%` : '0,0%'],
                    ['Экстрактивность нач. сусла', product.is_alcohol ? `${product.og}%` : '—'],
                    ['Солод', d.malt],
                    ['Хмель', d.hops],
                    ['Калорийность в 100 см3', d.calories],
                    ['Углеводы в 100 см3', d.carbs],
                    ['Цвет', d.colorName],
                    ['Срок годности', d.shelfLife],
                  ].map(([k, v]) => (
                    <View key={k} style={[st.compTableRow, { borderBottomColor: lineCol }]}>
                      <Text style={[st.compTableKey, { color: mainText }]}>{k}</Text>
                      <Text style={[st.compTableVal, { color: '#CFA052' }]}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 5. ФОРМАТЫ */}
              <View
                onLayout={(e) => { offsets.current.formats = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol }]}
              >
                <View style={st.twoColWrap}>
                  <Text style={[st.goldSubTitle, { flex: 1, fontSize: 18 }]}>Выберите удобный формат</Text>
                  <Text style={[st.bodyText, { flex: 1.5, color: subText }]}>
                    Настоящее пиво должно вариться рядом с тем местом, где оно будет питься. Поэтому наш
                    продукт мы делаем для земляков.
                  </Text>
                </View>

                <View style={st.formatsRow}>
                  {d.formats.map((f) => {
                    const active = f.product.id === product.id;
                    return (
                      <TouchableOpacity
                        key={f.product.id}
                        style={[
                          st.formatCard,
                          { borderColor: active ? '#CFA052' : lineCol },
                          active && { backgroundColor: 'rgba(207,160,82,0.1)' },
                        ]}
                        onPress={() => onSelectProduct(f.product)}
                      >
                        <ContainerArt
                          productId={f.product.id}
                          type={f.product.container_type}
                          visual={f.product.visual}
                          height={96}
                        />
                        <View style={[st.formatDivider, { backgroundColor: lineCol }]} />
                        <Text style={st.formatVol}>{f.label}</Text>
                        <Text style={[st.formatSub, { color: mainText }]}>{f.sub}</Text>
                        <Text style={[st.formatPrice, { color: mutedText }]}>
                          {f.product.base_price} ₽{f.product.is_draft ? '/л' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 6. ЛЕГЕНДА */}
              <View
                onLayout={(e) => { offsets.current.legend = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol }]}
              >
                <View style={[st.legendCard, { backgroundColor: cardSurface, borderColor: lineCol }]}>
                  <Text
                    style={[
                      st.legendTitle,
                      { color: themeMode === 'dark' && !isHeroDark ? '#FFFFFF' : '#1E1C1A' },
                    ]}
                  >
                    {d.legendTitle}
                  </Text>
                  <Text
                    style={[
                      st.bodyText,
                      {
                        color: themeMode === 'dark' && !isHeroDark ? '#D0C9BF' : '#4A453F',
                        marginTop: 12,
                      },
                    ]}
                  >
                    {d.legendText}
                  </Text>
                </View>
              </View>

              {/* 7. ТЕХНОЛОГИЯ */}
              <View
                onLayout={(e) => { offsets.current.technology = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol }]}
              >
                <View style={st.techBanner}>
                  <Text style={st.techStamp}>КОНСЕРВЫ НЕ ПРОЙДУТ!</Text>
                  <Text style={st.techHeading}>Наш продукт —{'\n'}наша совесть!</Text>
                </View>

                <View style={[st.twoColWrap, { marginTop: 14 }]}>
                  <Text style={[st.bodyText, { flex: 1, color: subText }]}>
                    Никаких порошков. Только естественное созревание. Технология производства всех сортов на
                    «Золотой Сове» — классическая. Только натуральное сырьё и никакого постороннего
                    вмешательства.
                  </Text>
                  <Text style={[st.bodyText, { flex: 1, color: subText }]}>
                    Мы консерваторы во всём, что касается натуральности сырья, и новаторы во всём, что
                    касается технологии. Все мы, сотрудники «Золотой Совы», живём рядом с вами в Кемерове.
                  </Text>
                </View>

                <View style={st.principlesGrid}>
                  {[
                    ['1.', 'Никаких порошков'],
                    ['2.', 'Натуральное сырьё'],
                    ['3.', 'Консервативная технология'],
                    ['4.', 'Современное оборудование'],
                  ].map(([num, label]) => (
                    <View key={num} style={st.principleItem}>
                      <Text style={st.principleNum}>{num}</Text>
                      <Text style={[st.principleText, { color: mainText }]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 8. ГДЕ КУПИТЬ */}
              <View
                onLayout={(e) => { offsets.current.buy = e.nativeEvent.layout.y; }}
                style={[st.sectionBlock, { borderTopWidth: 1, borderTopColor: lineCol, paddingBottom: 110 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={[st.sectionTitle, { color: mainText, marginBottom: 0 }]}>Где купить</Text>
                  <View style={st.greenBadge}>
                    <Text style={st.greenBadgeText}>{stores.length}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#CFA052' }}>
                    Фирменных{'\n'}точек в Кемерове
                  </Text>
                </View>

                <Text style={[st.goldSubTitle, { marginTop: 22 }]}>Магазины</Text>
                <View style={st.storesGrid}>
                  {brandStores.map((stItem) => {
                    const active = stItem.id === selectedStore.id;
                    return (
                      <TouchableOpacity
                        key={stItem.id}
                        style={[st.storeCell, active && { backgroundColor: 'rgba(207,160,82,0.12)' }]}
                        onPress={() => onSelectStore(stItem)}
                      >
                        <View style={st.storeGoldLine} />
                        <Text style={[st.storeName, { color: mainText }]}>{stItem.name}</Text>
                        <Text style={[st.storeAddr, { color: subText }]}>{stItem.address}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {deptStores.length > 0 && (
                  <>
                    <Text style={[st.goldSubTitle, { marginTop: 22 }]}>Фирменные отделы</Text>
                    <View style={st.storesGrid}>
                      {deptStores.map((stItem) => {
                        const active = stItem.id === selectedStore.id;
                        return (
                          <TouchableOpacity
                            key={stItem.id}
                            style={[st.storeCell, active && { backgroundColor: 'rgba(207,160,82,0.12)' }]}
                            onPress={() => onSelectStore(stItem)}
                          >
                            <View style={st.storeGoldLine} />
                            <Text style={[st.storeName, { color: mainText }]}>{stItem.name}</Text>
                            <Text style={[st.storeAddr, { color: subText }]}>{stItem.address}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            {/* Правая вертикальная кнопка переключения на следующий сорт (на широких экранах) */}
            {isWide && nextProduct && (
              <TouchableOpacity
                style={st.edgeNavRight}
                onPress={() => onSelectProduct(nextProduct)}
              >
                <Text style={[st.edgeNavText, { color: mutedText }]} numberOfLines={1}>
                  {nextProduct.name.toUpperCase()} ›
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Нижняя панель заказа */}
          <View style={[st.bottomBar, { borderTopColor: lineCol, backgroundColor: pageBg }]}>
            {product.is_draft && (
              <View style={st.volRow}>
                {[0.5, 1.0, 1.5].map((v) => {
                  const active = draftVolume === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[
                        st.volChip,
                        { borderColor: active ? '#CFA052' : lineCol },
                        active && { backgroundColor: '#CFA052' },
                      ]}
                      onPress={() => onChangeVolume(v)}
                    >
                      <Text style={[st.volChipText, { color: active ? '#191816' : mainText }]}>{v} л</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <TouchableOpacity style={st.addBtn} onPress={() => onAddProduct(product, draftVolume)}>
              <Text style={st.addBtnText}>В КОРЗИНУ • {finalPrice} ₽</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLinkText: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.2 },
  dotsGrid: {
    width: 12,
    height: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  dotSq: { width: 4, height: 4 },
  closeCircle: {
    width: 32,
    height: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeCircleText: { fontSize: 15 },

  leftCol: { width: 250, position: 'relative', justifyContent: 'flex-start' },
  edgeNavLeft: { position: 'absolute', left: 10, top: '46%', zIndex: 5, maxWidth: 130 },
  edgeNavRight: { width: 44, justifyContent: 'center', alignItems: 'center' },
  edgeNavText: { fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.4 },

  kicker: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: '#CFA052', letterSpacing: 1.6 },
  bigNumber: { fontFamily: 'Oswald_600SemiBold', fontSize: 56, lineHeight: 62, marginTop: 4 },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center' },
  sideDash: { width: 14, height: 1.5, backgroundColor: '#CFA052', marginRight: 8 },
  sideMenuText: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.3 },

  centerBottleCol: { width: 240, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingBottom: 30 },
  sectionBlock: { paddingVertical: 30 },
  mobileHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, marginBottom: 18 },
  specTable: { borderTopWidth: 1 },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  halfCell: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  specKey: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  specVal: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  colorSeg: { width: 18, height: 4, borderRadius: 2 },
  compBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 14, borderBottomWidth: 1 },
  compText: { flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18, letterSpacing: 0.4 },

  downCue: { alignItems: 'center', marginTop: 26 },
  downCueText: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#CFA052', letterSpacing: 1.6, marginBottom: 10 },
  downCueLine: { width: 1.5, height: 34, backgroundColor: '#CFA052' },
  downCueCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#CFA052', marginTop: -5 },

  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 28, marginBottom: 18 },
  goldSubTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#CFA052', marginBottom: 8 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  twoColWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  popBox: {
    minWidth: 120,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  popNum: { fontFamily: 'Oswald_600SemiBold', fontSize: 24, color: '#CFA052' },
  popLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },

  quoteText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 12,
  },
  pairingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginTop: 22,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#CFA052',
  },
  pairingBtn: { backgroundColor: '#191816', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#CFA052' },
  pairingBtnText: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#CFA052' },

  compTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 12,
  },
  compTableKey: { fontFamily: 'Inter_600SemiBold', fontSize: 13, flex: 1 },
  compTableVal: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1, textAlign: 'right' },

  formatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  formatCard: {
    flex: 1,
    minWidth: 110,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  formatDivider: { width: '100%', height: 1, marginVertical: 10 },
  formatVol: { fontFamily: 'Oswald_600SemiBold', fontSize: 16, color: '#CFA052' },
  formatSub: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 2 },
  formatPrice: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },

  legendCard: { padding: 24, borderWidth: 1 },
  legendTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 20, letterSpacing: 1.5, textAlign: 'center' },

  techBanner: { borderLeftWidth: 3, borderLeftColor: '#CFA052', paddingLeft: 14 },
  techStamp: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#CFA052', letterSpacing: 1.8 },
  techHeading: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#CFA052', lineHeight: 30, marginTop: 4 },
  principlesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 20 },
  principleItem: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  principleNum: { fontFamily: 'Oswald_600SemiBold', fontSize: 22, color: '#CFA052' },
  principleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, flex: 1 },

  greenBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#194D33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#CFA052' },
  storesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  storeCell: { width: '47%', paddingVertical: 8, paddingHorizontal: 6 },
  storeGoldLine: { height: 1, backgroundColor: '#CFA052', marginBottom: 8 },
  storeName: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  storeAddr: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  volRow: { flexDirection: 'row', gap: 6 },
  volChip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  volChipText: { fontFamily: 'Oswald_500Medium', fontSize: 12 },
  addBtn: { flex: 1, backgroundColor: '#CFA052', paddingVertical: 13, alignItems: 'center' },
  addBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#191816', letterSpacing: 1 },
});
