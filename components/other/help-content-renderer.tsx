import { RolesInfoSection } from '@/components/widgets/guide/rules-info-section';
import { HelpContextKey } from '@/lib/help-config';
import { TourContextKey } from '@/lib/onboarding-config';

interface Props {
    contextKey?: HelpContextKey | TourContextKey;
}

export function HelpContentRenderer({ contextKey: _contextKey }: Props) {
    return (
        <div className="min-w-0">
            <RolesInfoSection noBorder />
        </div>
    );
}
