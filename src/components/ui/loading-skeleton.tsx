import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
    variant?: 'dashboard' | 'card' | 'list' | 'form' | 'page';
    count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
    const items = Array.from({ length: count }, (_, i) => i);

    if (variant === 'dashboard') {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                {/* Grid */}
                <div className="bg-card rounded-xl border p-4 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <Skeleton key={j} className="h-10 w-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className="space-y-3">
                {items.map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'form') {
        return (
            <div className="space-y-6">
                {items.map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    if (variant === 'page') {
        return (
            <div className="min-h-screen bg-background">
                {/* Header skeleton */}
                <div className="border-b bg-card/50 p-4">
                    <div className="container flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="container py-8 space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid gap-4 md:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default: card variant
    return (
        <div className="space-y-4">
            {items.map((i) => (
                <div key={i} className="bg-card rounded-xl border p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
                        <svg
                            className="h-7 w-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                        </svg>
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
                </div>
                <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
}

export default LoadingSkeleton;
