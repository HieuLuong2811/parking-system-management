import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clientHttp,
  requestWithContext,
  VehicleInfo,
} from './clientApi';

export type VehiclePayload = {
  user_code: string;
  vehicle_type: string;
  license_plate: string;
  qr_code?: string | null;
};

export type UpdateVehicleArgs = {
  vehicleId: string;
  payload: VehiclePayload;
};

export type DeleteVehicleArgs = {
  vehicleId: string;
};

export const fetchVehicles = async (): Promise<VehicleInfo[]> => {
  return requestWithContext(
    clientHttp.get<VehicleInfo[]>('/vehicles/me'),
    'Load vehicles'
  );
};

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
