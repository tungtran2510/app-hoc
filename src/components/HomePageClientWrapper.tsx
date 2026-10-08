'use client';

import React, { useState, useEffect } from 'react';
import ModernSeniorHome from './ModernSeniorHome';
import HomeHeader from './HomeHeader';
import HomeSectionsClient from './HomeSectionsClient';
import BottomNav from './BottomNav';
import QbizBooksOpeningSplash from './QbizBooksOpeningSplash';
import { Topic, Settings, RecommendedBook, CustomHtmlBlockData, AuthorProfile } from '../lib/types';
import { Sparkles, Layers } from 'lucide-react';

interface HomePageClientWrapperProps {
  settings: Settings;
  topicsWithCounts: {
    topic: Topic;
    pageCount: number;
  }[];
}

export default function HomePageClientWrapper({
  settings,
  topicsWithCounts,
}: HomePageClientWrapperProps) {
  const [uiMode, setUiMode] = useState<'tinh_gon' | 'chuan'>('tinh_gon');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('v2_ui_mode');
      if (stored === 'chuan' || stored === 'tinh_gon') {
        setUiMode(stored as any);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  const handleToggleMode = (mode: 'tinh_gon' | 'chuan') => {
    setUiMode(mode);
    try {
      localStorage.setItem('v2_ui_mode', mode);
    } catch {}
  };

  return (
    <div className="relative w-full flex flex-col">
      {/* Nút chuyển đổi nhanh giao diện để xem & đối sánh */}
      <div className="w-full flex justify-end items-center py-2 px-1 gap-2 z-50">
        <div className="inline-flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-full border border-slate-300 dark:border-slate-700 shadow-sm text-xs">
          <button
            onClick={() => handleToggleMode('tinh_gon')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold transition-all ${
              uiMode === 'tinh_gon'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>🌿</span>
            <span>Mẫu Tinh Gọn V2</span>
          </button>
          <button
            onClick={() => handleToggleMode('chuan')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold transition-all ${
              uiMode === 'chuan'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>⚡</span>
            <span>Bản Cũ Đầy Đủ</span>
          </button>
        </div>
      </div>

      {uiMode === 'tinh_gon' ? (
        <ModernSeniorHome
          topicsWithCounts={topicsWithCounts}
          settings={settings}
          appName={settings.app_name}
          appSubtitle={settings.app_subtitle}
          brandTagline={settings.brand_tagline}
          hotline={settings.hotline}
          zaloUrl={settings.zalo_url}
          authorProfile={settings.author_profile}
          recommendedBooks={settings.recommended_books}
          flatBooks={settings.flat_books}
          welcomeTitle={settings.welcome_title}
          welcomeMessage={settings.welcome_message}
          welcomeVideoUrl={settings.welcome_video_url}
        />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5 pb-28">
          {/* Hiệu ứng 3D mở sách Qbiz Books khi vào trang chủ */}
          <QbizBooksOpeningSplash />

          {/* Header chuẩn iPhone */}
          <HomeHeader
            initialAppName={settings.app_name}
            initialAppSubtitle={settings.app_subtitle}
            initialBrandTagline={settings.brand_tagline}
            initialLogoUrl={settings.logo_url}
            initialHotline={settings.hotline}
            initialZaloUrl={settings.zalo_url}
          />

          {/* Lưới chuyên đề học & khối nội dung */}
          <HomeSectionsClient
            initialSectionsOrder={settings.home_sections_order}
            initialHiddenSections={settings.hidden_home_sections}
            topicsWithCounts={topicsWithCounts}
            topicsTitle={settings.topics_title || 'Chuyên Đề Học'}
            authorProfile={settings.author_profile}
            recommendedBooksTitle={settings.recommended_books_title}
            recommendedBooksSubtitle={settings.recommended_books_subtitle}
            recommendedBooks={settings.recommended_books}
            initialBooksLayout={settings.recommended_books_layout}
            flatBooksTitle={settings.flat_books_title}
            flatBooks={settings.flat_books}
            appName={settings.app_name}
            appSubtitle={settings.app_subtitle}
            brandTagline={settings.brand_tagline}
            logoUrl={settings.logo_url}
            hotline={settings.hotline}
            zaloUrl={settings.zalo_url}
            welcomeTitle={settings.welcome_title}
            welcomeMessage={settings.welcome_message}
            welcomeVideoUrl={settings.welcome_video_url}
            initialCustomBlocks={settings.home_custom_blocks}
          />

          <BottomNav />
        </div>
      )}
    </div>
  );
}
