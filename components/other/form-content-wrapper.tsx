import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormContentWrapperProps {
    isEditing: boolean;
    children: ReactNode;
    className?: string;
}

export const FormContentWrapper = ({ isEditing, children, className }: FormContentWrapperProps) => {
    return (
        <fieldset
            disabled={!isEditing}
            className={cn(
                'group space-y-6 transition-all',
                !isEditing && '[&_label_span.text-red-500]:hidden',
                className,
            )}
        >
            {children}
        </fieldset>
    );
};
