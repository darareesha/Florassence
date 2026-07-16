
export const lightColors = {
  background:   '#F5EDD8',    // warm parchment
  surface:      '#FFFDF5',    // cream white card
  surfaceAlt:   '#EDE6D0',   
  surfaceWarm:  '#FBF5E6',    // soft lantern-lit card

  primary:      '#4D7A5B',    // deep forest green
  primaryLight: '#6B9E7A',    // morning fern
  primaryDark:  '#2E5A3D',    // old forest shadow
  primarySoft:  '#E3EDE5',    // moss mist

  accent:       '#C97B45',    // warm terracotta
  accentLight:  '#E09D6A',    // soft amber
  accentSoft:   '#F7EAD8',    // faint candlelight

  gold:         '#C9933A',    // lantern gold
  goldBright:   '#F0B84A',    // glowing firefly
  goldSoft:     '#FBF0D5',    // candlelit parchment

  sky:          '#7BADC4',    // Ghibli afternoon sky
  skySoft:      '#D8EAF4',    // morning mist
  mist:         '#B8C9C3',    // mountain mist
  mistSoft:     '#E8EEE9',    // fog

  night:        '#1E2E1E',    // deep forest night
  nightMid:     '#2A3D2A',
  nightSoft:    'rgba(20,35,20,0.55)',

  text:         '#2C2016',    // dark ink
  textSecondary:'#4A3D2A',
  textMuted:    '#8A7A65',    // faded ink
  textDisabled: '#C4B8A4',
  textInverse:  '#FFFDF5',
  textOnDark:   '#F5EDD8',    // on night backgrounds

  success:      '#4D7A5B',
  successSoft:  '#E3EDE5',
  warning:      '#C97B45',
  warningSoft:  '#F7EAD8',
  danger:       '#B85C5C',
  dangerSoft:   '#F2E0E0',

  border:       '#DDD0B8',    
  borderLight:  '#EDE6D0',
  divider:      '#E8DFC8',

  priorityHigh:   { bg: '#F2E0E0', ink: '#8B3A3A', dot: '#B85C5C' },
  priorityMedium: { bg: '#F7EAD8', ink: '#8B5E2A', dot: '#C97B45' },
  priorityLow:    { bg: '#E3EDE5', ink: '#2E5A3D', dot: '#4D7A5B' },

  statGreen:  { bg: '#E3EDE5', ink: '#2E5A3D' },
  statBlue:   { bg: '#D8EAF4', ink: '#2E5A7A' },
  statOrange: { bg: '#F7EAD8', ink: '#8B5E2A' },
  statPurple: { bg: '#EDE3F0', ink: '#5E2A7A' },

  firefly:      '#FFE566',
  fireflyGlow:  'rgba(255, 229, 102, 0.4)',
};

export const darkColors = {
  background:   '#141C14',    // deep forest night
  surface:      '#1E2A1E',    
  surfaceAlt:   '#263325',    
  surfaceWarm:  '#23301F',    

  primary:      '#7BB48B',    
  primaryLight: '#96CBA3',
  primaryDark:  '#4D7A5B',
  primarySoft:  '#26362B',

  accent:       '#E09D6A',
  accentLight:  '#F0B98A',
  accentSoft:   '#3A2E22',

  gold:         '#F0B84A',
  goldBright:   '#FFD873',
  goldSoft:     '#3A3020',

  sky:          '#8FC3DA',
  skySoft:      '#22323A',
  mist:         '#9FB3AC',
  mistSoft:     '#212B26',

  night:        '#0E140E',
  nightMid:     '#1A241A',
  nightSoft:    'rgba(0,0,0,0.55)',

  text:         '#EDE6D5',    // warm off-white 
  textSecondary:'#C9BFA8',
  textMuted:    '#8FA090',   
  textDisabled: '#4A5A4A',
  textInverse:  '#1E2A1E',
  textOnDark:   '#F5EDD8',

  success:      '#7BB48B',
  successSoft:  '#26362B',
  warning:      '#E09D6A',
  warningSoft:  '#3A2E22',
  danger:       '#E08A8A',
  dangerSoft:   '#3A2424',

  border:       '#32402F',
  borderLight:  '#263325',
  divider:      '#2A3728',

  priorityHigh:   { bg: '#3A2424', ink: '#E08A8A', dot: '#E08A8A' },
  priorityMedium: { bg: '#3A3020', ink: '#F0B98A', dot: '#E09D6A' },
  priorityLow:    { bg: '#26362B', ink: '#96CBA3', dot: '#7BB48B' },

  statGreen:  { bg: '#26362B', ink: '#96CBA3' },
  statBlue:   { bg: '#22323A', ink: '#8FC3DA' },
  statOrange: { bg: '#3A3020', ink: '#F0B98A' },
  statPurple: { bg: '#302638', ink: '#C9A3E0' },

  firefly:      '#FFE566',
  fireflyGlow:  'rgba(255, 229, 102, 0.35)',
};

export const colors = lightColors;

export const fonts = {
  pixel: 'PixelFont',
};

export const spacing = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 9999,
};

export const fontSizes = {
  xxs:   10,
  xs:    12,
  sm:    13,
  body:  15,
  label: 15,
  sub:   17,
  title: 20,
  h2:    24,
  h1:    30,
  timer: 52,
};

export const fontWeights = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
};

export const shadows = {
  xs: {
    shadowColor: '#7A6040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#7A6040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#7A6040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7A6040',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
};
