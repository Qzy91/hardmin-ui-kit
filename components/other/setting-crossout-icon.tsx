import { Settings } from 'lucide-react';
import React from 'react';

interface SettingsCrossedOutProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
}

const SettingsCrossedOut = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    className,
}: SettingsCrossedOutProps) => {
    const slashStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '-21%',
        width: '142%',
        height: `${strokeWidth}px`,
        backgroundColor: color,
        transform: 'rotate(-315deg)',
        transformOrigin: 'center',
    };

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    };

    return (
        <div style={containerStyle} className={className}>
            <Settings size={size} color={color} strokeWidth={strokeWidth} />
            <div style={slashStyle} />
        </div>
    );
};

export default SettingsCrossedOut;
