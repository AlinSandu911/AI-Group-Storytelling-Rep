'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard'); // Corrigido 'puch' para 'push'
        } catch (error) {
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-md mx-auto">
            <h2 className="text-heading-2 text-center mb-6">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="text-body block mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="text-body block mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                    />
                </div>

                <ErrorMessage message={error} />

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                    {loading ? <LoadingSpinner size="small" /> : 'Login'}
                </Button>
            </form>

            <p className="mt-4 text-body text-center">
                Do not have an Account?{' '}
                <Link href="/register" className="text-primary hover:text-primary-dark">
                    Register here
                </Link>
            </p>
        </div>
    );
}