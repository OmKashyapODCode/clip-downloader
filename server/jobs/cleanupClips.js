import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Clip from '../models/Clip.js';

const TMP_DIR = path.join('tmp');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Running temp folder cleanup...');

  fs.readdir(TMP_DIR, async (err, files) => {
    if (err) {
      console.error('❌ Failed to read tmp folder:', err.message);
      return;
    }

    for (const file of files) {
      const filePath = path.join(TMP_DIR, file);
      const stats = fs.statSync(filePath);
      const ageMs = Date.now() - stats.mtimeMs;

      if (ageMs > 5 * 60 * 1000) {
        // Delete file
        fs.unlink(filePath, async (err) => {
          if (err) {
            console.warn(`❌ Failed to delete ${filePath}:`, err.message);
            return;
          }

          console.log(`🗑️ Deleted old file: ${file}`);

          // Extract ID from filename: clip_<id>.mp4
          const id = file.split('_')[1]?.split('.')[0];
          if (id) {
            const downloadUrl = `/api/clip/download/${id}`;
            await Clip.findOneAndDelete({ downloadUrl });
            console.log(`🗃️ Deleted DB record for clip: ${downloadUrl}`);
          }
        });
      }
    }
  });
});

