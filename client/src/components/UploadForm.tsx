import { useState } from "react";
import { Button, Box, Typography, Card, CardMedia } from "@mui/material";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/detect", formData, {
        responseType: "blob",
      });

      const imageBlob = new Blob([response.data], { type: "image/jpeg" });
      setResultImage(URL.createObjectURL(imageBlob));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Nhận diện biển số xe
      </Typography>
      <Button variant="contained" component="label">
        Chọn ảnh
        <input
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Button>
      <Box mt={2}>
        <Button variant="outlined" onClick={handleUpload} disabled={!file}>
          Upload
        </Button>
      </Box>

      {resultImage && (
        <Card sx={{ mt: 4 }}>
          <CardMedia component="img" image={resultImage} alt="Result" />
        </Card>
      )}
    </Box>
  );
}
