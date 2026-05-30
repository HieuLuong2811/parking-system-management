import { Box } from "@mui/material";

export type FilterPillProps = {
  label: string;
  active: boolean;
  dotColor?: string;
  onClick: () => void;
};

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  active,
  dotColor,
  onClick,
}) => {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        height: 32,
        px: 1.75,
        borderRadius: 999,
        border: '1px solid',
        borderColor: active ? '#dbeafe' : '#eef2f7',
        bgcolor: active ? '#eff6ff' : '#fff',
        color: active ? '#2563eb' : '#94a3b8',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        transition: 'all 0.18s ease',
      }}
    >
      {dotColor ? (
        <Box
          component="span"
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: dotColor,
          }}
        />
      ) : null}

      {label}
    </Box>
  );
};