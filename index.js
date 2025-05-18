const express = require("express");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const YtDlpWrap = require("yt-dlp-wrap").default;
const ytDlpPath = path.join(__dirname, "bin", "yt-dlp.exe");
const ytDlpWrap = new YtDlpWrap(ytDlpPath);

const app = express();

// app.get("/stream1", (req, res) => {
//   const filePath = path.join(__dirname, "test.mp3");

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send("Datei nicht gefunden.");
//   }

//   res.setHeader("Content-Type", "audio/mpeg");
//   const readStream = fs.createReadStream(filePath);
//   readStream.pipe(res);
// });

// 2. Streaming einer lokalen Datei
app.get("/youtube", (req, res) => {
  const link = req.query.link || ""

  // Check if the provided link is valid
  if (!link || (!ytdl.validateID(link) && !ytdl.validateURL(link))) {
    return res.status(400).send("Fehlender oder ungültiger YouTube-Link.");
  }

  // Set the headers to send an audi stream and to buffer it in 20 second segments
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Accept-Ranges", "none");

  const ytStream = ytDlpWrap.execStream([
    link,
    "--quiet",
    "--no-playlist",
    "-f", "bestaudio",
    "--limit-rate", "200K", // Optional: für langsameres Nachladen
    "-o", "-"
  ]);

  ytStream.on("error", (err) => {
    console.error("Fehler beim Stream:", err.message);
    res.status(500).send("Streamfehler.");
  });

  ytStream.pipe(res);

  req.on("close", () => {
    ytStream.destroy();
  });
});

app.listen(3000, () => {
  console.log("Server läuft unter http://localhost:3000");
});

