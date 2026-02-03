'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { InsightForgeLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { generateDeviceFingerprint } from '@/lib/device-fingerprint';
import type { UserProfileData } from '@/lib/types';


export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { auth } = useFirebase();
    const firestore = useFirestore();

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore) return;
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const currentFingerprint = await generateDeviceFingerprint();
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as UserProfileData;
                const registeredDeviceId = userData.registeredDeviceId;

                if (registeredDeviceId && registeredDeviceId !== currentFingerprint) {
                    await auth.signOut();
                    toast({
                        variant: 'destructive',
                        title: 'Login Blocked',
                        description: 'This account is locked to another device.',
                    });
                    setIsLoading(false);
                    return;
                }
            }

            toast({ title: 'Success!', description: 'Welcome back.' });
            startTransition(() => {
                router.push('/dashboard/profile');
            });

        } catch (error: any) {
            console.error('Firebase Auth Error:', error.code, error.message);
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
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
            if (!isPending) {
                setIsLoading(false);
            }
        }
    };

    const isFormLoading = isLoading || isPending;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">

                    <div className="relative mx-auto w-24 sm:w-32 md:w-40 lg:w-48 aspect-square">
                        <Image
                            src="/images/578.png"
                            alt="Insight Phantom Logo"
                            fill
                            sizes="(max-width: 640px) 96px,
                                    (max-width: 768px) 128px,
                                    (max-width: 1024px) 160px,
                                    192px"
                            className="rounded-md object-cover"
                            data-ai-hint="gaming team logo"
                            priority
                        />
                    </div>

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

                    <a href="https://t.me/+Rj5caNIXxcI4OTBl" target="_blank" rel="noopener noreferrer" className="block w-full mt-4">
                        <Button variant="secondary" className="w-full bg-amber-500 text-black hover:bg-amber-600 font-bold" disabled={isFormLoading}>
                            BUY Now
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
