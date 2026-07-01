import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { countries } from '@/lib/country-name';
import { cn } from '@/lib/utils';

const PINNED_COUNTRIES = ['CZ', 'SK', 'PL', 'DE', 'HU', 'IT', 'ES', 'RO', 'BG'];

interface CountrySelectProps {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}

export const CountrySelect = ({ value, onChange, error, placeholder }: CountrySelectProps) => {
    const [open, setOpen] = React.useState(false);

    const { language, t } = useLanguage();
    const langCode = language === 'cs' ? 'cs' : 'en';

    const countryList = React.useMemo(() => {
        const obj = countries.getNames(langCode, { select: 'official' });
        return Object.entries(obj)
            .map(([code, name]) => ({
                value: code,
                label: name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [langCode]);

    const pinnedList = React.useMemo(() => {
        return PINNED_COUNTRIES.map((code) => countryList.find((c) => c.value === code)).filter(
            (c): c is { value: string; label: string } => !!c,
        );
    }, [countryList]);

    const selectedCountryLabel = value
        ? countryList.find((country) => country.value === value)?.label
        : undefined;

    return (
        <div className="flex flex-col gap-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label={t('common.selectCountry')}
                        className={cn(
                            'w-full justify-between font-normal',
                            !value && 'text-muted-foreground',
                            error && 'border-red-500',
                        )}
                    >
                        <span className="truncate text-left">
                            {selectedCountryLabel ?? placeholder ?? t('common.selectCountry')}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder={t('common.searchCountry')} />
                        <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty>{t('common.noCountriesFound')}</CommandEmpty>
                            {pinnedList.length > 0 && (
                                <>
                                    <CommandGroup heading={t('common.frequentCountries')}>
                                        {pinnedList.map((country) => (
                                            <CommandItem
                                                key={`pinned-${country.value}`}
                                                value={country.label}
                                                onSelect={() => {
                                                    onChange(country.value);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        value === country.value
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                                {country.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandSeparator />
                                </>
                            )}
                            <CommandGroup heading={t('common.allCountries')}>
                                {countryList.map((country) => (
                                    <CommandItem
                                        key={country.value}
                                        value={country.label}
                                        onSelect={() => {
                                            onChange(country.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === country.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        {country.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};
