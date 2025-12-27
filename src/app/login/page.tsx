
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { InsightForgeLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.57,36.646,48,30.651,48,24C48,22.659,47.862,21.35,47.611,20.083z" />
    </svg>
);


export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { auth } = useFirebase();

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: 'Success!', description: 'Welcome back.' });
            startTransition(() => {
                router.push('/dashboard/profile');
            });
        } catch (error: any) {
            console.error('Firebase Auth Error:', error.code, error.message);
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' ) {
                description = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.code === 'auth/email-already-in-use') {
                description = 'This email is already registered. Please sign in or use a different email.';
            } else if (error.code === 'auth/weak-password') {
                description = 'The password is too weak. It must be at least 6 characters long.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'The email address is not valid. Please enter a correct email.';
            }
            toast({ variant: 'destructive', title: 'Authentication Failed', description });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        if (!auth) return;
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast({ title: 'Success!', description: 'Welcome!' });
            startTransition(() => {
                router.push('/dashboard/profile');
            });
        } catch (error: any) {
             console.error('Google Sign-In Error:', error.code, error.message);
             let description = 'Could not sign in with Google. Please try again.';
             if (error.code === 'auth/popup-closed-by-user') {
                description = 'Sign-in cancelled. The sign-in window was closed.';
             } else if (error.code === 'auth/account-exists-with-different-credential') {
                description = 'An account already exists with the same email address but different sign-in credentials.';
             }
             toast({ variant: 'destructive', title: 'Google Sign-In Failed', description });
        } finally {
            setIsGoogleLoading(false);
        }
    };


    const isFormLoading = isLoading || isGoogleLoading || isPending;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <Image
                        src="https://storage.googleapis.com/aai-web-samples/578-team-logo.png"
                        alt="Insight Phantom Logo"
                        width={100}
                        height={100}
                        className="mx-auto rounded-md"
                        data-ai-hint="gaming team logo"
                    />
                    <h1 className="text-3xl font-bold mt-4">Welcome to Insight Phantom</h1>
                    <p className="text-muted-foreground">
                        by 578 SaaS Agency
                    </p>
                </div>

                <div className="bg-card p-8 rounded-2xl shadow-lg border">
                    <form onSubmit={handleAuthAction}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="bg-input border-border"
                                />
                            </div>
                            <div>
                                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="bg-input border-border"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isFormLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full bg-card border-border hover:bg-accent" onClick={handleGoogleSignIn} disabled={isFormLoading}>
                         {isGoogleLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Google</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
