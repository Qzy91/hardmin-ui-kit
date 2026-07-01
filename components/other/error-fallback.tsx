import i18next from 'i18next';
import { RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function translate(key: string, fallback: string): string {
    try {
        const translated = i18next.t(key, { defaultValue: fallback });
        return typeof translated === 'string' ? translated : fallback;
    } catch {
        return fallback;
    }
}

export interface ErrorFallbackProps {
    error?: Error | null;
    errorId?: string | null;
    resetErrorBoundary?: () => void;
    className?: string;
}

type IllustrationSize = 'sm' | 'lg';

const illustrationSizeClass: Record<IllustrationSize, string> = {
    sm: 'w-40',
    lg: 'w-56',
};

export function FullPageErrorFallback({ resetErrorBoundary, className }: ErrorFallbackProps) {
    return (
        <div
            role="alert"
            aria-live="assertive"
            className={cn(
                'flex min-h-screen w-full items-center justify-center bg-bg_secondary p-6',
                className,
            )}
        >
            <FallbackContent
                onRetry={resetErrorBoundary}
                illustrationSize="lg"
                wrapperClass="error-boundary-wrapper group flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-bg_border_element bg-bg_primary p-8 text-center shadow-sm"
            />
        </div>
    );
}

export function SectionErrorFallback({ resetErrorBoundary, className }: ErrorFallbackProps) {
    return (
        <div className={cn('flex min-h-[60vh] w-full items-center justify-center p-4', className)}>
            <FallbackContent
                onRetry={resetErrorBoundary}
                illustrationSize="sm"
                wrapperClass="error-boundary-wrapper group flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-bg_border_element bg-bg_primary p-6 text-center"
            />
        </div>
    );
}

interface FallbackContentProps {
    onRetry?: () => void;
    illustrationSize: IllustrationSize;
    wrapperClass: string;
}

function FallbackContent({ onRetry, illustrationSize, wrapperClass }: FallbackContentProps) {
    return (
        <div role="alert" aria-live="polite" className={wrapperClass}>
            <ErrorIllustration
                className={cn(
                    'error-boundary-illustration',
                    illustrationSizeClass[illustrationSize],
                )}
            />

            <p
                className={cn(
                    'font-semibold text-text_primary',
                    illustrationSize === 'lg' ? 'text-xl' : 'text-base',
                )}
            >
                {translate('errorBoundary.title', 'Ups, něco se pokazilo')}
            </p>

            {onRetry && (
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                    <RotateCw aria-hidden="true" />
                    {translate('errorBoundary.retry', 'Zkusit znovu')}
                </Button>
            )}
        </div>
    );
}

function ErrorIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 220 140"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={className}
        >
            <ellipse
                cx="110"
                cy="128"
                rx="78"
                ry="3"
                fill="hsl(var(--text-primary))"
                opacity="0.06"
            />

            <g>
                <rect
                    x="150"
                    y="48"
                    width="50"
                    height="50"
                    rx="10"
                    fill="hsl(var(--bg-primary))"
                    stroke="hsl(var(--bg-border-element))"
                    strokeWidth="2"
                />
                <rect
                    x="158"
                    y="56"
                    width="34"
                    height="34"
                    rx="6"
                    fill="hsl(var(--bg-secondary))"
                />
                <circle cx="170" cy="73" r="2.4" fill="hsl(var(--text-primary))" opacity="0.55" />
                <circle cx="180" cy="73" r="2.4" fill="hsl(var(--text-primary))" opacity="0.55" />
                <rect
                    x="172"
                    y="80"
                    width="6"
                    height="2"
                    rx="1"
                    fill="hsl(var(--text-primary))"
                    opacity="0.55"
                />
            </g>

            <path
                d="M 150 73 Q 138 73, 132 80 T 122 88"
                fill="none"
                stroke="hsl(var(--main-color))"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
            />

            <g>
                <rect
                    x="32"
                    y="56"
                    width="46"
                    height="34"
                    rx="8"
                    fill="hsl(var(--bg-primary))"
                    stroke="hsl(var(--bg-border-element))"
                    strokeWidth="2"
                />
                <rect
                    x="78"
                    y="64"
                    width="10"
                    height="3.5"
                    rx="1.5"
                    fill="hsl(var(--text-primary))"
                    opacity="0.6"
                />
                <rect
                    x="78"
                    y="78"
                    width="10"
                    height="3.5"
                    rx="1.5"
                    fill="hsl(var(--text-primary))"
                    opacity="0.6"
                />
                <rect
                    x="42"
                    y="68"
                    width="18"
                    height="3"
                    rx="1.5"
                    fill="hsl(var(--bg-border-element))"
                    opacity="0.7"
                />
                <rect
                    x="42"
                    y="76"
                    width="12"
                    height="3"
                    rx="1.5"
                    fill="hsl(var(--bg-border-element))"
                    opacity="0.7"
                />
            </g>

            <path
                d="M 32 73 Q 22 73, 18 86 Q 22 100, 40 102 Q 70 104, 92 96"
                fill="none"
                stroke="hsl(var(--main-color))"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.75"
            />

            <g opacity="0.55">
                <line
                    x1="100"
                    y1="78"
                    x2="105"
                    y2="73"
                    stroke="hsl(var(--text-alert))"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <line
                    x1="118"
                    y1="80"
                    x2="124"
                    y2="76"
                    stroke="hsl(var(--text-alert))"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                <line
                    x1="110"
                    y1="85"
                    x2="112"
                    y2="79"
                    stroke="hsl(var(--text-alert))"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            </g>

            <g className="error-boundary-badge">
                <circle cx="110" cy="55" r="20" fill="hsl(var(--text-alert))" opacity="0.12" />
                <circle cx="110" cy="55" r="14" fill="hsl(var(--text-alert))" />
                <line
                    x1="110"
                    y1="48"
                    x2="110"
                    y2="57"
                    stroke="hsl(var(--bg-primary))"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
                <circle cx="110" cy="61.5" r="1.5" fill="hsl(var(--bg-primary))" />
            </g>
        </svg>
    );
}

export default FullPageErrorFallback;
