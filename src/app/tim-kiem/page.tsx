'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X, ArrowLeft, BookOpen, Layers, ChevronRight, Sparkles } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export const dynamic = 'force-dynamic';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

interface SearchData {
  topics: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    color_bg: string;
    color_fg: string;
    icon_url?: string;
    cover_url?: string;
  }[];
  pages: {
    id: string;
    title: string;
    slug: string;
    topic_slug: string;
    topic_title: string;
    page_number: number;
    summary: string | null;
    cover_url?: string;
    text_snippets: string[];
  }[];
  videos: {
    youtube_id: string;
    title: string;
    description?: string;
    topic_slug: string;
    topic_title: string;
    page_slug: string;
    page_title: string;
    page_number: number;
    video_index: number;
    thumbnail_url?: string;
  }[];
}

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [allData, setAllData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  // Tự động focus vào ô nhập và cập nhật tiêu đề trang
  useEffect(() => {
    inputRef.current?.focus();
    document.title = 'Tìm kiếm bài học · Học Cơ Thể';
  }, []);

  // Tải dữ liệu tìm kiếm ngầm
  useEffect(() => {
    fetch('/api/search')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setAllData(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Debounce 250ms sau khi ngừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const cleanQuery = removeVietnameseTones(debouncedQuery);

  // Lọc kết quả theo 3 nhóm: Chủ đề, Trang nội dung, Video
  const matchedTopics = (allData?.topics || []).filter((t) => {
    if (!cleanQuery) return false;
    const titleMatch = removeVietnameseTones(t.title).includes(cleanQuery);
    const descMatch = t.description && removeVietnameseTones(t.description).includes(cleanQuery);
    return titleMatch || descMatch;
  });

  const matchedPages = (allData?.pages || []).filter((p) => {
    if (!cleanQuery) return false;
    const titleMatch = removeVietnameseTones(p.title).includes(cleanQuery);
    const summaryMatch = p.summary && removeVietnameseTones(p.summary).includes(cleanQuery);
    const snippetMatch = p.text_snippets.some((snip) =>
      removeVietnameseTones(snip).includes(cleanQuery)
    );
    return titleMatch || summaryMatch || snippetMatch;
  });

  const matchedVideos = (allData?.videos || []).filter((v) => {
    if (!cleanQuery) return false;
    const titleMatch = removeVietnameseTones(v.title).includes(cleanQuery);
    const descMatch = v.description && removeVietnameseTones(v.description).includes(cleanQuery);
    return titleMatch || descMatch;
  });

  const totalResults = matchedTopics.length + matchedPages.length + matchedVideos.length;

  return (
    <main className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-24 gap-3.5 max-w-[640px] w-full mx-auto bg-[#FAF9F6] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* 1. Thanh đầu trang: Nút quay lại + Ô tìm kiếm */}
      <section className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="w-10 h-10 min-w-[40px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer shadow-2xs"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={17} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài học, đĩa đệm, cột sống..."
            className="w-full h-10 pl-9 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-teal-500 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden shadow-2xs transition-colors"
            aria-label="Nhập từ khóa tìm kiếm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-2 my-auto w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              aria-label="Xóa từ khóa"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {/* 2. Nội dung kết quả hoặc Gợi ý */}
      <section className="flex flex-col gap-3.5">
        {!cleanQuery ? (
          /* Gợi ý khi chưa gõ: Hiển thị ngay lập tức, không để màn hình trắng chờ tải */
          <div className="flex flex-col gap-3 py-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gợi ý tìm kiếm phổ biến
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Cột sống',
                'Đĩa đệm',
                'Thoát vị',
                'Tư thế ngồi',
                'Dạ dày',
                'Tiêu hóa',
                'Dinh dưỡng',
                'Thần kinh',
                'Hệ miễn dịch',
                'Gan mật',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="h-8 px-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 dark:hover:border-teal-500 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Chuyên đề truy cập nhanh */}
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase text-slate-400">
                Chuyên đề trọng tâm
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cot-song"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all"
                >
                  <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Cột sống
                  </span>
                </Link>

                <Link
                  href="/tieu-hoa"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all"
                >
                  <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Hệ Tiêu Hóa
                  </span>
                </Link>

                <Link
                  href="/dinh-duong"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all"
                >
                  <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Dinh Dưỡng
                  </span>
                </Link>

                <Link
                  href="/co-the-nguoi"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all"
                >
                  <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Cơ Thể Người 3D
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-slate-400 text-sm font-medium animate-pulse">
            Đang tìm kiếm...
          </div>
        ) : totalResults === 0 ? (
          /* Không tìm thấy - Empty State tinh gọn */
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 my-2 flex flex-col gap-1 shadow-2xs">
            <p className="text-sm font-black text-slate-900 dark:text-white">
              Không tìm thấy kết quả phù hợp
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thử tìm với từ khóa khác như: cột sống, đĩa đệm, dinh dưỡng.
            </p>
          </div>
        ) : (
          /* Danh sách kết quả theo 3 nhóm */
          <div className="flex flex-col gap-4">
            {/* Nhóm 1: Chủ đề */}
            {matchedTopics.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider px-1">
                  <Layers size={13} />
                  <span>CHUYÊN ĐỀ ({matchedTopics.length})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {matchedTopics.map((t) => {
                    const iconSrc = t.icon_url || `/images/topics/${t.slug}.png`;
                    return (
                      <Link
                        key={t.id}
                        href={`/${t.slug}`}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={iconSrc}
                              alt={t.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                              Chuyên đề
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                              {t.title}
                            </span>
                            {t.description && (
                              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {t.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-6 h-6 rounded-full text-slate-400 group-hover:text-teal-600 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                          <ChevronRight size={16} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nhóm 2: Bài học */}
            {matchedPages.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider px-1">
                  <BookOpen size={13} />
                  <span>BÀI HỌC ({matchedPages.length})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {matchedPages.map((p) => {
                    const formattedNum = String(p.page_number).padStart(2, '0');
                    const thumbSrc = p.cover_url || `/images/topics/${p.topic_slug}.png`;
                    return (
                      <Link
                        key={p.id}
                        href={`/${p.topic_slug}/${p.slug}`}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 shadow-2xs transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbSrc}
                              alt={p.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              {p.topic_title} · Bài {formattedNum}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                              {p.title}
                            </span>
                            {p.summary && (
                              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {p.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-6 h-6 rounded-full text-slate-400 group-hover:text-teal-600 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                          <ChevronRight size={16} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
