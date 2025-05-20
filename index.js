const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const ytdl = require("ytdl-core");
const YtDlpWrap = require("yt-dlp-wrap").default;

const ytDlpPath = path.join(__dirname, "bin", "yt-dlp.exe");
const ytDlpWrap = new YtDlpWrap(ytDlpPath);
const app = express();

app.get("/youtube", (req, res) => {
  const link = req.query.link;

  if (!link || (!ytdl.validateID(link) && !ytdl.validateURL(link))) {
    return res.status(400).send("Fehlender oder ungültiger YouTube-Link.");
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Accept-Ranges", "none");

  // yt-dlp audio stream
  const ytdlp = ytDlpWrap.execStream([
    link,
    "--quiet",
    "--no-playlist",
    "-f", "bestaudio",
    "-o", "-"
  ]);

  // ffmpeg konvertiert zu MP3 on-the-fly
  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",
    "-vn",               // kein Video
    "-acodec", "libmp3lame",
    "-f", "mp3",
    "-b:a", "192k",      // konstante Bitrate (kannst du anpassen)
    "pipe:1"
  ]);

  ytdlp.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    // Debug-Zeug falls was schiefläuft
    console.error("ffmpeg stderr:", data.toString());
  });

  req.on("close", () => {
    ytdlp.destroy();
    ffmpeg.kill("SIGKILL");
  });

  ffmpeg.on("error", (err) => {
    console.error("ffmpeg error:", err.message);
    res.status(500).send("FFmpeg-Fehler.");
  });
});

app.listen(3000, () => {
  console.log("Server läuft unter http://localhost:3000");
});
