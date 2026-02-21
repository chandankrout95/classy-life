
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '../provider';

export function useUser() {
  const { auth } = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        console.log('[useUser] Full Auth User Object:', {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          emailVerified: authUser.emailVerified,
          isAnonymous: authUser.isAnonymous,
          metadata: authUser.metadata,
          phoneNumber: authUser.phoneNumber,
          providerData: authUser.providerData,
          providerId: authUser.providerId,
          tenantId: authUser.tenantId,
          refreshToken: authUser.refreshToken ? '***' : null,
          createdAt: authUser.metadata?.creationTime,
          lastSignIn: authUser.metadata?.lastSignInTime,
          // Full raw object for inspection
          _raw: authUser,
        });
        console.log('[useUser] Complete User Object (stringified):', JSON.stringify(authUser, null, 2));
      } else {
        console.log('[useUser] No authenticated user');
      }
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, auth, loading };
}

    