const { spawn } = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

// ====== إعداداتك ======
const IMAGE_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgT1HNNcPV0JDoj6OrR8elPcTLPMQB2n4U1udFxRntCQ9YLBJ_5tsObxcZyZccibhQnWq_I0B55djs6WzqPZxK_AlMtwT8zihhb4MtjZNFNTaeKBy5k3TD-qrw-Zb_szmdMz1ifJKAmoUSaHUkuXp2QTYQvmnMl145qsOXgzLoYla5cdAjig8aVj4tcXF4/s1536/9362.jpg";
const STREAM_KEY = "re_11151233_event2e479da06c894f428bfe6f61a04dc466";
const RTMP_URL = `rtmp://live.restream.io/live/${STREAM_KEY}`;
const FFMPEG_PATH = "ffmpeg";

const IMAGE_PATH = path.join(__dirname, "image.jpg");

// تحميل الصورة أولاً
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function startStream() {
  console.log("📥 تحميل الصورة...");
  await downloadImage(IMAGE_URL, IMAGE_PATH);
  console.log("✅ تم تحميل الصورة");

  console.log("🚀 بدء البث إلى Restream...");

  const ffmpeg = spawn(FFMPEG_PATH, [
    "-re",
    "-loop", "1",
    "-i", IMAGE_PATH,
    "-f", "lavfi",
    "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-tune", "stillimage",
    "-b:v", "3000k",
    "-pix_fmt", "yuv420p",
    "-g", "50",
    "-r", "25",
    "-c:a", "aac",
    "-b:a", "128k",
    "-ar", "44100",
    "-shortest",
    "-f", "flv",
    RTMP_URL
  ]);

  ffmpeg.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  ffmpeg.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  ffmpeg.on("close", (code) => {
    console.log(`❌ توقف البث بكود: ${code}`);
  });
}

startStream();