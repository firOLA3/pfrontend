import React from 'react';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  G,
  Mask,
  ClipPath,
} from 'react-native-svg';

export interface IconProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

// 1. Flame Icon (Figma #2174:1660 noto:fire)
export const FlameIcon: React.FC<IconProps> = ({ size = 16, style }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
    <Path
      d="M4.4448 5.09124C4.37355 5.85124 4.32355 7.19624 4.7723 7.76874C4.7723 7.76874 4.56105 6.29124 6.4548 4.43749C7.2173 3.69124 7.39355 2.67624 7.1273 1.91499C6.97605 1.48374 6.6998 1.12749 6.4598 0.878737C6.3198 0.732487 6.4273 0.491237 6.63105 0.499987C7.86355 0.554987 9.86105 0.897487 10.7098 3.02749C11.0823 3.96249 11.1098 4.92874 10.9323 5.91124C10.8198 6.53874 10.4198 7.93374 11.3323 8.10499C11.9836 8.22749 12.2986 7.70999 12.4398 7.33749C12.4986 7.18249 12.7023 7.14374 12.8123 7.26749C13.9123 8.51874 14.0061 9.99249 13.7786 11.2612C13.3386 13.7137 10.8548 15.4987 8.3873 15.4987C5.3048 15.4987 2.85105 13.735 2.2148 10.5425C1.95855 9.25374 2.08855 6.70374 4.07605 4.90374C4.22355 4.76874 4.4648 4.88874 4.4448 5.09124Z"
      fill="url(#flame_grad1)"
    />
    <Path
      d="M9.51384 9.67751C8.37759 8.21501 8.88634 6.54626 9.16509 5.88126C9.20259 5.79376 9.10259 5.71126 9.02384 5.76501C8.53509 6.09751 7.53384 6.88001 7.06759 7.98126C6.43634 9.47001 6.48134 10.1988 6.85509 11.0888C7.08009 11.625 6.81884 11.7388 6.68759 11.7588C6.56009 11.7788 6.44259 11.6938 6.34884 11.605C6.07919 11.346 5.887 11.0171 5.79384 10.655C5.77384 10.5775 5.67259 10.5563 5.62634 10.62C5.27634 11.1038 5.09509 11.88 5.08634 12.4288C5.05884 14.125 6.46009 15.5 8.15509 15.5C10.2913 15.5 11.8476 13.1375 10.6201 11.1625C10.2638 10.5875 9.92884 10.2113 9.51384 9.67751Z"
      fill="url(#flame_grad2)"
    />
    <Defs>
      <RadialGradient id="flame_grad1" cx="50%" cy="100%" r="90%">
        <Stop offset="31%" stopColor="#FF9800" />
        <Stop offset="66%" stopColor="#FF6D00" />
        <Stop offset="97%" stopColor="#F44336" />
      </RadialGradient>
      <RadialGradient id="flame_grad2" cx="50%" cy="50%" r="50%">
        <Stop offset="21%" stopColor="#FFF176" />
        <Stop offset="67%" stopColor="#FFF7AD" />
        <Stop offset="94%" stopColor="#FFF176" stopOpacity="0" />
      </RadialGradient>
    </Defs>
  </Svg>
);

// 2. Bell Notification Icon with red dot (Figma #2174:1992)
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#000000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.00066 9C5.00066 7.14348 5.73816 5.36301 7.05092 4.05025C8.36367 2.7375 10.1441 2 12.0007 2C13.8572 2 15.6377 2.7375 16.9504 4.05025C18.2632 5.36301 19.0007 7.14348 19.0007 9V12.764L20.8227 16.408C20.9065 16.5757 20.9461 16.7621 20.9377 16.9494C20.9293 17.1368 20.8731 17.3188 20.7745 17.4783C20.6759 17.6379 20.5382 17.7695 20.3744 17.8608C20.2106 17.9521 20.0262 18 19.8387 18H15.8747C15.6522 18.8582 15.1511 19.6183 14.4499 20.1609C13.7488 20.7035 12.8873 20.9979 12.0007 20.9979C11.1141 20.9979 10.2526 20.7035 9.5514 20.1609C8.85023 19.6183 8.3491 18.8582 8.12666 18H4.16266C3.97514 18 3.79072 17.9521 3.62693 17.8608C3.46314 17.7695 3.3254 17.6379 3.22681 17.4783C3.12822 17.3188 3.07204 17.1368 3.06361 16.9494C3.05518 16.7621 3.09479 16.5757 3.17866 16.408L5.00066 12.764V9ZM10.2687 18C10.4442 18.304 10.6967 18.5565 11.0007 18.732C11.3047 18.9075 11.6496 18.9999 12.0007 18.9999C12.3517 18.9999 12.6966 18.9075 13.0006 18.732C13.3046 18.5565 13.5571 18.304 13.7327 18H10.2687ZM12.0007 4C10.6746 4 9.40281 4.52678 8.46513 5.46447C7.52745 6.40215 7.00066 7.67392 7.00066 9V12.764C7.00064 13.0743 6.9284 13.3804 6.78966 13.658L5.61966 16H18.3827L17.2127 13.658C17.0736 13.3805 17.001 13.0744 17.0007 12.764V9C17.0007 7.67392 16.4739 6.40215 15.5362 5.46447C14.5985 4.52678 13.3267 4 12.0007 4Z"
      fill={color}
    />
    <Circle cx="16.5" cy="4.5" r="3.5" fill="#FE2E31" />
  </Svg>
);

// 3. Menu Hamburger Icon (Figma #2172:1524 material-symbols:menu)
export const MenuIcon: React.FC<IconProps> = ({ size = 24, color = '#000000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path d="M3 18V16H21V18H3ZM3 13V11H21V13H3ZM3 8V6H21V8H3Z" fill={color} />
  </Svg>
);

// 4. Time Clock Icon (Figma #2172:1543 mingcute:time-line)
export const TimeIcon: React.FC<IconProps> = ({ size = 12, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={style}>
    <Path
      d="M6 1C8.7615 1 11 3.2385 11 6C11 8.7615 8.7615 11 6 11C3.2385 11 1 8.7615 1 6C1 3.2385 3.2385 1 6 1ZM6 2C4.93913 2 3.92172 2.42143 3.17157 3.17157C2.42143 3.92172 2 4.93913 2 6C2 7.06087 2.42143 8.07828 3.17157 8.82843C3.92172 9.57857 4.93913 10 6 10C7.06087 10 8.07828 9.57857 8.82843 8.82843C9.57857 8.07828 10 7.06087 10 6C10 4.93913 9.57857 3.92172 8.82843 3.17157C8.07828 2.42143 7.06087 2 6 2ZM6 3C6.12247 3.00002 6.24067 3.04498 6.33219 3.12636C6.4237 3.20774 6.48217 3.31987 6.4965 3.4415L6.5 3.5V5.793L7.8535 7.1465C7.94317 7.23648 7.99524 7.35722 7.99911 7.48419C8.00299 7.61117 7.95839 7.73486 7.87438 7.83014C7.79036 7.92542 7.67322 7.98515 7.54676 7.9972C7.4203 8.00925 7.294 7.97271 7.1935 7.895L7.1465 7.8535L5.6465 6.3535C5.56879 6.27572 5.51888 6.1745 5.5045 6.0655L5.5 6V3.5C5.5 3.36739 5.55268 3.24021 5.64645 3.14645C5.74021 3.05268 5.86739 3 6 3Z"
      fill={color}
    />
  </Svg>
);

// 5. Calories Flame Icon (Figma #2172:1563 fluent-mdl2:calories)
export const CaloriesIcon: React.FC<IconProps> = ({ size = 12, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={style}>
    <Path
      d="M7.5 0.375C7.5 1.07422 7.62891 1.71875 7.88672 2.30859C8.14453 2.89844 8.51562 3.44141 9 3.9375C9.48438 4.43359 9.85547 4.97656 10.1133 5.56641C10.3711 6.15625 10.5 6.80078 10.5 7.5C10.5 7.91406 10.4473 8.3125 10.3418 8.69531C10.2363 9.07812 10.084 9.43555 9.88477 9.76758C9.68555 10.0996 9.45117 10.4043 9.18164 10.6816C8.91211 10.959 8.60938 11.1934 8.27344 11.3848C7.9375 11.5762 7.57812 11.7266 7.19531 11.8359C6.8125 11.9453 6.41406 12 6 12C5.58594 12 5.1875 11.9473 4.80469 11.8418C4.42188 11.7363 4.06445 11.584 3.73242 11.3848C3.40039 11.1855 3.0957 10.9512 2.81836 10.6816C2.54102 10.4121 2.30664 10.1094 2.11523 9.77344C1.92383 9.4375 1.77344 9.07812 1.66406 8.69531C1.55469 8.3125 1.5 7.91406 1.5 7.5C1.5 7.17188 1.53516 6.84961 1.60547 6.5332C1.67578 6.2168 1.77734 5.91406 1.91016 5.625C2.04297 5.33594 2.20703 5.06055 2.40234 4.79883C2.59766 4.53711 2.81836 4.30078 3.06445 4.08984C3.0918 4.23828 3.12891 4.39062 3.17578 4.54688C3.22266 4.70312 3.27734 4.85938 3.33984 5.01562C3.40234 5.17188 3.47656 5.32031 3.5625 5.46094C3.64844 5.60156 3.73828 5.73242 3.83203 5.85352C3.91016 5.95117 4.01172 6 4.13672 6C4.24219 6 4.33008 5.96289 4.40039 5.88867C4.4707 5.81445 4.50781 5.72461 4.51172 5.61914C4.51172 5.57617 4.50586 5.53711 4.49414 5.50195C4.48242 5.4668 4.46289 5.43164 4.43555 5.39648C4.32617 5.23633 4.23047 5.07812 4.14844 4.92188C4.06641 4.76562 3.99414 4.60547 3.93164 4.44141C3.86914 4.27734 3.82422 4.10742 3.79688 3.93164C3.76953 3.75586 3.75391 3.57031 3.75 3.375C3.75 2.91016 3.83789 2.47266 4.01367 2.0625C4.18945 1.65234 4.43164 1.29492 4.74023 0.990234C5.04883 0.685547 5.40625 0.445312 5.8125 0.269531C6.21875 0.09375 6.65625 0.00390625 7.125 0H7.5V0.375ZM6 11.25C6.51953 11.25 7.00586 11.1523 7.45898 10.957C7.91211 10.7617 8.31055 10.4941 8.6543 10.1543C8.99805 9.81445 9.26562 9.41797 9.45703 8.96484C9.64844 8.51172 9.74609 8.02344 9.75 7.5C9.75 6.91016 9.64062 6.36133 9.42188 5.85352C9.20312 5.3457 8.88672 4.88477 8.47266 4.4707C7.96484 3.95898 7.56641 3.39453 7.27734 2.77734C6.98828 2.16016 6.81641 1.49219 6.76172 0.773438C6.4375 0.816406 6.13867 0.914062 5.86523 1.06641C5.5918 1.21875 5.35156 1.41211 5.14453 1.64648C4.9375 1.88086 4.7793 2.14453 4.66992 2.4375C4.56055 2.73047 4.50391 3.04297 4.5 3.375C4.5 3.67969 4.54492 3.95508 4.63477 4.20117C4.72461 4.44727 4.85742 4.69336 5.0332 4.93945C5.10742 5.04102 5.16406 5.14648 5.20312 5.25586C5.24219 5.36523 5.26367 5.48633 5.26758 5.61914C5.26758 5.77539 5.23828 5.92188 5.17969 6.05859C5.12109 6.19531 5.03906 6.31445 4.93359 6.41602C4.82812 6.51758 4.70898 6.59961 4.57617 6.66211C4.44336 6.72461 4.29688 6.75391 4.13672 6.75C3.95703 6.75 3.79883 6.7168 3.66211 6.65039C3.52539 6.58398 3.4043 6.49414 3.29883 6.38086C3.19336 6.26758 3.09961 6.14062 3.01758 6C2.93555 5.85938 2.85742 5.71875 2.7832 5.57812C2.60352 5.86328 2.4707 6.16992 2.38477 6.49805C2.29883 6.82617 2.25391 7.16016 2.25 7.5C2.25 8.01953 2.34766 8.50586 2.54297 8.95898C2.73828 9.41211 3.00586 9.81055 3.3457 10.1543C3.68555 10.498 4.08203 10.7656 4.53516 10.957C4.98828 11.1484 5.47656 11.2461 6 11.25Z"
      fill={color}
    />
  </Svg>
);

// 6. Level/Difficulty Icon (Figma #2172:1556 mdi:radiobox-intermediate-variant)
export const LevelIcon: React.FC<IconProps> = ({ size = 12, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={style}>
    <Circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.2" />
    <Circle cx="6" cy="6" r="2.2" fill={color} />
  </Svg>
);

// 7. Play Icon with Circle Container (Figma #2172:1568)
export const PlayIcon: React.FC<IconProps> = ({ size = 28, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 28 27" fill="none" style={style}>
    <Rect width="28" height="27" rx="13.5" fill="white" />
    <Path
      d="M9.88219 19.1525C9.99469 19.22 10.1222 19.25 10.2497 19.25C10.3772 19.25 10.5197 19.2125 10.6322 19.145L18.1322 14.645C18.3572 14.51 18.4997 14.2625 18.4997 14C18.4997 13.7375 18.3647 13.49 18.1322 13.355L10.6322 8.85497C10.5182 8.78584 10.3878 8.74867 10.2545 8.74735C10.1212 8.74603 9.99 8.78062 9.87469 8.84747C9.64219 8.98247 9.49219 9.22997 9.49219 9.49997V18.5C9.49219 18.77 9.63469 19.0175 9.87469 19.1525H9.88219Z"
      fill={color}
    />
  </Svg>
);

// 8. Search Icon (Figma #2333:741)
export const SearchIcon: React.FC<IconProps> = ({ size = 16, color = '#5C5C5C', style }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
    <Path
      d="M12.6303 6.73683C12.6303 9.9924 9.99111 12.6316 6.73553 12.6316C3.47996 12.6316 0.840791 9.9924 0.840791 6.73683C0.840791 3.48125 3.47996 0.842086 6.73553 0.842086C9.99111 0.842086 12.6303 3.48125 12.6303 6.73683Z"
      stroke={color}
      strokeWidth="1.68"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.1566 15.1579L10.9461 10.9474"
      stroke={color}
      strokeWidth="1.68"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 9. Arrow Right Icon (Figma #2170:1158 / #2174:1706)
export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, color = '#000000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 10. Arrow Back Icon (Figma #2294:225)
export const ArrowBackIcon: React.FC<IconProps> = ({ size = 24, color = '#000000', style }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <Path
      d="M16.334 19.8333L10.5007 14L16.334 8.16663"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 11. Pause Icon (Figma #2342:917)
export const PauseIcon: React.FC<IconProps> = ({ size = 20, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M10 6V18M14 6V18"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 12. Close / Cross Icon (Figma #2382:3421)
export const CloseIcon: React.FC<IconProps> = ({ size = 18, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 13. Check Mark Icon (Figma #2420:1460)
export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
    <Path
      d="M3 8.5L6.5 12L13 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 14. Bookmark / Saved Icon (Figma #2342:1308)
export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({
  size = 20,
  color = '#FE2E31',
  filled = false,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

// --- TAB BAR ICONS (Figma #2173:1606) ---

export const HomeTabIcon: React.FC<IconProps> = ({ size = 26, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <Path
      d="M12.7978 2.20845C13.1227 1.90126 13.5529 1.7301 14 1.7301C14.4471 1.7301 14.8773 1.90126 15.2023 2.20845L23.6793 10.2217C24.2043 10.717 24.5 11.4082 24.5 12.1292V21.8767C24.5 22.5729 24.2234 23.2406 23.7312 23.7329C23.2389 24.2251 22.5712 24.5017 21.875 24.5017H18.375C18.0301 24.5017 17.6886 24.4337 17.3701 24.3017C17.0515 24.1697 16.762 23.9762 16.5182 23.7322C16.2744 23.4883 16.0811 23.1987 15.9493 22.88C15.8175 22.5614 15.7498 22.2198 15.75 21.875V17.5C15.75 17.2679 15.6578 17.0453 15.4937 16.8812C15.3296 16.7171 15.1071 16.625 14.875 16.625H13.125C12.8929 16.625 12.6704 16.7171 12.5063 16.8812C12.3422 17.0453 12.25 17.2679 12.25 17.5V21.875C12.25 22.5711 11.9734 23.2388 11.4812 23.7311C10.9889 24.2234 10.3212 24.5 9.625 24.5H6.125C5.42881 24.5 4.76113 24.2234 4.26884 23.7311C3.77656 23.2388 3.5 22.5711 3.5 21.875V12.1275C3.5 11.4065 3.7975 10.7152 4.3225 10.22L12.7978 2.20845ZM14 3.47895L5.523 11.494C5.43694 11.5755 5.36837 11.6738 5.32144 11.7827C5.27451 11.8916 5.2502 12.0089 5.25 12.1275V21.875C5.25 22.107 5.34219 22.3296 5.50628 22.4937C5.67038 22.6578 5.89294 22.75 6.125 22.75H9.625C9.85706 22.75 10.0796 22.6578 10.2437 22.4937C10.4078 22.3296 10.5 22.107 10.5 21.875V17.5C10.5 16.8038 10.7766 16.1361 11.2688 15.6438C11.7611 15.1515 12.4288 14.875 13.125 14.875H14.875C15.5712 14.875 16.2389 15.1515 16.7312 15.6438C17.2234 16.1361 17.5 16.8038 17.5 17.5V21.875C17.5 22.107 17.5922 22.3296 17.7563 22.4937C17.9204 22.6578 18.1429 22.75 18.375 22.75H21.875C22.1071 22.75 22.3296 22.6578 22.4937 22.4937C22.6578 22.3296 22.75 22.107 22.75 21.875V12.1275C22.75 12.0086 22.7258 11.8909 22.6789 11.7817C22.632 11.6725 22.5633 11.574 22.477 11.4922L14 3.47895Z"
      fill={color}
    />
  </Svg>
);

export const ExploreTabIcon: React.FC<IconProps> = ({ size = 26, color = '#666666', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProgressTabIcon: React.FC<IconProps> = ({ size = 26, color = '#666666', style }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <Path
      d="M19.832 5.25C19.832 5.71413 19.6477 6.15925 19.3195 6.48744C18.9913 6.81563 18.5462 7 18.082 7C17.6179 7 17.1728 6.81563 16.8446 6.48744C16.5164 6.15925 16.332 5.71413 16.332 5.25C16.332 4.78587 16.5164 4.34075 16.8446 4.01256C17.1728 3.68437 17.6179 3.5 18.082 3.5C18.5462 3.5 18.9913 3.68437 19.3195 4.01256C19.6477 4.34075 19.832 4.78587 19.832 5.25Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M17.4993 24.5001L16.7247 21.4492C16.467 20.4359 15.9364 19.5126 15.1905 18.7799L13.416 17.0334M13.416 17.0334L13.405 17.0247C12.2375 16.1042 11.6513 15.642 11.4245 15.0244C11.3229 14.749 11.2743 14.4569 11.281 14.1634C11.2973 13.504 11.7034 12.8772 12.5142 11.6254L12.5177 11.6201L13.9993 9.33455M13.416 17.0334L17.4993 10.8232M17.4993 10.8232C17.3687 10.7252 17.2263 10.5782 17.0887 10.4126C16.608 9.83739 16.3665 9.55039 16.132 9.44072C15.8975 9.33105 15.6035 9.33105 15.0143 9.33105C14.634 9.33105 14.2548 9.33222 13.9993 9.33455C9.96035 9.38355 8.16602 10.7136 6.99935 13.0119M17.4993 10.8232C18.8468 11.8336 20.9562 12.2407 23.3327 9.56555M4.66602 20.6851L5.45702 20.8741C7.47418 21.3524 9.56952 20.4354 10.4993 18.6667"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileTabIcon: React.FC<IconProps> = ({ size = 26, color = '#666666', style }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style}>
    <Path
      d="M4.66602 20.9999C4.66602 19.7622 5.15768 18.5753 6.03285 17.7001C6.90802 16.8249 8.09501 16.3333 9.33268 16.3333H18.666C19.9037 16.3333 21.0907 16.8249 21.9658 17.7001C22.841 18.5753 23.3327 19.7622 23.3327 20.9999C23.3327 21.6188 23.0868 22.2122 22.6493 22.6498C22.2117 23.0874 21.6182 23.3333 20.9993 23.3333H6.99935C6.38051 23.3333 5.78702 23.0874 5.34943 22.6498C4.91185 22.2122 4.66602 21.6188 4.66602 20.9999Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 8.16663C17.5 10.0996 15.933 11.6666 14 11.6666C12.067 11.6666 10.5 10.0996 10.5 8.16663C10.5 6.23363 12.067 4.66663 14 4.66663C15.933 4.66663 17.5 6.23363 17.5 8.16663Z"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

// 19. Calories Ring Badge Icon (Figma #2174:1666)
export const CalRingIcon: React.FC<IconProps> = ({ size = 32, style }) => (
  <Svg width={size} height={size} viewBox="0 0 35 35" fill="none" style={style}>
    <Rect width="35" height="35" rx="17.5" fill="white" />
    <Path
      d="M13.556 14.364C13.4669 15.314 13.4044 16.9953 13.9654 17.7109C13.9654 17.7109 13.7013 15.864 16.0685 13.5469C17.0216 12.614 17.2419 11.3453 16.9091 10.3937C16.7201 9.85467 16.3748 9.40936 16.0748 9.09842C15.8998 8.91561 16.0341 8.61405 16.2888 8.62498C17.8294 8.69373 20.3263 9.12186 21.3873 11.7844C21.8529 12.9531 21.8873 14.1609 21.6654 15.389C21.5248 16.1734 21.0248 17.9172 22.1654 18.1312C22.9794 18.2844 23.3732 17.6375 23.5498 17.1719C23.6232 16.9781 23.8779 16.9297 24.0154 17.0844C25.3904 18.6484 25.5076 20.4906 25.2232 22.0765C24.6732 25.1422 21.5685 27.3734 18.4841 27.3734C14.631 27.3734 11.5638 25.1687 10.7685 21.1781C10.4482 19.5672 10.6107 16.3797 13.0951 14.1297C13.2794 13.9609 13.581 14.1109 13.556 14.364Z"
      fill="url(#cal_ring_grad1)"
    />
    <Path
      d="M19.8923 20.0969C18.472 18.2687 19.1079 16.1828 19.4564 15.3515C19.5032 15.2422 19.3782 15.139 19.2798 15.2062C18.6689 15.6219 17.4173 16.6 16.8345 17.9765C16.0454 19.8375 16.1017 20.7484 16.5689 21.8609C16.8501 22.5312 16.5235 22.6734 16.3595 22.6984C16.2001 22.7234 16.0532 22.6172 15.936 22.5062C15.599 22.1825 15.3588 21.7713 15.2423 21.3187C15.2173 21.2219 15.0907 21.1953 15.0329 21.275C14.5954 21.8797 14.3689 22.85 14.3579 23.5359C14.3235 25.6562 16.0751 27.375 18.1939 27.375C20.8642 27.375 22.8095 24.4219 21.2751 21.9531C20.8298 21.2344 20.411 20.764 19.8923 20.0969Z"
      fill="url(#cal_ring_grad2)"
    />
    <Defs>
      <RadialGradient id="cal_ring_grad1" cx="50%" cy="100%" r="90%">
        <Stop offset="31%" stopColor="#FF9800" />
        <Stop offset="66%" stopColor="#FF6D00" />
        <Stop offset="97%" stopColor="#F44336" />
      </RadialGradient>
      <RadialGradient id="cal_ring_grad2" cx="50%" cy="50%" r="50%">
        <Stop offset="21%" stopColor="#FFF176" />
        <Stop offset="67%" stopColor="#FFF7AD" />
        <Stop offset="94%" stopColor="#FFF176" stopOpacity="0" />
      </RadialGradient>
    </Defs>
  </Svg>
);

// 20. Active Time Ring Badge Icon (Figma #2174:1683)
export const TimeRingIcon: React.FC<IconProps> = ({ size = 32, style }) => (
  <Svg width={size} height={size} viewBox="0 0 35 35" fill="none" style={style}>
    <Rect width="35" height="35" rx="17.5" fill="white" />
    <Path
      d="M25.1332 11.2583C25.6249 11.75 25.6249 12.5416 25.1332 13.025L21.8915 16.2666L23.6582 23.925L22.4832 25.1083L19.2499 18.9166L15.9999 22.1666L16.2999 24.225L15.4082 25.1083L13.9415 22.4583L11.2832 20.9833L12.1665 20.0833L14.2499 20.3916L17.4749 17.1666L11.2832 13.9083L12.4665 12.7333L20.1249 14.5L23.3665 11.2583C23.8332 10.775 24.6665 10.775 25.1332 11.2583Z"
      fill="#36C25F"
    />
  </Svg>
);

// 21. Activity Chart Wave (Figma #2174:1987)
export const ActivityChartWave: React.FC<{ width?: number | string; height?: number }> = ({
  width = '100%',
  height = 85,
}) => (
  <Svg width={width} height={height} viewBox="0 0 289 85" fill="none">
    <Path
      d="M0.301197 72.9587L24.3343 48.4249L48.3675 0.358649L72.4006 7.36831L96.4337 24.3918H120.467L144.5 37.4097L168.533 48.4249H192.566L216.599 60.9422L241.133 71.9574L265.166 48.4249L288.699 24.8925"
      stroke="#FE2E31"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M24.3343 48.4249L0.301197 72.9587V84.4746H288.699V24.8925L265.166 48.4249L241.133 71.9574L216.599 60.9422L192.566 48.4249H168.533L144.5 37.4097L120.467 24.3918H96.4337L72.4006 7.36831L48.3675 0.358649L24.3343 48.4249Z"
      fill="url(#chart_area_grad)"
    />
    <Defs>
      <RadialGradient id="chart_area_grad" cx="50%" cy="0%" r="100%">
        <Stop offset="0%" stopColor="#FE2E31" stopOpacity="0.2" />
        <Stop offset="100%" stopColor="#FE2E31" stopOpacity="0.0" />
      </RadialGradient>
    </Defs>
  </Svg>
);


// 22. Back Arrow Icon (Figma #2425:875 iconamoon:arrow-right-2)
export const BackArrowIcon: React.FC<IconProps> = ({ size = 24, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M15 19L8 12L15 5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 23. Notification Category Badges (Figma ci1..ci6 #2425:887..#2425:1009)
export const NotificationCategoryBadge: React.FC<{
  type: string;
  size?: number;
  style?: any;
}> = ({ type, size = 46, style }) => {
  switch (type) {
    case 'workout_reminder':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#FFF5F5" stroke="rgba(254, 46, 49, 0.22)" />
          <Path
            d="M16 19V27M18 17V29M28 17V29M30 19V27M18 23H28"
            stroke="#FE2E31"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'badge_unlocked':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#FFF9E6" stroke="rgba(255, 171, 0, 0.28)" />
          <Path
            d="M18 16H28V22C28 24.7614 25.7614 27 23 27C20.2386 27 18 24.7614 18 22V16ZM18 18H15C13.8954 18 13 18.8954 13 20C13 21.1046 13.8954 22 15 22H18M28 18H31C32.1046 18 33 18.8954 33 20C33 21.1046 32.1046 22 31 22H28M23 27V30M19 30H27"
            stroke="#FFAB00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'challenge':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#EBF5FF" stroke="rgba(41, 121, 255, 0.22)" />
          <Path
            d="M20 20C21.6569 20 23 18.6569 23 17C23 15.3431 21.6569 14 20 14C18.3431 14 17 15.3431 17 17C17 18.6569 18.3431 20 20 20ZM20 22C16.6863 22 14 24.6863 14 28H26C26 24.6863 23.3137 22 20 22ZM27 15C28.1046 15 29 15.8954 29 17C29 18.1046 28.1046 19 27 19M27.5 22.5C29.5 23 31 24.5 31 27"
            stroke="#2979FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'goal_progress':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#FFF2EB" stroke="rgba(255, 109, 0, 0.25)" />
          <Circle cx="23" cy="23" r="10" stroke="#FF6D00" strokeWidth="2" />
          <Circle cx="23" cy="23" r="5" stroke="#FF6D00" strokeWidth="1.8" />
          <Circle cx="23" cy="23" r="1.5" fill="#FF6D00" />
        </Svg>
      );

    case 'social_like':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#FFF0F5" stroke="rgba(255, 64, 129, 0.22)" />
          <Path
            d="M23 29L21.55 27.68C16.4 23.01 13 19.93 13 16.12C13 13.04 15.42 10.62 18.5 10.62C20.24 10.62 21.91 11.43 23 12.69C24.09 11.43 25.76 10.62 27.5 10.62C30.58 10.62 33 13.04 33 16.12C33 19.93 29.6 23.01 24.45 27.69L23 29Z"
            fill="#FF4081"
          />
        </Svg>
      );

    case 'weekly_summary':
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#EBF9EF" stroke="rgba(54, 194, 95, 0.25)" />
          <Path
            d="M16 29V25M21 29V19M26 29V22M31 29V15M13 31H33"
            stroke="#36C25F"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 46 46" fill="none" style={style}>
          <Circle cx="23" cy="23" r="22.5" fill="#F5F5F5" stroke="#E0E0E0" />
          <Circle cx="23" cy="23" r="4" fill="#666666" />
        </Svg>
      );
  }
};

// 24. Plan Icon (Calendar Checklist)
export const PlanIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M8 15L10.5 17.5L16 12.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 27. Trophy Menu Icon (Achievements)
export const TrophyMenuIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M7 4H17V9C17 11.7614 14.7614 14 12 14C9.23858 14 7 11.7614 7 9V4ZM7 6H4C3.44772 6 3 6.44772 3 7C3 8.65685 4.34315 10 6 10H7M17 6H20C20.5523 6 21 6.44772 21 7C21 8.65685 19.6569 10 18 10H17M12 14V18M8 18H16M8 21H16"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 28. Flag Challenge Icon
export const FlagChallengeIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V22"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 29. Devices Icon (Connected Devices)
export const DevicesIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="7" y="5" width="10" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M10 2H14M10 22H14M12 16H12.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

// 30. Invite Friends Icon
export const InviteFriendsIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    <Path d="M2 20C2 16.6863 5.13401 14 9 14C10.5 14 11.8 14.4 12.9 15.1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M18 8V14M15 11H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

// 31. Info Circle Icon (About)
export const InfoCircleIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Path d="M12 8H12.01M11 11H12V16H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 32. Gear Settings Icon (Settings)
export const GearSettingsIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
    <Path
      d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L20.08 17.17A2 2 0 1 1 17.25 20L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.87V21.5A2 2 0 1 1 10 21.5V20.87A1.65 1.65 0 0 0 8.92 19.32A1.65 1.65 0 0 0 7.1 19.65L6.75 20A2 2 0 1 1 3.92 17.17L4.27 16.82A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.05 13.92H2.5A2 2 0 1 1 2.5 9.92H3.05A1.65 1.65 0 0 0 4.6 8.84A1.65 1.65 0 0 0 4.27 7.02L3.92 6.67A2 2 0 1 1 6.75 3.84L7.1 4.19A1.65 1.65 0 0 0 8.92 4.52A1.65 1.65 0 0 0 10 2.97V2.5A2 2 0 1 1 14 2.5V2.97A1.65 1.65 0 0 0 15.08 4.52A1.65 1.65 0 0 0 16.9 4.19L17.25 3.84A2 2 0 1 1 20.08 6.67L19.73 7.02A1.65 1.65 0 0 0 19.4 8.84A1.65 1.65 0 0 0 20.95 9.92H21.5A2 2 0 1 1 21.5 13.92H20.95A1.65 1.65 0 0 0 19.4 15Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 33. Help Circle Icon (Help & Support)
export const HelpCircleIcon: React.FC<IconProps> = ({ size = 22, color = '#111111', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Path
      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 34. Logout Icon
export const LogoutIcon: React.FC<IconProps> = ({ size = 22, color = '#FE2E31', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 35. Camera Icon (Photo upload)
export const CameraIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" />
  </Svg>
);
