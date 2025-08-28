-- Create custom types
CREATE TYPE user_type AS ENUM ('patient', 'doctor');
CREATE TYPE lab_result_status AS ENUM ('pending', 'in-review', 'completed');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE consultation_type AS ENUM ('follow_up', 'prescription', 'general');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    user_type user_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    specialization TEXT,
    medical_degree TEXT,
    years_of_experience INTEGER,
    is_verified BOOLEAN DEFAULT false,
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    availability_status availability_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    reference_number TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size TEXT NOT NULL,
    test_type TEXT NOT NULL,
    status lab_result_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    interpretation TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    lab_result_id UUID REFERENCES public.lab_results(id) ON DELETE SET NULL,
    consultation_type consultation_type NOT NULL,
    status consultation_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    prescription TEXT,
    fee DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for doctors table
CREATE POLICY "Doctors can view their own doctor profile" ON public.doctors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can update their own doctor profile" ON public.doctors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Patients can view verified doctors" ON public.doctors
    FOR SELECT USING (
        is_verified = true AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'patient'
        )
    );

-- Create policies for lab_results table
CREATE POLICY "Patients can view their own lab results" ON public.lab_results
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own lab results" ON public.lab_results
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own lab results" ON public.lab_results
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view lab results assigned to them or unassigned" ON public.lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'doctor'
        ) AND (
            assigned_doctor_id IS NULL OR 
            assigned_doctor_id IN (
                SELECT doctors.id FROM public.doctors 
                WHERE doctors.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Doctors can update lab results assigned to them" ON public.lab_results
    FOR UPDATE USING (
        assigned_doctor_id IN (
            SELECT doctors.id FROM public.doctors 
            WHERE doctors.user_id = auth.uid()
        )
    );

-- Create policies for consultations table
CREATE POLICY "Patients can view their own consultations" ON public.consultations
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their own consultations" ON public.consultations
    FOR SELECT USING (
        doctor_id IN (
            SELECT doctors.id FROM public.doctors 
            WHERE doctors.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can insert consultations for themselves" ON public.consultations
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update their consultations" ON public.consultations
    FOR UPDATE USING (
        doctor_id IN (
            SELECT doctors.id FROM public.doctors 
            WHERE doctors.user_id = auth.uid()
        )
    );

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        (new.raw_user_meta_data->>'user_type')::user_type
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER lab_results_updated_at
    BEFORE UPDATE ON public.lab_results
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS doctors_is_verified_idx ON public.doctors(is_verified);
CREATE INDEX IF NOT EXISTS lab_results_patient_id_idx ON public.lab_results(patient_id);
CREATE INDEX IF NOT EXISTS lab_results_assigned_doctor_id_idx ON public.lab_results(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS lab_results_status_idx ON public.lab_results(status);
CREATE INDEX IF NOT EXISTS lab_results_created_at_idx ON public.lab_results(created_at);
CREATE INDEX IF NOT EXISTS consultations_patient_id_idx ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS consultations_doctor_id_idx ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS consultations_scheduled_at_idx ON public.consultations(scheduled_at);

-- Insert sample doctor data for testing
INSERT INTO public.profiles (id, email, full_name, user_type) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'doctor1@clarimed.com', 'Dr. Sarah Wilson', 'doctor'),
('123e4567-e89b-12d3-a456-426614174001', 'doctor2@clarimed.com', 'Dr. Michael Chen', 'doctor'),
('123e4567-e89b-12d3-a456-426614174002', 'doctor3@clarimed.com', 'Dr. Emily Rodriguez', 'doctor'),
('123e4567-e89b-12d3-a456-426614174003', 'doctor4@clarimed.com', 'Dr. David Park', 'doctor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctors (user_id, license_number, specialization, medical_degree, years_of_experience, is_verified, consultation_fee) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'MD001234', 'Internal Medicine', 'MD', 15, true, 150.00),
('123e4567-e89b-12d3-a456-426614174001', 'MD001235', 'Cardiology', 'MD', 12, true, 200.00),
('123e4567-e89b-12d3-a456-426614174002', 'MD001236', 'Endocrinology', 'MD', 10, true, 180.00),
('123e4567-e89b-12d3-a456-426614174003', 'MD001237', 'General Practice', 'MD', 8, true, 120.00)
ON CONFLICT (license_number) DO NOTHING;
