import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Animated, Easing,
  StatusBar, NativeSyntheticEvent, NativeScrollEvent, Pressable, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATALOG, MOODS, Product, PRODUCTS, Store, STORES } from './data';
import { BrandLogo, ContainerArt, FlavorWheelSvg, OwlLogo } from './components/Art';
import { BeerBubbles, FadeSlide, ScalePress } from './components/Motion';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { s, THEMES, ThemeMode } from './styles';

type Tab = 'home' | 'about' | 'catalog' | 'wheel' | 'stores';
type OrderStatus = 'accepted' | 'pouring' | 'ready';

interface CartItem {
  key: string;
  name: string;
  subtitle?: string;
  unitPrice: number;
  quantity: number;
}

interface LocalOrder {
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

export default function AppRoot() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [tab, setTab] = useState<Tab>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store>(STORES[0]);

  const [activeCatId, setActiveCatId] = useState<number>(CATALOG[0].id);
  const homeScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const aboutScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const catalogScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const wheelScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const storesScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const sectionOffsets = useRef<Record<number, number>>({});

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [draftVolume, setDraftVolume] = useState<number>(1.0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pickupTime, setPickupTime] = useState('Через 15 минут');
  const [activeOrder, setActiveOrder] = useState<LocalOrder | null>(null);

  const wheelAnim = useRef(new Animated.Value(0)).current;
  const wheelAngle = useRef(0);
  const [wheelMood, setWheelMood] = useState<(typeof MOODS)[0] | null>(null);
  const [wheelProducts, setWheelProducts] = useState<Product[]>([]);
  const [spinning, setSpinning] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  const t = THEMES[themeMode];

  useEffect(() => {
    AsyncStorage.getItem('sova_age_ok').then((v) => setAgeVerified(v === '1'));
    AsyncStorage.getItem('sova_theme').then((v) => {
      if (v === 'dark' || v === 'light') setThemeMode(v);
    });
    AsyncStorage.getItem('sova_store_id').then((id) => {
      const found = STORES.find((st) => String(st.id) === id);
      if (found) setSelectedStore(found);
    });
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'ready') return;
    const delay = activeOrder.status === 'accepted' ? 3500 : 4500;
    const next: OrderStatus = activeOrder.status === 'accepted' ? 'pouring' : 'ready';
    const timer = setTimeout(() => {
      setActiveOrder((prev) => (prev ? { ...prev, status: next } : null));
    }, delay);
    return () => clearTimeout(timer);
  }, [activeOrder?.code, activeOrder?.status]);

  function navigateTo(target: Tab) {
    setTab(target);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      if (target === 'home') homeScrollRef.current?.scrollTo({ y: 0, animated: true });
      if (target === 'about') aboutScrollRef.current?.scrollTo({ y: 0, animated: true });
      if (target === 'catalog') {
        setActiveCatId(CATALOG[0].id);
        catalogScrollRef.current?.scrollTo({ y: 0, animated: true });
      }
      if (target === 'wheel') wheelScrollRef.current?.scrollTo({ y: 0, animated: true });
      if (target === 'stores') storesScrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  }

  function changeTheme(mode: ThemeMode) {
    setThemeMode(mode);
    AsyncStorage.setItem('sova_theme', mode);
  }

  function toggleTheme() {
    changeTheme(themeMode === 'dark' ? 'light' : 'dark');
  }

  function bounceFab() {
    fabScale.setValue(0.92);
    Animated.spring(fabScale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
  }

  function selectStore(st: Store) {
    setSelectedStore(st);
    AsyncStorage.setItem('sova_store_id', String(st.id));
    navigateTo('catalog');
  }

  function addItem(key: string, name: string, unitPrice: number, subtitle?: string) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { key, name, subtitle, unitPrice, quantity: 1 }];
    });
    bounceFab();
  }

  function addProductToCart(p: Product, vol: number) {
    const price = p.is_draft ? Math.round(p.base_price * vol) : p.base_price;
    const sub = p.is_draft ? `Розлив ${vol} л` : p.subtitle;
    addItem(`p_${p.id}_${p.is_draft ? vol : 0}`, p.name, price, sub);
    setDetailProduct(null);
  }

  function navigateProduct(dir: -1 | 1) {
    if (!detailProduct) return;
    const idx = PRODUCTS.findIndex((item) => item.id === detailProduct.id);
    if (idx < 0) return;
    const nextIdx = (idx + dir + PRODUCTS.length) % PRODUCTS.length;
    setDraftVolume(1.0);
    setDetailProduct(PRODUCTS[nextIdx]);
  }

  function updateQty(key: string, delta: number) {
    setCart((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + delta } : i)).filter((i) => i.quantity > 0)
    );
  }

  function submitOrder() {
    if (cart.length === 0) return;
    const code = `SOVA-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveOrder({
      code,
      storeAddress: selectedStore.address,
      pickupTime,
      totalPrice: totalSum,
      status: 'accepted',
    });
    setCart([]);
  }

  function spinWheel(chosenIdx?: number) {
    if (spinning) return;
    setSpinning(true);
    const idx = chosenIdx ?? Math.floor(Math.random() * MOODS.length);
    const sectorDeg = 360 / MOODS.length;
    const alignToTop = 360 - (idx * sectorDeg + sectorDeg / 2);
    const baseFull = Math.ceil(wheelAngle.current / 360) * 360;
    const target = baseFull + 720 + alignToTop;
    wheelAngle.current = target;

    Animated.timing(wheelAnim, {
      toValue: target,
      duration: 1900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const mood = MOODS[idx];
      setWheelMood(mood);
      setWheelProducts(PRODUCTS.filter((p) => p.mood_tags.includes(mood.id)).slice(0, 4));
      setSpinning(false);
    });
  }

  function handleCatalogScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const y = contentOffset.y;

    if (y + layoutMeasurement.height >= contentSize.height - 28) {
      const lastId = CATALOG[CATALOG.length - 1].id;
      if (activeCatId !== lastId) setActiveCatId(lastId);
      return;
    }

    let current = CATALOG[0].id;
    for (const c of CATALOG) {
      const top = sectionOffsets.current[c.id];
      if (top !== undefined && y + 90 >= top) current = c.id;
    }
    if (current !== activeCatId) setActiveCatId(current);
  }

  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalSum = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (ageVerified === null) return null;

  if (!ageVerified) {
    return (
      <SafeAreaView style={[s.darkScreen, { backgroundColor: t.bg }]}>
        <BeerBubbles />
        <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
        <FadeSlide offset={20} style={s.ageBox}>
          <BrandLogo />
          <Text style={[s.brandSub, { color: t.textMuted }]}>КЕМЕРОВСКИЙ ПИВОВАРЕННЫЙ ЗАВОД</Text>
          <View style={s.ochreLine} />
          <Text style={[s.ageText, { color: t.textSecondary }]}>
            Для входа подтвердите, что вам исполнилось 18 лет. Оплата и выдача алкогольной продукции
            строго на кассе по паспорту.
          </Text>
          <ScalePress
            onPress={() => {
              AsyncStorage.setItem('sova_age_ok', '1');
              setAgeVerified(true);
            }}
          >
            <View style={s.ochreBtn}>
              <Text style={s.ochreBtnText}>МНЕ ЕСТЬ 18 ЛЕТ</Text>
            </View>
          </ScalePress>
        </FadeSlide>
      </SafeAreaView>
    );
  }

  const spinInterpolate = wheelAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Шапка */}
      <View style={[s.header, { backgroundColor: t.bg, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => navigateTo('home')}>
          <BrandLogo compact />
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={[s.themeIconBtn, { borderColor: t.border, backgroundColor: t.surface }]}
            onPress={toggleTheme}
            accessibilityLabel="Переключить тему"
          >
            <Text style={[s.themeIconText, { color: t.accent }]}>{themeMode === 'dark' ? '☀' : '☾'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navChip} onPress={() => navigateTo('catalog')}>
            <Text style={[s.navChipText, { color: t.text }]}>ПРОДУКЦИЯ</Text>
            <View style={s.dotsGrid}>
              <View style={[s.dotSq, { backgroundColor: t.text }]} />
              <View style={[s.dotSq, { backgroundColor: t.text }]} />
              <View style={[s.dotSq, { backgroundColor: t.text }]} />
              <View style={[s.dotSq, { backgroundColor: t.text }]} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={s.navChip} onPress={() => setMenuOpen(true)}>
            <View style={s.burgerWrap}>
              <View style={[s.burgerLine, { backgroundColor: t.text }]} />
              <View style={[s.burgerLine, { backgroundColor: t.text }]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1. ГЛАВНАЯ */}
      {tab === 'home' && (
        <View style={{ flex: 1 }}>
          <BeerBubbles />
          <ScrollView ref={homeScrollRef} contentContainerStyle={s.homeWrap}>
            <FadeSlide delay={0}>
              <TouchableOpacity style={[s.storeBanner, { borderBottomColor: t.border }]} onPress={() => navigateTo('stores')}>
                <Text style={[s.storeBannerText, { color: t.textMuted }]} numberOfLines={1}>
                  Кемерово • {selectedStore.address}
                </Text>
                <Text style={s.storeBannerAction}>СМЕНИТЬ</Text>
              </TouchableOpacity>
              <Text style={[s.heroTitle, { color: t.text }]}>Золотые стандарты{'\n'}«ЗОЛОТОЙ СОВЫ»</Text>
              <TouchableOpacity onPress={() => navigateTo('about')} style={s.underlinedLink}>
                <Text style={[s.underlinedLinkText, { color: t.textSecondary }]}>УЗНАТЬ БОЛЬШЕ</Text>
                <View style={s.underlinedBar} />
              </TouchableOpacity>
            </FadeSlide>

            <FadeSlide delay={90}>
              <ScalePress onPress={() => navigateTo('catalog')}>
                <View style={s.ochreCard}>
                  <Text style={s.ochreCardKicker}>ЛЕГЕНДАРНЫЕ НАПИТКИ</Text>
                  <Text style={s.ochreCardTitle}>Откройте для себя продукцию Золотой совы.</Text>
                  <Text style={s.ochreArrow}>↙</Text>
                </View>
              </ScalePress>
            </FadeSlide>

            <FadeSlide delay={170}>
              <ScalePress onPress={() => navigateTo('wheel')}>
                <View style={s.ochreCard}>
                  <Text style={s.ochreCardKicker}>ГИД ПО ПИВУ</Text>
                  <Text style={s.ochreCardTitle}>Колесо вкусов — подбор под настроение и блюдо.</Text>
                  <Text style={s.ochreArrow}>↙</Text>
                </View>
              </ScalePress>
            </FadeSlide>

            <Animated.View style={[s.scrollCueWrap, { opacity: pulseAnim }]}>
              <View style={s.scrollCueLine} />
              <View style={s.scrollCueCircle} />
            </Animated.View>
          </ScrollView>
        </View>
      )}

      {/* 2. О «ЗОЛОТОЙ СОВЕ» */}
      {tab === 'about' && (
        <ScrollView ref={aboutScrollRef} contentContainerStyle={s.aboutWrap}>
          <FadeSlide>
            <TouchableOpacity style={s.aboutBack} onPress={() => navigateTo('home')}>
              <Text style={s.aboutBackText}>← НА ГЛАВНУЮ</Text>
            </TouchableOpacity>

            <BrandLogo />
            <Text style={s.aboutKicker}>КЕМЕРОВСКИЙ ПИВОВАРЕННЫЙ ЗАВОД • С 1972 ГОДА</Text>
            <Text style={[s.aboutLead, { color: t.textSecondary }]}>
              «Золотая Сова» — это кемеровский завод напитков с полувековой историей и собственной сетью
              фирменных магазинов «GOLD SOVA». Мы варим классические лагеры, живой хлебный квас и
              натуральные лимонады по традиционным рецептурам.
            </Text>

            <View style={s.statsGrid}>
              {[
                ['1972', 'Год основания завода в Кемерове'],
                [String(STORES.length), 'Фирменных магазинов и отделов'],
                [String(PRODUCTS.length), 'Позиций пива, кваса и лимонадов'],
                ['21 день', 'Классическая выдержка лагеров'],
              ].map(([num, label]) => (
                <View key={num} style={[s.statCard, { backgroundColor: t.surface }]}>
                  <Text style={s.statNum}>{num}</Text>
                  <Text style={[s.statLabel, { color: t.textMuted }]}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={[s.aboutSection, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[s.aboutSectionTitle, { color: t.text }]}>НАТУРАЛЬНЫЕ СТАНДАРТЫ</Text>
              <Text style={[s.aboutSectionText, { color: t.textSecondary }]}>
                Отборный солод, ароматный хмель и подготовленная вода — без искусственных красителей и
                ускорителей брожения. Разливные сорта попадают на краны фирменных точек напрямую с производства.
              </Text>
            </View>

            <View style={[s.aboutSection, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[s.aboutSectionTitle, { color: t.text }]}>САМОВЫВОЗ У ДОМА (18+)</Text>
              <Text style={[s.aboutSectionText, { color: t.textSecondary }]}>
                Выберите ближайший магазин в Кемерове, соберите корзину и забронируйте напитки к удобному
                времени. К вашему приходу заказ уже будет собран — оплата и выдача проходят на кассе по паспорту.
              </Text>
            </View>

            <View style={s.sheetActions}>
              <TouchableOpacity
                style={[s.closeBtn, { borderColor: t.text }]}
                onPress={() => navigateTo('stores')}
              >
                <Text style={[s.closeBtnText, { color: t.text }]}>МАГАЗИНЫ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={() => navigateTo('catalog')}>
                <Text style={s.ochreBtnText}>ОТКРЫТЬ КАТАЛОГ</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>
        </ScrollView>
      )}

      {/* 3. КАТАЛОГ */}
      {tab === 'catalog' && (
        <FadeSlide style={s.catalogLayout} offset={10}>
          <View style={[s.sidebar, { backgroundColor: t.bg, borderRightColor: t.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATALOG.map((c) => {
                const active = c.id === activeCatId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={s.sideItem}
                    onPress={() => {
                      setActiveCatId(c.id);
                      catalogScrollRef.current?.scrollTo({ y: sectionOffsets.current[c.id] ?? 0, animated: true });
                    }}
                  >
                    {active && <View style={s.sideDash} />}
                    <Text style={[s.sideText, { color: active ? t.text : t.textMuted }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <ScrollView
            ref={catalogScrollRef}
            style={s.feed}
            contentContainerStyle={{ paddingBottom: 140 }}
            scrollEventThrottle={16}
            onScroll={handleCatalogScroll}
          >
            {CATALOG.map((cat) => (
              <View
                key={cat.id}
                onLayout={(e) => { sectionOffsets.current[cat.id] = e.nativeEvent.layout.y; }}
                style={s.catBlock}
              >
                <Text style={[s.catHeader, { color: t.text }]}>{cat.name.toUpperCase()}</Text>
                <View style={s.grid}>
                  {cat.products.map((p) => (
                    <ScalePress
                      key={p.id}
                      style={s.card}
                      onPress={() => { setDraftVolume(1.0); setDetailProduct(p); }}
                    >
                      <View style={[s.pedestal, { backgroundColor: t.surface }]}>
                        <ContainerArt productId={p.id} type={p.container_type} visual={p.visual} height={110} />
                      </View>
                      <Text style={[s.cardTitle, { color: t.text }]} numberOfLines={2}>{p.name.toUpperCase()}</Text>
                      {!!p.subtitle && <Text style={s.cardSub} numberOfLines={1}>{p.subtitle.toUpperCase()}</Text>}
                      <Text style={[s.cardPrice, { color: t.text }]}>{p.base_price} ₽{p.is_draft ? ' / л' : ''}</Text>
                    </ScalePress>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </FadeSlide>
      )}

      {/* 4. КОЛЕСО ВКУСОВ */}
      {tab === 'wheel' && (
        <ScrollView ref={wheelScrollRef} contentContainerStyle={s.wheelWrap}>
          <FadeSlide style={{ alignItems: 'center', width: '100%' }}>
            <Text style={[s.pageTitle, { color: t.text }]}>КОЛЕСО ВКУСОВ</Text>
            <Text style={[s.pageSub, { color: t.textMuted }]}>Нажми на сову в центре или выбери настроение</Text>
            <View style={[s.pointer, { borderTopColor: t.accent }]} />
            <View style={s.wheelContainer}>
              <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                <FlavorWheelSvg size={264} />
              </Animated.View>
              <ScalePress style={s.wheelCenter} scaleTo={0.9} onPress={() => spinWheel()}>
                <View style={{ alignItems: 'center' }}>
                  <OwlLogo size={32} />
                  <Text style={s.wheelSpinText}>{spinning ? '...' : 'КРУТИТЬ'}</Text>
                </View>
              </ScalePress>
            </View>
            <View style={s.moodChips}>
              {MOODS.map((m, i) => {
                const active = wheelMood?.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      s.moodChip,
                      { borderColor: active ? t.chipActiveBg : t.border },
                      active && { backgroundColor: t.chipActiveBg },
                    ]}
                    onPress={() => spinWheel(i)}
                  >
                    <Text style={[s.moodChipText, { color: active ? t.chipActiveText : t.text }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {wheelProducts.length > 0 && (
              <FadeSlide key={wheelMood?.id} style={{ width: '100%', marginTop: 18 }}>
                <Text style={[s.catHeader, { color: t.text }]}>ПОДХОДИТ ПОД «{wheelMood?.label}»</Text>
                {wheelProducts.map((p) => (
                  <ScalePress key={p.id} onPress={() => { setDraftVolume(1.0); setDetailProduct(p); }}>
                    <View style={[s.recRow, { backgroundColor: t.surface }]}>
                      <ContainerArt productId={p.id} type={p.container_type} visual={p.visual} height={58} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[s.cardTitle, { color: t.text }]}>{p.name}</Text>
                        <Text style={s.cardSub}>К закуске: {p.pairing.name}</Text>
                      </View>
                      <Text style={[s.cardPrice, { color: t.text }]}>{p.base_price} ₽</Text>
                    </View>
                  </ScalePress>
                ))}
              </FadeSlide>
            )}
          </FadeSlide>
        </ScrollView>
      )}

      {/* 5. ГДЕ КУПИТЬ */}
      {tab === 'stores' && (
        <ScrollView ref={storesScrollRef} contentContainerStyle={s.storesWrap}>
          <FadeSlide>
            <View style={s.storesHead}>
              <Text style={[s.pageTitle, { color: t.text }]}>ГДЕ КУПИТЬ</Text>
              <View style={s.greenBadge}><Text style={s.greenBadgeText}>{STORES.length}</Text></View>
            </View>
            <Text style={[s.pageSub, { textAlign: 'left', color: t.textMuted }]}>
              Кемерово • выбери точку для самовывоза у дома
            </Text>
            {STORES.map((st) => {
              const active = selectedStore.id === st.id;
              return (
                <ScalePress key={st.id} scaleTo={0.98} onPress={() => selectStore(st)}>
                  <View style={[s.storeRow, active && { backgroundColor: t.surface, paddingHorizontal: 10 }]}>
                    <View style={s.storeTopLine} />
                    <Text style={[s.storeName, { color: t.text }]}>{st.name}</Text>
                    <Text style={[s.storeAddr, { color: t.textSecondary }]}>{st.address}</Text>
                    <Text style={s.storeHours}>{st.work_hours} {active ? '• ВЫБРАН' : ''}</Text>
                  </View>
                </ScalePress>
              );
            })}
          </FadeSlide>
        </ScrollView>
      )}

      {(totalCount > 0 || activeOrder) && (
        <Animated.View style={[s.cartFab, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => setCartOpen(true)}>
            <Text style={s.cartFabText}>
              {activeOrder
                ? `БРОНЬ ${activeOrder.code} • ${STATUS_LABELS[activeOrder.status].toUpperCase()}`
                : `КОРЗИНА (${totalCount}) • ${totalSum} ₽`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Нижнее меню — нажатие всегда переводит в начало выбранного экрана */}
      <View style={[s.tabBar, { backgroundColor: t.tabBg, borderTopColor: t.border }]}>
        {([['home', 'ГЛАВНАЯ'], ['catalog', 'КАТАЛОГ'], ['wheel', 'КОЛЕСО'], ['stores', 'МАГАЗИНЫ']] as [Tab, string][]).map(
          ([id, label]) => {
            const active = tab === id || (id === 'home' && tab === 'about');
            return (
              <TouchableOpacity key={id} style={s.tabItem} onPress={() => navigateTo(id)}>
                <Text style={[s.tabText, { color: active ? t.text : t.textMuted }]}>{label}</Text>
                {active && <View style={s.tabDot} />}
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* Полноэкранное меню */}
      <Modal visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <SafeAreaView style={[s.menuOverlay, { backgroundColor: t.bg }]}>
          <BeerBubbles />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <BrandLogo compact />
            <TouchableOpacity onPress={() => setMenuOpen(false)}>
              <Text style={{ fontFamily: 'Oswald_600SemiBold', fontSize: 16, color: '#CFA052' }}>ЗАКРЫТЬ ✕</Text>
            </TouchableOpacity>
          </View>
          <View>
            {([
              ['home', 'ГЛАВНАЯ'],
              ['about', 'О «ЗОЛОТОЙ СОВЕ»'],
              ['catalog', 'ВСЯ ПРОДУКЦИЯ'],
              ['wheel', 'КОЛЕСО ВКУСОВ'],
              ['stores', 'ГДЕ КУПИТЬ'],
            ] as [Tab, string][]).map(([id, label], idx) => (
              <FadeSlide key={id} delay={idx * 45}>
                <TouchableOpacity
                  style={[s.menuItem, { borderBottomColor: t.border }]}
                  onPress={() => navigateTo(id)}
                >
                  <Text style={[s.menuItemText, { color: t.text }]}>{label}</Text>
                </TouchableOpacity>
              </FadeSlide>
            ))}

            <View style={s.themeSwitchRow}>
              <TouchableOpacity
                style={[
                  s.themeSwitchBtn,
                  { borderColor: themeMode === 'dark' ? t.accent : t.border },
                  themeMode === 'dark' && { backgroundColor: t.accent },
                ]}
                onPress={() => changeTheme('dark')}
              >
                <Text style={[s.themeSwitchText, { color: themeMode === 'dark' ? '#191816' : t.text }]}>
                  ☾ ТЁМНАЯ ТЕМА
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.themeSwitchBtn,
                  { borderColor: themeMode === 'light' ? t.accent : t.border },
                  themeMode === 'light' && { backgroundColor: t.accent },
                ]}
                onPress={() => changeTheme('light')}
              >
                <Text style={[s.themeSwitchText, { color: themeMode === 'light' ? '#191816' : t.text }]}>
                  ☀ СВЕТЛАЯ ТЕМА
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.textMuted }}>
            Точка самовывоза: {selectedStore.address}
          </Text>
        </SafeAreaView>
      </Modal>

      {/* Фирменная анимированная карточка товара */}
      {(() => {
        const curIdx = detailProduct ? PRODUCTS.findIndex((x) => x.id === detailProduct.id) : -1;
        const prevProduct = curIdx >= 0 ? PRODUCTS[(curIdx - 1 + PRODUCTS.length) % PRODUCTS.length] : null;
        const nextProduct = curIdx >= 0 ? PRODUCTS[(curIdx + 1) % PRODUCTS.length] : null;
        return (
          <ProductModal
            product={detailProduct}
            prevProduct={prevProduct}
            nextProduct={nextProduct}
            stores={STORES}
            selectedStore={selectedStore}
            theme={t}
            themeMode={themeMode}
            draftVolume={draftVolume}
            onChangeVolume={setDraftVolume}
            onClose={() => setDetailProduct(null)}
            onAddProduct={addProductToCart}
            onAddPairing={(p) => addItem(`snack_${p.id}`, p.pairing.name, p.pairing.price, "Закуска")}
            onSelectProduct={(p) => { setDraftVolume(1.0); setDetailProduct(p); }}
            onSelectStore={(st) => {
              setSelectedStore(st);
              AsyncStorage.setItem("sova_store_id", String(st.id));
            }}
          />
        );
      })()}

      {/* Фирменная выезжающая корзина и талон самовывоза */}
      <CartModal
        visible={cartOpen}
        cart={cart}
        activeOrder={activeOrder}
        selectedStore={selectedStore}
        pickupTime={pickupTime}
        totalSum={totalSum}
        themeMode={themeMode}
        pulseAnim={pulseAnim}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onChangePickupTime={setPickupTime}
        onSubmitOrder={submitOrder}
        onClearOrder={() => { setActiveOrder(null); setCartOpen(false); }}
      />
    </SafeAreaView>
  );
}
