const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://evuhamqlzprrbuabxyyn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWhhbXFsenBycmJ1YWJ4eXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc3ODIxNywiZXhwIjoyMTA2MzU0MjE3fQ.AZ8T_oEHoUxobvOLJ_wFpSx8SH6oEJ-D-ype1zSHqks';
const supabase = createClient(supabaseUrl, supabaseKey);

const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\753f97f0-dd7e-4ec3-815f-c40f6a887219';

async function main() {
  const file = 'my_learning_saved_ui_1791103378522.jpg';
  const name = 'demo-v2-bai-cua-toi-va-hoi-dap-ai.jpg';
  const filePath = path.join(brainDir, file);
  const buffer = fs.readFileSync(filePath);
  const storagePath = 'demo-ui/' + name;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error('Error uploading', error);
  } else {
    const { data: publicData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);
    console.log('UPLOADED: ' + publicData.publicUrl);
  }
}

main().catch(console.error);
