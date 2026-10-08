import React from 'react';
import { getSettings, getTopicsWithCounts } from '../lib/data';
import ModernSeniorHome from '../components/ModernSeniorHome';
import { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings?.app_name || 'Qbiz Books'} · Tủ Sách Y Khoa & Khám Phá Cơ Thể`,
    description: 'Ứng dụng học hiểu kiến thức về cơ thể và chăm sóc sức khỏe chủ động',
  };
}

export default async function HomePage() {
  const [settings, topicsWithCounts] = await Promise.all([
    getSettings(),
    getTopicsWithCounts(true),
  ]);

  return (
    <main className="w-full min-h-screen">
      <ModernSeniorHome
        topicsWithCounts={topicsWithCounts}
        settings={settings}
        appName={settings?.app_name}
        appSubtitle={settings?.app_subtitle}
        brandTagline={settings?.brand_tagline}
        hotline={settings?.hotline}
        zaloUrl={settings?.zalo_url}
        authorProfile={settings?.author_profile}
        recommendedBooks={settings?.recommended_books}
        flatBooks={settings?.flat_books}
        welcomeTitle={settings?.welcome_title}
        welcomeMessage={settings?.welcome_message}
        welcomeVideoUrl={settings?.welcome_video_url}
      />
    </main>
  );
}
