import { icons } from 'lucide-react';
import React from 'react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, ...props }) => {
    const LucideIcon = (icons as any)[name] || icons.Box;

    return <LucideIcon className={className} {...props} />;
};
