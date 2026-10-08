const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://evuhamqlzprrbuabxyyn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWhhbXFsenBycmJ1YWJ4eXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc3ODIxNywiZXhwIjoyMTA2MzU0MjE3fQ.AZ8T_oEHoUxobvOLJ_wFpSx8SH6oEJ-D-ype1zSHqks';
const supabase = createClient(supabaseUrl, supabaseKey);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\753f97f0-dd7e-4ec3-815f-c40f6a887219';

const images = [
  { file: 'modern_friendly_ui_1791093788590.jpg', name: 'demo-v2-dau-trang.jpg' },
  { file: 'home_scroll_down_1791093907226.jpg', name: 'demo-v2-cuon-xuong.jpg' },
  { file: 'lesson_detail_ui_1791093927071.jpg', name: 'demo-v2-bai-hoc.jpg' },
  { file: 'senior_friendly_ui_1791093689785.jpg', name: 'demo-v2-duong-sinh.jpg' }
];

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Available buckets:', buckets ? buckets.map(b => b.name) : 'none');

  const targetBucket = buckets && buckets.length > 0 ? buckets[0].name : 'images';

  const urls = {};
  for (const item of images) {
    const filePath = path.join(brainDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.log('Not found:', filePath);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const storagePath = 'demo-ui/' + item.name;

    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Error uploading ' + item.name, error);
    } else {
      const { data: publicData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(storagePath);
      urls[item.name] = publicData.publicUrl;
      console.log('Uploaded ' + item.name + ' -> ' + publicData.publicUrl);
    }
  }

  fs.writeFileSync('scripts/uploaded_urls.json', JSON.stringify(urls, null, 2));
}

main().catch(console.error);
