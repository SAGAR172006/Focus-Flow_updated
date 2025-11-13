import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Download, Type, Image as ImageIcon, Highlighter, Trash2, Save } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Annotation {
  id: string;
  type: "text" | "image" | "highlight";
  page: number;
  x: number;
  y: number;
  content?: string;
  imageData?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

const PdfEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editMode, setEditMode] = useState<"text" | "image" | "highlight" | null>(null);
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [textColor, setTextColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdf);
      toast.success("PDF loaded successfully!");
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (editMode === "text" && textInput) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "text",
        page: currentPage,
        x,
        y,
        content: textInput,
        fontSize,
        fontFamily,
        color: textColor,
      };
      setAnnotations([...annotations, newAnnotation]);
      setTextInput("");
      toast.success("Text added!");
    } else if (editMode === "highlight") {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "highlight",
        page: currentPage,
        x,
        y,
        width: 100,
        height: 20,
        color: textColor,
      };
      setAnnotations([...annotations, newAnnotation]);
      toast.success("Highlight added!");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "image",
          page: currentPage,
          x: 100,
          y: 100,
          imageData: event.target?.result as string,
          width: 150,
          height: 150,
        };
        setAnnotations([...annotations, newAnnotation]);
        toast.success("Image added!");
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
    toast.success("Annotation deleted!");
  };

  const savePdf = async () => {
    if (!pdfDoc) {
      toast.error("No PDF loaded");
      return;
    }

    try {
      const pdfDocCopy = await PDFDocument.load(await pdfDoc.save());
      const pages = pdfDocCopy.getPages();

      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        const { height: pageHeight } = page.getSize();

        if (annotation.type === "text" && annotation.content) {
          const font = await pdfDocCopy.embedFont(
            annotation.fontFamily === "Courier" ? StandardFonts.Courier :
            annotation.fontFamily === "Times" ? StandardFonts.TimesRoman :
            StandardFonts.Helvetica
          );

          const colorMatch = annotation.color?.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          const r = colorMatch ? parseInt(colorMatch[1], 16) / 255 : 0;
          const g = colorMatch ? parseInt(colorMatch[2], 16) / 255 : 0;
          const b = colorMatch ? parseInt(colorMatch[3], 16) / 255 : 0;

          page.drawText(annotation.content, {
            x: annotation.x,
            y: pageHeight - annotation.y,
            size: annotation.fontSize || 16,
            font,
            color: rgb(r, g, b),
          });
        } else if (annotation.type === "highlight") {
          const colorMatch = annotation.color?.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          const r = colorMatch ? parseInt(colorMatch[1], 16) / 255 : 1;
          const g = colorMatch ? parseInt(colorMatch[2], 16) / 255 : 1;
          const b = colorMatch ? parseInt(colorMatch[3], 16) / 255 : 0;

          page.drawRectangle({
            x: annotation.x,
            y: pageHeight - annotation.y - (annotation.height || 20),
            width: annotation.width || 100,
            height: annotation.height || 20,
            color: rgb(r, g, b),
            opacity: 0.3,
          });
        } else if (annotation.type === "image" && annotation.imageData) {
          try {
            const imageBytes = await fetch(annotation.imageData).then((res) => res.arrayBuffer());
            const image = annotation.imageData.includes("png") 
              ? await pdfDocCopy.embedPng(imageBytes)
              : await pdfDocCopy.embedJpg(imageBytes);

            page.drawImage(image, {
              x: annotation.x,
              y: pageHeight - annotation.y - (annotation.height || 150),
              width: annotation.width || 150,
              height: annotation.height || 150,
            });
          } catch (err) {
            console.error("Error embedding image:", err);
          }
        }
      }

      const pdfBytes = await pdfDocCopy.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "edited-document.pdf";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF saved successfully!");
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save PDF");
    }
  };

  useEffect(() => {
    if (canvasRef.current && file) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw annotations for current page
        annotations
          .filter((ann) => ann.page === currentPage)
          .forEach((ann) => {
            if (ann.type === "text" && ann.content) {
              ctx.font = `${(ann.fontSize || 16) * scale}px ${ann.fontFamily || "Helvetica"}`;
              ctx.fillStyle = ann.color || "#000000";
              ctx.fillText(ann.content, ann.x * scale, ann.y * scale);
            } else if (ann.type === "highlight") {
              ctx.fillStyle = ann.color || "rgba(255, 255, 0, 0.3)";
              ctx.fillRect(
                ann.x * scale,
                ann.y * scale,
                (ann.width || 100) * scale,
                (ann.height || 20) * scale
              );
            } else if (ann.type === "image" && ann.imageData) {
              const img = new Image();
              img.src = ann.imageData;
              img.onload = () => {
                ctx.drawImage(
                  img,
                  ann.x * scale,
                  ann.y * scale,
                  (ann.width || 150) * scale,
                  (ann.height || 150) * scale
                );
              };
            }
          });
      }
    }
  }, [annotations, currentPage, scale, file]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">PDF Editor</h1>
        <div className="flex gap-2">
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          {file && (
            <Button onClick={savePdf} className="gap-2">
              <Download className="h-4 w-4" />
              Save PDF
            </Button>
          )}
        </div>
      </div>

      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Tools */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Editing Tools</h2>

            <Tabs value={editMode || ""} onValueChange={(v) => setEditMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="highlight">
                  <Highlighter className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label>Text Content</Label>
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to add"
                  />
                </div>
                <div>
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                      <SelectItem value="Times">Times Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size: {fontSize}px</Label>
                  <Input
                    type="range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on the PDF to place text
                </p>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <Button onClick={() => imageInputRef.current?.click()} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">
                  Upload an image to add to the PDF
                </p>
              </TabsContent>

              <TabsContent value="highlight" className="space-y-4">
                <div>
                  <Label>Highlight Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on the PDF to add highlights
                </p>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <h3 className="font-semibold">Annotations (Page {currentPage})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {annotations
                  .filter((ann) => ann.page === currentPage)
                  .map((ann) => (
                    <div
                      key={ann.id}
                      className="flex items-center justify-between p-2 bg-secondary/20 rounded"
                    >
                      <span className="text-sm truncate flex-1">
                        {ann.type === "text" ? ann.content : ann.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnotation(ann.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          {/* PDF Viewer */}
          <Card className="lg:col-span-2 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage >= numPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Label>Zoom: {Math.round(scale * 100)}%</Label>
                  <Input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="relative border rounded overflow-auto max-h-[700px]">
                <div style={{ position: "relative" }}>
                  <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={currentPage} scale={scale} />
                  </Document>
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      cursor: editMode ? "crosshair" : "default",
                      pointerEvents: editMode ? "auto" : "none",
                    }}
                    width={612 * scale}
                    height={792 * scale}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!file && (
        <Card className="p-12 text-center">
          <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No PDF Loaded</h2>
          <p className="text-muted-foreground mb-6">Upload a PDF to start editing</p>
          <Button onClick={() => fileInputRef.current?.click()} size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PdfEditor;
