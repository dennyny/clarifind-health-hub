import { useState, useEffect } from "react";
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
  Filter,
  AlertCircle,
  UserCheck,
  Zap,
  RefreshCw
} from "lucide-react";
import { LabResultViewer } from "./LabResultViewer";
import { FullPageLabViewer } from "./FullPageLabViewer";
import { LabResultsService, LabResult, Doctor } from "@/lib/labResultsService";
import { useToast } from "@/hooks/use-toast";


type FilterType = 'all' | 'fresh' | 'in-review' | 'completed' | 'my-assignments';

export const DoctorDashboard = () => {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentDoctor] = useState<Doctor>(LabResultsService.getAvailableDoctors()[0]); // Simulate logged-in doctor
  const [availableDoctors] = useState<Doctor[]>(LabResultsService.getAvailableDoctors());
  const [fullPageViewerId, setFullPageViewerId] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Load lab results on component mount and refresh periodically
  useEffect(() => {
    const loadResults = () => {
      // Initialize demo data if no results exist
      LabResultsService.initializeDemoData();
      const results = LabResultsService.getAllLabResults();
      setLabResults(results);
    };

    loadResults();
    
    // Refresh data every 30 seconds to catch new uploads
    const interval = setInterval(loadResults, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Apply filters based on current filter type
  const getFilteredResults = () => {
    let filtered = labResults;
    
    // Apply filter type
    switch (currentFilter) {
      case 'fresh':
        filtered = LabResultsService.getFreshResults();
        break;
      case 'in-review':
        filtered = LabResultsService.getResultsByStatus('in-review');
        break;
      case 'completed':
        filtered = LabResultsService.getResultsByStatus('completed');
        break;
      case 'my-assignments':
        filtered = LabResultsService.getResultsByDoctor(currentDoctor.id);
        break;
      default:
        filtered = labResults;
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredResults = getFilteredResults();

  const handleAssignToMe = (resultId: string) => {
    const updated = LabResultsService.assignDoctorToResult(resultId, currentDoctor);
    if (updated) {
      setLabResults(LabResultsService.getAllLabResults());
      toast({
        title: "Assignment successful",
        description: "Lab result has been assigned to you",
      });
    }
  };

  const handleUnassign = (resultId: string) => {
    const updated = LabResultsService.unassignDoctorFromResult(resultId);
    if (updated) {
      setLabResults(LabResultsService.getAllLabResults());
      toast({
        title: "Unassigned",
        description: "Lab result has been unassigned",
      });
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

  const getFilterCounts = () => {
    return {
      fresh: LabResultsService.getFreshResults().length,
      inReview: LabResultsService.getResultsByStatus('in-review').length,
      completed: LabResultsService.getResultsByStatus('completed').length,
      myAssignments: LabResultsService.getResultsByDoctor(currentDoctor.id).length
    };
  };

  const filterCounts = getFilterCounts();

  const handleStatusUpdate = (resultId: string, newStatus: LabResult['status']) => {
    const updated = LabResultsService.updateLabResult(resultId, { status: newStatus });
    if (updated) {
      setLabResults(LabResultsService.getAllLabResults());
      toast({
        title: "Status updated",
        description: `Lab result status changed to ${newStatus}`,
      });
    }
  };

  const handleSendInterpretation = () => {
    if (!selectedResult || !interpretation.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a result and write an interpretation",
        variant: "destructive",
      });
      return;
    }

    const updated = LabResultsService.updateLabResult(selectedResult, { 
      interpretation: interpretation.trim(),
      status: 'completed'
    });
    
    if (updated) {
      setLabResults(LabResultsService.getAllLabResults());
      setInterpretation("");
      toast({
        title: "Interpretation sent!",
        description: "The patient will receive your interpretation via email.",
      });
    }
  };

  const getStatsData = () => {
    const pending = labResults.filter(r => r.status === 'pending').length;
    const inReview = labResults.filter(r => r.status === 'in-review').length;
    const completed = labResults.filter(r => r.status === 'completed').length;
    
    return { pending, inReview, completed };
  };

  const stats = getStatsData();

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
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by patient email, reference number, or filename..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentFilter('all')}
                    className="h-8"
                  >
                    All Results ({labResults.length})
                  </Button>
                  <Button
                    variant={currentFilter === 'fresh' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentFilter('fresh')}
                    className="h-8 relative"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Fresh ({filterCounts.fresh})
                    {filterCounts.fresh > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                  <Button
                    variant={currentFilter === 'in-review' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentFilter('in-review')}
                    className="h-8"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    In Review ({filterCounts.inReview})
                  </Button>
                  <Button
                    variant={currentFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentFilter('completed')}
                    className="h-8"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed ({filterCounts.completed})
                  </Button>
                  <Button
                    variant={currentFilter === 'my-assignments' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentFilter('my-assignments')}
                    className="h-8"
                  >
                    <UserCheck className="w-3 h-3 mr-1" />
                    My Assignments ({filterCounts.myAssignments})
                  </Button>
                </div>
                
                {/* Active Filter Info */}
                {currentFilter !== 'all' && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    Showing {currentFilter.replace('-', ' ')} results ({filteredResults.length})
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      No Results Found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'No results match your search criteria.' : 'No lab results found for the selected filter.'}
                    </p>
                    {(currentFilter !== 'all' || searchTerm) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => {
                          setCurrentFilter('all');
                          setSearchTerm('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredResults.map((result) => {
                  const isFresh = LabResultsService.getFreshResults().some(f => f.id === result.id);
                  const isAssignedToMe = result.assignedDoctor?.id === currentDoctor.id;
                  
                  return (
                    <Card 
                      key={result.id} 
                      className={`shadow-card cursor-pointer transition-all duration-300 hover:shadow-medical ${
                        selectedResult === result.id ? "ring-2 ring-primary" : ""
                      } ${isFresh ? "border-l-4 border-l-orange-400" : ""}`}
                      onClick={() => setSelectedResult(result.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            {/* Status and ID Row */}
                            <div className="flex items-center gap-3 flex-wrap">
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
                              
                              <span className="text-sm font-mono text-muted-foreground">
                                {result.id}
                              </span>
                            </div>
                            
                            {/* Test Type */}
                            <h3 className="font-semibold text-foreground">
                              {result.testType}
                            </h3>
                            
                            {/* Patient and File Info */}
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
                            
                            {/* Assignment Info */}
                            {result.assignedDoctor && (
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className="w-4 h-4 text-blue-600" />
                                <span className={isAssignedToMe ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                                  {isAssignedToMe ? "Assigned to you" : `Assigned to ${result.assignedDoctor.name}`}
                                </span>
                                {result.assignedAt && (
                                  <span className="text-muted-foreground">• {new Date(result.assignedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFullPageViewerId(result.id);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                            
                            {/* Assignment Actions */}
                            <div className="flex gap-2">
                              {result.status === "pending" && !result.assignedDoctor && (
                                <Button 
                                  variant="medical" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignToMe(result.id);
                                    setSelectedResult(result.id);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Take
                                </Button>
                              )}
                              
                              {result.status === "pending" && result.assignedDoctor && !isAssignedToMe && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast({
                                      title: "Already assigned",
                                      description: `This result is assigned to ${result.assignedDoctor.name}`,
                                      variant: "destructive",
                                    });
                                  }}
                                  disabled
                                >
                                  Assigned
                                </Button>
                              )}
                              
                              {isAssignedToMe && result.status === "in-review" && (
                                <Button 
                                  variant="medical" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedResult(result.id);
                                  }}
                                >
                                  Continue
                                </Button>
                              )}
                              
                              {isAssignedToMe && result.status === "pending" && (
                                <Button 
                                  variant="medical" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(result.id, 'in-review');
                                    setSelectedResult(result.id);
                                  }}
                                >
                                  Start Review
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
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
                  
                  <LabResultViewer resultId={selectedResult} />
                  
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
                    <Button 
                      variant="medical" 
                      className="flex-1"
                      onClick={handleSendInterpretation}
                      disabled={!interpretation.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Patient
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (selectedResult) {
                          LabResultsService.updateLabResult(selectedResult, { 
                            interpretation: interpretation.trim() 
                          });
                          toast({
                            title: "Draft saved",
                            description: "Your interpretation has been saved as a draft",
                          });
                        }
                      }}
                      disabled={!interpretation.trim()}
                    >
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
                    <div className="text-xs text-muted-foreground">In Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Total results: <span className="font-medium">{labResults.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Full Page Lab Viewer */}
      {fullPageViewerId && (
        <FullPageLabViewer
          resultId={fullPageViewerId}
          onClose={() => setFullPageViewerId(null)}
          onSendInterpretation={(interpretation) => {
            setLabResults(LabResultsService.getAllLabResults());
            // Optionally close the full page viewer after sending
            // setFullPageViewerId(null);
          }}
        />
      )}
    </div>
  );
};
