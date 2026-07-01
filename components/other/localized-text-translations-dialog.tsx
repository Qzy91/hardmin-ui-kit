import { CountryFlagSelectType } from '@/components/common/country-flag-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import {
    getDefaultTextTranslationEditLocale,
    normalizeTextTranslations,
    REQUIRED_TEXT_TRANSLATION_LOCALES,
    sanitizeTextTranslations,
    TEXT_TRANSLATION_FLAG_MAPPING,
    TEXT_TRANSLATION_LOCALES,
} from '@/lib/text-translation-utils';
import { cn, getCapitalizedDisplayName } from '@/lib/utils';
import { Languages, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

interface LocalizedTextTranslationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: Record<string, string>;
    onSave: (translations: Record<string, string>) => void;
    title: string;
    fieldLabel: string;
    placeholder?: string;
    description?: string;
    fieldHint?: string;
    requiredMessage?: string;
    multiline?: boolean;
}

const REQUIRED_LOCALES = new Set<string>(REQUIRED_TEXT_TRANSLATION_LOCALES);

export const LocalizedTextTranslationsDialog: React.FC<LocalizedTextTranslationsDialogProps> = ({
    open,
    onOpenChange,
    value,
    onSave,
    title,
    fieldLabel,
    placeholder,
    description,
    fieldHint,
    requiredMessage,
    multiline = false,
}) => {
    const { language: currentUiLanguage, t } = useLanguage();
    const [localTranslations, setLocalTranslations] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('en');

    useEffect(() => {
        if (!open) {
            return;
        }

        const normalizedValue = normalizeTextTranslations(value);
        const nextTranslations = { ...normalizedValue };

        REQUIRED_TEXT_TRANSLATION_LOCALES.forEach((locale) => {
            if (!Object.prototype.hasOwnProperty.call(nextTranslations, locale)) {
                nextTranslations[locale] = '';
            }
        });

        setLocalTranslations(nextTranslations);

        const preferredLocale = getDefaultTextTranslationEditLocale(currentUiLanguage);
        const initialLocale = Object.prototype.hasOwnProperty.call(
            nextTranslations,
            preferredLocale,
        )
            ? preferredLocale
            : Object.prototype.hasOwnProperty.call(nextTranslations, 'en')
              ? 'en'
              : Object.keys(nextTranslations)[0] || 'en';

        setActiveTab(initialLocale);
    }, [currentUiLanguage, open, value]);

    const sortedLocales = useMemo(() => {
        const priorityOrder = ['cs', 'en'];

        return Object.keys(localTranslations).sort((a, b) => {
            const indexA = priorityOrder.indexOf(a);
            const indexB = priorityOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return a.localeCompare(b);
        });
    }, [localTranslations]);

    const remainingLocales = TEXT_TRANSLATION_LOCALES.filter(
        (locale) => !Object.prototype.hasOwnProperty.call(localTranslations, locale),
    );

    const missingRequiredLocales = REQUIRED_TEXT_TRANSLATION_LOCALES.filter(
        (locale) => !localTranslations[locale]?.trim(),
    );
    const missingRequiredLocaleSet = new Set<string>(missingRequiredLocales);

    const addLocale = (locale: string) => {
        setLocalTranslations((prev) => ({ ...prev, [locale]: '' }));
        setActiveTab(locale);
    };

    const removeLocale = (locale: string) => {
        if (REQUIRED_LOCALES.has(locale)) {
            return;
        }

        setLocalTranslations((prev) => {
            const next = { ...prev };
            delete next[locale];
            return next;
        });

        if (activeTab === locale) {
            setActiveTab('en');
        }
    };

    const updateLocaleValue = (locale: string, nextValue: string) => {
        setLocalTranslations((prev) => ({ ...prev, [locale]: nextValue }));
    };

    const renderLocaleLabel = (locale: string) =>
        getCapitalizedDisplayName(locale, CountryFlagSelectType.Language, currentUiLanguage);

    const handleSave = () => {
        if (missingRequiredLocales.length > 0) {
            return;
        }

        onSave(sanitizeTextTranslations(localTranslations));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl gap-5 p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-text_primary">
                        <Languages className="h-5 w-5 text-main_color" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {description ? (
                    <div className="rounded-xl border border-bg_border_element bg-bg_secondary px-4 py-3 text-sm text-text_secondary">
                        {description}
                    </div>
                ) : null}

                <div className="flex items-center justify-end">
                    <Select
                        value=""
                        onValueChange={(nextValue) => addLocale(nextValue)}
                        disabled={remainingLocales.length === 0}
                    >
                        <SelectTrigger className="h-10 w-full max-w-[260px] border-bg_border_element bg-bg_primary text-text_primary data-[placeholder]:text-text_secondary">
                            <SelectValue
                                placeholder={t('common.add_language', {
                                    defaultValue: 'Přidat jazyk',
                                })}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {remainingLocales.map((locale) => (
                                <SelectItem key={locale} value={locale}>
                                    <div className="flex items-center gap-2">
                                        <ReactCountryFlag
                                            countryCode={TEXT_TRANSLATION_FLAG_MAPPING[locale]}
                                            svg
                                            style={{ width: '1.1em', height: '1.1em' }}
                                        />
                                        <span>{renderLocaleLabel(locale)}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-xl bg-bg_secondary p-2">
                        {sortedLocales.map((locale) => {
                            const isRequired = REQUIRED_LOCALES.has(locale);
                            const hasError = missingRequiredLocaleSet.has(locale);

                            return (
                                <TabsTrigger
                                    key={locale}
                                    value={locale}
                                    className={cn(
                                        'group rounded-lg border border-transparent bg-bg_primary px-3 py-2 text-sm text-text_primary shadow-sm data-[state=active]:border-main_color data-[state=active]:bg-bg_primary data-[state=active]:text-main_color',
                                        hasError &&
                                            'border-red-200 text-red-600 data-[state=active]:border-red-500 data-[state=active]:text-red-600',
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <ReactCountryFlag
                                            countryCode={TEXT_TRANSLATION_FLAG_MAPPING[locale]}
                                            svg
                                            style={{ width: '1.1em', height: '1.1em' }}
                                        />
                                        <span>{renderLocaleLabel(locale)}</span>
                                        {isRequired && <span className="text-red-500">*</span>}
                                        {!isRequired && (
                                            <button
                                                type="button"
                                                className="text-text_secondary transition-colors hover:text-red-500"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeLocale(locale);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {sortedLocales.map((locale) => {
                        const hasError = missingRequiredLocaleSet.has(locale);

                        return (
                            <TabsContent key={locale} value={locale} className="mt-4">
                                <div className="rounded-xl border border-bg_border_element bg-bg_primary p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <Label className="text-sm font-semibold text-text_primary">
                                                {fieldLabel}
                                            </Label>
                                            {fieldHint ? (
                                                <p className="mt-1 text-xs text-text_secondary">
                                                    {fieldHint}
                                                </p>
                                            ) : null}
                                        </div>
                                        {REQUIRED_LOCALES.has(locale) && (
                                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                                {t('common.required')}
                                            </span>
                                        )}
                                    </div>

                                    {multiline ? (
                                        <Textarea
                                            value={localTranslations[locale] || ''}
                                            onChange={(event) =>
                                                updateLocaleValue(locale, event.target.value)
                                            }
                                            placeholder={placeholder || fieldLabel}
                                            rows={4}
                                            className={cn(
                                                'bg-bg_primary text-text_primary',
                                                hasError &&
                                                    'border-red-300 bg-red-50/40 focus-visible:ring-red-200 dark:bg-red-500/10',
                                            )}
                                        />
                                    ) : (
                                        <Input
                                            value={localTranslations[locale] || ''}
                                            onChange={(event) =>
                                                updateLocaleValue(locale, event.target.value)
                                            }
                                            placeholder={placeholder || fieldLabel}
                                            className={cn(
                                                'h-11 bg-bg_primary text-text_primary',
                                                hasError &&
                                                    'border-red-300 bg-red-50/40 focus-visible:ring-red-200 dark:bg-red-500/10',
                                            )}
                                        />
                                    )}

                                    {hasError && requiredMessage ? (
                                        <p className="mt-2 text-xs text-red-600">
                                            {requiredMessage}
                                        </p>
                                    ) : null}
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="main"
                        onClick={handleSave}
                        disabled={missingRequiredLocales.length > 0}
                    >
                        {t('common.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
