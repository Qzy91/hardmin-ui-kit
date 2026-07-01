import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface RolesInfoSectionProps {
    noBorder?: boolean;
}

export const RolesInfoSection = ({ noBorder }: RolesInfoSectionProps) => {
    const { t } = useLanguage();

    return (
        <div className={cn(!noBorder && 'mt-8 border-t border-bg_border_element pt-6')}>
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-text_primary">
                <ShieldCheck className="h-5 w-5 text-main_color" />
                {t('help.roles.title')}
            </h3>

            <p className="mb-4 text-sm leading-relaxed text-text_secondary">
                {t('help.roles.intro')}
            </p>

            <ul className="space-y-4 text-sm leading-relaxed">
                {[
                    { label: 'admin_label', text: 'admin_text' },
                    { label: 'user_label', text: 'user_text' },
                    { label: 'custom_label', text: 'custom_text' },
                ].map((item) => (
                    <li key={item.label} className="flex gap-3">
                        <div>
                            <span className="font-bold text-text_primary">
                                {t(`help.roles.${item.label}`)}:
                            </span>
                            <span className="ml-1 text-text_secondary">
                                {t(`help.roles.${item.text}`)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
