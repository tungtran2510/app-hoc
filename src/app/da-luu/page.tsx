'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Bookmark,
  Trash2,
  ChevronRight,
  Play,
  ArrowRight,
} from 'lucide-react';
import { getSavedPages, SavedPageInfo, toggleSavePage, getStoredXemTiep } from '../../lib/learningProgress';
import BottomNav from '../../components/BottomNav';

export default function MyLearningPage() {
  const [savedList, setSavedList] = useState<SavedPageInfo[]>([]);
  const [continueData, setContinueData] = useState<{
    topic_slug: string;
    page_slug: string;
    page_title?: string;
    topic_title?: string;
    video_index?: number;
    cover_url?: string | null;
  } | null>(null);
  const [continueUrl, setContinueUrl] = useState<string>('/cot-song/tu-the-va-van-dong?v=1');
  const [isLoading, setIsLoading] = useState(true);

  const refreshList = () => {
    try {
      const list = getSavedPages();
      setSavedList(list);

      const stored = getStoredXemTiep();
      if (stored && stored.topic_slug && stored.page_slug) {
        setContinueData(stored);
        const cleanTopic = stored.topic_slug.replace('cot-song-that-lung', 'cot-song');
        setContinueUrl(`/${cleanTopic}/${stored.page_slug}?v=${stored.video_index || 1}`);
      } else {
        setContinueData({
          topic_slug: 'cot-song',
          page_slug: 'tu-the-va-van-dong',
          page_title: 'Bài 02: Thoát vị đĩa đệm & chèn ép thần kinh',
          topic_title: 'Cột Sống & Đĩa Đệm',
          video_index: 2,
        });
        setContinueUrl('/cot-song/tu-the-va-van-dong?v=1');
      }
    } catch {
      setSavedList([]);
    }
  };

  useEffect(() => {
    refreshList();
    setIsLoading(false);
  }, []);

  const handleRemoveSaved = (e: React.MouseEvent, page: SavedPageInfo) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSavePage(page);
    refreshList();
  };

  return (
    <main className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-28 gap-4 max-w-lg mx-auto w-full bg-[#FAF9F6] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* 1. Header Trang: Solid Teal Bar với ‹ Trang chủ và Bài Học Của Tôi chuẩn Mockup my_learning_saved_ui */}
      <header className="w-full bg-teal-700 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs mb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-white font-bold text-sm sm:text-base transition-opacity hover:opacity-80"
          aria-label="Quay lại trang chủ"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          <span>Trang chủ</span>
        </Link>
        <h1 className="text-base sm:text-lg font-black text-white">
          Bài Học Của Tôi
        </h1>
        <div className="w-6" />
      </header>

      {/* 2. KHUNG TO Ở TRÊN ĐẦU: ĐANG HỌC DỞ CHUẨN MOCKUP */}
      <section className="flex flex-col gap-2">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            ĐANG HỌC DỞ
          </span>

          {/* Ảnh video lớn có nút Play ở giữa */}
          <Link
            href={continueUrl}
            className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner"
          >
            <img
              src={continueData?.cover_url || '/images/topics/cot-song.png'}
              alt="Bài đang học"
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              onError={(e: any) => {
                e.target.src = '/spine_hero_clean.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Nút Play to bản ở giữa */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-white/95 text-teal-700 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play size={26} fill="currentColor" className="ml-1" />
            </div>

            {/* Thanh tiến độ bên trong ảnh: Đã xem 60% (04:12) */}
            <div className="absolute bottom-2.5 left-3 right-3 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold text-white drop-shadow-md">
                <span>Đã xem 60% (04:12)</span>
                <span>60%</span>
              </div>
              <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full w-[60%]" />
              </div>
            </div>
          </Link>

          {/* Tiêu đề bài đang xem dở */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {continueData?.page_title || 'Bài 02: Thoát vị đĩa đệm & chèn ép thần kinh'}
            </h3>
          </div>

          {/* Nút Tiếp tục xem full-width màu xanh ngọc chuẩn mockup */}
          <Link
            href={continueUrl}
            className="w-full py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
          >
            <span>Tiếp tục xem</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 3. CÁC KHUNG NHỎ Ở PHÍA DƯỚI: BÀI HỌC ĐÃ LƯU CHUẨN MOCKUP */}
      <section className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            BÀI HỌC ĐÃ LƯU ({savedList.length > 0 ? savedList.length : '3'})
          </h2>
        </div>

        {savedList.length === 0 ? (
          /* Nếu chưa lưu bài nào thì hiển thị các bài mẫu minh họa trực quan như mockup */
          <div className="flex flex-col gap-2.5">
            <Link
              href="/cot-song/tu-the-va-van-dong"
              className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 shadow-2xs transition-all"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  01 · Cấu tạo đốt sống
                </span>
                <span className="text-xs text-slate-400 mt-0.5 font-medium">
                  (8 phút)
                </span>
              </div>
              <Bookmark size={20} className="text-teal-600 fill-teal-600 shrink-0" />
            </Link>

            <Link
              href="/cot-song/tu-the-va-van-dong"
              className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 shadow-2xs transition-all"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  03 · 5 Động tác giãn cơ tại nhà
                </span>
                <span className="text-xs text-slate-400 mt-0.5 font-medium">
                  (8 phút)
                </span>
              </div>
              <Bookmark size={20} className="text-teal-600 fill-teal-600 shrink-0" />
            </Link>

            <Link
              href="/cot-song/tu-the-va-van-dong"
              className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 shadow-2xs transition-all"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  04 · Tư thế ngồi đúng
                </span>
                <span className="text-xs text-slate-400 mt-0.5 font-medium">
                  (7 phút)
                </span>
              </div>
              <Bookmark size={20} className="text-teal-600 fill-teal-600 shrink-0" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {savedList.map((item, idx) => (
              <Link
                key={item.page_id || item.page_slug || idx}
                href={`/${item.topic_slug}/${item.page_slug}`}
                className="group flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-2xs transition-all"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors truncate">
                    {String(idx + 1).padStart(2, '0')} · {item.page_title}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5 font-medium">
                    ({item.topic_title || 'Chuyên đề cơ thể'})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Bookmark size={20} className="text-teal-600 fill-teal-600 shrink-0" />
                  <button
                    onClick={(e) => handleRemoveSaved(e, item)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                    title="Bỏ lưu bài này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Thanh điều hướng đáy 3 nút chuẩn (Trang chủ · Bài của tôi · Hỏi đáp - AI) */}
      <BottomNav />
    </main>
  );
}
