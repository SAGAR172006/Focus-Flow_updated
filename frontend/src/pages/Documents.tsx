import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Sparkles, Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Documents = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfText, setPdfText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<"summary" | "keypoints" | "action">("summary");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf" && uploadedFile.type !== "text/plain") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or text file",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    setSummary("");
    
    // Extract text from file
    if (uploadedFile.type === "text/plain") {
      const text = await uploadedFile.text();
      setPdfText(text);
    } else if (uploadedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        
        setPdfText(fullText);
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        toast({
          title: "Error",
          description: "Failed to extract text from PDF",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "File uploaded",
      description: `${uploadedFile.name} loaded successfully`,
    });
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleAnalyze = async () => {
    if (!pdfText) {
      toast({
        title: "No document",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-document", {
        body: { text: pdfText, type: analysisType },
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Analysis complete",
        description: "Document analyzed successfully",
      });
    } catch (error: any) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">AI Document Tools</h1>
        <p className="text-muted-foreground">
          Upload PDFs or text files to view, analyze, and get AI-powered insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload a PDF or text file to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            {file && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              Get AI-powered insights from your document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="keypoints">Key Points</TabsTrigger>
                <TabsTrigger value="action">Actions</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={handleAnalyze}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PDF Viewer */}
      {file?.type === "application/pdf" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>PDF Viewer</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="border rounded-lg overflow-hidden"
              >
                <Page pageNumber={pageNumber} scale={scale} />
              </Document>
              {numPages > 0 && (
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text File Viewer */}
      {file?.type === "text/plain" && (
        <Card>
          <CardHeader>
            <CardTitle>Document Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={pdfText}
              onChange={(e) => setPdfText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Document text will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {/* AI Summary Display */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Documents;
