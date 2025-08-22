"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };
  
  if (loading || user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Sparkles className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          <CardTitle className="text-4xl font-headline tracking-tight">Eventide Tracker</CardTitle>
          <CardDescription className="pt-2">Sign in to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full" disabled={loading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 68.7C297.6 116.2 274.2 104 248 104c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c83.8 0 119.3-61.2 122.7-89.3h-122.7v-83.1h221.4c2.5 13 4.1 26.8 4.1 42.3z"></path></svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
