// backend/src/routes/youtube.routes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js");
const { YoutubeTranscript } = require("youtube-transcript");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI (using the key from .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.use(protect);

// --- AI Summary Function ---
async function getAiSummaryFromTranscript(transcriptText, title) {
  if (!transcriptText) {
    return "No transcript available for this video to summarize.";
  }
  
  // Truncate transcript to avoid exceeding token limits
  const maxChars = 10000; 
  const truncatedText = transcriptText.length > maxChars 
    ? transcriptText.substring(0, maxChars) 
    : transcriptText;

  const prompt = `You are a YouTube video summarizer.
  Video Title: "${title}"
  Transcript: "${truncatedText}"
  
  Please provide a concise, 3-5 bullet point summary of this video. Focus on the main ideas and key takeaways.`;

  try {
    console.log(`Getting AI summary for: ${title}`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error(`AI summary failed for ${title}:`, error);
    return "AI summary could not be generated for this video.";
  }
}

// --- Transcript Fetcher ---
async function fetchTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    return transcript.map((item) => item.text).join(" ");
  } catch (error) {
    console.log(`Could not fetch transcript for ${videoId}: ${error.message}`);
    return null;
  }
}

// POST /api/youtube-search
router.post("/", async (req, res) => {
  const { query, maxResults = 12 } = req.body;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ message: "YouTube API key is not configured" });
  }
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=${maxResults}&key=${API_KEY}`;

  try {
    // 1. Search for videos
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    if (searchData.error) throw new Error(searchData.error.message);
    if (!searchData.items) {
        return res.status(200).json({ videos: [] });
    }

    // 2. Get details for each video (duration, etc.)
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const videoDetailsMap = new Map();
    if (detailsData.items) {
      detailsData.items.forEach(item => videoDetailsMap.set(item.id, item));
    }

    // 3. Process all videos in parallel
    const videos = await Promise.all(
      searchData.items.map(async (item) => {
        const videoId = item.id.videoId;
        const details = videoDetailsMap.get(videoId);
        
        const transcript = await fetchTranscript(videoId);
        const aiSummary = await getAiSummaryFromTranscript(transcript, item.snippet.title);

        let duration = "N/A";
        if (details?.contentDetails?.duration) {
          duration = details.contentDetails.duration
            .replace("PT", "")
            .replace("H", ":")
            .replace("M", ":")
            .replace("S", "");
        }

        return {
          videoId: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: duration,
          aiSummary: aiSummary,
          captionsAvailable: !!transcript,
        };
      })
    );

    res.status(200).json({ videos });
  } catch (error) {
    console.error("YouTube search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;