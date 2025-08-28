export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

export interface LabResult {
  id: string;
  patientEmail: string;
  fileName: string;
  fileData: string; // base64 encoded file data
  fileType: string;
  uploadDate: string;
  status: 'pending' | 'in-review' | 'completed';
  fileSize: string;
  testType: string;
  interpretation?: string;
  assignedDoctor?: Doctor;
  assignedAt?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

const STORAGE_KEY = 'clarifind_lab_results';

export class LabResultsService {
  static generateReferenceNumber(): string {
    return `CLR-${Date.now().toString().slice(-6)}`;
  }

  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static detectTestType(fileName: string): string {
    const name = fileName.toLowerCase();
    
    if (name.includes('cbc') || name.includes('complete blood')) {
      return 'Complete Blood Count';
    } else if (name.includes('lipid') || name.includes('cholesterol')) {
      return 'Lipid Panel';
    } else if (name.includes('thyroid') || name.includes('tsh') || name.includes('t3') || name.includes('t4')) {
      return 'Thyroid Function';
    } else if (name.includes('glucose') || name.includes('blood sugar') || name.includes('a1c')) {
      return 'Glucose/Diabetes Panel';
    } else if (name.includes('liver') || name.includes('alt') || name.includes('ast')) {
      return 'Liver Function';
    } else if (name.includes('kidney') || name.includes('creatinine') || name.includes('bun')) {
      return 'Kidney Function';
    } else {
      return 'General Lab Test';
    }
  }

  static async saveLabResult(file: File, patientEmail: string): Promise<LabResult> {
    try {
      const fileData = await this.fileToBase64(file);
      const id = this.generateReferenceNumber();
      
      const labResult: LabResult = {
        id,
        patientEmail,
        fileName: file.name,
        fileData,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        fileSize: this.formatFileSize(file.size),
        testType: this.detectTestType(file.name),
      };

      const existingResults = this.getAllLabResults();
      existingResults.push(labResult);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResults));
      
      return labResult;
    } catch (error) {
      console.error('Error saving lab result:', error);
      throw new Error('Failed to save lab result');
    }
  }

  static getAllLabResults(): LabResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving lab results:', error);
      return [];
    }
  }

  static getLabResultById(id: string): LabResult | null {
    const results = this.getAllLabResults();
    return results.find(result => result.id === id) || null;
  }

  static updateLabResult(id: string, updates: Partial<LabResult>): LabResult | null {
    try {
      const results = this.getAllLabResults();
      const index = results.findIndex(result => result.id === id);
      
      if (index === -1) {
        return null;
      }

      results[index] = { ...results[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
      
      return results[index];
    } catch (error) {
      console.error('Error updating lab result:', error);
      throw new Error('Failed to update lab result');
    }
  }

  static deleteLabResult(id: string): boolean {
    try {
      const results = this.getAllLabResults();
      const filteredResults = results.filter(result => result.id !== id);
      
      if (filteredResults.length === results.length) {
        return false; // No result was deleted
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResults));
      return true;
    } catch (error) {
      console.error('Error deleting lab result:', error);
      return false;
    }
  }

  static getResultsByStatus(status: LabResult['status']): LabResult[] {
    return this.getAllLabResults().filter(result => result.status === status);
  }

  static getResultsByPatientEmail(email: string): LabResult[] {
    return this.getAllLabResults().filter(result => 
      result.patientEmail.toLowerCase() === email.toLowerCase()
    );
  }

  // New methods for doctor assignment and filtering
  static assignDoctorToResult(resultId: string, doctor: Doctor): LabResult | null {
    return this.updateLabResult(resultId, {
      assignedDoctor: doctor,
      assignedAt: new Date().toISOString(),
      status: 'in-review'
    });
  }

  static unassignDoctorFromResult(resultId: string): LabResult | null {
    return this.updateLabResult(resultId, {
      assignedDoctor: undefined,
      assignedAt: undefined,
      status: 'pending'
    });
  }

  static getResultsByDoctor(doctorId: string): LabResult[] {
    return this.getAllLabResults().filter(result => 
      result.assignedDoctor?.id === doctorId
    );
  }

  static getUnassignedResults(): LabResult[] {
    return this.getAllLabResults().filter(result => !result.assignedDoctor);
  }

  static getResultsByStatusAndDoctor(status: LabResult['status'], doctorId?: string): LabResult[] {
    const allResults = this.getAllLabResults();
    
    if (!doctorId) {
      return allResults.filter(result => result.status === status);
    }
    
    return allResults.filter(result => 
      result.status === status && result.assignedDoctor?.id === doctorId
    );
  }

  static getFreshResults(doctorId?: string): LabResult[] {
    // Fresh results are pending and uploaded in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const allResults = this.getAllLabResults();
    
    let freshResults = allResults.filter(result => 
      result.status === 'pending' && 
      result.uploadDate > oneDayAgo
    );

    if (doctorId) {
      freshResults = freshResults.filter(result => 
        !result.assignedDoctor || result.assignedDoctor.id === doctorId
      );
    }

    return freshResults;
  }

  static getAvailableDoctors(): Doctor[] {
    // Demo doctors list - in real app, this would come from backend
    return [
      {
        id: "doc-001",
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@clarifind.com",
        specialization: "Internal Medicine"
      },
      {
        id: "doc-002",
        name: "Dr. Michael Chen",
        email: "michael.chen@clarifind.com",
        specialization: "Cardiology"
      },
      {
        id: "doc-003",
        name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@clarifind.com",
        specialization: "Endocrinology"
      },
      {
        id: "doc-004",
        name: "Dr. David Park",
        email: "david.park@clarifind.com",
        specialization: "General Practice"
      }
    ];
  }

  static initializeDemoData(): void {
    // Only initialize if no data exists
    const existingResults = this.getAllLabResults();
    if (existingResults.length > 0) {
      return;
    }

    // Get demo doctors
    const doctors = this.getAvailableDoctors();
    
    // Create some demo lab results
    const demoResults: LabResult[] = [
      {
        id: "CLR-123456",
        patientEmail: "john.doe@email.com",
        fileName: "CBC_Results_Jan2024.pdf",
        fileData: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovTGVuZ3RoIDYgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwtTTVMzIxV7AwMdSzUPBIzcnPS1WwUUitKC5JzUvPTFGwUYOCUlJRfgb6BuYKFpp",
        fileType: "application/pdf",
        uploadDate: new Date().toISOString(), // Fresh result
        status: "pending",
        fileSize: "1.2 MB",
        testType: "Complete Blood Count",
        priority: "normal"
      },
      {
        id: "CLR-123457",
        patientEmail: "sarah.smith@email.com",
        fileName: "Lipid_Panel_Results.pdf",
        fileData: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iao8PAovTGVuZ3RoIDYgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwtTTVMzIxV7AwMdSzUPBIzcnPS1WwUUitKC5JzUvPTFGwUYOCUlJRfgb6BuYKFpo",
        fileType: "application/pdf",
        uploadDate: "2024-01-14T14:45:00Z",
        status: "in-review",
        fileSize: "0.8 MB",
        testType: "Lipid Panel",
        assignedDoctor: doctors[1], // Dr. Michael Chen
        assignedAt: "2024-01-14T15:00:00Z",
        priority: "normal"
      },
      {
        id: "CLR-123458",
        patientEmail: "mike.jones@email.com",
        fileName: "Thyroid_Function_Test.pdf",
        fileData: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iao8PAovTGVuZ3RoIDYgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwtTTVMzIxV7AwMdSzUPBIzcnPS1WwUUitKC5JzUvPTFGwUYOCUlJRfgb6BuYKFpo",
        fileType: "application/pdf",
        uploadDate: "2024-01-13T09:15:00Z",
        status: "completed",
        fileSize: "1.0 MB",
        testType: "Thyroid Function",
        assignedDoctor: doctors[2], // Dr. Emily Rodriguez
        assignedAt: "2024-01-13T10:00:00Z",
        interpretation: "Your thyroid function tests show normal TSH, T3, and T4 levels. All values are within the healthy reference ranges, indicating that your thyroid gland is functioning properly. Continue with your current lifestyle and follow up as recommended by your primary care physician.",
        priority: "normal"
      },
      {
        id: "CLR-123459",
        patientEmail: "emma.williams@email.com",
        fileName: "Glucose_A1C_Results.pdf",
        fileData: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iao8PAovTGVuZ3RoIDYgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwtTTVMzIxV7AwMdSzUPBIzcnPS1WwUUitKC5JzUvPTFGwUYOCUlJRfgb6BuYKFpo",
        fileType: "application/pdf",
        uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago - fresh
        status: "pending",
        fileSize: "0.9 MB",
        testType: "Glucose/Diabetes Panel",
        priority: "high"
      },
      {
        id: "CLR-123460",
        patientEmail: "alex.brown@email.com",
        fileName: "Liver_Function_Panel.pdf",
        fileData: "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iao8PAovTGVuZ3RoIDYgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwtTTVMzIxV7AwMdSzUPBIzcnPS1WwUUitKC5JzUvPTFGwUYOCUlJRfgb6BuYKFpo",
        fileType: "application/pdf",
        uploadDate: "2024-01-12T16:30:00Z",
        status: "in-review",
        fileSize: "1.1 MB",
        testType: "Liver Function",
        assignedDoctor: doctors[0], // Dr. Sarah Wilson
        assignedAt: "2024-01-12T17:00:00Z",
        priority: "normal"
      }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoResults));
  }
}
