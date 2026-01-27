
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProfileData } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { mockProfile } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { generateDeviceFingerprint } from '@/lib/device-fingerprint';

interface DashboardContextType {
    profile: UserProfileData | null;
    onProfileUpdate: (newProfile: UserProfileData) => void;
    loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    const initializeProfile = useCallback(async () => {
        if (!firestore || !user) return;
        
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            const deviceId = await generateDeviceFingerprint();
            const newProfile: UserProfileData = {
                ...mockProfile,
                id: user.uid,
                email: user.email || 'no-email@example.com',
                name: user.displayName || 'New User',
                username: user.displayName?.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`,
                avatarUrl: user.photoURL || mockProfile.avatarUrl,
                registeredDeviceId: deviceId,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
        } else {
            // Ensure contentTypeStats exists
            const data = userDocSnap.data() as UserProfileData;
            if (!data.stats?.contentTypeStats) {
                const updatedData = {
                    ...data,
                    stats: {
                        ...data.stats,
                        contentTypeStats: mockProfile.stats.contentTypeStats
                    }
                };
                await setDoc(userDocRef, updatedData, { merge: true });
                setProfile(updatedData);
            }
        }
    }, [firestore, user]);

    useEffect(() => {
        if (userLoading) {
            setLoading(true);
            return;
        }
        if (!user) {
            router.replace('/login');
            return;
        }

        initializeProfile();
        
        const userDocRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfileData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to profile changes:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user, userLoading, firestore, router, initializeProfile]);
    
    const handleProfileUpdate = async (newProfileData: UserProfileData) => {
        if (!user || !firestore) return;
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await setDoc(userDocRef, newProfileData, { merge: true });
        } catch (error) {
            console.error("Error updating profile: ", error);
        }
    };


    const value = { profile, onProfileUpdate: handleProfileUpdate, loading };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
