import * as React from 'react';

import { cn } from '@/lib/utils';

const Box = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-lg border border-bg_border_element bg-bg_primary p-4 text-text_primary shadow-sm sm:p-6',
                className,
            )}
            {...props}
        />
    ),
);
Box.displayName = 'Box';

export { Box };
