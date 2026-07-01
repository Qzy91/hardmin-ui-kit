import { cn } from '@/lib/utils';
import { SharedPageProps } from '@/types';
import { usePage } from '@inertiajs/react';

interface EnvironmentBadgeProps {
    className?: string;
}

const badgeToneClasses: Record<NonNullable<SharedPageProps['environmentBadge']>['tone'], string> = {
    warning:
        'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-600/40',
};

export function EnvironmentBadge({ className }: EnvironmentBadgeProps) {
    const { environmentBadge } = usePage<SharedPageProps>().props;

    if (!environmentBadge) {
        return null;
    }

    return (
        <div
            className={cn(
                'inline-flex h-6 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]',
                badgeToneClasses[environmentBadge.tone],
                className,
            )}
        >
            {environmentBadge.label}
        </div>
    );
}
