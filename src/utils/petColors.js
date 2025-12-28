// 펫 색상 팔레트 정의
export const PET_COLOR_PALETTES = {
  dog: [
    { id: 'brown', name: '갈색', main: '#E8C39E', dark: '#D4A574', belly: '#FFF5E6', accent: '#FFB6C1' },
    { id: 'white', name: '흰색', main: '#FAFAFA', dark: '#E0E0E0', belly: '#FFFFFF', accent: '#FFD4E5' },
    { id: 'black', name: '검정', main: '#4A4A4A', dark: '#2C2C2C', belly: '#6A6A6A', accent: '#FF9CAA' },
    { id: 'golden', name: '골든', main: '#FFD700', dark: '#DAA520', belly: '#FFF8DC', accent: '#FFB6C1' },
    { id: 'gray', name: '회색', main: '#9E9E9E', dark: '#757575', belly: '#BDBDBD', accent: '#FFB6C1' },
    { id: 'cream', name: '크림', main: '#FFF5E1', dark: '#E8D5B7', belly: '#FFFFFF', accent: '#FFB6C1' },
  ],
  cat: [
    { id: 'gray', name: '회색', main: '#BDBDBD', dark: '#9E9E9E', belly: '#F5F5F5', accent: '#FFB6C1', eye: '#90CAF9' },
    { id: 'orange', name: '치즈', main: '#FFB74D', dark: '#F57C00', belly: '#FFF3E0', accent: '#FFD4E5', eye: '#81C784' },
    { id: 'black', name: '검정', main: '#424242', dark: '#212121', belly: '#616161', accent: '#FF9CAA', eye: '#FFD54F' },
    { id: 'white', name: '흰색', main: '#FAFAFA', dark: '#E0E0E0', belly: '#FFFFFF', accent: '#FFD4E5', eye: '#64B5F6' },
    { id: 'calico', name: '삼색', main: '#F5DEB3', dark: '#D4A574', belly: '#FFFEF0', accent: '#FFB6C1', eye: '#81D4FA' },
    { id: 'siamese', name: '샴', main: '#F5F5DC', dark: '#8B7355', belly: '#FFFEF5', accent: '#FFB6C1', eye: '#4FC3F7' },
  ],
  hamster: [
    { id: 'orange', name: '오렌지', main: '#E8B86D', dark: '#D4A574', belly: '#FFF5E6', cheek: '#F5D6A8', accent: '#FFB6C1' },
    { id: 'white', name: '흰색', main: '#FAFAFA', dark: '#E0E0E0', belly: '#FFFFFF', cheek: '#FFF0F5', accent: '#FFD4E5' },
    { id: 'gray', name: '회색', main: '#9E9E9E', dark: '#757575', belly: '#BDBDBD', cheek: '#C5C5C5', accent: '#FFB6C1' },
    { id: 'brown', name: '갈색', main: '#A0522D', dark: '#8B4513', belly: '#DEB887', cheek: '#D2B48C', accent: '#FFB6C1' },
    { id: 'cream', name: '크림', main: '#FFFDD0', dark: '#F5DEB3', belly: '#FFFFFF', cheek: '#FFF8DC', accent: '#FFB6C1' },
    { id: 'golden', name: '골든', main: '#DAA520', dark: '#B8860B', belly: '#FFE4B5', cheek: '#F4C430', accent: '#FFB6C1' },
  ]
};

// 기본 색상 가져오기
export const getDefaultColor = (petType) => {
  return PET_COLOR_PALETTES[petType]?.[0]?.id || 'brown';
};

// 색상 팔레트 가져오기
export const getColorPalette = (petType, colorId) => {
  const palettes = PET_COLOR_PALETTES[petType];
  return palettes?.find(p => p.id === colorId) || palettes?.[0];
};
