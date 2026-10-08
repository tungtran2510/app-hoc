import React from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { Page, Topic } from '../lib/types';

interface PageCardProps {
  page: Page;
  topic: Topic;
  orderNumber: number;
  videoCount: number;
  watchedVideos?: number[];
  lastVideo?: number;
  isCompleted?: boolean;
  isActive?: boolean;
  onActivate?: () => void;
}

export default function PageCard({
  page,
  topic,
  orderNumber,
  videoCount,
  watchedVideos = [],
  lastVideo,
  isCompleted = false,
  isActive = false,
  onActivate,
}: PageCardProps) {
  const count = typeof videoCount === 'number' ? videoCount : 0;
  const watchedCount = watchedVideos.length;
  const isAllWatched = count > 0 && watchedCount >= count;
  const hasStarted = isCompleted || watchedCount > 0 || (lastVideo !== undefined && lastVideo > 0);

  const durationMin = Math.max(5, count * 5);
  let subtitle = `${count > 0 ? `${count} video` : 'Bài học'} • ⏱ ~${durationMin} phút`;
  let progressPercent = 0;

  if (isCompleted || isAllWatched) {
    subtitle = `Đã hoàn thành bài ✓`;
    progressPercent = 100;
  } else if (count === 0) {
    subtitle = hasStarted ? `Đang học bài` : `Lý thuyết • ⏱ 5 phút`;
    progressPercent = hasStarted ? 50 : 0;
  } else if (hasStarted) {
    const currentVideo = lastVideo || (watchedVideos.length > 0 ? Math.max(...watchedVideos) : 1);
    subtitle = `Đang học video ${String(currentVideo).padStart(2, '0')}/${count}`;
    progressPercent = Math.min(100, Math.round((watchedCount / count) * 100));
    if (progressPercent === 0 && currentVideo > 0) {
      progressPercent = Math.round((1 / count) * 100);
    }
  }

  const targetUrl = lastVideo
    ? `/${topic.slug}/${page.slug}?v=${lastVideo}`
    : `/${topic.slug}/${page.slug}`;

  return (
    <Link
      href={targetUrl}
      prefetch={true}
      onTouchStart={onActivate}
      className={`page-card-container flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border transition-all active:scale-[0.99] shadow-xs group ${
        isActive
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
          : hasStarted && !isCompleted
          ? 'border-teal-300 dark:border-teal-700/60'
          : isCompleted
          ? 'border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/20'
          : 'border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800'
      }`}
    >
      {/* Ô ẢNH ĐẠI DIỆN BÀI HỌC (THUMBNAIL) */}
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
        {page.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.cover_url}
            alt={page.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
            <BookOpen size={24} className="opacity-80" />
          </div>
        )}
      </div>

      {/* NỘI DUNG BÊN PHẢI: TIÊU ĐỀ RỘNG RÃI + THỜI LƯỢNG & TRẠNG THÁI */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 self-stretch">
        <div className="flex items-center justify-between gap-1.5">
          <h3
            className={`text-sm sm:text-base font-bold leading-snug line-clamp-2 transition-colors flex-1 min-w-0 ${
              isActive
                ? 'text-teal-800 dark:text-teal-300'
                : 'text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400'
            }`}
          >
            <span className="text-teal-700 dark:text-teal-400 font-mono font-extrabold mr-1.5 shrink-0">
              {String(orderNumber).padStart(2, '0')} ·
            </span>
            <span>{page.title}</span>
          </h3>
          <ChevronRight
            size={18}
            className={`transition-colors shrink-0 ml-1 ${
              isActive
                ? 'text-teal-600 dark:text-teal-400 translate-x-0.5'
                : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-white'
            }`}
          />
        </div>

        {/* HÀNG DƯỚI: TRẠNG THÁI HOÀN THÀNH / ĐANG HỌC HOẶC THỜI LƯỢNG */}
        <div className="flex items-center justify-between gap-2 mt-1 pt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-600/40 dark:text-emerald-300 text-[11px] font-bold shrink-0">
                <CheckCircle2 size={12} />
                <span>Hoàn thành</span>
              </span>
            ) : hasStarted ? (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950/80 dark:border-teal-600/40 dark:text-teal-200 text-[11px] font-bold shrink-0">
                Đang học
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-semibold shrink-0">
                <Clock size={11} />
                <span>~{durationMin} phút</span>
              </span>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          </div>

          {/* Thanh tiến độ nếu đang học */}
          {hasStarted && (
            <div
              className="w-16 sm:w-20 h-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden shrink-0"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAllWatched || isCompleted ? 'bg-emerald-500' : 'bg-teal-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
