import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SlidePanelProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  cancelLabel?: string;
  applyLabel?: string;
  onApply?: () => void;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showFooter?: boolean;
  className?: string;
}

export function SlidePanel({
  title,
  open,
  onOpenChange,
  children,
  cancelLabel = 'Cancel',
  applyLabel = 'Apply',
  onApply,
  width = 'md',
  showFooter = true,
  className = '',
}: SlidePanelProps) {
  const widthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-full',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={`${widthClasses[width]} h-fit max-h-[85vh] top-1/2 -translate-y-1/2 right-0 bottom-auto rounded-l-2xl border border-r-0 shadow-2xl overflow-y-auto p-5 ${className}`}
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl">{title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-2 text-black">
            {children}
        </div>

        {showFooter && (
          <SheetFooter className="flex justify-between pt-5 sm:justify-between">
            <SheetClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </SheetClose>
            {onApply && <Button onClick={onApply}>{applyLabel}</Button>}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}