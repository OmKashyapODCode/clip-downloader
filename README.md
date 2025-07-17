# 🎬 YouTube Clip Downloader - Backend

A backend service built with **Node.js**, **Express**, and **MongoDB** that allows users to download specific clips from YouTube videos by providing timestamps.

---

## 📦 Features

- Download specific segments of YouTube videos
- Store downloaded clips metadata in MongoDB
- Error handling and validation
- Environment-configurable ports and DB connection

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **FFmpeg** (for video processing)
- **dotenv**

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
Install dependencies

npm install

Add .env file

Create a .env file in the root directory with the following variables:


PORT=5000
MONGO_URI=your_mongodb_connection_string

Ensure FFmpeg is installed and added to PATH

Download from: https://ffmpeg.org/download.html
Make sure it's accessible from your terminal or CMD.

Start the server

npm start
