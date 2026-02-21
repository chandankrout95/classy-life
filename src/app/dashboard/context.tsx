
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
        if (!firestore || !user) {
            console.log('[DashboardContext] Skipping init: firestore?', !!firestore, 'user?', !!user);
            return;
        }
        
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const deviceId = await generateDeviceFingerprint();

        if (!userDocSnap.exists()) {
            console.log('[DashboardContext] Profile does not exist, creating new one for', user.uid);
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
            console.log('[DashboardContext] Profile created:', newProfile.id);
        } else {
            console.log('[DashboardContext] Profile exists for', user.uid);
            const data = userDocSnap.data() as UserProfileData;
            let needsUpdate = false;
            let updatedData: UserProfileData = { ...data };

            if (!data.registeredDeviceId) {
                updatedData.registeredDeviceId = deviceId;
                needsUpdate = true;
            }
            
            // Ensure contentTypeStats exists
            if (!data.stats?.contentTypeStats) {
                updatedData = {
                    ...updatedData,
                    stats: {
                        ...updatedData.stats,
                        contentTypeStats: mockProfile.stats.contentTypeStats
                    }
                };
                needsUpdate = true;
            }

            if (needsUpdate) {
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
                const profileData = docSnap.data() as UserProfileData;
                console.log('[DashboardContext] Profile snapshot received:', profileData.id, 'username:', profileData.username);
                console.log('[DashboardContext] Full Profile Data Object:', profileData);
                console.log('[DashboardContext] Complete Profile Data (stringified):', JSON.stringify(profileData, null, 2));
                setProfile(profileData);
            } else {
                console.log('[DashboardContext] Profile snapshot: document does not exist');
            }
            setLoading(false);
        }, (error) => {
            console.error("[DashboardContext] Error listening to profile changes:", error);
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
