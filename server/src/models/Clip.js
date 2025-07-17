import mongoose from 'mongoose';

const clipSchema = new mongoose.Schema({
  url: String,
  start: String,
  end: String,
  downloadUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Clip', clipSchema);
