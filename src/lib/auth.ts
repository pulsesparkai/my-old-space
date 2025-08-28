import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const signInWithEmail = async (email: string) => {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
  
  return { error };
};

export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  return { error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
};

export const createProfile = async (userId: string, username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      username,
      display_name: '',
      bio: ''
    }])
    .select()
    .single();
    
  return { data, error };
};