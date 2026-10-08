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
        setContinueData(null);
      }
    } catch {
      setSavedList([]);
      setContinueData(null);
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
    <main className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-24 gap-3.5 max-w-lg mx-auto w-full bg-[#FAF9F6] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* 1. Header Trang: Solid Teal Bar với ‹ Trang chủ và Bài Học Của Tôi */}
      <header className="w-full bg-teal-700 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs">
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

      {/* 2. KHUNG ĐANG HỌC DỞ (CHỈ HIỂN THỊ KHI NGƯỜI DÙNG THỰC SỰ CÓ TIẾN ĐỘ) */}
      {continueData && (
        <section className="flex flex-col gap-2">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs p-3.5 sm:p-4 flex flex-col gap-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              ĐANG HỌC DỞ
            </span>

            {/* Ảnh video lớn có nút Play ở giữa */}
            <Link
              href={continueUrl}
              className="group relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner"
            >
              <img
                src={continueData?.cover_url || '/images/topics/cot-song.png'}
                alt="Bài đang học"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 w-12 h-12 rounded-full bg-white/95 text-teal-700 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play size={22} fill="currentColor" className="ml-0.5" />
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex flex-col gap-0.5">
                <div className="flex justify-between text-[10.5px] font-bold text-white drop-shadow-md">
                  <span>Tiếp tục bài học</span>
                </div>
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full w-2/3" />
                </div>
              </div>
            </Link>

            {/* Tiêu đề bài đang xem dở */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {continueData?.page_title}
            </h3>

            {/* Nút Tiếp tục xem */}
            <Link
              href={continueUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all"
            >
              <span>Tiếp tục xem</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* 3. BÀI HỌC ĐÃ LƯU */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            BÀI HỌC ĐÃ LƯU ({savedList.length})
          </h2>
        </div>

        {savedList.length === 0 ? (
          /* Tuân thủ Quy tắc Khối dữ liệu rỗng (Empty State Suppression): gọn gàng, không choán diện tích */
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center gap-2 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Bookmark size={20} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Bạn chưa lưu bài học nào
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Khi học, bạn chạm biểu tượng Bookmark để lưu bài vào danh sách này.
            </p>
            <Link
              href="/chuyen-de"
              className="mt-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-all"
            >
              Khám phá bài học ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {savedList.map((item, idx) => (
              <Link
                key={item.page_id || item.page_slug || idx}
                href={`/${item.topic_slug}/${item.page_slug}`}
                className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-2xs transition-all"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors truncate">
                    {String(idx + 1).padStart(2, '0')} · {item.page_title}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {item.topic_title || 'Chuyên đề giải phẫu'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Bookmark size={18} className="text-teal-600 fill-teal-600 shrink-0" />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(e, item)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                    title="Bỏ lưu bài này"
                  >
                    <Trash2 size={15} />
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
