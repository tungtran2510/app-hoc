'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, LayoutGrid, Bookmark, Search, Home } from 'lucide-react';

import { playTapSound } from '../lib/audioFeedback';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Tải trước (pre-warm) toàn bộ các tab chính vào bộ nhớ đệm Next.js router
  useEffect(() => {
    try {
      router.prefetch('/');
      router.prefetch('/chuyen-de');
      router.prefetch('/da-luu');
      router.prefetch('/tim-kiem');
      router.prefetch('/tro-ly-ai');
    } catch {}
  }, [router]);

  const isHome = pathname === '/';
  const isSaved = pathname === '/da-luu';
  const isSearch = pathname === '/tim-kiem';
  // Tab "Chuyên đề" sáng khi đang ở trang tất cả chuyên đề, trong một chuyên đề hoặc trong một bài học
  const isTopics = !isHome && !isSearch && !isSaved && !pathname.startsWith('/dang-nhap') && !pathname.startsWith('/tro-ly-ai');

  // Khối tab căn giữa tinh tế, chuẩn phong cách ứng dụng chăm sóc sức khỏe hiện đại
  const baseItem = 'flex items-center justify-center min-h-[50px] select-none cursor-pointer';

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    playTapSound();
    if (pathname === href) {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-white/95 dark:bg-[#100922]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-[#2A184D] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_20px_rgba(0,0,0,0.6)]"
      style={{ transform: 'translateZ(0)' }}
      aria-label="Điều hướng chính"
    >
      <div className="w-full max-w-[480px] md:max-w-[820px] lg:max-w-[820px] h-[72px] pb-1 grid grid-cols-4 items-center select-none px-1">
        {/* 1. Khám phá (Tổng quan) */}
        <Link
          href="/"
          prefetch={true}
          onClick={(e) => handleTabClick(e, '/')}
          className={baseItem}
          aria-label="Khám phá"
        >
          {isHome ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2F1] dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-[#00897B] dark:text-teal-300 font-extrabold shadow-2xs">
              <Compass size={17} strokeWidth={2.5} className="pointer-events-none" />
              <span className="text-[12px] leading-tight pointer-events-none">Khám phá</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-purple-300/70 hover:text-slate-800 dark:hover:text-purple-200">
              <Compass size={20} strokeWidth={2} className="pointer-events-none" />
              <span className="text-[11px] leading-tight pointer-events-none">Khám phá</span>
            </div>
          )}
        </Link>

        {/* 2. Chuyên đề */}
        <Link
          href="/chuyen-de"
          prefetch={true}
          onClick={(e) => handleTabClick(e, '/chuyen-de')}
          className={baseItem}
          aria-label="Chuyên đề"
        >
          {isTopics ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2F1] dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-[#00897B] dark:text-teal-300 font-extrabold shadow-2xs">
              <LayoutGrid size={17} strokeWidth={2.5} className="pointer-events-none" />
              <span className="text-[12px] leading-tight pointer-events-none">Chuyên đề</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-purple-300/70 hover:text-slate-800 dark:hover:text-purple-200">
              <LayoutGrid size={20} strokeWidth={2} className="pointer-events-none" />
              <span className="text-[11px] leading-tight pointer-events-none">Chuyên đề</span>
            </div>
          )}
        </Link>

        {/* 3. Đã lưu (Bài của tôi) */}
        <Link
          href="/da-luu"
          prefetch={true}
          onClick={(e) => handleTabClick(e, '/da-luu')}
          className={baseItem}
          aria-label="Bài học đã lưu"
        >
          {isSaved ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2F1] dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-[#00897B] dark:text-teal-300 font-extrabold shadow-2xs">
              <Bookmark size={17} strokeWidth={2.5} className="pointer-events-none fill-current" />
              <span className="text-[12px] leading-tight pointer-events-none">Đã lưu</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-purple-300/70 hover:text-slate-800 dark:hover:text-purple-200">
              <Bookmark size={20} strokeWidth={2} className="pointer-events-none" />
              <span className="text-[11px] leading-tight pointer-events-none">Đã lưu</span>
            </div>
          )}
        </Link>

        {/* 4. Tìm kiếm */}
        <Link
          href="/tim-kiem"
          prefetch={true}
          onClick={(e) => handleTabClick(e, '/tim-kiem')}
          className={baseItem}
          aria-label="Tìm kiếm"
        >
          {isSearch ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2F1] dark:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/40 text-[#00897B] dark:text-teal-300 font-extrabold shadow-2xs">
              <Search size={17} strokeWidth={2.5} className="pointer-events-none" />
              <span className="text-[12px] leading-tight pointer-events-none">Tìm kiếm</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-purple-300/70 hover:text-slate-800 dark:hover:text-purple-200">
              <Search size={20} strokeWidth={2} className="pointer-events-none" />
              <span className="text-[11px] leading-tight pointer-events-none">Tìm kiếm</span>
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
}
