import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Send,
  Save,
  Maximize,
  Minimize,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  AlertCircle,
  UserCheck,
  Zap
} from "lucide-react";
import { LabResultsService, LabResult } from "@/lib/labResultsService";
import { useToast } from "@/hooks/use-toast";

interface FullPageLabViewerProps {
  resultId: string;
  onClose: () => void;
  onSendInterpretation?: (interpretation: string) => void;
}

export const FullPageLabViewer = ({ resultId, onClose, onSendInterpretation }: FullPageLabViewerProps) => {
  const [result, setResult] = useState<LabResult | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [panelWidth, setPanelWidth] = useState(30); // Percentage width of interpretation panel
  const [isResizing, setIsResizing] = useState(false);
  const [showInterpretationPanel, setShowInterpretationPanel] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const labResult = LabResultsService.getLabResultById(resultId);
    if (labResult) {
      setResult(labResult);
      setInterpretation(labResult.interpretation || "");
    }
  }, [resultId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
        setPanelWidth(Math.max(20, Math.min(60, newWidth))); // Limit between 20% and 60%
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-review": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "in-review": return <Eye className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleSendInterpretation = () => {
    if (!interpretation.trim()) {
      toast({
        title: "Missing interpretation",
        description: "Please write an interpretation before sending",
        variant: "destructive",
      });
      return;
    }

    const updated = LabResultsService.updateLabResult(resultId, { 
      interpretation: interpretation.trim(),
      status: 'completed'
    });
    
    if (updated) {
      setResult(updated);
      toast({
        title: "Interpretation sent!",
        description: "The patient will receive your interpretation via email.",
      });
      if (onSendInterpretation) {
        onSendInterpretation(interpretation.trim());
      }
    }
  };

  const handleSaveDraft = () => {
    if (!interpretation.trim()) return;
    
    const updated = LabResultsService.updateLabResult(resultId, { 
      interpretation: interpretation.trim() 
    });
    
    if (updated) {
      setResult(updated);
      toast({
        title: "Draft saved",
        description: "Your interpretation has been saved as a draft",
      });
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p>Loading lab result...</p>
        </div>
      </div>
    );
  }

  const isFresh = LabResultsService.getFreshResults().some(f => f.id === result.id);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(result.status)}>
                {getStatusIcon(result.status)}
                <span className="ml-1 capitalize">{result.status.replace('-', ' ')}</span>
              </Badge>
              
              {result.priority && result.priority !== 'normal' && (
                <Badge className={getPriorityColor(result.priority)}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {result.priority.toUpperCase()}
                </Badge>
              )}
              
              {isFresh && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Fresh
                </Badge>
              )}
              
              <span className="text-sm font-mono text-muted-foreground">{result.id}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{result.testType}</span>
              <span className="mx-2">•</span>
              <span>{result.patientEmail}</span>
              <span className="mx-2">•</span>
              <span>{new Date(result.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Document Controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="px-2 text-sm min-w-[3rem] text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInterpretationPanel(!showInterpretationPanel)}
            >
              {showInterpretationPanel ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="ml-2">{showInterpretationPanel ? 'Hide' : 'Show'} Panel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Viewer */}
        <div 
          className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto"
          style={{ 
            width: showInterpretationPanel ? `${100 - panelWidth}%` : '100%' 
          }}
        >
          <div 
            className="bg-white shadow-lg max-w-full max-h-full overflow-auto"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {result.fileData ? (
              <img 
                src={result.fileData} 
                alt={result.fileName}
                className="max-w-none"
                style={{ maxWidth: 'none', height: 'auto' }}
              />
            ) : (
              <div className="w-96 h-96 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Document preview not available</p>
                  <p className="text-sm text-gray-400 mt-2">{result.fileName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interpretation Panel */}
        {showInterpretationPanel && (
          <>
            {/* Resize Handle */}
            <div 
              className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
              onMouseDown={() => setIsResizing(true)}
            />
            
            {/* Panel */}
            <div 
              className="bg-background border-l border-border overflow-hidden flex flex-col"
              style={{ width: `${panelWidth}%` }}
            >
              <Card className="flex-1 rounded-none border-0 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Medical Interpretation
                  </CardTitle>
                  
                  {result.assignedDoctor && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCheck className="w-4 h-4" />
                      <span>Assigned to {result.assignedDoctor.name}</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col">
                      <label className="text-sm font-medium text-foreground mb-2">
                        Professional Interpretation
                      </label>
                      <Textarea
                        placeholder="Write your professional interpretation of the lab results here..."
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        className="flex-1 min-h-[300px] resize-none bg-background"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="medical" 
                        onClick={handleSendInterpretation}
                        disabled={!interpretation.trim() || result.status === 'completed'}
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Patient
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={!interpretation.trim()}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                    </div>
                    
                    {result.interpretation && result.status === 'completed' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium">✓ Interpretation sent to patient</p>
                        <p className="text-xs text-green-700 mt-1">
                          The patient has been notified via email with your interpretation.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
