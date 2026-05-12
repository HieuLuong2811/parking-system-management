import React, { useCallback, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  // InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

import { useAdminRoles } from '../../api/roles';
import { useAssignUserRole, useRevokeUserRole } from '../../api/userRoles';
import type { RoleSummary } from '../../api/types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 240,
    },
  },
};

interface RoleSelectorProps {
  userCode: string;
  roles: RoleSummary[];
  onNotify?: (severity: 'success' | 'error', message: string) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ userCode, roles, onNotify }) => {
  const { t } = useTranslation();

  const { data: availableRoles = [], isLoading: rolesLoading } = useAdminRoles();
  const assignRole = useAssignUserRole();
  const revokeRole = useRevokeUserRole();

  const [open, setOpen] = useState(false);
  const selectedRoleIds = useMemo(() => roles.map((r) => r.id), [roles]);

  const roleMap = useMemo(() => {
    const map = new Map<string, RoleSummary>();
    [...availableRoles, ...roles].forEach((r) => map.set(r.id, r));
    return map;
  }, [availableRoles, roles]);

  const unassignedRoles = useMemo(() => {
    const assignedSet = new Set(selectedRoleIds);
    return availableRoles.filter((r) => !assignedSet.has(r.id));
  }, [availableRoles, selectedRoleIds]);

  const statusText = useMemo(() => {
    if (rolesLoading) return t('usersPage.roleSelector.loading');
    if (assignRole.isPending) return t('usersPage.roleSelector.assigning');
    if (revokeRole.isPending) return t('usersPage.roleSelector.removing');
    return '';
  }, [rolesLoading, assignRole.isPending, revokeRole.isPending, t]);

  // Remove role
  const handleRemoveRole = useCallback(
    async (roleId: string) => {
      const role = roleMap.get(roleId);

      try {
        await revokeRole.mutateAsync({
          user_code: userCode,
          role_id: roleId,
        });

        onNotify?.(
          'success',
          t('usersPage.roleSelector.removeSuccess', {
            role: role ? t(`common.roleTypes.${role.role_code}`) : roleId,
          })
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('usersPage.roleSelector.removeError', {
                role: role ? t(`common.roleTypes.${role.role_code}`) : roleId,
              });

        onNotify?.('error', message);
      }
    },
    [revokeRole, roleMap, userCode, onNotify, t]
  );

  // Assign role
  const handleChange = async (event: SelectChangeEvent<string[]>) => {
    const rawValue = event.target.value;
    const value = typeof rawValue === 'string' ? rawValue.split(',') : rawValue;

    const newlySelected = value.filter((id) => !selectedRoleIds.includes(id));

    setOpen(false);

    if (!newlySelected.length) return;

    await Promise.all(
      newlySelected.map(async (roleId) => {
        const role = roleMap.get(roleId);

        try {
          await assignRole.mutateAsync({
            user_code: userCode,
            role_id: roleId,
          });

          onNotify?.(
            'success',
            t('usersPage.roleSelector.assignSuccess', {
              role: role ? t(`common.roleTypes.${role.role_code}`) : roleId,
            })
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t('usersPage.roleSelector.assignError', {
                  role: role ? t(`common.roleTypes.${role.role_code}`) : roleId,
                });

          onNotify?.('error', message);
        }
      })
    );
  };

  // Render selected roles
  const renderValue = (selected: string[]) => {
    if (!selected.length) {
      return t('usersPage.roleSelector.placeholder');
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((id) => {
          const role = roleMap.get(id);
          const label = role ? t(`common.roleTypes.${role.role_code}`) : role;

          return (
            <Tooltip placement='top' key={id} title={t('usersPage.roleSelector.removeTooltip', { role: label })}>
              <Chip
                label={label}
                size="small"
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onDelete={() => handleRemoveRole(id)}
                deleteIcon={<CloseIcon fontSize="small" />}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  return (
    <Stack spacing={0.5}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <FormControl fullWidth size="small">
          <Select
            id={`role-selector-${userCode}`}
            multiple
            value={selectedRoleIds}
            onChange={handleChange}
            input={<OutlinedInput/>}
            renderValue={renderValue}
            MenuProps={MenuProps}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            displayEmpty
            disabled={
              rolesLoading ||
              assignRole.isPending ||
              revokeRole.isPending ||
              unassignedRoles.length === 0
            }
          >
            {unassignedRoles.length === 0 ? (
              <MenuItem disabled>
                {t('usersPage.roleSelector.noOptions')}
              </MenuItem>
            ) : (
              unassignedRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {t(`common.roleTypes.${role.role_code}`)}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {(rolesLoading || assignRole.isPending || revokeRole.isPending) && (
          <CircularProgress size={18} />
        )}
      </Box>

      {statusText && (
        <Typography variant="caption" color="text.secondary">
          {statusText}
        </Typography>
      )}
    </Stack>
  );
};
