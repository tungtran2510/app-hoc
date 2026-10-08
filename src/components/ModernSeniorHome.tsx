'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Search,
  BookOpen,
  PhoneCall,
  MessageCircle,
  Award,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Volume2,
  SlidersHorizontal,
  Settings,
  Users,
  LogOut,
  Smartphone,
  Download,
  Edit2,
  User,
} from 'lucide-react';
import {
  Topic,
  Settings as AppSettingsType,
  AuthorProfile,
  RecommendedBook,
  AuthorBook,
} from '../lib/types';
import { checkAdminStatus, logoutAdmin, isSuperAdmin } from '../lib/adminAuth';
import { getStoredAppSettings } from '../lib/storage';
import { getUserPhone, LEARNING_PROGRESS_EVENT } from '../lib/userSync';
import AdminSettingsModal from './admin/AdminSettingsModal';
import EditAppModal from './admin/EditAppModal';
import PwaInstallModal from './PwaInstallModal';
import UserSyncModal from './UserSyncModal';
import BottomNav from './BottomNav';
import FlipbookViewer from './FlipbookViewer';
import { AuthorBioDetailModal } from './AuthorIntroSection';

interface ModernSeniorHomeProps {
  topicsWithCounts: {
    topic: Topic;
    pageCount: number;
  }[];
  settings?: AppSettingsType;
  appName?: string | null;
  appSubtitle?: string | null;
  brandTagline?: string | null;
  hotline?: string | null;
  zaloUrl?: string | null;
  authorProfile?: AuthorProfile | null;
  recommendedBooks?: RecommendedBook[];
  flatBooks?: RecommendedBook[];
  welcomeTitle?: string | null;
  welcomeMessage?: string | null;
  welcomeVideoUrl?: string | null;
}

export type ColorTheme = 'emerald' | 'sapphire' | 'zen';
export type LayoutStyle = 'therapeutic' | 'compact';

export default function ModernSeniorHome({
  topicsWithCounts,
  settings,
  appName = 'Học Cơ Thể',
  appSubtitle = 'QBIZ BOOKS · Y Khoa Dưỡng Sinh',
  brandTagline = 'Hiểu Đúng Cơ Thể — Chăm Sóc Sức Khỏe Chủ Động',
  hotline = '0974248716',
  zaloUrl = 'https://zalo.me/0974248716',
  authorProfile,
  recommendedBooks = [],
  flatBooks = [],
  welcomeTitle,
  welcomeMessage,
  welcomeVideoUrl,
}: ModernSeniorHomeProps) {
  // 1. Quản trị & Menu mặc định của App
  const [isAdmin, setIsAdmin] = useState(false);
  const [supabaseOk, setSupabaseOk] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'chung' | 'trai_nghiem' | 'du_lieu' | 'giang_vien'>('chung');
  const [showEditApp, setShowEditApp] = useState(false);
  const [showPwaInstall, setShowPwaInstall] = useState(false);
  const [showPhoneSync, setShowPhoneSync] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userName, setUserName] = useState<string>('bạn');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // 2. Giao diện V2 Tinh Gọn & Mẫu Trị Liệu Dưỡng Sinh
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('therapeutic');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [activeTheme, setActiveTheme] = useState<ColorTheme>('emerald');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAuthorBioModal, setShowAuthorBioModal] = useState(false);
  const [flipbookPreviewBook, setFlipbookPreviewBook] = useState<RecommendedBook | AuthorBook | null>(null);

  // Thông tin tác giả chuẩn mực (tuyệt đối KHÔNG có từ bác sĩ theo quy định)
  const effectiveAuthor: AuthorProfile = authorProfile || {
    name: 'Tùng Dinh Dưỡng',
    title: 'Chuyên gia Dinh dưỡng & Giải phẫu ứng dụng',
    avatar_url:
      'https://evuhamqlzprrbuabxyyn.supabase.co/storage/v1/object/public/media/images/2026-10/5513d9c5-10bc-4b23-b2f3-2f9d72fd7436.webp',
    bio: 'Người sáng lập tủ sách Qbiz Books, người truyền cảm hứng chăm sóc sức khỏe chủ động qua tri thức dinh dưỡng cân bằng và cơ chế vận động chuẩn y khoa.',
    extra_title: 'Triết lý phụng sự',
    extra_content:
      'Hiểu rõ cấu trúc giải phẫu và cơ chế vận hành của cơ thể là nền tảng vững chắc nhất để mỗi người tự làm chủ sức khỏe của chính mình.',
    books: [],
    phone: hotline,
    zalo_url: zaloUrl,
  };

  // 4 cuốn sách mẫu chuẩn mực hiển thị 3D theo bản vẽ toàn cảnh đã duyệt
  const defaultSampleBooks = [
    {
      id: 'book-cot-song',
      title: 'Cột Sống & Đĩa Đệm',
      author: 'Tùng Dinh Dưỡng',
      category: 'Giải phẫu ứng dụng',
      color: 'from-emerald-700 to-teal-900',
      border: 'border-emerald-500',
      cover_url: 'https://evuhamqlzprrbuabxyyn.supabase.co/storage/v1/object/public/media/images/2026-10/02327c65-40dd-4e3c-8656-78daea8ef627.webp',
    },
    {
      id: 'book-khop-goi',
      title: 'Khớp Gối & Vận Động',
      author: 'Tùng Dinh Dưỡng',
      category: 'Cơ xương khớp',
      color: 'from-blue-700 to-indigo-900',
      border: 'border-blue-500',
      cover_url: 'https://evuhamqlzprrbuabxyyn.supabase.co/storage/v1/object/public/media/images/2026-10/5513d9c5-10bc-4b23-b2f3-2f9d72fd7436.webp',
    },
    {
      id: 'book-tieu-hoa',
      title: 'Hệ Tiêu Hóa & Dạ Dày',
      author: 'Tùng Dinh Dưỡng',
      category: 'Dinh dưỡng tế bào',
      color: 'from-teal-800 to-cyan-950',
      border: 'border-teal-500',
      cover_url: 'https://evuhamqlzprrbuabxyyn.supabase.co/storage/v1/object/public/media/images/2026-10/02327c65-40dd-4e3c-8656-78daea8ef627.webp',
    },
    {
      id: 'book-tim-mach',
      title: 'Tim Mạch & Khí Huyết',
      author: 'Tùng Dinh Dưỡng',
      category: 'Huyết học & Tuần hoàn',
      color: 'from-rose-800 to-red-950',
      border: 'border-rose-500',
      cover_url: 'https://evuhamqlzprrbuabxyyn.supabase.co/storage/v1/object/public/media/images/2026-10/5513d9c5-10bc-4b23-b2f3-2f9d72fd7436.webp',
    },
  ];

  useEffect(() => {
    // Check Dark Mode
    try {
      const stored = localStorage.getItem('giao_dien');
      const darkActive = stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(darkActive);
      if (darkActive) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}

    // Check Admin Status
    checkAdminStatus().then(({ isAdmin, supabaseOk, user }) => {
      setIsAdmin(isAdmin);
      setSupabaseOk(supabaseOk);
      setAdminUser(user);
    });

    setUserPhone(getUserPhone());

    const handleUpdate = () => {
      setUserPhone(getUserPhone());
    };
    window.addEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
    window.addEventListener('learning_progress_changed', handleUpdate);

    // Tên người dùng
    try {
      const savedName = localStorage.getItem('app_user_display_name');
      if (savedName && savedName.trim()) {
        setUserName(savedName.trim());
      }
      const savedScale = localStorage.getItem('v2_font_scale') as any;
      if (savedScale && ['normal', 'large', 'xlarge'].includes(savedScale)) {
        setFontScale(savedScale);
      }
      const savedTheme = localStorage.getItem('v2_color_theme') as any;
      if (savedTheme && ['emerald', 'sapphire', 'zen'].includes(savedTheme)) {
        setActiveTheme(savedTheme);
      }
      const savedLayout = localStorage.getItem('v2_home_layout_style') as LayoutStyle;
      if (savedLayout && ['compact', 'therapeutic'].includes(savedLayout)) {
        setLayoutStyle(savedLayout);
      }
    } catch {}

    return () => {
      window.removeEventListener(LEARNING_PROGRESS_EVENT, handleUpdate);
      window.removeEventListener('learning_progress_changed', handleUpdate);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectLayoutStyle = (style: LayoutStyle) => {
    setLayoutStyle(style);
    try {
      localStorage.setItem('v2_home_layout_style', style);
    } catch {}
  };

  const handlePlaySuggestionAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (!('speechSynthesis' in win)) {
      window.location.href = '/cot-song';
      return;
    }
    if (isPlayingAudio) {
      win.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    win.speechSynthesis.cancel();
    const text = 'Chào bạn! Chào mừng bạn đến với bài học Dưỡng Khớp và Cột Sống. Cột sống nâng đỡ toàn bộ thân mình và bảo vệ tủy sống. Hãy cùng lắng nghe và chăm sóc đúng cách mỗi ngày nhé!';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    win.speechSynthesis.speak(utterance);
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('giao_dien', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('giao_dien', 'light');
      }
      window.dispatchEvent(new Event('giao_dien_changed'));
    } catch {}
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setUserName(trimmed);
      try {
        localStorage.setItem('app_user_display_name', trimmed);
        window.dispatchEvent(new CustomEvent('app_user_name_changed', { detail: { name: trimmed } }));
      } catch {}
    } else {
      setUserName('bạn');
      try {
        localStorage.removeItem('app_user_display_name');
      } catch {}
    }
    setShowNameModal(false);
  };

  const handleBackup = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/admin/sao-luu');
      if (!res.ok) throw new Error('Chưa lưu được sao lưu hoặc chưa đăng nhập');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sao-luu-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi sao lưu dữ liệu.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdmin(false);
    setShowMenu(false);
    window.location.reload();
  };

  const handleToggleFont = (scale: 'normal' | 'large' | 'xlarge') => {
    setFontScale(scale);
    try {
      localStorage.setItem('v2_font_scale', scale);
    } catch {}
  };

  const handleSelectTheme = (theme: ColorTheme) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem('v2_color_theme', theme);
    } catch {}
  };

  // Màu sắc động theo theme
  const themeClasses = {
    emerald: {
      headerBg: 'bg-[#0D9488]',
      cardBadge: 'bg-teal-600 text-white',
      borderAccent: 'border-teal-400',
      textAccent: 'text-teal-700',
    },
    sapphire: {
      headerBg: 'bg-[#1E3A8A]',
      cardBadge: 'bg-blue-700 text-white',
      borderAccent: 'border-blue-400',
      textAccent: 'text-blue-800',
    },
    zen: {
      headerBg: 'bg-[#9A3412]',
      cardBadge: 'bg-amber-700 text-white',
      borderAccent: 'border-amber-400',
      textAccent: 'text-amber-800',
    },
  }[activeTheme];

  const scaleClass =
    fontScale === 'xlarge'
      ? 'text-[114%]'
      : fontScale === 'large'
      ? 'text-[106%]'
      : 'text-[100%]';

  // Voice Search
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Thiết bị chưa hỗ trợ nhận diện giọng nói. Bạn có thể gõ vào ô tìm kiếm.');
      return;
    }
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        window.location.href = `/tim-kiem?q=${encodeURIComponent(transcript)}`;
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const getTopicImage = (slug: string, coverUrl?: string | null) => {
    if (coverUrl && !coverUrl.includes('placeholder')) {
      return coverUrl;
    }
    if (slug.includes('cot-song')) return '/images/topics/cot-song.png';
    if (slug.includes('khop') || slug.includes('goi')) return '/images/topics/co-the-nguoi.png';
    if (slug.includes('tieu-hoa') || slug.includes('da-day')) return '/images/topics/tieu-hoa.png';
    if (slug.includes('tim') || slug.includes('mach') || slug.includes('mien-dich')) return '/images/topics/mien-dich.png';
    return coverUrl || '/images/topics/co-the-nguoi.png';
  };

  const getTherapeuticTopicConfig = (slug: string, title: string) => {
    if (slug.includes('cot-song')) {
      return {
        displayTitle: 'Hệ xương khớp',
        bgCircle: 'bg-[#E0F2F1] dark:bg-teal-950/70 text-teal-700',
        iconUrl: '/images/topics_transparent/cot-song.png',
      };
    }
    if (slug.includes('tieu-hoa')) {
      return {
        displayTitle: 'Tiêu hóa',
        bgCircle: 'bg-[#FFF3E0] dark:bg-amber-950/70 text-amber-700',
        iconUrl: '/images/topics_transparent/tieu-hoa.png',
      };
    }
    if (slug.includes('co-the-nguoi')) {
      return {
        displayTitle: 'Tim mạch',
        bgCircle: 'bg-[#FFEBEE] dark:bg-rose-950/70 text-rose-700',
        iconUrl: '/images/topics_transparent/co-the-nguoi.png',
      };
    }
    if (slug.includes('mien-dich')) {
      return {
        displayTitle: 'Giấc ngủ',
        bgCircle: 'bg-[#E0F2F1] dark:bg-cyan-950/70 text-teal-800',
        iconUrl: '/images/topics_transparent/mien-dich.png',
      };
    }
    if (slug.includes('dinh-duong')) {
      return {
        displayTitle: 'Dinh dưỡng',
        bgCircle: 'bg-[#FEF9C3] dark:bg-yellow-950/70 text-yellow-800',
        iconUrl: '/images/topics_transparent/dinh-duong.png',
      };
    }
    if (slug.includes('nuoc')) {
      return {
        displayTitle: 'Nước & Điện giải',
        bgCircle: 'bg-[#E0F7FA] dark:bg-cyan-950/70 text-cyan-800',
        iconUrl: '/images/topics_transparent/nuoc.png',
      };
    }
    if (slug.includes('gan-mat-tuy')) {
      return {
        displayTitle: 'Gan – Mật – Tụy',
        bgCircle: 'bg-[#FFF8E1] dark:bg-amber-950/70 text-amber-800',
        iconUrl: '/images/topics_transparent/gan-mat-tuy.png',
      };
    }
    if (slug.includes('noi-tiet')) {
      return {
        displayTitle: 'Nội tiết',
        bgCircle: 'bg-[#F3E8FF] dark:bg-purple-950/70 text-purple-800',
        iconUrl: '/images/topics_transparent/noi-tiet-chuyen-hoa.png',
      };
    }
    return {
      displayTitle: title,
      bgCircle: 'bg-slate-100 dark:bg-slate-800 text-slate-700',
      iconUrl: '/images/topics_transparent/cot-song.png',
    };
  };

  return (
    <div className={`w-full min-h-screen flex flex-col gap-3.5 pb-28 select-none bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${scaleClass}`}>
      
      {/* 1. KHỐI THANH ĐEN QUẢN TRỊ ADMIN (NẾU ĐĂNG NHẬP ADMIN - GIỮ NGUYÊN 100% CÀI ĐẶT MẶC ĐỊNH CỦA APP) */}
      {isAdmin && (
        <div className="w-full flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950 text-white border-b border-white/10 shadow-md gap-1.5 z-40">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ${
                supabaseOk ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
              }`}
            />
            <span className="text-[13px] font-black text-white/95 truncate">
              {isSuperAdmin(adminUser)
                ? (supabaseOk ? 'Quản trị viên' : 'Chưa kết nối CSDL')
                : `Giảng viên: ${adminUser?.name || 'Giảng viên'}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isSuperAdmin(adminUser) && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('giang_vien');
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-bold shadow-2xs"
                  title="Phân quyền Giảng viên"
                >
                  <Users size={13} />
                  <span>Giảng viên</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('chung');
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold shadow-2xs"
                  title="Cài đặt quản trị"
                >
                  <Settings size={13} />
                  <span>Cài đặt</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 text-[12px] font-bold shadow-2xs"
              title="Đăng xuất"
            >
              <LogOut size={13} />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. HEADER DUY NHẤT: HIỆN ĐẠI, TINH GỌN, CHUẨN ĐẸP KHÔNG THỪA THÃI */}
      <header className="px-4 sm:px-5 pt-3 pb-1 flex flex-col gap-2.5 relative z-30">
        <div className="flex items-center justify-between gap-2">
          {/* Cụm Trái: Avatar tác giả + Lời chào thân thiện */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-2xs hover:scale-105 transition-transform shrink-0 cursor-pointer flex items-center justify-center"
                title="Cài đặt & Tài khoản"
                aria-label="Cài đặt ứng dụng"
              >
                <img
                  src={effectiveAuthor.avatar_url || "/images/author_tung.png"}
                  alt="Menu"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              {/* Dropdown Menu ⋮ Cài đặt & Quản trị */}
              {showMenu && (
                <div className="absolute top-[46px] left-0 w-[240px] bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 animate-in fade-in duration-150 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowPhoneSync(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Smartphone size={16} className="text-teal-600" />
                    <span>{userPhone ? 'Quản lý SĐT học tập' : 'Lưu tiến độ qua SĐT'}</span>
                  </button>

                  {/* Tông màu giao diện */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Tông màu</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectTheme('emerald')}
                        className={`py-1 px-1 rounded-lg text-[10.5px] font-bold text-center transition-all ${
                          activeTheme === 'emerald'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        🌿 Dưỡng Sinh
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTheme('sapphire')}
                        className={`py-1 px-1 rounded-lg text-[10.5px] font-bold text-center transition-all ${
                          activeTheme === 'sapphire'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        🔷 Sapphire
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTheme('zen')}
                        className={`py-1 px-1 rounded-lg text-[10.5px] font-bold text-center transition-all ${
                          activeTheme === 'zen'
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        🍂 Nâu Zen
                      </button>
                    </div>
                  </div>

                  {/* Mẫu hiển thị (Giao diện) */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">Mẫu hiển thị</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectLayoutStyle('therapeutic')}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                          layoutStyle === 'therapeutic'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        🌿 Mẫu Trị Liệu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectLayoutStyle('compact')}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                          layoutStyle === 'compact'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        📱 Mẫu Tinh Gọn
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowPwaInstall(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Download size={16} className="text-teal-600" />
                    <span>Cài app ra màn hình</span>
                  </button>

                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          handleBackup();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Download size={16} className="text-teal-600" />
                        <span>Sao lưu dữ liệu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowEditApp(true);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Edit2 size={16} className="text-teal-600" />
                        <span>Sửa tên & logo app</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setSettingsTab('chung');
                          setShowSettings(true);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Settings size={16} className="text-teal-600" />
                        <span>Cài đặt quản trị</span>
                      </button>

                      <Link
                        href="/tro-ly-ai"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Sparkles size={16} className="text-amber-500" />
                        <span>Huấn luyện Trợ lý AI</span>
                      </Link>

                      <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/dang-nhap"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <User size={16} className="text-teal-600" />
                      <span>Đăng nhập quản trị</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {layoutStyle === 'therapeutic' ? (
              /* Lời chào Mẫu Trị Liệu Dưỡng Sinh theo ảnh chuẩn */
              <div className="flex flex-col min-w-0">
                <h1 className="text-[18px] sm:text-[20px] font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight">
                  Xin chào, hôm nay<br />bạn thấy thế nào?
                </h1>
              </div>
            ) : (
              /* Lời chào Mẫu Tinh Gọn */
              <div className="flex flex-col min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(userName === 'bạn' ? '' : userName);
                    setShowNameModal(true);
                  }}
                  className="flex items-center gap-1 text-left cursor-pointer group"
                  title="Bấm để đổi tên của bạn"
                >
                  <span className="text-[16px] sm:text-[17px] font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-teal-600 transition-colors">
                    Hi, {userName || 'bạn'}! 👋
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPhoneSync(true);
                    }}
                    className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 relative hover:scale-105 transition-transform shrink-0"
                    title="Đồng bộ tiến độ học tập qua SĐT"
                  >
                    <Bell size={11} fill="currentColor" />
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-red-500" />
                  </span>
                </button>
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Chúc bạn ngày mới an lành!
                </span>
              </div>
            )}
          </div>

          {/* Cụm Phải: Bộ chỉnh cỡ chữ [A- A+] + Nút Sáng/Tối + Nút chuyển mẫu */}
          <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
            {/* Bộ chỉnh cỡ chữ [A- A+] */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleToggleFont('normal')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
                  fontScale === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Cỡ chữ chuẩn"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleToggleFont('large')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
                  fontScale === 'large' || fontScale === 'xlarge'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Cỡ chữ to"
              >
                A+
              </button>
            </div>

            {/* Nút Sáng / Tối */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500 transition-colors shadow-2xs cursor-pointer hover:bg-slate-50"
              title={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
              aria-label="Chuyển chế độ Sáng / Tối"
            >
              {isDark ? <Sun size={15} strokeWidth={2.4} /> : <Moon size={15} strokeWidth={2.4} />}
            </button>

            {/* Nút chuyển đổi nhanh giữa 2 Mẫu giao diện */}
            <button
              type="button"
              onClick={() => handleSelectLayoutStyle(layoutStyle === 'therapeutic' ? 'compact' : 'therapeutic')}
              className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200/80 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 transition-colors shadow-2xs cursor-pointer hover:bg-teal-100"
              title={layoutStyle === 'therapeutic' ? "Đang là Mẫu Trị Liệu - Bấm đổi sang Mẫu Tinh Gọn" : "Đang là Mẫu Tinh Gọn - Bấm đổi sang Mẫu Trị Liệu"}
              aria-label="Đổi mẫu giao diện"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm theo từng Mẫu */}
        {layoutStyle === 'therapeutic' ? (
          /* Thanh tìm kiếm Mẫu Trị Liệu: Viên thuốc mềm, nút Mic tròn xanh bên TRÁI */
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus-within:border-teal-500 transition-all p-1.5">
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#00897B] hover:bg-[#00796B] text-white shadow-xs'
              }`}
              title="Bấm để nói tìm kiếm"
              aria-label="Nói để tìm kiếm"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              placeholder={
                isListening
                  ? 'Đang lắng nghe... Mời bạn nói...'
                  : 'Nói hoặc gõ tên bệnh, bài học...'
              }
              className="w-full pl-3 pr-4 py-1.5 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 font-medium text-sm focus:outline-none"
            />
          </div>
        ) : (
          /* Thanh tìm kiếm Mẫu Tinh Gọn: Kính lúp bên trái, Mic bên phải */
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs focus-within:border-teal-500 transition-colors p-1">
            <Search size={16} className="ml-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              placeholder={
                isListening
                  ? 'Đang lắng nghe... Mời bạn nói...'
                  : 'Tìm kiếm bài học, chuyên đề, giải phẫu...'
              }
              className="w-full pl-2.5 pr-10 py-1.5 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 font-medium text-sm focus:outline-none"
            />

            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-1.5 w-7.5 h-7.5 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-slate-700 cursor-pointer'
              }`}
              title="Bấm để nói tìm kiếm"
              aria-label="Nói để tìm kiếm"
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </div>
        )}
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-20 bg-transparent" onClick={() => setShowMenu(false)} />
      )}

      <main className="px-4 sm:px-5 flex flex-col gap-3">

        {/* NỘI DUNG HIỂN THỊ THEO MẪU ĐƯỢC CHỌN */}
        {layoutStyle === 'therapeutic' ? (
          <>
            {/* 1. THẺ GỢI Ý HÔM NAY: DƯỠNG KHỚP & CỘT SỐNG (CHẤT LƯỢNG MẪU ẢNH THỰC TẾ) */}
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E6F4F1] via-[#EBF7F5] to-[#DDF0EC] dark:from-slate-900 dark:via-teal-950/40 dark:to-slate-900 border border-teal-200/70 dark:border-teal-800/40 p-4.5 sm:p-5 shadow-xs">
              {/* Vạt cong màu đào ấm áp nhô ra từ mép phải đúng chuẩn ảnh mẫu */}
              <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-28 rounded-l-full bg-[#FED7AA]/70 dark:bg-amber-900/30 blur-[0.5px] pointer-events-none" />

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex flex-col gap-1.5 max-w-[62%]">
                  <span className="text-[12.5px] font-semibold text-teal-800 dark:text-teal-300">
                    Bài học gợi ý hôm nay:
                  </span>
                  <Link href="/cot-song" className="group">
                    <h2 className="text-[20px] sm:text-[22px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-teal-700 transition-colors">
                      Dưỡng Khớp<br />& Cột Sống
                    </h2>
                  </Link>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handlePlaySuggestionAudio}
                      className={`px-3.5 py-1.5 rounded-full text-white flex items-center gap-1.5 text-[12px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all ${
                        isPlayingAudio ? 'bg-rose-600 animate-pulse' : 'bg-[#00897B] hover:bg-[#00796B]'
                      }`}
                      title="Bấm để nghe đọc bài học mẫu"
                    >
                      <Volume2 size={15} />
                      <span>{isPlayingAudio ? 'Dừng đọc' : 'Ấn để nghe đọc'}</span>
                    </button>
                  </div>
                </div>

                {/* Ảnh giải phẫu 3D Cột sống & Khớp */}
                <Link href="/cot-song" className="w-28 sm:w-32 h-28 sm:h-32 shrink-0 flex items-center justify-center relative group">
                  <img
                    src="/images/topics_transparent/cot-song.png"
                    alt="Dưỡng Khớp & Cột Sống"
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                </Link>
              </div>

              {/* Chấm phân trang [ — • • ] */}
              <div className="flex items-center justify-center gap-1.5 pt-3">
                <span className="w-5 h-1.5 rounded-full bg-[#00897B]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
            </section>

            {/* 2. LƯỚI CHUYÊN ĐỀ 2 CỘT (THẺ BO TRÒN MỀM MẠI, VÒNG TRÒN PASTEL Ở GIỮA) */}
            <section className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {topicsWithCounts
                .filter((item) => {
                  const titleLower = item.topic.title.toLowerCase();
                  const slugLower = item.topic.slug.toLowerCase();
                  return (
                    !titleLower.includes('tùng') &&
                    !titleLower.includes('chuyên gia') &&
                    !slugLower.includes('tung') &&
                    !slugLower.includes('chuyen-gia')
                  );
                })
                .map((item) => {
                  const topic = item.topic;
                  const conf = getTherapeuticTopicConfig(topic.slug, topic.title);

                  return (
                    <Link
                      key={topic.id || topic.slug}
                      href={`/${topic.slug}`}
                      className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100/90 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer aspect-[1.12/1]"
                    >
                      <div className={`w-15 h-15 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-2.5 ${conf.bgCircle} shadow-2xs group-hover:scale-110 transition-transform`}>
                        <img
                          src={conf.iconUrl}
                          alt={conf.displayTitle}
                          className="max-h-full max-w-full object-contain drop-shadow-xs"
                          loading="lazy"
                        />
                      </div>

                      <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-tight">
                        {conf.displayTitle}
                      </span>
                    </Link>
                  );
                })}
            </section>
          </>
        ) : (
          /* MẪU TINH GỌN (APPLE HEALTH - SỐ THỨ TỰ 1 ĐẾN 8) */
          <section className="flex flex-col gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white px-1">
              Chuyên Đề Học
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {topicsWithCounts
                .filter((item) => {
                  const titleLower = item.topic.title.toLowerCase();
                  const slugLower = item.topic.slug.toLowerCase();
                  return (
                    !titleLower.includes('tùng') &&
                    !titleLower.includes('chuyên gia') &&
                    !slugLower.includes('tung') &&
                    !slugLower.includes('chuyen-gia')
                  );
                })
                .map((item, idx) => {
                  const topic = item.topic;
                  const imgUrl = getTopicImage(topic.slug, topic.cover_url);
                  const orderNum = idx + 1;

                  return (
                    <Link
                      key={topic.id || topic.slug}
                      href={`/${topic.slug}`}
                      className="group relative flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 shadow-2xs hover:shadow-sm transition-all min-h-[90px] overflow-hidden"
                    >
                      <span className={`absolute top-2 left-2 w-5 h-5 rounded-md ${themeClasses.cardBadge} text-[11px] font-black flex items-center justify-center shadow-xs`}>
                        {orderNum}
                      </span>

                      <div className="flex-1 pr-1.5 pt-5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 transition-colors leading-tight line-clamp-2">
                          {topic.title}
                        </h3>
                      </div>

                      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                        <img
                          src={imgUrl}
                          alt={topic.title}
                          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}
        {/* 6. HỒ SƠ CHUYÊN GIA (TÁC GIẢ TÙNG DINH DƯỠNG & TRIẾT LÝ SỨC KHỎE - TUYỆT ĐỐI KHÔNG CHỮ BÁC SĨ) */}
        <section className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Hồ Sơ Chuyên Gia
            </h3>
            <button
              type="button"
              onClick={() => setShowAuthorBioModal(true)}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
            >
              Chi tiết →
            </button>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <img
              src={effectiveAuthor.avatar_url || '/images/author_tung.png'}
              alt={effectiveAuthor.name}
              className="w-14 h-14 min-w-[56px] max-w-[56px] h-[56px] rounded-full object-cover border-2 border-teal-500 shadow-2xs shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                {effectiveAuthor.name}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed mt-0.5 line-clamp-3">
                “{effectiveAuthor.extra_content || 'Hiểu rõ giải phẫu và cơ chế vận hành của cơ thể là nền tảng để mỗi người tự làm chủ sức khỏe của chính mình.'}”
              </p>
            </div>
          </div>
        </section>

        {/* 7. TỦ SÁCH Y KHOA (HIỂN THỊ CÁC CUỐN SÁCH KÈM NÚT ĐỌC THỬ 3D CHUẨN ẢNH DUYỆT) */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Tủ Sách Y Khoa
            </h3>
            <span className="text-xs text-slate-400 font-medium">4 cuốn chuyên khảo</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {defaultSampleBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center"
              >
                {/* Bìa sách 3D */}
                <div className={`w-full aspect-[3/4] rounded-lg bg-gradient-to-tr ${book.color} p-1.5 flex flex-col justify-between text-white shadow-sm border ${book.border} overflow-hidden`}>
                  <span className="text-[7.5px] font-black uppercase tracking-tighter opacity-80">QBIZ BOOKS</span>
                  <span className="text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-3">{book.title}</span>
                  <span className="text-[7px] opacity-70">Tác giả Tùng</span>
                </div>

                {/* Nút Đọc thử */}
                <button
                  type="button"
                  onClick={() => setFlipbookPreviewBook(book as any)}
                  className="mt-2 w-full py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 text-slate-700 dark:text-slate-300 font-bold text-[10.5px] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Đọc thử
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 2 NÚT LIÊN HỆ TO RÕ: NHẮN ZALO TƯ VẤN & HOTLINE TƯ VẤN CHUẨN ẢNH DUYỆT */}
        <section className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={zaloUrl || `https://zalo.me/${hotline}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#0D9488] hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-98 transition-all"
          >
            <MessageCircle size={17} />
            <span>Nhắn Zalo tư vấn</span>
          </a>

          <a
            href={`tel:${hotline}`}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-98 transition-all"
          >
            <PhoneCall size={17} />
            <span>Hotline tư vấn</span>
          </a>
        </section>
      </main>

      {/* 9. THANH ĐIỀU HƯỚNG ĐÁY CHUẨN 3 NÚT (Trang chủ · Bài của tôi · Hỏi đáp - AI) */}
      <BottomNav />

      {/* MODAL: Sửa tên app & Logo */}
      {showEditApp && (
        <EditAppModal
          isOpen={true}
          initialName={appName || ''}
          initialSubtitle={appSubtitle}
          initialBrandTagline={brandTagline}
          initialLogoUrl={settings?.logo_url || null}
          initialHotline={hotline || ''}
          initialZaloUrl={zaloUrl || ''}
          onClose={() => setShowEditApp(false)}
          onSaved={() => window.location.reload()}
        />
      )}

      {/* MODAL: Cài đặt quản trị */}
      {showSettings && (
        <AdminSettingsModal
          isOpen={true}
          initialTab={settingsTab}
          onClose={() => setShowSettings(false)}
          onSettingsSaved={() => {}}
          onLogout={() => setIsAdmin(false)}
        />
      )}

      {/* MODAL: Cài app ra màn hình */}
      {showPwaInstall && (
        <PwaInstallModal
          isOpen={true}
          onClose={() => setShowPwaInstall(false)}
        />
      )}

      {/* MODAL: Đồng bộ tiến độ & Lưu SĐT */}
      <UserSyncModal
        isOpen={showPhoneSync}
        onClose={() => setShowPhoneSync(false)}
        reason="manual"
        onSuccess={() => setUserPhone(getUserPhone())}
      />

      {/* MODAL: Nhập tên bạn */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">
                <span>👋</span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Chào mừng bạn!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Nhập tên của bạn để tiện xưng hô nhé
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Tên hoặc danh xưng:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ví dụ: Hoàng, Minh, Bác Ba..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNameModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={handleSaveName}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Lưu tên ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Chi tiết Hồ sơ Tác giả */}
      {showAuthorBioModal && (
        <AuthorBioDetailModal
          profile={effectiveAuthor}
          onClose={() => setShowAuthorBioModal(false)}
        />
      )}

      {/* MODAL: Đọc thử Sách 3D Flipbook */}
      {flipbookPreviewBook && (
        <FlipbookViewer
          isOpen={true}
          book={flipbookPreviewBook as any}
          title={`Đọc thử: ${flipbookPreviewBook.title}`}
          onClose={() => setFlipbookPreviewBook(null)}
        />
      )}
    </div>
  );
}
