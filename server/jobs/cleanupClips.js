import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Clip from '../models/Clip.js';

// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running cleanup job...');

  const expiredClips = await Clip.find({
    createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // older than 5 minutes
  });

  for (const clip of expiredClips) {
    const fileId = clip.downloadUrl.split('/').pop();
    const fullPath = path.join('tmp', `clip_${fileId}.mp4`);

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.warn(`Failed to delete file: ${fullPath}`, err.message);
      } else {
        console.log(`Deleted file: ${fullPath}`);
      }
    });

    await Clip.findByIdAndDelete(clip._id);
    console.log(`Deleted DB record: ${clip._id}`);
  }
});
