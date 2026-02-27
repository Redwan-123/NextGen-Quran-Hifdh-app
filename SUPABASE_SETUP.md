# Supabase Setup Guide — Quran Teacher Dashboard

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Choose a name (e.g. `quran-teacher-app`), set a strong database password, pick a region close to you
4. Wait ~2 minutes for the project to provision

## Step 2: Get Your API Credentials

1. In the Supabase dashboard, go to **Settings → API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon / public** key (starts with `eyJ...`)
3. Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Never commit your `.env` file to git.** It's already in `.gitignore`.

## Step 3: Run the Database Migration

Go to **Supabase Dashboard → SQL Editor** and run this entire SQL script:

```sql
-- ============================================
-- QURAN TEACHER APP — DATABASE SCHEMA
-- ============================================

-- 1. Teachers table (linked to auth.users)
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  institution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'hafiz')),
  avatar_color TEXT NOT NULL DEFAULT '#6366f1',
  notes TEXT,
  current_surah INTEGER NOT NULL DEFAULT 1,
  current_ayah INTEGER NOT NULL DEFAULT 1,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_mistakes INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Recitation sessions table
CREATE TABLE recitation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  start_ayah INTEGER NOT NULL,
  end_ayah INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  overall_rating INTEGER NOT NULL DEFAULT 3 CHECK (overall_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ayah mistakes table
CREATE TABLE ayah_mistakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES recitation_sessions(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  word_index INTEGER,
  mistake_type TEXT NOT NULL CHECK (mistake_type IN (
    'tajweed', 'pronunciation', 'forgotten', 'hesitation',
    'substitution', 'addition', 'omission', 'repetition', 'sequence'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES for fast queries
-- ============================================
CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_sessions_student ON recitation_sessions(student_id);
CREATE INDEX idx_sessions_teacher ON recitation_sessions(teacher_id);
CREATE INDEX idx_mistakes_student ON ayah_mistakes(student_id);
CREATE INDEX idx_mistakes_session ON ayah_mistakes(session_id);
CREATE INDEX idx_mistakes_surah_ayah ON ayah_mistakes(surah_number, ayah_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Teachers can only see their own data
-- ============================================

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE recitation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayah_mistakes ENABLE ROW LEVEL SECURITY;

-- Teachers: can read/write their own profile
CREATE POLICY "Teachers can manage own profile"
  ON teachers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Students: teachers can manage their own students
CREATE POLICY "Teachers can manage own students"
  ON students FOR ALL
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()))
  WITH CHECK (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Sessions: teachers can manage sessions for their students
CREATE POLICY "Teachers can manage own sessions"
  ON recitation_sessions FOR ALL
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()))
  WITH CHECK (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Mistakes: teachers can manage mistakes for their students
CREATE POLICY "Teachers can manage own mistakes"
  ON ayah_mistakes FOR ALL
  USING (student_id IN (
    SELECT s.id FROM students s
    JOIN teachers t ON s.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  ))
  WITH CHECK (student_id IN (
    SELECT s.id FROM students s
    JOIN teachers t ON s.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  ));
```

## Step 4: Enable Authentication

1. Go to **Authentication → Providers** in the Supabase dashboard
2. Make sure **Email** is enabled (it is by default)
3. Optionally disable "Confirm email" for faster testing:
   - Go to **Authentication → Settings**
   - Under "Email Auth", toggle OFF **"Enable email confirmations"**
   - (Re-enable this for production!)

## Step 5: Run the App

```bash
npm run dev
```

You should see the login page. Create a teacher account, sign in, and start adding students!

## Database Structure Overview

```
auth.users (Supabase built-in)
  └── teachers (1:1 with auth.users)
        └── students (many per teacher)
              ├── recitation_sessions (many per student)
              └── ayah_mistakes (many per student, linked to sessions)
```

## How It Works

| Feature | How it works |
|---------|-------------|
| **Teacher Login** | Supabase Auth (email/password) → creates `teachers` row |
| **Add Students** | Teacher creates student records linked to their profile |
| **Digital Quran** | Opens real Mushaf pages via [AlQuran Cloud API](https://alquran.cloud/api) |
| **Mistake Tracking** | During a recitation session, tap any ayah → select mistake type |
| **Sessions** | Start/end sessions with rating & notes, all mistakes are linked |
| **Progress** | Charts showing weekly activity, mistakes by type, problem surahs |
| **Security** | Row Level Security ensures teachers only see their own data |

## Troubleshooting

- **"Supabase credentials missing" warning**: Make sure your `.env` file exists with both values
- **Can't sign up**: Check that email auth is enabled in Supabase dashboard
- **No data showing**: Check the SQL editor for any migration errors
- **RLS blocking queries**: Make sure you ran all the policy CREATE statements
