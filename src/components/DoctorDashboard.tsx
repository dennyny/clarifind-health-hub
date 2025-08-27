import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Search, 
  Eye, 
  Send, 
  User,
  Calendar,
  Filter
} from "lucide-react";

// Mock data for demonstration
const mockUploadedResults = [
  {
    id: "CLR-123456",
    patientEmail: "john.doe@email.com",
    fileName: "CBC_Results_Jan2024.pdf",
    uploadDate: "2024-01-15T10:30:00Z",
    status: "pending",
    fileSize: "1.2 MB",
    testType: "Complete Blood Count"
  },
  {
    id: "CLR-123457",
    patientEmail: "sarah.smith@email.com",
    fileName: "Lipid_Panel_Results.pdf",
    uploadDate: "2024-01-14T14:45:00Z",
    status: "in-review",
    fileSize: "0.8 MB",
    testType: "Lipid Panel"
  },
  {
    id: "CLR-123458",
    patientEmail: "mike.jones@email.com",
    fileName: "Thyroid_Function_Test.pdf",
    uploadDate: "2024-01-13T09:15:00Z",
    status: "completed",
    fileSize: "1.0 MB",
    testType: "Thyroid Function"
  }
];

export const DoctorDashboard = () => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredResults = mockUploadedResults.filter(result =>
    result.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
              <p className="text-muted-foreground">Review and interpret lab results</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-accent border-accent">
                <User className="w-4 h-4 mr-2" />
                Dr. Sarah Wilson, MD
              </Badge>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Results Queue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Lab Results Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by patient email, reference number, or filename..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card 
                  key={result.id} 
                  className={`shadow-card cursor-pointer transition-all duration-300 hover:shadow-medical ${
                    selectedResult === result.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedResult(result.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(result.status)}>
                            {getStatusIcon(result.status)}
                            <span className="ml-1 capitalize">{result.status}</span>
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {result.id}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-foreground">
                          {result.testType}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {result.patientEmail}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(result.uploadDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {result.fileName}
                          </div>
                          <div className="text-muted-foreground">
                            {result.fileSize}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View File
                        </Button>
                        {result.status === "pending" && (
                          <Button variant="medical" size="sm">
                            Start Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Interpretation Panel */}
          <div className="space-y-6">
            {selectedResult ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Write Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedResult}
                  </div>
                  
                  {/* File Viewer Placeholder */}
                  <div className="aspect-[3/4] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Lab Results PDF Viewer
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (File would display here)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Medical Interpretation
                    </label>
                    <Textarea
                      placeholder="Write your professional interpretation of the lab results here..."
                      value={interpretation}
                      onChange={(e) => setInterpretation(e.target.value)}
                      className="min-h-[200px] bg-background"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="medical" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Send to Patient
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Select a Lab Result
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a lab result from the queue to start writing your interpretation.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">5</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Avg. turnaround: <span className="font-medium">18 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};