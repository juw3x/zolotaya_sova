import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
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

function SideProductPeek({
  side,
  product,
  isPastHero,
  isDark,
  labelColor,
  activeColor,
  onSelect,
}: {
  side: "left" | "right";
  product: Product;
  isPastHero: boolean;
  isDark: boolean;
  labelColor: string;
  activeColor: string;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.16)).current;

  useEffect(() => {
    const targetOpacity = hovered ? 1 : isPastHero ? (isDark ? 0.28 : 0.38) : 0.16;
    Animated.timing(opacityAnim, {
      toValue: targetOpacity,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [hovered, isPastHero, isDark, opacityAnim]);

  useEffect(() => {
    Animated.spring(hoverAnim, {
      toValue: hovered ? 1 : 0,
      friction: 7,
      tension: 85,
      useNativeDriver: true,
    }).start();
  }, [hovered, hoverAnim]);

  const isLeft = side === "left";
  const shiftX = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isLeft ? 58 : -58],
  });
  const scale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: "14%",
        bottom: "14%",
        [side]: 0,
        zIndex: 25,
        justifyContent: "center",
      }}
    >
      <Pressable
        onPress={onSelect}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          flexDirection: isLeft ? "row" : "row-reverse",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            marginLeft: isLeft ? -168 : 0,
            marginRight: isLeft ? 0 : -168,
            opacity: opacityAnim,
            transform: [{ translateX: shiftX }, { scale }],
          }}
        >
          <ContainerArt
            productId={product.id}
            type={product.container_type}
            visual={product.visual}
            height={380}
          />
        </Animated.View>

        <Animated.View
          style={{
            marginLeft: isLeft ? -62 : 0,
            marginRight: isLeft ? 0 : -62,
            flexDirection: isLeft ? "row" : "row-reverse",
            alignItems: "center",
            transform: [{ translateX: Animated.multiply(shiftX, 0.35) }],
          }}
        >
          <Text
            style={{
              color: hovered ? "#CFA052" : labelColor,
              fontSize: 18,
              marginHorizontal: 4,
            }}
          >
            {isLeft ? "‹" : "›"}
          </Text>
          <View
            style={{
              width: 28,
              height: 220,
              overflow: "visible",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                position: "absolute",
                width: 220,
                textAlign: "center",
                fontFamily: "Oswald_500Medium",
                fontSize: 11,
                letterSpacing: 2.2,
                color: hovered ? activeColor : labelColor,
                transform: [{ rotate: isLeft ? "-90deg" : "90deg" }],
              }}
            >
              {product.name.toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
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
  const { width, height } = useWindowDimensions();
  const isWide = width >= 860;
  const slideH = Math.max(540, height - 130);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Partial<Record<SectionId, number>>>({});
  const [activeSec, setActiveSec] = useState<SectionId>('desc');
  const [isPastHero, setIsPastHero] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const pageOpacity = useRef(new Animated.Value(0)).current;
  const panelSlideX = useRef(new Animated.Value(360)).current;
  const bottleScale = useRef(new Animated.Value(0.88)).current;
  const bottleShift = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    if (!product) return;
    setActiveSec('desc');
    setIsPastHero(false);
    scrollY.setValue(0);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    pageOpacity.setValue(0);
    panelSlideX.setValue(Math.min(width, 460));
    bottleScale.setValue(0.88);
    bottleShift.setValue(22);

    Animated.parallel([
      Animated.timing(pageOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(panelSlideX, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(bottleScale, { toValue: 1, friction: 6, tension: 75, useNativeDriver: true }),
      Animated.spring(bottleShift, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [product?.id, bottleScale, bottleShift, pageOpacity, panelSlideX, scrollY, width]);

  if (!product) return null;

  const d = getProductDetail(product);
  const isDark = themeMode === 'dark';
  const finalPrice = product.is_draft ? Math.round(product.base_price * draftVolume) : product.base_price;

  // Плавная интерполяция с учётом текущей темы приложения (dark или light)
  const targetBg = isDark ? '#191816' : '#F3EEE8';
  const transitionEnd = Math.max(260, slideH * 0.65);

  const bgInterp = scrollY.interpolate({
    inputRange: [0, transitionEnd * 0.35, transitionEnd],
    outputRange: ['#342014', '#342014', targetBg],
    extrapolate: 'clamp',
  });
  const badgeColorInterp = scrollY.interpolate({
    inputRange: [0, transitionEnd * 0.35, transitionEnd],
    outputRange: ['#FFFFFF', '#FFFFFF', '#CFA052'],
    extrapolate: 'clamp',
  });
  const peekOpacity = scrollY.interpolate({
    inputRange: [transitionEnd * 0.35, transitionEnd],
    outputRange: [0, isDark ? 0.22 : 0.34],
    extrapolate: 'clamp',
  });

  // Палитра первого экрана («Описание» — всегда фирменный шоколадный)
  const heroText = '#FFFFFF';
  const heroMuted = '#C4B3A3';
  const heroLine = 'rgba(207, 160, 82, 0.38)';

  // Палитра остальных разделов (подстраивается под тёмную или светлую тему)
  const bodyText = isDark ? '#FFFFFF' : '#1E1C1A';
  const bodySub = isDark ? '#CEC7BD' : '#524D47';
  const bodyMuted = isDark ? '#9A9287' : '#8C8378';
  const bodyLine = isDark ? 'rgba(207, 160, 82, 0.22)' : 'rgba(25, 24, 22, 0.14)';
  const cardBg = isDark ? '#23201D' : '#FFFFFF';

  const chromeText = isPastHero ? bodyText : heroText;
  const chromeMuted = isPastHero ? bodyMuted : heroMuted;
  const chromeLine = isPastHero ? bodyLine : heroLine;

  const brandStores = stores.filter((s) => s.name.includes('GOLD SOVA'));
  const deptStores = stores.filter((s) => !s.name.includes('GOLD SOVA'));

  function scrollToSection(id: SectionId) {
    setActiveSec(id);
    const y = offsets.current[id] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.setValue(y);

    const past = y > transitionEnd * 0.65;
    if (past !== isPastHero) setIsPastHero(past);

    let current: SectionId = 'desc';
    for (const sec of SECTIONS) {
      const top = offsets.current[sec.id];
      if (top !== undefined && y + 180 >= top) current = sec.id;
    }
    if (current !== activeSec) setActiveSec(current);
  }

  return (
    <Modal visible={!!product} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: "rgba(10, 9, 8, 0.75)", opacity: pageOpacity }}>
      <Animated.View style={[st.root, { backgroundColor: bgInterp, transform: [{ translateX: panelSlideX }] }]}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <Animated.View style={{ flex: 1, opacity: pageOpacity }}>
            {/* Верхняя шапка */}
            <View style={[st.topHeader, { borderBottomColor: chromeLine }]}>
              <TouchableOpacity onPress={onClose}>
                {isPastHero ? <OwlLogo size={26} /> : <BrandLogo compact />}
              </TouchableOpacity>

              <View style={st.topHeaderRight}>
                <TouchableOpacity style={st.topLink} onPress={onClose}>
                  <Text style={[st.topLinkText, { color: chromeText }]}>ВСЯ ПРОДУКЦИЯ</Text>
                  <View style={st.dotsGrid}>
                    <View style={[st.dotSq, { backgroundColor: chromeText }]} />
                    <View style={[st.dotSq, { backgroundColor: chromeText }]} />
                    <View style={[st.dotSq, { backgroundColor: chromeText }]} />
                    <View style={[st.dotSq, { backgroundColor: chromeText }]} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[st.closeSquare, { borderColor: chromeLine }]} onPress={onClose}>
                  <Text style={[st.closeSquareText, { color: chromeText }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Горизонтальное меню разделов для мобильных */}
            {!isWide && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ maxHeight: 42, borderBottomWidth: 1, borderBottomColor: chromeLine }}
                contentContainerStyle={{ paddingHorizontal: 14, alignItems: 'center', gap: 14 }}
              >
                {SECTIONS.map((sec) => {
                  const active = activeSec === sec.id;
                  return (
                    <TouchableOpacity key={sec.id} onPress={() => scrollToSection(sec.id)} style={{ paddingVertical: 8 }}>
                      <Text style={[st.sideMenuText, { color: active ? '#CFA052' : chromeMuted }]}>
                        {active ? '— ' : ''}
                        {sec.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Интерактивные боковые бутылки с выездом и осветлением при наведении */}
            {isWide && prevProduct && (
              <SideProductPeek
                side="left"
                product={prevProduct}
                isPastHero={isPastHero}
                isDark={isDark}
                labelColor={chromeMuted}
                activeColor={chromeText}
                onSelect={() => onSelectProduct(prevProduct)}
              />
            )}
            {isWide && nextProduct && (
              <SideProductPeek
                side="right"
                product={nextProduct}
                isPastHero={isPastHero}
                isDark={isDark}
                labelColor={chromeMuted}
                activeColor={chromeText}
                onSelect={() => onSelectProduct(nextProduct)}
              />
            )}

            {/* Основная область (сцентрирована на широком экране) */}
            <View style={[st.mainFrame, { flexDirection: isWide ? 'row' : 'column' }]}>
              {isWide && (
                <View style={st.leftCol}>

                  <View style={{ paddingLeft: 76, paddingTop: 26 }}>
                    <Text style={st.kicker}>{d.kicker}</Text>
                    <Animated.Text style={[st.bigNumber, { color: badgeColorInterp }]}>
                      {d.badge}
                      <Text style={{ fontSize: 22 }}>°</Text>
                    </Animated.Text>

                    <View style={{ marginTop: 42, gap: 11 }}>
                      {SECTIONS.map((sec) => {
                        const active = activeSec === sec.id;
                        return (
                          <TouchableOpacity
                            key={sec.id}
                            style={st.sideMenuItem}
                            onPress={() => scrollToSection(sec.id)}
                          >
                            <View style={[st.sideDash, { opacity: active ? 1 : 0 }]} />
                            <Text style={[st.sideMenuText, { color: active ? chromeText : chromeMuted }]}>
                              {sec.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

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
                      height={410}
                    />
                  </Animated.View>
                </View>
              )}

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
                <View style={{ maxWidth: 680, width: '100%' }}>
                  {/* 1. ОПИСАНИЕ */}
                  <View
                    onLayout={(e) => { offsets.current.desc = e.nativeEvent.layout.y; }}
                    style={[st.slide, isWide && { minHeight: slideH }]}
                  >
                    {!isWide && (
                      <View style={st.mobileHeroTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={st.kicker}>{d.kicker}</Text>
                          <Text style={[st.bigNumber, { fontSize: 44, color: heroText }]}>{d.badge}°</Text>
                        </View>
                        <Animated.View style={{ transform: [{ scale: bottleScale }] }}>
                          <ContainerArt
                            productId={product.id}
                            type={product.container_type}
                            visual={product.visual}
                            height={185}
                          />
                        </Animated.View>
                      </View>
                    )}

                    <Text style={[st.heroTitle, { color: heroText }]}>{product.name}</Text>

                    <View style={[st.specTable, { borderTopColor: heroLine }]}>
                      <View style={[st.specRow, { borderBottomColor: heroLine }]}>
                        <Text style={[st.specKey, { color: heroText }]}>Проверенное заводское качество</Text>
                        <Text style={[st.specVal, { color: heroMuted }]}>{d.gost}</Text>
                      </View>

                      <View style={[st.specRow, { borderBottomColor: heroLine }]}>
                        <View style={st.halfCell}>
                          <Text style={[st.specKey, { color: heroText }]}>Алкоголь</Text>
                          <Text style={[st.specVal, { color: '#CFA052', fontWeight: '700' }]}>
                            {product.is_alcohol ? `${product.abv.toFixed(1).replace('.', ',')}%` : '0,0%'}
                          </Text>
                        </View>
                        <View style={[st.halfCell, { borderLeftWidth: 1, borderLeftColor: heroLine, paddingLeft: 14 }]}>
                          <Text style={[st.specKey, { color: heroText }]}>Экстрактивность нач. сусла</Text>
                          <Text style={[st.specVal, { color: heroText }]}>
                            {product.is_alcohol ? `${product.og}%` : '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={[st.specRow, { borderBottomColor: heroLine }]}>
                        <Text style={[st.specKey, { color: heroText }]}>Цвет напитка</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[st.specVal, { color: heroMuted }]}>{d.colorName}</Text>
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <View
                                key={lvl}
                                style={[
                                  st.colorSeg,
                                  { backgroundColor: lvl <= d.colorLevel ? '#CFA052' : 'rgba(255,255,255,0.2)' },
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                      </View>

                      <View style={[st.compBox, { borderBottomColor: heroLine }]}>
                        <Text style={{ fontSize: 18 }}>🌾</Text>
                        <Text style={[st.compText, { color: heroText }]}>
                          <Text style={{ color: '#CFA052', fontFamily: 'Oswald_600SemiBold' }}>СОСТАВ: </Text>
                          {d.composition.toUpperCase()}
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
                    style={[st.slide, isWide && { minHeight: slideH }]}
                  >
                    <Text style={[st.sectionTitle, { color: bodyText }]}>{d.historyHeadline}</Text>

                    <View style={st.historyGrid}>
                      <View style={{ flex: 2 }}>
                        <Text style={[st.goldSubTitle, isWide && { textAlign: 'right' }]}>История сорта</Text>
                        <Text style={[st.bodyText, { color: bodySub }, isWide && { textAlign: 'right' }]}>
                          {d.historyText}
                        </Text>

                        <Text style={[st.goldSubTitle, { marginTop: 28 }, isWide && { textAlign: 'right' }]}>
                          Стиль пива
                        </Text>
                        <Text style={[st.bodyText, { color: bodySub }, isWide && { textAlign: 'right' }]}>
                          {d.styleText}
                        </Text>
                      </View>

                      <View style={[st.popBox, { borderTopColor: bodyLine }]}>
                        <Text style={st.popNum}>{d.popularity}</Text>
                        <Text style={[st.popLabel, { color: bodyMuted }]}>Популярность сорта</Text>
                      </View>
                    </View>
                  </View>

                  {/* 3. ВКУС */}
                  <View
                    onLayout={(e) => { offsets.current.taste = e.nativeEvent.layout.y; }}
                    style={[st.slide, isWide && { minHeight: slideH * 0.85 }, { alignItems: 'center' }]}
                  >
                    <Text style={st.kicker}>{d.tasteAuthor}</Text>
                    <Text style={[st.quoteText, { color: bodyText }]}>{d.tasteQuote}</Text>

                    <View style={[st.pairingCard, { borderColor: bodyLine, backgroundColor: cardBg }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={st.kicker}>ЕДА-ПЕЙРИНГ ОТ ТЕХНОЛОГА</Text>
                        <Text style={[st.specKey, { color: bodyText, marginTop: 4 }]}>{product.pairing.name}</Text>
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
                    style={[st.slide, isWide && { minHeight: slideH * 0.9 }]}
                  >
                    <View style={{ borderTopWidth: 1, borderTopColor: bodyLine }}>
                      {d.components.map(([k, v], idx) => (
                        <View key={`${k}-${idx}`} style={[st.compTableRow, { borderBottomColor: bodyLine }]}>
                          <Text style={[st.compTableKey, { color: bodyText }]}>{k}</Text>
                          <Text style={[st.compTableVal, { color: '#CFA052' }]}>{v}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 5. ФОРМАТЫ */}
                  <View
                    onLayout={(e) => { offsets.current.formats = e.nativeEvent.layout.y; }}
                    style={[st.slide, isWide && { minHeight: slideH * 0.85 }]}
                  >
                    <View style={st.twoColWrap}>
                      <Text style={[st.goldSubTitle, { flex: 1, fontSize: 18, textAlign: isWide ? 'right' : 'left' }]}>
                        Выберите удобный формат
                      </Text>
                      <Text style={[st.bodyText, { flex: 1.5, color: bodySub }]}>
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
                              { borderColor: active ? '#CFA052' : bodyLine },
                              active && { backgroundColor: 'rgba(207,160,82,0.12)' },
                            ]}
                            onPress={() => onSelectProduct(f.product)}
                          >
                            <ContainerArt
                              productId={f.product.id}
                              type={f.product.container_type}
                              visual={f.product.visual}
                              height={108}
                            />
                            <View style={[st.formatDivider, { backgroundColor: bodyLine }]} />
                            <Text style={st.formatVol}>{f.label}</Text>
                            <Text style={[st.formatSub, { color: bodyText }]}>{f.sub}</Text>
                            <Text style={[st.formatPrice, { color: bodyMuted }]}>
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
                    style={[st.slide, isWide && { minHeight: slideH * 0.7 }]}
                  >
                    <View style={[st.legendCard, { backgroundColor: cardBg, borderColor: bodyLine }]}>
                      <Text style={[st.legendTitle, { color: bodyText }]}>{d.legendTitle}</Text>
                      <Text style={[st.bodyText, { color: bodySub, marginTop: 14 }]}>{d.legendText}</Text>
                    </View>
                  </View>

                  {/* 7. ТЕХНОЛОГИЯ */}
                  <View
                    onLayout={(e) => { offsets.current.technology = e.nativeEvent.layout.y; }}
                    style={[st.slide, isWide && { minHeight: slideH * 0.85 }]}
                  >
                    <View style={st.techBanner}>
                      <Text style={st.techStamp}>КОНСЕРВЫ НЕ ПРОЙДУТ!</Text>
                      <Text style={st.techHeading}>Наш продукт —{'\n'}наша совесть!</Text>
                    </View>

                    <View style={[st.twoColWrap, { marginTop: 18 }]}>
                      <Text style={[st.bodyText, { flex: 1, color: bodySub }]}>
                        Никаких порошков. Только естественное созревание. Технология производства всех сортов на
                        «Золотой Сове» — классическая. Только натуральное сырьё и никакого постороннего
                        вмешательства.
                      </Text>
                      <Text style={[st.bodyText, { flex: 1, color: bodySub }]}>
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
                          <Text style={[st.principleText, { color: bodyText }]}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 8. ГДЕ КУПИТЬ */}
                  <View
                    onLayout={(e) => { offsets.current.buy = e.nativeEvent.layout.y; }}
                    style={[st.slide, { paddingBottom: 120 }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={[st.sectionTitle, { color: bodyText, marginBottom: 0 }]}>Где купить</Text>
                      <View style={st.greenBadge}>
                        <Text style={st.greenBadgeText}>{stores.length}</Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#CFA052' }}>
                        Фирменных{'\n'}точек в Кемерове
                      </Text>
                    </View>

                    <Text style={[st.goldSubTitle, { marginTop: 26 }]}>Магазины</Text>
                    <View style={st.storesGrid}>
                      {brandStores.map((stItem) => {
                        const active = stItem.id === selectedStore.id;
                        return (
                          <TouchableOpacity
                            key={stItem.id}
                            style={[st.storeCell, active && { backgroundColor: 'rgba(207,160,82,0.16)' }]}
                            onPress={() => onSelectStore(stItem)}
                          >
                            <View style={st.storeGoldLine} />
                            <Text style={[st.storeName, { color: bodyText }]}>{stItem.name}</Text>
                            <Text style={[st.storeAddr, { color: bodySub }]}>{stItem.address}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {deptStores.length > 0 && (
                      <>
                        <Text style={[st.goldSubTitle, { marginTop: 26 }]}>Фирменные отделы</Text>
                        <View style={st.storesGrid}>
                          {deptStores.map((stItem) => {
                            const active = stItem.id === selectedStore.id;
                            return (
                              <TouchableOpacity
                                key={stItem.id}
                                style={[st.storeCell, active && { backgroundColor: 'rgba(207,160,82,0.16)' }]}
                                onPress={() => onSelectStore(stItem)}
                              >
                                <View style={st.storeGoldLine} />
                                <Text style={[st.storeName, { color: bodyText }]}>{stItem.name}</Text>
                                <Text style={[st.storeAddr, { color: bodySub }]}>{stItem.address}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Нижняя панель заказа */}
            <Animated.View style={[st.bottomBar, { borderTopColor: chromeLine, backgroundColor: bgInterp }]}>
              {product.is_draft && (
                <View style={st.volRow}>
                  {[0.5, 1.0, 1.5].map((v) => {
                    const active = draftVolume === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        style={[
                          st.volChip,
                          { borderColor: active ? '#CFA052' : chromeLine },
                          active && { backgroundColor: '#CFA052' },
                        ]}
                        onPress={() => onChangeVolume(v)}
                      >
                        <Text style={[st.volChipText, { color: active ? '#191816' : chromeText }]}>{v} л</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              <TouchableOpacity style={st.addBtn} onPress={() => onAddProduct(product, draftVolume)}>
                <Text style={st.addBtnText}>В КОРЗИНУ • {finalPrice} ₽</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  topHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLinkText: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.4 },
  dotsGrid: {
    width: 12,
    height: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  dotSq: { width: 4, height: 4 },
  closeSquare: {
    width: 34,
    height: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeSquareText: { fontSize: 15 },

  peekLeft: { position: 'absolute', left: -135, top: '24%', zIndex: 1 },
  peekRight: { position: 'absolute', right: -135, top: '24%', zIndex: 1 },

  mainFrame: { flex: 1, width: '100%', maxWidth: 1320, alignSelf: 'center' },
  leftCol: { width: 260, position: 'relative', justifyContent: 'flex-start', zIndex: 5 },
  vertBtnLeft: {
    position: 'absolute',
    left: -34,
    top: '48%',
    width: 130,
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
    zIndex: 8,
  },
  vertBtnRight: {
    position: 'absolute',
    right: -34,
    top: '48%',
    width: 130,
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
    zIndex: 8,
  },
  vertBtnText: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 2 },

  kicker: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: '#CFA052', letterSpacing: 1.6 },
  bigNumber: { fontFamily: 'Oswald_600SemiBold', fontSize: 60, lineHeight: 66, marginTop: 4 },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center' },
  sideDash: { width: 16, height: 1.5, backgroundColor: '#CFA052', marginRight: 10 },
  sideMenuText: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 1.5 },

  centerBottleCol: { width: 230, justifyContent: 'center', alignItems: 'center', zIndex: 4 },

  scrollContent: { paddingBottom: 30 },
  slide: { paddingVertical: 36, justifyContent: 'center' },
  mobileHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 38, lineHeight: 44, marginBottom: 22 },
  specTable: { borderTopWidth: 1 },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  halfCell: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  specKey: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  specVal: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  colorSeg: { width: 18, height: 4, borderRadius: 2 },
  compBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  compText: { flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 19, letterSpacing: 0.5 },

  downCue: { alignItems: 'center', marginTop: 32 },
  downCueText: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#CFA052', letterSpacing: 1.8, marginBottom: 12 },
  downCueLine: { width: 1.5, height: 44, backgroundColor: '#CFA052' },
  downCueCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CFA052', marginTop: -8 },

  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 34, marginBottom: 26 },
  goldSubTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#CFA052', marginBottom: 10 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 21 },
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  twoColWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 },
  popBox: {
    minWidth: 130,
    borderTopWidth: 1,
    paddingTop: 14,
    alignSelf: 'flex-start',
  },
  popNum: { fontFamily: 'Oswald_600SemiBold', fontSize: 26, color: '#CFA052' },
  popLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },

  quoteText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: 1.6,
    marginTop: 14,
    maxWidth: 520,
  },
  pairingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 32,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#CFA052',
  },
  pairingBtn: { backgroundColor: '#191816', paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#CFA052' },
  pairingBtnText: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#CFA052' },

  compTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 16,
  },
  compTableKey: { fontFamily: 'Inter_600SemiBold', fontSize: 13, flex: 1 },
  compTableVal: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },

  formatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 26 },
  formatCard: { flex: 1, minWidth: 120, borderWidth: 1, padding: 14, alignItems: 'center' },
  formatDivider: { width: '100%', height: 1, marginVertical: 12 },
  formatVol: { fontFamily: 'Oswald_600SemiBold', fontSize: 17, color: '#CFA052' },
  formatSub: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 2 },
  formatPrice: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },

  legendCard: {
    padding: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  legendTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 22, letterSpacing: 1.8, textAlign: 'center' },

  techBanner: { borderLeftWidth: 3, borderLeftColor: '#CFA052', paddingLeft: 16 },
  techStamp: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#CFA052', letterSpacing: 2 },
  techHeading: { fontFamily: 'Inter_700Bold', fontSize: 28, color: '#CFA052', lineHeight: 34, marginTop: 4 },
  principlesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 26 },
  principleItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  principleNum: { fontFamily: 'Oswald_600SemiBold', fontSize: 24, color: '#CFA052' },
  principleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, flex: 1 },

  greenBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#194D33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#CFA052' },
  storesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  storeCell: { width: '46%', paddingVertical: 10, paddingHorizontal: 6 },
  storeGoldLine: { height: 1, backgroundColor: '#CFA052', marginBottom: 10 },
  storeName: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  storeAddr: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    zIndex: 10,
  },
  volRow: { flexDirection: 'row', gap: 6 },
  volChip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  volChipText: { fontFamily: 'Oswald_500Medium', fontSize: 12 },
  addBtn: { flex: 1, backgroundColor: '#CFA052', paddingVertical: 13, alignItems: 'center' },
  addBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#191816', letterSpacing: 1 },
});
