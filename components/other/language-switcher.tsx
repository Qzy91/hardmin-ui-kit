import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

import { CountryFlagSelectType } from '@/components/common/country-flag-select';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { cn, getCapitalizedDisplayName, Language } from '@/lib/utils';

interface LanguageSwitcherProps {
    className?: string;
}

const LANGUAGE_MAPPING = [
    { code: Language.EN, displayCode: 'EN', countryCode: 'US' },
    { code: Language.CS, displayCode: 'CS', countryCode: 'CZ' },
    { code: Language.PL, displayCode: 'PL', countryCode: 'PL' },
    { code: Language.SK, displayCode: 'SK', countryCode: 'SK' },
    { code: Language.IT, displayCode: 'IT', countryCode: 'IT' },
    { code: Language.DE, displayCode: 'DE', countryCode: 'DE' },
    { code: Language.HU, displayCode: 'HU', countryCode: 'HU' },
    { code: Language.ES, displayCode: 'ES', countryCode: 'ES' },
    { code: Language.RO, displayCode: 'RO', countryCode: 'RO' },
    { code: Language.BG, displayCode: 'BG', countryCode: 'BG' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { language, setLanguage, t } = useLanguage();
    const [open, setOpen] = useState(false);

    const languageOptions = useMemo(() => {
        return LANGUAGE_MAPPING.map((item) => ({
            ...item,
            name: getCapitalizedDisplayName(item.code, CountryFlagSelectType.Language, language),
        }));
    }, [language]);

    const currentLanguage =
        languageOptions.find((lang) => lang.code === language) || languageOptions[0];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-[110px] justify-between border-bg_border_element bg-bg_primary px-3 text-text_primary hover:bg-bg_secondary',
                        className,
                    )}
                    aria-label="Select language"
                >
                    <span className="flex items-center truncate font-medium">
                        <ReactCountryFlag
                            countryCode={currentLanguage.countryCode}
                            svg
                            className="mr-2"
                            aria-label={currentLanguage.name}
                            style={{
                                width: '1.2em',
                                height: '1.2em',
                            }}
                        />
                        {currentLanguage.displayCode}
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-[180px] border-bg_border_element bg-bg_secondary p-0 shadow-md"
            >
                <Command>
                    <div className="border-b border-bg_border_element p-1">
                        <CommandInput
                            placeholder={t?.('common.search')}
                            className="border-none shadow-none focus:ring-0"
                        />
                    </div>
                    <CommandList>
                        <CommandEmpty>{t?.('common.noCountriesFound')}</CommandEmpty>
                        <CommandGroup>
                            {languageOptions.map((lang) => (
                                <CommandItem
                                    key={lang.code}
                                    value={lang.name}
                                    onSelect={() => {
                                        setLanguage(lang.code);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        'cursor-pointer hover:bg-bg_secondary/50',
                                        language === lang.code && 'bg-[#D0B87B]/10 font-medium',
                                    )}
                                >
                                    <div className="flex flex-1 items-center">
                                        <ReactCountryFlag
                                            countryCode={lang.countryCode}
                                            svg
                                            className="mr-2"
                                            aria-label={lang.name}
                                            style={{
                                                width: '1.2em',
                                                height: '1.2em',
                                            }}
                                        />
                                        <span>{lang.name}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            'ml-auto h-4 w-4',
                                            language === lang.code ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
