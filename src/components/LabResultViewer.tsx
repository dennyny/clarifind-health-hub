import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, ZoomIn, ZoomOut } from "lucide-react";
import { LabResultsService } from "@/lib/labResultsService";

interface LabResultViewerProps {
  resultId: string;
}

export const LabResultViewer = ({ resultId }: LabResultViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const result = LabResultsService.getLabResultById(resultId);

  if (!result) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lab Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[3/4] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No file selected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.fileData;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPDF = result.fileType === 'application/pdf';
  const isImage = result.fileType.startsWith('image/');

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lab Result
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span>{result.fileName}</span>
            <span className="text-xs">{result.fileSize}</span>
          </div>
          
          <div className="max-h-[500px] overflow-auto bg-muted rounded-lg border">
            {isImage && (
              <div className="p-4 flex justify-center">
                <img 
                  src={result.fileData} 
                  alt={result.fileName}
                  style={{ transform: `scale(${zoom / 100})` }}
                  className="max-w-full transition-transform origin-top-left"
                />
              </div>
            )}
            
            {isPDF && (
              <div className="p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  PDF Document: {result.fileName}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF preview not available in this demo. In a production environment,
                  this would display the PDF content or use a PDF viewer library.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(result.fileData, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
            
            {!isImage && !isPDF && (
              <div className="p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  {result.fileName}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  File type: {result.fileType}
                </p>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
