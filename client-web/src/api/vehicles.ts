import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clientHttp,
  requestWithContext,
  VehicleInfo,
} from './clientApi';
import { isMockMode, mockVehicles } from '../mocks/mockData';

export type VehiclePayload = {
  user_code: string;
  vehicle_type: string;
  license_plate: string;
  qr_code?: string | null;
};

export type UpdateVehicleArgs = {
  vehicleId: string;
  payload: VehiclePayload;
  userCode?: string;
};

export type DeleteVehicleArgs = {
  vehicleId: string;
  userCode?: string;
};

export const fetchVehicles = async (userCode?: string): Promise<VehicleInfo[]> => {
  const params = userCode ? { user_code: userCode } : undefined;
  if (isMockMode) {
    return Promise.resolve(mockVehicles);
  }
  return requestWithContext(
    clientHttp.get<VehicleInfo[]>('/vehicles', { params }),
    'Load vehicles'
  );
};

export const useVehicles = (userCode?: string) => {
  return useQuery({
    queryKey: ['vehicles', userCode || 'all'],
    queryFn: () => fetchVehicles(userCode),
    staleTime: 1000 * 60,
  });
};

export const createVehicle = async (payload: VehiclePayload): Promise<VehicleInfo> => {
  return requestWithContext(
    clientHttp.post<VehicleInfo>('/vehicles', payload),
    'Create vehicle'
  );
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehiclePayload) => createVehicle(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', payload.user_code] });
    },
  });
};

export const updateVehicle = async ({ vehicleId, payload }: UpdateVehicleArgs): Promise<VehicleInfo> => {
  return requestWithContext(
    clientHttp.patch<VehicleInfo>(`/vehicles/${vehicleId}`, payload),
    'Update vehicle'
  );
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: UpdateVehicleArgs) => updateVehicle(args),
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      if (args.userCode) {
        queryClient.invalidateQueries({ queryKey: ['vehicles', args.userCode] });
      }
    },
  });
};

export const deleteVehicle = async ({ vehicleId }: DeleteVehicleArgs): Promise<void> => {
  await requestWithContext(clientHttp.delete(`/vehicles/${vehicleId}`), 'Delete vehicle');
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: DeleteVehicleArgs) => deleteVehicle(args),
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      if (args.userCode) {
        queryClient.invalidateQueries({ queryKey: ['vehicles', args.userCode] });
      }
    },
  });
};
