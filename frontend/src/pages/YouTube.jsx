import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast"; // Removed
import {
  Search,
  Loader2,
  PlayCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const YouTube = () => {
  // const { toast } = useToast(); // Removed
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]); // Removed TypeScript

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Empty search: Please enter a search query"); // Replaced toast
      return;
    }

    setIsSearching(true);
    try {
      // This fetch call was already correct
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/youtube-search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, maxResults: 12 }),
        }
      );

      if (!response.ok) throw new Error("Backend request failed");
      const data = await response.json();

      setResults(data.videos || []);
      alert(`Search complete: Found ${data.videos?.length || 0} videos`); // Replaced toast
    } catch (error) {
      console.error("Error searching YouTube:", error);
      alert(`Search failed: ${error.message || "Failed to search YouTube"}`); // Replaced toast
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => { // Removed TypeScript
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Smart YouTube Search
        </h1>
        <p className="text-muted-foreground">
          Search for videos and get AI-powered summaries instantly
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Videos
          </CardTitle>
          <CardDescription>
            Enter a topic to find relevant YouTube videos with AI-generated
            insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., productivity tips, machine learning tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Search Results ({results.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((video) => (
              <Card
                key={video.videoId}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {video.channelTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Summary</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {video.aiSummary}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {video.captionsAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        Captions Available
                      </Badge>
                    )}
                  </div>

                  {/* Watch Button */}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full" variant="default">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Watch on YouTube
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isSearching && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Search className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">
                Enter a topic above to discover relevant videos with AI-powered
                summaries
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default YouTube;