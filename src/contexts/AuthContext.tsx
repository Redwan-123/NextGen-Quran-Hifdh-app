import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { TeacherProfile } from '../types/teacher';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  teacher: TeacherProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create teacher profile (safe — never throws)
  const ensureTeacher = async (authUser: User) => {
    try {
      // Try to fetch existing profile
      const { data: existing } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (existing) {
        setTeacher(existing);
        return;
      }

      // Auto-create for OAuth or new users
      const fullName = authUser.user_metadata?.full_name
        || authUser.user_metadata?.name
        || authUser.email?.split('@')[0]
        || 'Teacher';

      const { data: created } = await supabase.from('teachers').insert({
        user_id: authUser.id,
        full_name: fullName,
        email: authUser.email || '',
        avatar_url: authUser.user_metadata?.avatar_url || null,
      }).select().single();

      setTeacher(created);
    } catch (err) {
      console.warn('Could not fetch/create teacher profile:', err);
      setTeacher(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureTeacher(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await ensureTeacher(session.user);
        } else {
          setTeacher(null);
        }
        setLoading(false);
      }
    );

    // Safety net: never stay stuck loading for more than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      // Create teacher profile
      await supabase.from('teachers').insert({
        user_id: data.user.id,
        full_name: fullName,
        email,
      });
    }
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setTeacher(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, teacher, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
