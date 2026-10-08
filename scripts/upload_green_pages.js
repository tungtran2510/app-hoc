const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://evuhamqlzprrbuabxyyn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWhhbXFsenBycmJ1YWJ4eXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc3ODIxNywiZXhwIjoyMTA2MzU0MjE3fQ.AZ8T_oEHoUxobvOLJ_wFpSx8SH6oEJ-D-ype1zSHqks';
const supabase = createClient(supabaseUrl, supabaseKey);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\753f97f0-dd7e-4ec3-815f-c40f6a887219';

const images = [
  { file: 'green_grid_home_1791101454141.jpg', name: 'demo-v2-xanh-trang-chu.jpg' },
  { file: 'green_topic_playlist_1791101511233.jpg', name: 'demo-v2-xanh-chuyen-de.jpg' },
  { file: 'green_lesson_detail_1791101567894.jpg', name: 'demo-v2-xanh-bai-hoc.jpg' }
];

async function main() {
  for (const item of images) {
    const filePath = path.join(brainDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.log('Not found:', filePath);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const storagePath = 'demo-ui/' + item.name;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Error uploading ' + item.name, error);
    } else {
      const { data: publicData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);
      console.log('UPLOADED: ' + item.name + ' => ' + publicData.publicUrl);
    }
  }
}

main().catch(console.error);
