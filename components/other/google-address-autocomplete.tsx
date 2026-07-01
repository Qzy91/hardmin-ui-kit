import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useEffect } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

export interface GoogleAddressResult {
    street?: string;
    street_number?: string;
    city?: string;
    postal_code?: string;
    state?: string;
    country?: string;
}

interface GoogleAddressAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onAddressSelect: (address: GoogleAddressResult) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    types?: string[];
    restrictToCountry?: string;
}

export const GoogleAddressAutocomplete = ({
    id,
    value,
    onChange,
    onAddressSelect,
    className,
    placeholder,
    disabled,
    types = ['address'],
    restrictToCountry,
}: GoogleAddressAutocompleteProps) => {
    const { language } = useLanguage();

    const { ref, autocompleteRef } = usePlacesWidget({
        apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
        options: {
            types: types,
            fields: ['address_components', 'formatted_address', 'name'],
            componentRestrictions: restrictToCountry ? { country: restrictToCountry } : undefined,
        },
        language: language,
        onPlaceSelected: (place) => {
            const getComponent = (type: string, useShort = false) => {
                const component = place.address_components?.find((c: any) =>
                    c.types.includes(type),
                );
                return component
                    ? useShort
                        ? component.short_name
                        : component.long_name
                    : undefined;
            };

            const result: GoogleAddressResult = {
                street: getComponent('route'),
                street_number: getComponent('street_number'),
                city:
                    getComponent('locality') ||
                    getComponent('postal_town') ||
                    getComponent('sublocality'),
                postal_code: getComponent('postal_code'),
                state: getComponent('administrative_area_level_1'),
                country: getComponent('country', true),
            };

            if (types.includes('administrative_area_level_1')) {
                onChange(place.name || result.state || '');
                onAddressSelect({ state: place.name, country: result.country });
            } else {
                if (result.street) {
                    onChange(result.street);
                }

                onAddressSelect(result);
            }
        },
    });

    useEffect(() => {
        if (autocompleteRef.current && restrictToCountry) {
            autocompleteRef.current.setComponentRestrictions({ country: restrictToCountry });
        }
    }, [restrictToCountry, autocompleteRef]);

    return (
        <Input
            id={id}
            ref={ref as any}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
        />
    );
};
