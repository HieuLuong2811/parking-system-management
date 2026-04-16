import { useEffect, useState } from "react";
import { Box, Button, Modal, Typography } from "@mui/material";

export default function DetectForm() {
  const [open, setOpen] = useState(false);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("http://localhost:8000/api/v1/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "object_detected") {
        setObjects(data.objects);
        setOpen(true);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      <Typography variant="h5">🚗 Camera Quét Vật Thể</Typography>

      <Box
        component="img"
        src="http://localhost:8000/api/v1/stream"
        alt="Camera Stream"
        sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}
      />

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            🎯 Phát hiện vật thể
          </Typography>
          <Typography>{objects.join(", ")}</Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => setOpen(false)}
            variant="contained"
          >
            Đóng
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
