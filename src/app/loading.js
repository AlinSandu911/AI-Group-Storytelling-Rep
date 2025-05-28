import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
    return (
        <div className="container flex items-center justify-center min-h-screen">
            <LoadingSpinner size="large" />
        </div>
    );
}