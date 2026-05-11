import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getVehicleTypeLabel } from "../../../ultis/formatters";

type Props = {
  licensedVehicles: any[];
  unlicensedVehicles: any[];
  selectedLicensedVehicleId: string;
  selectedUnlicensedVehicleId: string;
  setLicensedVehicleId: (id: string) => void;
  setUnlicensedVehicleId: (id: string) => void;
  handleOpenCreate: () => void;
  t: any;
};

export default function VehicleStep({
  licensedVehicles,
  unlicensedVehicles,
  selectedLicensedVehicleId,
  selectedUnlicensedVehicleId,
  setLicensedVehicleId,
  setUnlicensedVehicleId,
  handleOpenCreate,
  t,
}: Props) {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Chọn phương tiện
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Select
          fullWidth
          displayEmpty
          value={selectedLicensedVehicleId ?? ""}
          onChange={(e) => {
            const value = e.target.value as string;
            if (value === "new") {
              navigate("/vehicles");
              return;
            }
            setLicensedVehicleId(value || "");
          }}
        >
          <MenuItem value="" disabled>
            -- Chọn xe có biển số --
          </MenuItem>
          <MenuItem value="">(Không chọn)</MenuItem>
          {licensedVehicles.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.license_plate
                ? `${getVehicleTypeLabel(v.vehicle_type, t)} • ${v.license_plate}`
                : getVehicleTypeLabel(v.vehicle_type, t)}
            </MenuItem>
          ))}
        </Select>

        <Select
          fullWidth
          displayEmpty
          value={selectedUnlicensedVehicleId ?? ""}
          onChange={(e) => {
            const value = e.target.value as string;
            if (value === "new") {
              navigate("/vehicles");
              return;
            }
            setUnlicensedVehicleId(value || "");
          }}
        >
          <MenuItem value="" disabled>
            -- Chọn xe không biển số --
          </MenuItem>
          <MenuItem value="">(Không chọn)</MenuItem>
          {unlicensedVehicles.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {getVehicleTypeLabel(v.vehicle_type, t)}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="outlined" onClick={handleOpenCreate}>
            + Thêm xe
          </Button>
        </Box>
      </Box>
    </>
  );
}

