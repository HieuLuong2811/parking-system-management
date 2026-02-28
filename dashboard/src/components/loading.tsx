import { Box, CircularProgress } from "@mui/material";

export const LoadingPage = () => {
    return (
        <Box
            sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(1px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            }}
        >
            <CircularProgress color="primary" />
        </Box>
    );
};