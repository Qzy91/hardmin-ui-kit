import { RotateCw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

type ChartErrorSize = 'sm' | 'md' | 'lg';

export interface ChartErrorProps {
    /** Optional title override. Defaults to a translated, neutral title. */
    title?: React.ReactNode;
    /** Optional description override. Defaults to a translated, neutral message. */
    message?: React.ReactNode;
    /**
     * When provided, a "Try again" button is rendered. Without it, no button is shown
     * — the parent dialog/page is responsible for retry UX.
     */
    onRetry?: () => void;
    /** Visual size variant. Use `sm` for inline empty-state slots, `lg` for full dialogs. */
    size?: ChartErrorSize;
    /** Extra wrapper className. */
    className?: string;
    /** When true, the wrapper fills its parent (height-wise) so it can be dropped in place of a chart. */
    fillContainer?: boolean;
}

const sizeStyles: Record<
    ChartErrorSize,
    { wrapper: string; illustration: string; title: string; message: string }
> = {
    sm: {
        wrapper: 'gap-2 p-4',
        illustration: 'w-32',
        title: 'text-sm',
        message: 'text-xs',
    },
    md: {
        wrapper: 'gap-3 p-6',
        illustration: 'w-48',
        title: 'text-base',
        message: 'text-sm',
    },
    lg: {
        wrapper: 'gap-4 p-8',
        illustration: 'w-60',
        title: 'text-lg',
        message: 'text-sm',
    },
};

/**
 * `ChartError` — a reusable error state for any chart / data-loading widget.
 *
 * Renders a themed inline SVG illustration (a stylized chart card with a
 * "broken" data line and a floating alert badge), a short title, a human
 * message, and an optional retry button. The illustration uses theme tokens
 * (`hsl(var(--…))`) so it adapts to light/dark and any brand re-skinning.
 *
 * UX/UI choices follow patterns used by large products (Linear, Vercel, Stripe,
 * Datadog, Grafana) for data-load failure states:
 *   - one neutral illustration + one title + one supporting sentence
 *   - no HTTP status codes in the UI (kept in the console for developers)
 *   - a single primary action ("Try again") when recovery is possible
 *   - calm palette via design tokens — never harsh full-saturation red on neutral background
 *   - `role="alert"` + `aria-live="polite"` so screen readers announce it
 *   - entrance pop-up animation; on hover the alert badge gently pulses and the
 *     dashed gap shifts — motion respects `prefers-reduced-motion`
 *
 * @example
 *   {error && <ChartError onRetry={refetch} />}
 */
export function ChartError({
    title,
    message,
    onRetry,
    size = 'md',
    className,
    fillContainer = false,
}: ChartErrorProps) {
    const { t } = useLanguage();

    const styles = sizeStyles[size];
    const resolvedTitle = title ?? t('chartError.title');
    const resolvedMessage = message ?? t('chartError.message');

    return (
        <div
            role="alert"
            aria-live="polite"
            className={cn(
                'chart-error-wrapper group flex w-full flex-col items-center justify-center text-center',
                fillContainer && 'h-full min-h-[240px]',
                styles.wrapper,
                className,
            )}
        >
            <ChartErrorIllustration className={cn('chart-error-illustration', styles.illustration)} />

            <p className={cn('font-semibold text-text_primary', styles.title)}>{resolvedTitle}</p>

            <p className={cn('max-w-prose text-text_secondary', styles.message)}>
                {resolvedMessage}
            </p>

            {onRetry && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="mt-1"
                >
                    <RotateCw aria-hidden="true" />
                    {t('chartError.retry')}
                </Button>
            )}
        </div>
    );
}

/**
 * Inline SVG illustration of a chart card with a broken/disconnected data line
 * and a floating alert badge. All colors use design tokens via `hsl(var(--…))`
 * so the illustration follows the app's theme.
 *
 * The .chart-error-badge and .chart-error-gap classes are targeted by hover
 * animations defined in app.css.
 */
function ChartErrorIllustration({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 140"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={className}
        >
            {/* Soft ground shadow */}
            <ellipse cx="100" cy="128" rx="68" ry="3" fill="hsl(var(--text-primary))" opacity="0.06" />

            {/* Chart card */}
            <rect
                x="20"
                y="18"
                width="160"
                height="100"
                rx="12"
                fill="hsl(var(--bg-primary))"
                stroke="hsl(var(--bg-border-element))"
                strokeWidth="1.5"
            />

            {/* Chart title placeholder bar */}
            <rect
                x="32"
                y="30"
                width="44"
                height="4"
                rx="2"
                fill="hsl(var(--bg-border-element))"
                opacity="0.7"
            />

            {/* Grid lines */}
            <g
                stroke="hsl(var(--bg-border-element))"
                strokeWidth="0.6"
                strokeDasharray="2 3"
                opacity="0.45"
            >
                <line x1="32" y1="60" x2="168" y2="60" />
                <line x1="32" y1="80" x2="168" y2="80" />
                <line x1="32" y1="100" x2="168" y2="100" />
            </g>

            {/* Y-axis ticks */}
            <g fill="hsl(var(--bg-border-element))" opacity="0.7">
                <circle cx="28" cy="60" r="1" />
                <circle cx="28" cy="80" r="1" />
                <circle cx="28" cy="100" r="1" />
            </g>

            {/* Data line — first half: straight segments, higher-low pattern,
                terminating at the alert badge center (100, 55) */}
            <polyline
                points="32,75 50,95 65,58 80,80 100,55"
                fill="none"
                stroke="hsl(var(--main-color))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Data points marking key trend turns
                (no point at 100,55 — covered by the badge) */}
            <circle cx="32" cy="75" r="2.5" fill="hsl(var(--main-color))" />
            <circle cx="50" cy="95" r="2.5" fill="hsl(var(--main-color))" />
            <circle cx="65" cy="58" r="2.5" fill="hsl(var(--main-color))" />
            <circle cx="80" cy="80" r="2.5" fill="hsl(var(--main-color))" />

            {/* Data line — second half: faded straight segments,
                emerging from the alert badge center (100, 55) */}
            <polyline
                points="100,55 135,90 168,105"
                fill="none"
                stroke="hsl(var(--main-color))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
            />

            {/* Data points on faded segment */}
            <circle cx="135" cy="90" r="2.5" fill="hsl(var(--main-color))" opacity="0.3" />
            <circle cx="168" cy="105" r="2.5" fill="hsl(var(--main-color))" opacity="0.3" />

            {/* Alert badge — horizontally centered in the card,
                pulses on hover. Both data lines meet exactly at (100, 55). */}
            <g className="chart-error-badge">
                {/* Outer halo */}
                <circle cx="100" cy="55" r="18" fill="hsl(var(--text-alert))" opacity="0.12" />
                {/* Inner filled circle */}
                <circle cx="100" cy="55" r="13" fill="hsl(var(--text-alert))" />
                {/* Exclamation mark */}
                <line
                    x1="100"
                    y1="49"
                    x2="100"
                    y2="57"
                    stroke="hsl(var(--bg-primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle cx="100" cy="61" r="1.4" fill="hsl(var(--bg-primary))" />
            </g>
        </svg>
    );
}

export default ChartError;
