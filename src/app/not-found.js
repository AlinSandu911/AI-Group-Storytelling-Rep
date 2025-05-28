import Link from 'next/link';
import Button from '@/components/common/Button';

export default function NotFound() {
    return (
        <div className="container flex items-center justify-center min-h-screen">
            <div className="card text-center">
                <h2 className="text-heading-2 mb-4">404 - Page Not Found</h2>
                <p className="text-body mb-4">The page you're looking for doesn't exist.</p>
                <Link href="/">
                    <Button variant="primary">Return Home</Button>
                </Link>
            </div>
        </div>
    );
}