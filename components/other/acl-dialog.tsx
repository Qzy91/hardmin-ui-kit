import { AclManagerContent } from '@/components/acl/acl-manager-content';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';
import { useOrganization } from '@/contexts/organization-context';
import { useAcl } from '@/hooks/use-acl';
import { PERMISSIONS } from '@/lib/acl-config';
import { RoleList } from '@/sections/users/types';
import { SharedPageProps } from '@/types';
import { AclData, Module } from '@/types/acl';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface Props {
    className?: string;
    module: Module;
}

export function AclDialog({ className, module }: Props) {
    const { t } = useLanguage();
    const { auth, organizationsList } = usePage<SharedPageProps>().props;
    const { selectedOrganizationId } = useOrganization();
    const { can } = useAcl();
    const orgId = selectedOrganizationId;
    const isSuperAdmin = auth?.user?.global_role === RoleList.SUPER_ADMIN;
    const userCan = can(PERMISSIONS.CORE.USERS.MANAGE_ROLES);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aclData, setAclData] = useState<AclData | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [managingUsersRole, setManagingUsersRole] = useState<{ id: string; name: string } | null>(
        null,
    );

    const refreshAclData = async () => {
        if (!orgId) return;

        if (!aclData || aclData.activeModule !== module) {
            setLoading(true);
        }

        try {
            const response = await axios.get(`/organizations/${orgId}/acl-roles`, {
                params: {
                    module: module,
                },
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const rawData = response.data;

            let finalData: AclData | null = null;
            if (rawData.roles) {
                finalData = rawData;
            } else if (rawData.props && rawData.props.roles) {
                finalData = rawData.props;
            } else if (rawData.data && rawData.data.roles) {
                finalData = rawData.data;
            }

            if (finalData && finalData.roles) {
                setAclData(finalData);
            } else {
                console.error('Missing "roles" key in response.');
            }
        } catch (error: unknown) {
            console.error('Failed to load ACL data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            refreshAclData();
        }
        if (!isOpen) {
            setSelectedRoleId(null);
            setManagingUsersRole(null);
        }
    };

    if (!orgId) return null;
    if (!isSuperAdmin && !userCan) return null;

    const moduleLabel = t(`permissions.groups.${module}`);
    const organizationName =
        organizationsList?.find((organization) => organization.id === orgId)?.name ||
        t('common.selectOrganization');
    const headerTitle = managingUsersRole
        ? t('acl.manage_users_title_for_role', {
              role: managingUsersRole.name,
          })
        : t('acl.modal_title');

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    className={
                        className ||
                        'rounded-full p-2 text-text_secondary transition-colors hover:bg-bg_border_element'
                    }
                    title={t('acl.manage_access') + ` (${t(`permissions.groups.${module}`)})`}
                >
                    <ShieldCheck className="h-5 w-5" />
                </button>
            </DialogTrigger>

            <DialogContent className="max-h-[92vh] max-w-[min(1100px,96vw)] gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-bg_border_element px-6 pb-4 pt-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 pr-10">
                            <span className="flex h-9 w-9 items-center justify-center text-main_color">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <DialogTitle>
                                {headerTitle} - {moduleLabel}
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            {t('acl.module_description', {
                                organization: organizationName,
                                module: moduleLabel,
                            })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex h-[68vh] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-main_color" />
                    </div>
                ) : aclData ? (
                    <AclManagerContent
                        organizationId={orgId}
                        data={aclData}
                        onClose={() => setOpen(false)}
                        onReload={refreshAclData}
                        selectedRoleId={selectedRoleId}
                        onSelectRole={setSelectedRoleId}
                        onManagingRoleChange={setManagingUsersRole}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="font-medium text-red-500">
                            {t('acl.error_loading_data')}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
