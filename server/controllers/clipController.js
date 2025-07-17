import Clip from '../models/Clip.js';
import { spawn } from 'child_process';

// 🧮 Duration calculator
function calculateDuration(start, end) {
  const parseTime = (t) => {
    const parts = t.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return NaN;
  };

  const startSec = parseTime(start);
  const endSec = parseTime(end);
  return endSec - startSec;
}

// 🎬 Create and store clip metadata only
export const generateClip = async (req, res) => {
  try {
    const { url, start, end } = req.body;

    if (!url || !start || !end) {
      return res.status(400).json({ error: 'Missing url/start/end' });
    }

    const duration = calculateDuration(start, end);
    if (!isFinite(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    const id = Date.now();
    const downloadUrl = `/api/clip/download/${id}`;

    const clip = new Clip({ url, start, end, downloadUrl });
    await clip.save();

    res.json({
      message: 'Clip metadata saved!',
      downloadUrl
    });
  } catch (err) {
    console.error('🔥 Error:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// 📥 Stream clip without saving file
export const downloadAndDelete = async (req, res) => {
  try {
    const clip = await Clip.findOne({ downloadUrl: `/api/clip/download/${req.params.id}` });
    if (!clip) return res.status(404).json({ error: 'Clip not found in database' });

    const { url, start, end } = clip;
    const duration = calculateDuration(start, end);
    if (!duration || duration <= 0) return res.status(400).json({ error: 'Invalid duration' });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=\"clip.mp4\"');

    const ytDlp = spawn('yt-dlp', ['-f', 'best', '-o', '-', url]);
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

    ytDlp.stdout.pipe(ffmpeg.stdin);
    ffmpeg.stdout.pipe(res);

    // ✅ Catches broken pipe (EPIPE) if browser closes early
    res.on('error', (err) => {
      console.error('❌ Response stream error:', err.message);
      ytDlp.kill('SIGKILL');
      ffmpeg.kill('SIGKILL');
    });

    res.on('close', () => {
      ytDlp.kill('SIGKILL');
      ffmpeg.kill('SIGKILL');
      console.log('⚠️ Client disconnected. Cleaned up processes.');
    });

    ytDlp.stderr.on('data', (data) => console.log(`[yt-dlp] ${data}`));
    ffmpeg.stderr.on('data', (data) => console.log(`[ffmpeg] ${data}`));

    ytDlp.on('error', (err) => {
      console.error('❌ yt-dlp failed:', err.message);
      try { res.end(); } catch {}
    });

    ffmpeg.on('error', (err) => {
      console.error('❌ ffmpeg failed:', err.message);
      try { res.end(); } catch {}
    });

    ffmpeg.on('close', async () => {
      await Clip.findByIdAndDelete(clip._id);
      console.log(`🗃️ Deleted DB record: ${clip._id}`);
    });

  } catch (err) {
    console.error('🔥 Download error:', err.message);
    try { res.status(500).json({ error: 'Internal server error' }); } catch {}
  }
};
