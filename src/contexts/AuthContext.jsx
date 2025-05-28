'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { loginUser, logoutUser, registerUser } from '@/firebase/auth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AuthContext = createContext();
const IDLE_TIME = 30 * 60 * 1000;
const WARNING_TIME = 5 * 60 * 1000;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    const router = useRouter();

    const idleTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const clearIdleTimers = useCallback(() => {
        clearTimeout(idleTimerRef.current);
        clearTimeout(warningTimerRef.current);
    }, []);

    const handleAutoLogout = useCallback(async () => {
        setShowIdleWarning(false);
        clearIdleTimers();
        try {
            await logoutUser();
            document.cookie = 'user=;Max-Age=0; path=/';
            setUser(null);
            router.push('/login?reason=idle');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [router, clearIdleTimers]);

    const showWarning = useCallback(() => {
        setShowIdleWarning(true);
        idleTimerRef.current = setTimeout(handleAutoLogout, WARNING_TIME);
    }, [handleAutoLogout]);

    const resetIdleTimer = useCallback(() => {
        if (!user) return;
        lastActivityRef.current = Date.now();
        setShowIdleWarning(false);
        clearIdleTimers();
        warningTimerRef.current = setTimeout(showWarning, IDLE_TIME - WARNING_TIME);
    }, [user, clearIdleTimers, showWarning]);

    const handleUserActivity = useCallback(() => {
        if (user && Date.now() - lastActivityRef.current > 1000) {
            resetIdleTimer();
        }
    }, [user, resetIdleTimer]);

    const extendSession = useCallback(() => {
        resetIdleTimer();
    }, [resetIdleTimer]);

    const refreshUser = async () => {
        if (auth.currentUser) {
            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        displayName: auth.currentUser.displayName,
                        ...userData
                    });
                }
            } catch (error) {
                console.error('Refresh user error:', error);
            }
        }
    };

    // ✅ REGISTER FIXED
    const register = async (email, password, displayName, role, familyId) => {
        try {
            const newUser = await registerUser(email, password, displayName, role, familyId);
            const loggedInUser = await loginUser(email, password);
            document.cookie = `user=${JSON.stringify({ role, email })}; path=/`;
            if (role === 'parent') router.push('/dashboard');
            else router.push('/');
            return loggedInUser;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const user = await loginUser(email, password);
            document.cookie = `user=${JSON.stringify({ role: user.role, email: user.email })}; path=/`;
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            clearIdleTimers();
            setShowIdleWarning(false);
            await logoutUser();
            document.cookie = 'user=;Max-Age=0; path=/';
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!user) return;
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        const handler = () => handleUserActivity();
        events.forEach(e => document.addEventListener(e, handler, true));
        resetIdleTimer();
        return () => {
            events.forEach(e => document.removeEventListener(e, handler, true));
            clearIdleTimers();
        };
    }, [user, handleUserActivity, resetIdleTimer, clearIdleTimers]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                const userDoc = await getDoc(doc(db, 'users', authUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUser({
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName,
                        ...data
                    });
                } else {
                    const defaultData = {
                        email: authUser.email,
                        displayName: authUser.displayName || '',
                        role: 'parent',
                        familyId: authUser.uid,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };
                    await setDoc(doc(db, 'users', authUser.uid), defaultData, { merge: true });
                    setUser({ uid: authUser.uid, ...defaultData });
                }
            } else {
                clearIdleTimers();
                setShowIdleWarning(false);
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [clearIdleTimers]);

    useEffect(() => {
        if (typeof window !== 'undefined' && user?.role === 'child') {
            if (window.location.pathname === '/dashboard') {
                router.push('/');
            }
        }
    }, [user, router]);

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        refreshUser,
        showIdleWarning,
        extendSession,
        handleAutoLogout
    };

    if (loading) return <LoadingSpinner fullScreen message="Loading..." />;

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showIdleWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Session Timeout Warning</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            You will be automatically logged out in 5 minutes due to inactivity.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleAutoLogout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >Logout Now</button>
                            <button
                                onClick={extendSession}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                            >Stay Logged In</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export default AuthContext;