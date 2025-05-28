'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { USER_ROLES } from '@/utils/constants';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '', // Adicionado campo que faltava no estado inicial
        role: USER_ROLES.PARENT
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth(); 
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const userCredential = await register(formData.email, formData.password);

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: formData.email,
                role: formData.role,
                createdAt: new Date().toISOString(), // Corrigido DataTransfer para Date
            });

            router.push('/dashboard');
        } catch (error) {
            setError('Failed to create an account. ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="card max-w-md mx-auto">
            <h2 className="text-heading-2 text-center mb-6">Register</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="text-body block mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="text-body block mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="text-body block mb-2">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="role" className="text-body block mb-2">
                        I am a:
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value={USER_ROLES.PARENT}>Parent</option>
                        <option value={USER_ROLES.CHILD}>Child</option>
                    </select>
                </div>

                <ErrorMessage message={error} />

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? <LoadingSpinner size="small" /> : 'Register'}
                </Button>
            </form>

            <p className="mt-4 text-body text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary-dark">
                    Login here
                </Link>
            </p>
        </div>
    );
}