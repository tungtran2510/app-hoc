import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  getTopicBySlug,
  getPagesByTopic,
  getBlocksByPage,
  getSettings,
} from '../../lib/data';
import TopicHeaderNav from '../../components/TopicHeaderNav';
import PageListClient from '../../components/PageListClient';
import BottomNav from '../../components/BottomNav';
import { Metadata } from 'next';

interface TopicPageProps {
  params: {
    topicSlug: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const [topic, settings] = await Promise.all([
    getTopicBySlug(params.topicSlug),
    getSettings(),
  ]);
  if (!topic) return { title: 'Không tìm thấy chủ đề' };
  return {
    title: `${topic.title} · ${settings?.app_name || 'Học Cơ Thể'}`,
    description: topic.description || `Khám phá kiến thức ${topic.title}`,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicSlug } = params;
  const topic = await getTopicBySlug(topicSlug);

  if (!topic) {
    notFound();
  }

  const pages = await getPagesByTopic(topic.id, true);

  // Lấy số video cho từng trang
  const pagesWithVideoCount = await Promise.all(
    pages.map(async (page, index) => {
      const blocks = await getBlocksByPage(page.id);
      let count = 0;
      for (const b of blocks) {
        if (b.type === 'videos' && Array.isArray(b.data?.videos)) {
          count += b.data.videos.length;
        }
      }

      return {
        page,
        orderNumber: index + 1,
        videoCount: count,
      };
    })
  );

  const totalVideos = pagesWithVideoCount.reduce(
    (acc, cur) => acc + cur.videoCount,
    0
  );

  return (
    <main className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-28 gap-4 max-w-lg mx-auto w-full bg-[#FAF9F6] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* 1. Header Điều Hướng: Solid Teal Bar với ‹ Trang chủ và Tên Chuyên Đề chuẩn mẫu v2_compact_topic_page */}
      <TopicHeaderNav topicTitle={topic.title} />

      {/* 2. Tiêu Đề & Thông tin Chuyên Đề Tinh Gọn */}
      {topic.description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-1 leading-relaxed -mb-1">
          {topic.description}
        </p>
      )}

      {/* 3. Danh sách lộ trình bài học nối tiếp với timeline và số nhỏ gọn */}
      <PageListClient initialPages={pagesWithVideoCount} topic={topic} />

      {/* 4. Thanh điều hướng đáy 3 nút chuẩn */}
      <BottomNav />
    </main>
  );
}
