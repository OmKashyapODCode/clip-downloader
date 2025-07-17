import Clip from '../models/Clip.js';
import { spawn } from 'child_process';

// Helper: calculate duration from start to end time
function calculateDuration(start, end) {
  const parse = (t) => {
    const parts = t.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return NaN;
  };
  return parse(end) - parse(start);
}

// Save clip metadata
export const generateClip = async (req, res) => {
  try {
    const { url, start, end } = req.body;
    if (!url || !start || !end) return res.status(400).json({ error: 'Missing url, start, or end' });

    const duration = calculateDuration(start, end);
    if (!isFinite(duration) || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

    const id = Date.now();
    const downloadUrl = `/api/clip/download/${id}`;
    const clip = new Clip({ url, start, end, downloadUrl });

    await clip.save();
    res.json({ message: 'Clip metadata saved', downloadUrl });
  } catch (err) {
    console.error('generateClip error:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Stream clip directly, then delete record
export const downloadAndDelete = async (req, res) => {
  try {
    const clip = await Clip.findOne({ downloadUrl: `/api/clip/download/${req.params.id}` });
    if (!clip) return res.status(404).json({ error: 'Clip not found' });

    const { url, start, end } = clip;
    const duration = calculateDuration(start, end);
    if (!isFinite(duration) || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="clip.mp4"');

    const yt = spawn('yt-dlp', ['-f', 'best', '-o', '-', url]);
    const ffmpeg = spawn('ffmpeg', [
      '-ss', start,
      '-i', 'pipe:0',
      '-t', `${duration}`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov',
      'pipe:1'
    ]);

    yt.stdout.pipe(ffmpeg.stdin);
    ffmpeg.stdout.pipe(res);

    yt.stderr.on('data', data => console.log(`[yt-dlp] ${data}`));
    ffmpeg.stderr.on('data', data => console.log(`[ffmpeg] ${data}`));

    yt.on('error', err => {
      console.error('yt-dlp failed:', err.message);
      res.status(500).end('yt-dlp error');
    });

    ffmpeg.on('error', err => {
      console.error('ffmpeg failed:', err.message);
      res.status(500).end('ffmpeg error');
    });

    ffmpeg.on('close', async () => {
      await Clip.findByIdAndDelete(clip._id);
      console.log(`Deleted clip from DB: ${clip._id}`);
    });
  } catch (err) {
    console.error('downloadAndDelete error:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
