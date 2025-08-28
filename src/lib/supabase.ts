import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          user_type: 'patient' | 'doctor';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_type: 'patient' | 'doctor';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_type?: 'patient' | 'doctor';
          created_at?: string;
          updated_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          license_number: string;
          specialization: string | null;
          medical_degree: string | null;
          years_of_experience: number | null;
          is_verified: boolean;
          bio: string | null;
          consultation_fee: number | null;
          availability_status: 'available' | 'busy' | 'offline';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          license_number: string;
          specialization?: string | null;
          medical_degree?: string | null;
          years_of_experience?: number | null;
          is_verified?: boolean;
          bio?: string | null;
          consultation_fee?: number | null;
          availability_status?: 'available' | 'busy' | 'offline';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          license_number?: string;
          specialization?: string | null;
          medical_degree?: string | null;
          years_of_experience?: number | null;
          is_verified?: boolean;
          bio?: string | null;
          consultation_fee?: number | null;
          availability_status?: 'available' | 'busy' | 'offline';
          created_at?: string;
          updated_at?: string;
        };
      };
      lab_results: {
        Row: {
          id: string;
          patient_id: string;
          assigned_doctor_id: string | null;
          reference_number: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: string;
          test_type: string;
          status: 'pending' | 'in-review' | 'completed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          interpretation: string | null;
          assigned_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          assigned_doctor_id?: string | null;
          reference_number: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: string;
          test_type: string;
          status?: 'pending' | 'in-review' | 'completed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          interpretation?: string | null;
          assigned_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          assigned_doctor_id?: string | null;
          reference_number?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: string;
          test_type?: string;
          status?: 'pending' | 'in-review' | 'completed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          interpretation?: string | null;
          assigned_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          lab_result_id: string | null;
          consultation_type: 'follow_up' | 'prescription' | 'general';
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at: string;
          completed_at: string | null;
          notes: string | null;
          prescription: string | null;
          fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          lab_result_id?: string | null;
          consultation_type: 'follow_up' | 'prescription' | 'general';
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at: string;
          completed_at?: string | null;
          notes?: string | null;
          prescription?: string | null;
          fee: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          lab_result_id?: string | null;
          consultation_type?: 'follow_up' | 'prescription' | 'general';
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          scheduled_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          prescription?: string | null;
          fee?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: 'patient' | 'doctor';
      lab_result_status: 'pending' | 'in-review' | 'completed';
      priority_level: 'low' | 'normal' | 'high' | 'urgent';
      consultation_type: 'follow_up' | 'prescription' | 'general';
      consultation_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      availability_status: 'available' | 'busy' | 'offline';
    };
  };
}
