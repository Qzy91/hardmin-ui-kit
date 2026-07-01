import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { ChevronDown, Mail, UserPlus } from 'lucide-react';

interface AddUserDropdownProps {
    onCreateClick: () => void;
    onInviteClick: () => void;
    buttonText?: string;
    variant?: 'default' | 'main' | 'outline' | 'ghost';
    className?: string;
    canCreateNew?: boolean;
    canInviteExisting?: boolean;
}

export const AddUserDropdown: React.FC<AddUserDropdownProps> = ({
    onCreateClick,
    onInviteClick,
    buttonText,
    variant = 'main',
    className,
    canCreateNew = true,
    canInviteExisting = true,
}) => {
    const { t } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} className={cn('flex items-center gap-2', className)}>
                    {buttonText || t('users.addUser')}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {canCreateNew && (
                    <DropdownMenuItem onClick={onCreateClick}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('organizations.users.createAndAttach')}
                    </DropdownMenuItem>
                )}
                {canInviteExisting && (
                    <DropdownMenuItem onClick={onInviteClick}>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('organizations.users.inviteByEmail')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
