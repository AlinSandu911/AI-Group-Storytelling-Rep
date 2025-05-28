'use client'

import { useEffect } from 'react';
import Button from '@/components/common/Button';

export default function Error({error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container flex items-center justify-center min-h-screen">
            <div className="card text-center">
                <h2 className="text-heading-2 mb-4">Something went wrong!</h2>
                <Button onClick={reset} variant="primary">
                Try again
                </Button>
            </div>
        </div>
    )
}