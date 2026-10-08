'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Settings } from 'lucide-react';
import { checkAdminStatus, isSuperAdmin } from '../lib/adminAuth';
import AdminSettingsModal from './admin/AdminSettingsModal';


interface TopicHeaderNavProps {
  topicTitle?: string;
}

export default function TopicHeaderNav({ topicTitle }: TopicHeaderNavProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkAdminStatus().then((st) => {
      setIsAdmin(st.isAdmin);
      setIsSuper(isSuperAdmin(st.user));
    });
  }, []);

  return (
    <>
      <nav
        aria-label="Đường dẫn quay lại"
        className="w-full bg-teal-700 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs mb-1"
      >
        <Link
          href="/"
          prefetch={true}
          className="inline-flex items-center gap-1 text-white font-bold text-sm sm:text-base transition-opacity active:opacity-75"
          aria-label="Quay lại Trang chủ"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          <span>Trang chủ</span>
        </Link>

        {topicTitle && (
          <span className="text-sm sm:text-base font-extrabold text-white truncate max-w-[200px] sm:max-w-[260px] text-center">
            {topicTitle}
          </span>
        )}

        {isSuper ? (
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-teal-800 text-white font-bold text-[11px] border border-teal-600 shadow-2xs hover:bg-teal-900"
            title="Cài đặt quản trị & Giảng viên"
          >
            <Settings size={13} />
            <span>Quản trị</span>
          </button>
        ) : (
          <div className="w-6" />
        )}
      </nav>


      {showSettings && (
        <AdminSettingsModal
          isOpen={true}
          onClose={() => setShowSettings(false)}
          onLogout={() => setIsAdmin(false)}
        />
      )}
    </>
  );
}
