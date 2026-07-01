import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/language-context';
import { cn, getRoleLabel } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { ArrowLeft, Loader2, Plus, Search, Trash2, User as UserIcon } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    current_role_name?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    roleId: string | null;
    roleName: string;
    onUpdate: () => void;
}

interface PanelProps {
    isActive: boolean;
    organizationId: string;
    roleId: string | null;
    onBack: () => void;
    onUpdate: () => void;
}

export function AclRoleUsersPanel({
    isActive,
    organizationId,
    roleId,
    onBack,
    onUpdate,
}: PanelProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [availableSearchQuery, setAvailableSearchQuery] = useState('');
    const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isActive && roleId) {
            fetchUsers();
        } else {
            setAvailableSearchQuery('');
            setAssignedSearchQuery('');
            setAssignedUsers([]);
            setAvailableUsers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, roleId]);

    const fetchUsers = async () => {
        if (!roleId) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `/organizations/${organizationId}/acl-roles/${roleId}/users`,
            );
            setAssignedUsers(res.data.assigned);
            setAvailableUsers(res.data.available);
        } catch (error) {
            console.error('Failed to fetch role users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (userId: string) => {
        if (!roleId) return;
        setProcessingId(userId);
        try {
            const response = await axios.post(
                `/organizations/${organizationId}/acl-roles/${roleId}/users`,
                {
                    user_id: userId,
                },
            );

            if (response.data.message) {
                toast.success(response.data.message);
            }

            await fetchUsers();
            onUpdate();
        } catch (error) {
            console.error('Failed to add user', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!roleId) return;
        setProcessingId(userId);
        try {
            const response = await axios.delete(
                `/organizations/${organizationId}/acl-roles/${roleId}/users/${userId}`,
            );

            if (response.data.message) {
                toast.success(response.data.message);
            }

            await fetchUsers();
            onUpdate();
        } catch (error: unknown) {
            console.error('Failed to remove user', error);

            const message = error instanceof AxiosError ? error.response?.data?.message : undefined;

            if (message) {
                toast.error(message);
            } else {
                toast.error(t('common.error_occurred'));
            }
        } finally {
            setProcessingId(null);
        }
    };

    const matchesSearch = (query: string) => (user: User) => {
        const full = `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase();
        return full.includes(query.toLowerCase());
    };

    const filteredAvailable = availableUsers.filter(matchesSearch(availableSearchQuery));
    const filteredAssigned = assignedUsers.filter(matchesSearch(assignedSearchQuery));

    return (
        <div className="flex h-[72vh] min-h-0 flex-col">
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
                <RoleUsersColumn
                    title={t('acl.available_users')}
                    count={filteredAvailable.length}
                    loading={loading}
                    searchValue={availableSearchQuery}
                    searchPlaceholder={t('acl.search_available_users')}
                    onSearchChange={setAvailableSearchQuery}
                    emptyText={
                        availableSearchQuery
                            ? t('common.no_results_found')
                            : t('acl.no_available_users')
                    }
                >
                    {filteredAvailable.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            action="add"
                            processing={processingId === user.id}
                            disabled={!!processingId}
                            onAction={() => handleAddUser(user.id)}
                        />
                    ))}
                </RoleUsersColumn>

                <RoleUsersColumn
                    title={t('acl.users_in_role')}
                    count={filteredAssigned.length}
                    loading={loading}
                    searchValue={assignedSearchQuery}
                    searchPlaceholder={t('acl.search_role_users')}
                    onSearchChange={setAssignedSearchQuery}
                    emptyText={
                        assignedSearchQuery
                            ? t('common.no_results_found')
                            : t('acl.no_users_in_role')
                    }
                >
                    {filteredAssigned.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            action="remove"
                            processing={processingId === user.id}
                            disabled={!!processingId}
                            onAction={() => handleRemoveUser(user.id)}
                        />
                    ))}
                </RoleUsersColumn>
            </div>

            <div className="flex justify-end border-t border-bg_border_element px-6 py-4">
                <Button type="button" variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t('common.back')}
                </Button>
            </div>
        </div>
    );
}

function RoleUsersColumn({
    title,
    count,
    loading,
    searchValue,
    searchPlaceholder,
    onSearchChange,
    emptyText,
    children,
}: {
    title: string;
    count: number;
    loading: boolean;
    searchValue: string;
    searchPlaceholder: string;
    onSearchChange: (value: string) => void;
    emptyText: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-0 flex-col border-l border-bg_border_element first:border-l-0">
            <div className="space-y-3 border-b border-bg_border_element bg-bg_secondary p-4">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-bg_border_element bg-bg_primary px-1.5 text-xs font-medium text-muted-foreground">
                        {count}
                    </span>
                </div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-9"
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                {loading && count === 0 ? (
                    <div className="flex h-56 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : count === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-muted-foreground opacity-60">
                        <UserIcon className="h-8 w-8" />
                        <span className="text-xs">{emptyText}</span>
                    </div>
                ) : (
                    <div className="space-y-1 p-4">{children}</div>
                )}
            </ScrollArea>
        </div>
    );
}

function UserRow({
    user,
    action,
    processing,
    disabled,
    onAction,
}: {
    user: User;
    action: 'add' | 'remove';
    processing: boolean;
    disabled: boolean;
    onAction: () => void;
}) {
    const { t } = useLanguage();
    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

    return (
        <div className="group flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-bg_secondary">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text_primary">
                        {user.first_name} {user.last_name}
                    </p>
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                        {user.current_role_name && action === 'add' && (
                            <span className="inline-flex shrink-0 items-center rounded-sm bg-main_color/15 px-1.5 py-0.5 text-[11px] font-medium text-text_primary">
                                {getRoleLabel(user.current_role_name, t)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <Button
                size="icon"
                variant="ghost"
                className={cn(
                    'h-8 w-8 shrink-0 transition-colors',
                    action === 'add'
                        ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
                        : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                )}
                disabled={disabled}
                onClick={onAction}
            >
                {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : action === 'add' ? (
                    <Plus className="h-4 w-4" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}

export function AclManageRoleUsersDialog({
    isOpen,
    onClose,
    organizationId,
    roleId,
    roleName,
    onUpdate,
}: Props) {
    const { t } = useLanguage();

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-[min(1100px,96vw)] gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-bg_border_element px-6 py-4">
                    <DialogTitle>
                        {t('acl.manage_users_title_for_role', { role: roleName })}
                    </DialogTitle>
                    <DialogDescription>{roleName}</DialogDescription>
                </DialogHeader>
                <AclRoleUsersPanel
                    isActive={isOpen}
                    organizationId={organizationId}
                    roleId={roleId}
                    onBack={onClose}
                    onUpdate={onUpdate}
                />
            </DialogContent>
        </Dialog>
    );
}
