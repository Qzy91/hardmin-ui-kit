import { CheckIcon, CopyIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface JsonEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    showValidation?: boolean;
    showFormatButton?: boolean;
    showCopyButton?: boolean;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    minHeight?: string;
    // Opt-in: stretch the editor to fill its (flex) container instead of sizing to content.
    // Off by default so embedded/small usages keep the original content-height behavior.
    fullHeight?: boolean;
}

export function JsonEditor({
    value = '',
    onChange,
    placeholder,
    className,
    readOnly = false,
    minHeight = '200px',
    showValidation = true,
    showFormatButton = true,
    showCopyButton = true,
    fullHeight = false,
}: JsonEditorProps) {
    const { t } = useLanguage();
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState<string>('');

    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const validateJson = useCallback(
        (jsonString: string) => {
            if (!jsonString.trim() || jsonString.trim() === '{}') {
                setIsValid(true);
                setError('');
                return true;
            }
            try {
                JSON.parse(jsonString);
                setIsValid(true);
                setError('');
                return true;
            } catch (err) {
                setIsValid(false);
                setError(err instanceof Error ? err.message : t('jsonEditor.invalidJsonError'));
                return false;
            }
        },
        [t],
    );

    useEffect(() => {
        validateJson(value);
    }, [value, validateJson]);

    const handleChange = (newValue: string) => {
        const valueToEmit = newValue.trim() === '' ? '{}' : newValue;
        validateJson(valueToEmit);
        onChange?.(valueToEmit);
    };

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    const formatJson = () => {
        if (!value.trim()) return;
        try {
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            onChange?.(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(value);
        toast(t('jsonEditor.copySuccess'), {
            description: t('jsonEditor.copyDescription'),
        });
    };

    const resetContent = () => {
        onChange?.('{}');
    };

    const displayValue = value === '{}' ? '' : value;

    return (
        <Card className={cn('relative overflow-hidden', fullHeight && 'flex flex-col', className)}>
            <div
                className={cn(
                    'flex items-center justify-between border-b border-bg_border_element p-3',
                    fullHeight && 'shrink-0',
                )}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('jsonEditor.title')}</span>
                    {showValidation && (
                        <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
                            {isValid ? (
                                <>
                                    <CheckIcon className="mr-1 h-3 w-3" />
                                    {t('jsonEditor.valid')}
                                </>
                            ) : (
                                <>
                                    <XIcon className="mr-1 h-3 w-3" />
                                    {t('jsonEditor.invalid')}
                                </>
                            )}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {showFormatButton && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={formatJson}
                            disabled={readOnly || !value.trim() || !isValid}
                            className="h-7 px-2"
                        >
                            {t('jsonEditor.format')}
                        </Button>
                    )}
                    {showCopyButton && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    disabled={!value.trim()}
                                    className="h-7 px-2"
                                >
                                    <CopyIcon className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('jsonEditor.copy')}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetContent}
                                disabled={readOnly || !value.trim()}
                                className="h-7 px-2"
                            >
                                <RotateCcwIcon className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('jsonEditor.reset')}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className={cn('relative flex', fullHeight && 'min-h-0 flex-1')}>
                <div
                    ref={lineNumbersRef}
                    className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 select-none overflow-hidden border-r border-bg_border_element bg-bg_secondary/40 py-4 text-right"
                    aria-hidden="true"
                >
                    <div className="pr-3 font-mono text-xs leading-5 text-text_secondary">
                        {displayValue.split('\n').map((_, index) => (
                            <div key={index}>{index + 1}</div>
                        ))}
                    </div>
                </div>

                <textarea
                    value={displayValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onScroll={handleScroll}
                    placeholder={placeholder || t('jsonEditor.placeholder')}
                    readOnly={readOnly}
                    wrap="off"
                    className={cn(
                        'w-full resize-none border-0 bg-transparent py-4 pl-14 pr-4 font-mono text-sm leading-5',
                        fullHeight && 'flex-1',
                        'focus:outline-none focus:ring-0',
                        'placeholder:text-muted-foreground',
                        'overflow-auto whitespace-pre',
                        !isValid && 'text-destructive',
                    )}
                    style={{ minHeight }}
                    spellCheck={false}
                />
            </div>

            {!isValid && error && (
                <div className="border-t bg-destructive/5 p-3">
                    <p className="font-mono text-sm text-destructive">{error}</p>
                </div>
            )}
        </Card>
    );
}
