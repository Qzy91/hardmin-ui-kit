import { useLanguage } from '@/contexts/language-context';
import { useMemo, useState } from 'react';

interface AuthWelcomePanelProps {
    title: string;
    subtitle: string;
    showIllustration?: boolean;
}

export function AuthWelcomePanel({
    title,
    subtitle,
    showIllustration = true,
}: AuthWelcomePanelProps) {
    const { language } = useLanguage();
    const [imgError, setImgError] = useState(false);

    const selectedImage = useMemo(() => {
        const imageNumber = Math.floor(Math.random() * 3) + 1;
        if (imgError) {
            return `/images/auth/en/auth_hero_${imageNumber}.jpg`;
        }
        return `/images/auth/${language}/auth_hero_${imageNumber}.jpg`;
    }, [language, imgError]);

    return (
        <div
            className="relative hidden items-center justify-center lg:flex lg:flex-1"
            style={{ background: 'linear-gradient(to bottom, #E0C86B, #8B7624)' }}
        >
            <div className="mt-[-2em] w-full max-w-lg space-y-2 text-center">
                <div className="mb-4 space-y-1">
                    <h1 className="text-3xl font-bold leading-tight text-white">{title}</h1>
                    <p className="text-base text-white/95">{subtitle}</p>
                </div>

                {showIllustration && (
                    <div className="relative mx-auto mb-8 mt-24 aspect-square max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
                        <img
                            src={selectedImage}
                            alt="Welcome illustration"
                            className="h-full w-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
