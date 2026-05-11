import type { ChipProps } from "@mui/material";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DiamondIcon from '@mui/icons-material/Diamond';

export const statusColor = (
  status?: string | null
): ChipProps["color"] => {
  switch (status) {
    case "ACTIVE":
      return "info";
    case "DONE":
      return "success";
    default:
      return "default";
  }
};

export const getPlanIcon = (plansType: string) => {
  switch (plansType) {
    case 'BASIC':
      return <WorkspacePremiumIcon />;
    case 'STARTUP':
      return <RocketLaunchIcon />;
    case 'ENTERPRISE':
      return <DiamondIcon />;
    default:
      return <WorkspacePremiumIcon />;
  }
};