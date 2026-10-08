export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string; // Mã màu chính
  primaryDark: string;
  primaryLight: string;
  accent: string;
  bgLight: string;
  textColor: string;
  cardBorder: string;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  emerald: {
    id: 'emerald',
    name: 'Xanh Ngọc Thảo Dược',
    category: 'Đông Y & Dưỡng Sinh Trị Liệu',
    description: 'Thư thái, an lành, gần gũi thiên nhiên, phù hợp trị liệu tự nhiên và thảo dược.',
    primary: '#0D9488',
    primaryDark: '#0D5C4D',
    primaryLight: '#CCFBF1',
    accent: '#D97706',
    bgLight: '#FAF9F6',
    textColor: '#134E4A',
    cardBorder: '#99F6E4',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Xanh Sapphire Viện Hàn Lâm',
    category: 'Bệnh Viện & Phòng Khám Đa Khoa',
    description: 'Chuyên nghiệp, chính quy, công nghệ y tế cao, chuẩn quốc tế.',
    primary: '#1E3A8A',
    primaryDark: '#172554',
    primaryLight: '#DBEAFE',
    accent: '#0284C7',
    bgLight: '#F8FAFC',
    textColor: '#1E3A8A',
    cardBorder: '#BFDBFE',
  },
  zen: {
    id: 'zen',
    name: 'Nâu Zen Dưỡng Sinh',
    category: 'Spa Dưỡng Sinh & Bấm Huyệt Trị Liệu',
    description: 'Ấm cúng, thư giãn sâu, tĩnh tâm, chữa lành theo phong cách thiền và trà đạo.',
    primary: '#9A3412',
    primaryDark: '#7C2D12',
    primaryLight: '#FFEDD5',
    accent: '#D97706',
    bgLight: '#FDFBF7',
    textColor: '#7C2D12',
    cardBorder: '#FED7AA',
  },
  mint: {
    id: 'mint',
    name: 'Xanh Bạc Hà Sức Sống',
    category: 'Yoga, Pilates & Vật Lý Trị Liệu',
    description: 'Năng động, tươi mát, tràn đầy năng lượng tích cực, kích thích vận động phục hồi.',
    primary: '#059669',
    primaryDark: '#065F46',
    primaryLight: '#D1FAE5',
    accent: '#F97316',
    bgLight: '#F0FDF4',
    textColor: '#065F46',
    cardBorder: '#A7F3D0',
  },
  plum: {
    id: 'plum',
    name: 'Tím Thạch Anh Hoàng Gia',
    category: 'Thẩm Mỹ Viện & Trẻ Hóa Da VIP',
    description: 'Đẳng cấp, quý phái, độc quyền, đắt giá, phù hợp chăm sóc sắc đẹp và chống lão hóa.',
    primary: '#6B21A8',
    primaryDark: '#4C1D95',
    primaryLight: '#F3E8FF',
    accent: '#F59E0B',
    bgLight: '#FAF5FF',
    textColor: '#581C87',
    cardBorder: '#E9D5FF',
  },
};

export const DEFAULT_THEME_ID = 'emerald';
