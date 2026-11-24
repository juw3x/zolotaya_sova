import React from 'react';
import { Image, View, Text } from 'react-native';
import { PRODUCT_IMAGES } from '../productImages';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';
import { MOODS } from '../data';

export function OwlLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.24} viewBox="0 0 100 124">
      {/* Внешний охристый силуэт совы с плоской макушкой и лапками */}
      <Path
        d="M20 6 L80 6 L71 19 C81 26 82 39 73 46 C87 53 91 71 84 89 C80 99 74 106 70 110 C76 112 79 116 78 120 L22 120 C21 116 24 112 30 110 C26 106 20 99 16 89 C9 71 13 53 27 46 C18 39 19 26 29 19 Z"
        fill="#D89F5C"
      />
      {/* Тёмно-терракотовая лицевая маска с клювом */}
      <Path
        d="M28 12 L72 12 L66 20 C75 26 75 39 65 44 C59 47 54 45 50 50 C46 45 41 47 35 44 C25 39 25 26 34 20 Z"
        fill="#9C4A1A"
      />
      {/* Круглые глаза с вертикальной перемычкой снизу */}
      <Circle cx="38.5" cy="31" r="8.2" fill="none" stroke="#D89F5C" strokeWidth="3.4" />
      <Circle cx="61.5" cy="31" r="8.2" fill="none" stroke="#D89F5C" strokeWidth="3.4" />
      <Rect x="36.8" y="30" width="3.4" height="8.5" rx="1.2" fill="#D89F5C" />
      <Rect x="59.8" y="30" width="3.4" height="8.5" rx="1.2" fill="#D89F5C" />
      {/* Живот — шишка хмеля (7 чешуек) */}
      <Path d="M25 68 C26 52 38 48 50 48 C62 48 74 52 75 68 C66 67 60 65 56 62 C53 66 51 68 50 69 C49 68 47 66 44 62 C40 65 34 67 25 68 Z" fill="#9C4A1A" />
      <Path d="M26 73 C33 72 39 70 43 67 C44 76 41 83 33 88 C27 84 25 78 26 73 Z" fill="#9C4A1A" />
      <Path d="M74 73 C67 72 61 70 57 67 C56 76 59 83 67 88 C73 84 75 78 74 73 Z" fill="#9C4A1A" />
      <Path d="M50 73 C55 78 58 86 50 96 C42 86 45 78 50 73 Z" fill="#9C4A1A" />
      <Path d="M34 92 C39 90 42 88 44 86 C45 92 44 98 39 102 C35 99 33 96 34 92 Z" fill="#9C4A1A" />
      <Path d="M66 92 C61 90 58 88 56 86 C55 92 56 98 61 102 C65 99 67 96 66 92 Z" fill="#9C4A1A" />
      <Path d="M50 99 C54 103 55 107 50 112 C45 107 46 103 50 99 Z" fill="#9C4A1A" />
    </Svg>
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const iconSize = compact ? 28 : 42;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <OwlLogo size={iconSize} />
      <View style={{ marginLeft: compact ? 8 : 12 }}>
        <Text
          style={{
            fontFamily: 'Oswald_600SemiBold',
            fontSize: compact ? 15 : 22,
            lineHeight: compact ? 16 : 23,
            color: '#D89F5C',
            letterSpacing: 1.4,
          }}
        >
          ЗОЛОТАЯ
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontFamily: 'Oswald_600SemiBold',
              fontSize: compact ? 15 : 22,
              lineHeight: compact ? 16 : 23,
              color: '#D89F5C',
              letterSpacing: 1.4,
            }}
          >
            СОВА
          </Text>
          <Text
            style={{
              fontFamily: 'Oswald_400Regular',
              fontSize: compact ? 9 : 11,
              color: '#B8894D',
              marginLeft: 5,
            }}
          >
            1972
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ContainerArt({
  productId,
  type,
  visual,
  height = 112,
}: {
  productId?: number;
  type: 'glass' | 'pet' | 'keg';
  visual: { top: string; bottom: string; bottle?: string };
  height?: number;
}) {
  if (productId && PRODUCT_IMAGES[productId]) {
    return (
      <Image
        source={PRODUCT_IMAGES[productId]}
        style={{ width: height * 0.9, height }}
        resizeMode="contain"
      />
    );
  }
  const { top, bottom, bottle = '#5C2C0C' } = visual;

  if (type === 'keg') {
    return (
      <Svg width={height * 0.72} height={height} viewBox="0 0 90 125">
        <Defs>
          <LinearGradient id="kegMetal" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#8E9298" />
            <Stop offset="0.35" stopColor="#E6E9ED" />
            <Stop offset="0.7" stopColor="#B8BDC4" />
            <Stop offset="1" stopColor="#7A7E85" />
          </LinearGradient>
        </Defs>
        <Rect x="14" y="10" width="62" height="104" rx="5" fill="url(#kegMetal)" />
        <Rect x="34" y="16" width="22" height="6" rx="3" fill="#4E5258" />
        <Rect x="12" y="30" width="66" height="5" rx="2" fill="#A5AAB2" />
        <Rect x="14" y="35" width="62" height="22" fill={top} />
        <Rect x="14" y="57" width="62" height="33" fill={bottom} />
        <Rect x="12" y="90" width="66" height="5" rx="2" fill="#A5AAB2" />
        <Rect x="22" y="12" width="7" height="100" fill="#FFFFFF" opacity={0.18} />
      </Svg>
    );
  }

  if (type === 'pet') {
    return (
      <Svg width={height * 0.45} height={height} viewBox="0 0 60 135">
        <Rect x="22" y="6" width="16" height="8" rx="2" fill="#B89F5D" />
        <Path
          d="M23 14 L37 14 L46 38 C50 48 50 56 44 64 L44 74 C49 82 50 96 47 120 C46 127 40 130 30 130 C20 130 14 127 13 120 C10 96 11 82 16 74 L16 64 C10 56 10 48 14 38 Z"
          fill={bottle}
        />
        <Rect x="14" y="63" width="32" height="18" fill={top} />
        <Rect x="14" y="81" width="32" height="22" fill={bottom} />
        <Path d="M20 35 L18 118" stroke="#FFFFFF" strokeWidth="2.5" opacity={0.22} />
      </Svg>
    );
  }

  return (
    <Svg width={height * 0.36} height={height} viewBox="0 0 54 150">
      <Rect x="21" y="5" width="12" height="6" rx="1.5" fill={bottom} />
      <Path
        d="M22 11 L32 11 L35 44 C41 53 43 62 43 74 L43 134 C43 141 38 144 27 144 C16 144 11 141 11 134 L11 74 C11 62 13 53 19 44 Z"
        fill={bottle}
      />
      <Path d="M20 35 L34 35 L36 45 L18 45 Z" fill={top} />
      <Rect x="11" y="74" width="32" height="22" fill={top} />
      <Rect x="11" y="96" width="32" height="28" fill={bottom} />
      <Rect x="16" y="54" width="3" height="80" fill="#FFFFFF" opacity={0.2} />
    </Svg>
  );
}

export function FlavorWheelSvg({ size = 264 }: { size?: number }) {
  const cx = 150;
  const cy = 150;
  const r = 138;
  const step = 360 / MOODS.length;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Circle cx={cx} cy={cy} r={146} fill="none" stroke="#CFA052" strokeWidth="2" />
      {MOODS.map((m, i) => {
        const start = i * step;
        const end = start + step;
        const mid = start + step / 2;
        const x1 = cx + r * Math.cos(toRad(start));
        const y1 = cy + r * Math.sin(toRad(start));
        const x2 = cx + r * Math.cos(toRad(end));
        const y2 = cy + r * Math.sin(toRad(end));
        const tx = cx + 92 * Math.cos(toRad(mid));
        const ty = cy + 92 * Math.sin(toRad(mid));

        return (
          <G key={m.id}>
            <Path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={m.color}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <SvgText
              x={tx}
              y={ty}
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${mid}, ${tx}, ${ty})`}
            >
              {m.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
