import { AclRoleUsersPanel } from '@/components/acl/acl-manage-role-users-dialog';
import { ConfirmDeleteDialog } from '@/components/common/confirm-delete-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/language-context';
import { useAcl } from '@/hooks/use-acl';
import { useRolePreview } from '@/hooks/use-role-preview';
import { PERMISSIONS } from '@/lib/acl-config';
import { cn, getRoleLabel } from '@/lib/utils';
import { RoleList } from '@/sections/users/types';
import { AclData, Permission, Role } from '@/types/acl';
import { router, useForm } from '@inertiajs/react';
import {
    Check,
    Eye,
    KeyRound,
    Loader2,
    Lock,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

const sortTemplateRolesForModule = (roles: Role[], module: string) => {
    if (module !== 'core') return roles;

    return [...roles].sort((a, b) => {
        if (a.name === RoleList.OWNER) return -1;
        if (b.name === RoleList.OWNER) return 1;

        return 0;
    });
};

export interface Props {
    organizationId: string;
    data: AclData;
    onClose: () => void;
    onReload: () => void;
    selectedRoleId: string | null;
    onSelectRole: (id: string | null) => void;
    onManagingRoleChange?: (role: { id: string; name: string } | null) => void;
}

export function AclManagerContent({
    organizationId,
    data,
    onReload,
    selectedRoleId,
    onSelectRole,
    onManagingRoleChange,
}: Props) {
    const { t } = useLanguage();
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');
    const [previewConfirmRole, setPreviewConfirmRole] = useState<Role | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [roleToDeleteId, setRoleToDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingNewRoleName, setPendingNewRoleName] = useState<string | null>(null);
    const [managingUsersRole, setManagingUsersRole] = useState<{ id: string; name: string } | null>(
        null,
    );
    const {
        status: previewStatus,
        startPreview,
        loading: previewLoading,
    } = useRolePreview(organizationId);
    const { can } = useAcl();
    const canViewContracts = can(PERMISSIONS.CORE.USERS.MANAGE_ROLES);

    const allRoles = useMemo(() => {
        const templateRoles = data?.roles?.template || [];
        const orgRoles = data?.roles?.organization || [];

        return [
            ...sortTemplateRolesForModule(templateRoles, data.activeModule || 'core').map(
                (role) => ({ ...role, _type: 'template' }),
            ),
            ...orgRoles.map((role) => ({ ...role, _type: 'organization' })),
        ];
    }, [data]);

    const filteredRoles = useMemo(() => {
        const search = roleSearch.trim().toLowerCase();

        if (!search) return allRoles;

        return allRoles.filter((role) => getRoleLabel(role.name, t).toLowerCase().includes(search));
    }, [allRoles, roleSearch, t]);

    const activeRoleId = useMemo(() => {
        if (selectedRoleId && allRoles.some((role) => role.id === selectedRoleId)) {
            return selectedRoleId;
        }

        return allRoles[0]?.id || null;
    }, [allRoles, selectedRoleId]);

    const selectedRole = useMemo(
        () => allRoles.find((role) => role.id === activeRoleId) || null,
        [activeRoleId, allRoles],
    );

    const permissionGroups = useMemo(() => {
        const search = permissionSearch.trim().toLowerCase();
        const permissions = data.permissions || {};

        if (!search) return permissions;

        return Object.entries(permissions).reduce<Record<string, Permission[]>>(
            (result, [group, items]) => {
                const filtered = items.filter((permission) =>
                    t(`permissions.keys.${permission.name}`).toLowerCase().includes(search),
                );

                if (filtered.length > 0) {
                    result[group] = filtered;
                }

                return result;
            },
            {},
        );
    }, [data.permissions, permissionSearch, t]);

    const permissionsForm = useForm({
        permission_ids: [] as string[],
    });

    const createRoleForm = useForm({
        name: '',
        module: data.activeModule || 'core',
    });

    useEffect(() => {
        if (!pendingNewRoleName || allRoles.length === 0) return;

        const newRole = allRoles.find((role) => role.name === pendingNewRoleName);
        if (!newRole) return;

        onSelectRole(newRole.id);
        setPendingNewRoleName(null);
    }, [allRoles, onSelectRole, pendingNewRoleName]);

    useEffect(() => {
        if (!selectedRole) return;

        permissionsForm.setData('permission_ids', selectedRole.permission_ids);
        setIsCreating(false);

        if (editingRoleId !== selectedRole.id) {
            setEditingRoleId(null);
            setEditName('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRole?.id, data]);

    const handleTogglePermission = (permissionId: string) => {
        if (selectedRole?.is_template || selectedRole?.name === RoleList.OWNER) return;

        permissionsForm.setData(
            'permission_ids',
            permissionsForm.data.permission_ids.includes(permissionId)
                ? permissionsForm.data.permission_ids.filter((id) => id !== permissionId)
                : [...permissionsForm.data.permission_ids, permissionId],
        );
    };

    const isPermissionDirty = useMemo(() => {
        if (!selectedRole) return false;

        return (
            JSON.stringify([...permissionsForm.data.permission_ids].sort()) !==
            JSON.stringify([...selectedRole.permission_ids].sort())
        );
    }, [permissionsForm.data.permission_ids, selectedRole]);

    const handleSavePermissions = () => {
        if (!activeRoleId) return;

        permissionsForm.put(
            `/organizations/${organizationId}/acl-roles/${activeRoleId}/permissions`,
            {
                preserveScroll: true,
                onSuccess: onReload,
            },
        );
    };

    const handleCreateRole = (event: React.FormEvent) => {
        event.preventDefault();

        const nameToCreate = createRoleForm.data.name;
        createRoleForm.post(`/organizations/${organizationId}/acl-roles`, {
            preserveScroll: true,
            onSuccess: () => {
                createRoleForm.reset();
                setIsCreating(false);
                setPendingNewRoleName(nameToCreate);
                onReload();
            },
        });
    };

    const saveRoleName = () => {
        if (!editingRoleId || !editName.trim()) return;

        setIsSavingName(true);
        router.put(
            `/organizations/${organizationId}/acl-roles/${editingRoleId}`,
            { name: editName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingRoleId(null);
                    setEditName('');
                    setIsSavingName(false);
                    onReload();
                },
                onError: () => setIsSavingName(false),
            },
        );
    };

    const handleConfirmDelete = () => {
        if (!roleToDeleteId) return;

        setIsDeleting(true);
        router.delete(`/organizations/${organizationId}/acl-roles/${roleToDeleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setRoleToDeleteId(null);
                setIsDeleting(false);
                onReload();
            },
            onError: () => setIsDeleting(false),
        });
    };

    const roleToDelete = allRoles.find((role) => role.id === roleToDeleteId);
    const roleToDeleteUsersCount = roleToDelete?.users_count || 0;

    useEffect(() => {
        onManagingRoleChange?.(managingUsersRole);
    }, [managingUsersRole, onManagingRoleChange]);

    const handlePreviewClick = (role: Role) => {
        if (role.name === RoleList.OWNER && !canViewContracts) return;

        setPreviewConfirmRole(role);
    };

    return (
        <div className="min-h-0 text-foreground">
            {managingUsersRole ? (
                <AclRoleUsersPanel
                    isActive={!!managingUsersRole}
                    organizationId={organizationId}
                    roleId={managingUsersRole.id}
                    onBack={() => setManagingUsersRole(null)}
                    onUpdate={onReload}
                />
            ) : (
                <div className="grid h-[72vh] min-h-0 grid-cols-1 gap-0 lg:grid-cols-[minmax(280px,0.95fr)_minmax(520px,1.65fr)]">
                    <SelectionColumn
                        icon={<Users className="h-4 w-4 text-main_color" />}
                        title={t('acl.roles')}
                        search={roleSearch}
                        onSearchChange={setRoleSearch}
                        placeholder={t('acl.search_roles')}
                        headerAction={
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 border-dashed"
                                disabled={!!editingRoleId}
                                onClick={() => setIsCreating(true)}
                                title={t('acl.add_custom_role')}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        }
                    >
                        {isCreating ? (
                            <form
                                onSubmit={handleCreateRole}
                                className="space-y-3 rounded-md border border-bg_border_element p-3"
                            >
                                <Input
                                    value={createRoleForm.data.name}
                                    onChange={(event) =>
                                        createRoleForm.setData('name', event.target.value)
                                    }
                                    placeholder={t('acl.role_name_placeholder')}
                                    autoFocus
                                />
                                {createRoleForm.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {createRoleForm.errors.name}
                                    </p>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCreating(false)}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="main"
                                        size="sm"
                                        disabled={createRoleForm.processing}
                                    >
                                        {t('common.create')}
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {filteredRoles.map((role) => (
                            <RoleRow
                                key={role.id}
                                role={role}
                                active={role.id === activeRoleId && !isCreating}
                                editing={editingRoleId === role.id}
                                editName={editName}
                                isSavingName={isSavingName}
                                onEditNameChange={setEditName}
                                onSelect={() => {
                                    setIsCreating(false);
                                    onSelectRole(role.id);
                                }}
                                onStartEdit={() => {
                                    setEditingRoleId(role.id);
                                    setEditName(role.name);
                                }}
                                onCancelEdit={() => {
                                    setEditingRoleId(null);
                                    setEditName('');
                                }}
                                onSaveName={saveRoleName}
                                onDelete={() => setRoleToDeleteId(role.id)}
                                previewActive={
                                    previewStatus.active &&
                                    previewStatus.roles[data.activeModule || 'core'] === role.id
                                }
                                onPreview={
                                    role.name === RoleList.OWNER && data.activeModule === 'core'
                                        ? undefined
                                        : () => handlePreviewClick(role)
                                }
                                onManageUsers={() =>
                                    setManagingUsersRole({
                                        id: role.id,
                                        name: getRoleLabel(role.name, t),
                                    })
                                }
                            />
                        ))}
                    </SelectionColumn>

                    <div className="flex min-h-0 flex-col border-l border-bg_border_element">
                        <div className="border-b border-bg_border_element bg-bg_secondary p-3">
                            <div className="mb-3 flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-main_color" />
                                <p className="text-sm font-semibold text-text_primary">
                                    {t('acl.permissions_column')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative min-w-0 flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={permissionSearch}
                                        onChange={(event) =>
                                            setPermissionSearch(event.target.value)
                                        }
                                        placeholder={t('acl.search_permissions')}
                                        className="pl-9"
                                    />
                                </div>
                                {selectedRole && !selectedRole.is_template && (
                                    <Button
                                        variant="main"
                                        className="h-10 shrink-0 px-3"
                                        onClick={handleSavePermissions}
                                        disabled={permissionsForm.processing || !isPermissionDirty}
                                    >
                                        {permissionsForm.processing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {t('common.saveChanges')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="space-y-6 p-4">
                                {!selectedRole ? (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        {t('acl.select_role')}
                                    </div>
                                ) : (
                                    Object.entries(permissionGroups).map(
                                        ([groupName, permissions]) => (
                                            <div key={groupName} className="space-y-3">
                                                <h4 className="text-sm font-semibold text-text_primary">
                                                    {t(`permissions.groups.${groupName}`)}
                                                </h4>
                                                <div className="space-y-1 border-l border-bg_border_element pl-3">
                                                    {permissions.map((permission) => {
                                                        const isOwnerRole =
                                                            selectedRole.name === RoleList.OWNER;
                                                        const isOrgViewPerm =
                                                            permission.name ===
                                                            PERMISSIONS.CORE.ORGANIZATIONS.VIEW;
                                                        const isLocked = permission.is_locked;
                                                        const checked =
                                                            isOwnerRole ||
                                                            isOrgViewPerm ||
                                                            isLocked ||
                                                            permissionsForm.data.permission_ids.includes(
                                                                permission.id,
                                                            );
                                                        const disabled =
                                                            selectedRole.is_template ||
                                                            isOwnerRole ||
                                                            isOrgViewPerm ||
                                                            isLocked;

                                                        return (
                                                            <div
                                                                key={permission.id}
                                                                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-bg_secondary"
                                                            >
                                                                <span className="text-sm">
                                                                    {t(
                                                                        `permissions.keys.${permission.name}`,
                                                                    )}
                                                                </span>
                                                                <Switch
                                                                    checked={checked}
                                                                    disabled={disabled}
                                                                    onCheckedChange={() =>
                                                                        handleTogglePermission(
                                                                            permission.id,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}

            <ConfirmDeleteDialog
                isOpen={!!roleToDeleteId}
                onClose={() => setRoleToDeleteId(null)}
                onConfirm={handleConfirmDelete}
                itemName={roleToDelete ? getRoleLabel(roleToDelete.name, t) : undefined}
                isLoading={isDeleting}
                description={
                    roleToDeleteUsersCount > 0
                        ? t('acl.delete_role_with_users_warning', {
                              count: roleToDeleteUsersCount,
                          })
                        : t('acl.delete_role_confirmation_desc')
                }
            />
            <ConfirmDialog
                isOpen={!!previewConfirmRole}
                onClose={() => setPreviewConfirmRole(null)}
                onConfirm={() => startPreview(previewConfirmRole!.id, data.activeModule)}
                isLoading={previewLoading}
                title={t('role_preview.dialog.confirm_title')}
                description={
                    <div className="space-y-5">
                        <p>
                            {t('role_preview.dialog.confirm_desc', {
                                role: previewConfirmRole
                                    ? getRoleLabel(previewConfirmRole.name, t)
                                    : '',
                            })}
                        </p>

                        <div className="rounded-sm border-l-0 bg-[#fff7d6] p-4 text-[13px] leading-snug text-[#92400e]">
                            {t('role_preview.dialog.mutation_warning')}
                        </div>
                    </div>
                }
                confirmText={t('common.confirm')}
            />
        </div>
    );
}

function SelectionColumn({
    icon,
    title,
    search,
    onSearchChange,
    placeholder,
    headerAction,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    search: string;
    onSearchChange: (value: string) => void;
    placeholder: string;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-0 flex-col border-l border-bg_border_element first:border-l-0">
            <div className="border-b border-bg_border_element bg-bg_secondary p-3">
                <div className="mb-3 flex items-center gap-2">
                    {icon}
                    <p className="text-sm font-semibold text-text_primary">{title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder={placeholder}
                            className="pl-9"
                        />
                    </div>
                    {headerAction}
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">{children}</div>
            </ScrollArea>
        </div>
    );
}

function RoleRow({
    role,
    active,
    editing,
    editName,
    isSavingName,
    onEditNameChange,
    onSelect,
    onStartEdit,
    onCancelEdit,
    onSaveName,
    onDelete,
    previewActive,
    onPreview,
    onManageUsers,
}: {
    role: Role;
    active: boolean;
    editing: boolean;
    editName: string;
    isSavingName: boolean;
    onEditNameChange: (value: string) => void;
    onSelect: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveName: () => void;
    onDelete: () => void;
    previewActive?: boolean;
    onPreview?: () => void;
    onManageUsers: () => void;
}) {
    const { t } = useLanguage();

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect();
                }
            }}
            className={cn(
                'group flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-2 py-2 text-left transition-colors',
                active
                    ? 'border-main_color bg-main_color/10'
                    : 'border-transparent hover:bg-bg_secondary',
            )}
        >
            {editing ? (
                <span
                    className="flex w-full items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                >
                    <Input
                        value={editName}
                        onChange={(event) => onEditNameChange(event.target.value)}
                        className="h-8 px-2 text-xs"
                        autoFocus
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') onSaveName();
                            if (event.key === 'Escape') onCancelEdit();
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600"
                        onClick={onSaveName}
                        disabled={isSavingName}
                    >
                        {isSavingName ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={onCancelEdit}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </span>
            ) : (
                <>
                    <span className="flex min-w-0 items-center gap-2">
                        {onPreview && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onPreview();
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                onPreview();
                                            }
                                        }}
                                        className={cn(
                                            'rounded p-1 transition-colors',
                                            previewActive
                                                ? 'text-green-600'
                                                : 'text-muted-foreground hover:text-primary',
                                        )}
                                    >
                                        <Eye
                                            className={cn(
                                                'h-4 w-4',
                                                previewActive && 'fill-current',
                                            )}
                                        />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>{t('role_preview.start_preview')}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <span className="truncate text-sm font-medium">
                            {getRoleLabel(role.name, t)}
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 opacity-70 group-hover:opacity-100">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center gap-1 rounded p-1 text-muted-foreground hover:text-primary"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onManageUsers();
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onManageUsers();
                                        }
                                    }}
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">{role.users_count}</span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>{t('acl.manage_users_title')}</p>
                            </TooltipContent>
                        </Tooltip>
                        {role.is_template ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="p-1">
                                        <Lock className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>{t('acl.template_role_locked_desc')}</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="p-1 text-muted-foreground hover:text-primary"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onStartEdit();
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    onStartEdit();
                                                }
                                            }}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>{t('common.edit')}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="p-1 text-muted-foreground hover:text-destructive"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDelete();
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    onDelete();
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>{t('common.delete')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </span>
                </>
            )}
        </div>
    );
}
