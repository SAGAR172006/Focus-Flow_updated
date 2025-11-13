import { Router } from "express";

const router = Router();

router.post("/youtube-search", async (req, res) => {
  try {
    const { query, maxResults } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    // For now, we’ll mock the data since AI summarization isn’t wired yet
    // Later, you can replace this with YouTube Data API + OpenAI summary logic.
    const mockResults = [
      {
        videoId: "sample1",
        title: `Example result for "${query}"`,
        description: "This is a mock YouTube video result.",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        channelTitle: "Mock Channel",
        publishedAt: new Date().toISOString(),
        duration: "5:23",
        aiSummary: "A mock AI-generated summary about this video.",
        captionsAvailable: true,
      },
    ];

    res.json({ videos: mockResults });
  } catch (error) {
    console.error("YouTube search error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
