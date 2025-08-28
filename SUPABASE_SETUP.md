# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for the Clarimed Health Hub application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. The project cloned and dependencies installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `clarifind-health-hub`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Configure Environment Variables

1. In your Supabase dashboard, go to Settings → API
2. Copy your project URL and anon public key
3. Update the `.env` file in your project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from the project root
3. Paste and run the SQL to create all necessary tables, types, and policies

## Step 4: Configure Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Configure the following settings:

### Site URL
- Set to your domain (e.g., `http://localhost:5173` for development)

### Auth Providers
- Email is enabled by default
- You can optionally enable other providers like Google, GitHub, etc.

### Email Templates (Optional)
- Customize the email templates for signup confirmation, password reset, etc.

## Step 5: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Test the authentication flows:
   - Visit `/signup` to create a patient account
   - Visit `/expert` to test doctor login (use a @clarimed.com email)
   - Test the protected routes

## Database Structure

The application uses the following main tables:

- **profiles**: User profiles with user type (patient/doctor)
- **doctors**: Doctor-specific information and credentials
- **lab_results**: Lab test results uploaded by patients
- **consultations**: Consultation sessions between patients and doctors

## Row Level Security (RLS)

The database implements Row Level Security to ensure:
- Users can only access their own data
- Doctors can only see lab results assigned to them
- Proper access control for all operations

## Sample Doctor Accounts

The schema includes sample doctor accounts for testing:
- doctor1@clarimed.com
- doctor2@clarimed.com
- doctor3@clarimed.com
- doctor4@clarimed.com

You'll need to create these users through Supabase Auth (or use the signup flow) and assign them the appropriate passwords.

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure the `.env` file is in the project root
   - Restart your development server after updating environment variables

2. **Authentication not working**
   - Check that your Supabase project URL and anon key are correct
   - Verify the Site URL is configured correctly in Supabase

3. **Database access issues**
   - Ensure all SQL from `supabase-schema.sql` has been executed
   - Check that RLS policies are properly configured

4. **Doctor login restricted to @clarimed.com**
   - This is intentional for security
   - Use the expert login page at `/expert`

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the browser console for any JavaScript errors
- Check the Supabase dashboard logs for database/auth issues

## Development vs Production

### Development
- Use `http://localhost:5173` as your Site URL
- Test with the provided sample data

### Production
- Update Site URL to your production domain
- Use environment variables for sensitive configuration
- Enable additional security measures as needed
- Consider implementing email confirmation for new accounts

## Next Steps

Once authentication is working:
1. Test creating patient and doctor accounts
2. Upload lab results as a patient
3. Login as a doctor and review lab results
4. Test the full workflow from upload to interpretation
