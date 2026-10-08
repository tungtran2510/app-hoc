'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import PwaInstallModal from './PwaInstallModal';

declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

export default function PwaRegistrar() {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showFloatingPill, setShowFloatingPill] = useState<boolean>(false);

  useEffect(() => {
    // 1. Đăng ký Service Worker và ép cập nhật bản mới nhất
    if (typeof window !== 'undefined') {
      const syncThemeColor = () => {
        const stored = localStorage.getItem('giao_dien');
        const isDark = stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const targetColor = isDark ? '#0C0817' : '#FFFFFF';
        let m = document.getElementById('app-theme-color') as HTMLMetaElement | null;
        if (!m) {
          m = document.querySelector('meta[name="theme-color"]');
        }
        if (!m) {
          m = document.createElement('meta');
          m.id = 'app-theme-color';
          m.name = 'theme-color';
          document.head.appendChild(m);
        }
        m.setAttribute('content', targetColor);
        m.removeAttribute('media');

        // Dọn dẹp tất cả các thẻ theme-color thừa/xung đột
        const all = document.querySelectorAll('meta[name="theme-color"]');
        all.forEach((el) => {
          if (el !== m) el.remove();
        });
      };
      syncThemeColor();
      window.addEventListener('giao_dien_changed', syncThemeColor);
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeColor);
      }

      // Lắng nghe thay đổi class trên thẻ html để cập nhật màu thanh trạng thái ngay lập tức
      const observer = new MutationObserver(() => {
        syncThemeColor();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            reg.update();
            reg.addEventListener('updatefound', () => {
              const installing = reg.installing;
              if (installing) {
                installing.addEventListener('statechange', () => {
                  if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch(() => {});
      }
    }

    // 2. Kiểm tra nếu app đã được cài đặt độc lập (PWA Standalone)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const alreadyInstalled = checkStandalone();

    // 3. Tự động tải sẵn ngầm tất cả các trang & dữ liệu cốt lõi (Aggressive Idle Prefetching)
    const runIdlePrefetch = () => {
      const routesToPrefetch = [
        '/',
        '/tro-ly-ai',
        '/da-luu',
        '/tim-kiem',
        '/cot-song',
        '/cot-song/tong-quan-ve-cot-song',
        '/cot-song/tu-the-va-van-dong',
        '/dinh-duong',
        '/co-the-nguoi',
      ];

      routesToPrefetch.forEach((route) => {
        // Tải cả file HTML lẫn RSC payload để khi bấm là mở ngay 0ms
        fetch(route, { priority: 'low' }).catch(() => {});
        fetch(`${route}?_rsc=1`, { priority: 'low' }).catch(() => {});
      });

      // Tải trước cấu hình trợ lý AI
      fetch('/api/ai/training', { priority: 'low' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data.ai_training) {
            try {
              localStorage.setItem('app_ai_training_cache_v1', JSON.stringify(data.ai_training));
            } catch {}
          }
        })
        .catch(() => {});
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(runIdlePrefetch, { timeout: 1200 });
    } else {
      setTimeout(runIdlePrefetch, 600);
    }

    // 4. Bắt sự kiện cài đặt PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e;
      if (!alreadyInstalled) {
        const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
        if (!dismissed) {
          setShowBanner(true);
        } else {
          setShowFloatingPill(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Bắt sự kiện người dùng đã cài app thành công
    const handleAppInstalled = () => {
      window.deferredPrompt = null;
      setShowBanner(false);
      setShowFloatingPill(false);
      setIsStandalone(true);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Nhắc cài app sau 5s nếu người dùng chưa từng tắt
    const bannerTimer = setTimeout(() => {
      if (!checkStandalone()) {
        const dismissed = localStorage.getItem('pwa_banner_dismissed_v2');
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(bannerTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const choiceResult = await window.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        window.deferredPrompt = null;
        setShowBanner(false);
        setShowFloatingPill(false);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowFloatingPill(false);
    try {
      localStorage.setItem('pwa_banner_dismissed_v2', '1');
    } catch {}
  };

  if (isStandalone) return null;

  return (
    <>
      {/* 1. THANH THÔNG BÁO CÀI ĐẶT ỨNG DỤNG Ở TRÊN ĐỈNH (KHÔNG BAO GIỜ CHE BOTTOM NAV) */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Thông báo cài đặt ứng dụng"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[80] w-[92%] max-w-[420px] p-2.5 rounded-[18px] bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-[10px] overflow-hidden shrink-0 shadow-xs border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app_logo.png?v=21" alt="Qbiz Books" className="w-full h-full object-cover rounded-[8px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-black text-slate-900 dark:text-white leading-tight truncate flex items-center gap-1.5">
                <span>Cài đặt Qbiz Books</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">Nhanh</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                Mở nhanh từ màn hình, học mượt 0ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] bg-teal-600 hover:bg-teal-700 text-white font-black text-[11.5px] shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Download size={13} strokeWidth={2.8} />
              <span>Cài đặt</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* 3. MODAL HƯỚNG DẪN CÀI ĐẶT (CHO IOS/SAFARI HOẶC KHI CẦN HƯỚNG DẪN CHI TIẾT) */}
      <PwaInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
