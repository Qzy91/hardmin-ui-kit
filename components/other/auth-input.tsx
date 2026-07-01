import { Lock, LucideIcon, Mail, User } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

import InputError from '@/components/common/input-error';
import InputLabel from '@/components/common/input-label';
import { PasswordInput } from '@/components/common/password-input';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
    icon?: 'email' | 'password' | 'user' | LucideIcon;
    type?: 'email' | 'password' | 'text';
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ label, error, icon, type = 'text', className, ...props }, ref) => {
        const getIcon = () => {
            if (typeof icon === 'string') {
                switch (icon) {
                    case 'email':
                        return Mail;
                    case 'password':
                        return Lock;
                    case 'user':
                        return User;
                    default:
                        return Mail;
                }
            }
            return icon || Mail;
        };

        const IconComponent = getIcon();

        return (
            <div>
                {label && <InputLabel htmlFor={props.id} value={label} className="text-gray-600" />}
                <div className="relative mt-1">
                    <div className="absolute bottom-0 left-0 top-0 z-30 w-1.5 rounded-l-md bg-main_color"></div>

                    <IconComponent className="absolute left-4 top-1/2 z-40 ml-1 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

                    {type === 'password' ? (
                        <div className="relative">
                            <PasswordInput
                                ref={ref}
                                className={cn(
                                    'h-12 rounded-lg border-gray-300 bg-white pl-12 text-gray-900',
                                    className,
                                )}
                                {...props}
                            />
                        </div>
                    ) : (
                        <Input
                            ref={ref}
                            type={type}
                            className={cn(
                                'h-12 rounded-lg border-gray-300 bg-white pl-12 text-gray-900',
                                className,
                            )}
                            {...props}
                        />
                    )}
                </div>
                <InputError message={error} />
            </div>
        );
    },
);

AuthInput.displayName = 'AuthInput';

export { AuthInput };
