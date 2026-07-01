import * as React from 'react';

import {
    FullPageErrorFallback,
    SectionErrorFallback,
    type ErrorFallbackProps,
} from '@/components/common/error-fallback';
import { generateErrorId, reportError } from '@/lib/error-reporting';

type FallbackRender = (props: Required<ErrorFallbackProps>) => React.ReactNode;

export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode | FallbackRender;
    name?: string;
    onError?: (error: Error, info: React.ErrorInfo, errorId: string) => void;
    resetKeys?: ReadonlyArray<unknown>;
}

interface ErrorBoundaryState {
    error: Error | null;
    errorId: string | null;
}

const INITIAL_STATE: ErrorBoundaryState = { error: null, errorId: null };

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = INITIAL_STATE;

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error, errorId: generateErrorId() };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        const errorId = this.state.errorId ?? generateErrorId();

        reportError(error, {
            boundary: this.props.name ?? 'ErrorBoundary',
            componentStack: info.componentStack ?? undefined,
            extra: { errorId },
        });

        this.props.onError?.(error, info, errorId);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (!this.state.error) return;
        if (!resetKeysChanged(prevProps.resetKeys, this.props.resetKeys)) return;
        this.reset();
    }

    reset = () => {
        this.setState(INITIAL_STATE);
    };

    render() {
        const { error, errorId } = this.state;

        if (!error) {
            return this.props.children;
        }

        const fallback = this.props.fallback;

        if (typeof fallback === 'function') {
            return (fallback as FallbackRender)({
                error,
                errorId: errorId ?? '',
                resetErrorBoundary: this.reset,
                className: '',
            });
        }

        if (fallback !== undefined) {
            return fallback;
        }

        return (
            <FullPageErrorFallback
                error={error}
                errorId={errorId}
                resetErrorBoundary={this.reset}
            />
        );
    }
}

function resetKeysChanged(
    prev: ReadonlyArray<unknown> | undefined,
    next: ReadonlyArray<unknown> | undefined,
): boolean {
    if (prev === next) return false;
    if (!prev || !next) return true;
    if (prev.length !== next.length) return true;
    for (let i = 0; i < prev.length; i++) {
        if (!Object.is(prev[i], next[i])) {
            return true;
        }
    }
    return false;
}

export function RootErrorBoundary({
    children,
    resetKeys,
}: {
    children: React.ReactNode;
    resetKeys?: ReadonlyArray<unknown>;
}) {
    return (
        <ErrorBoundary
            name="RootBoundary"
            resetKeys={resetKeys}
            fallback={(props) => <FullPageErrorFallback {...props} />}
        >
            {children}
        </ErrorBoundary>
    );
}

export function SectionErrorBoundary({
    children,
    name = 'SectionBoundary',
    resetKeys,
    className,
}: {
    children: React.ReactNode;
    name?: string;
    resetKeys?: ReadonlyArray<unknown>;
    className?: string;
}) {
    return (
        <ErrorBoundary
            name={name}
            resetKeys={resetKeys}
            fallback={(props) => <SectionErrorFallback {...props} className={className} />}
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
