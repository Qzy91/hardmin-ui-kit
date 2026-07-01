import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { cn, getCapitalizedDisplayName } from '@/lib/utils';
import ReactCountryFlag from 'react-country-flag';

export enum CountryFlagSelectType {
    Region = 'region',
    Language = 'language',
}

interface CountryFlagSelectProps {
    value: string | null | undefined;
    onValueChange: (value: string) => void;
    options: string[];
    placeholder: string;
    type: CountryFlagSelectType;
    disabled?: boolean;
    className?: string;
    flagMapping?: Record<string, string>;
}

export function CountryFlagSelect({
    value,
    onValueChange,
    options,
    placeholder,
    type,
    disabled = false,
    className,
    flagMapping,
}: CountryFlagSelectProps) {
    const { language } = useLanguage();

    const getFlagCode = (code: string) => {
        if (type === CountryFlagSelectType.Region) return code;
        return flagMapping?.[code] || 'UN';
    };

    const renderLabel = (code: string) => getCapitalizedDisplayName(code, type, language);

    return (
        <Select disabled={disabled} value={value || ''} onValueChange={onValueChange}>
            <SelectTrigger className={cn('w-full', className)}>
                <SelectValue placeholder={placeholder}>
                    {value ? (
                        <div className="flex items-center font-medium">
                            <ReactCountryFlag
                                countryCode={getFlagCode(value)}
                                svg
                                className="mr-2"
                                aria-label={renderLabel(value)}
                                style={{
                                    width: '1.2em',
                                    height: '1.2em',
                                }}
                            />
                            {renderLabel(value)}
                        </div>
                    ) : (
                        placeholder
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map((code) => (
                    <SelectItem key={code} value={code}>
                        <div className="flex items-center">
                            <ReactCountryFlag
                                countryCode={getFlagCode(code)}
                                svg
                                className="mr-2"
                                style={{
                                    width: '1.2em',
                                    height: '1.2em',
                                }}
                            />
                            {renderLabel(code)}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
