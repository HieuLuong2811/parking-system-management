import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildBarcodeUrl, PRIMARY } from "../../ultis/formatters";
import { ParkingAccessCard } from "../../api/parkingAccessCards";
import { useAppAuth } from "../../contexts/useAppAuth";

type StudentParkingCardProps = {
  card?: ParkingAccessCard;
  isLoading?: boolean;
};

export const StudentParkingCard: React.FC<StudentParkingCardProps> = ({
  card,
  isLoading,
}) => {
  const { user } = useAppAuth();
  const { t } = useTranslation();

  const barcodeToken = useMemo(() => {
    return card?.barcode_token?.trim().toUpperCase() || "";
  }, [card?.barcode_token]);

  const barcodeImageUrl = useMemo(() => {
    return buildBarcodeUrl(barcodeToken);
  }, [barcodeToken]);

  return (
    <Box
      sx={{
        borderRadius: "10px",
        bgcolor: "#fff",
        border: "1px solid #dbe7dd",
        overflow: "hidden",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box
        sx={{
          minHeight: 60,
          px: { xs: 1.5, sm: 2 },
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(90deg, #43B14B 0%, #31963a 100%)",
          borderBottom: "3px solid #d12121",
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 45,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <img src="/Logo.svg" width="100%" height="100%" alt="" />
        </Box>

        <Typography
          sx={{
            flex: 1,
            color: "#fff",
            fontSize: { xs: 14, sm: 17 },
            lineHeight: 1.25,
            fontWeight: 700,
            textTransform: "uppercase",
            textAlign: "right",
          }}
        >
          {t("presentCard.schoolName", {
            defaultValue: "TRƯỜNG ĐẠI HỌC SPKT HƯNG YÊN",
          })}
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.25, pb: 2.5 }}>
        <Typography
          sx={{
            textAlign: "center",
            color: "#d12121",
            fontSize: { xs: 18, sm: 22 },
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            mb: 2.5,
          }}
        >
          {t("presentCard.cardTitle", {
            defaultValue: "THẺ GỬI XE SINH VIÊN",
          })}
        </Typography>

        {isLoading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ minHeight: 220 }}
          >
            <CircularProgress size={28} sx={{ color: PRIMARY }} />

            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}
            >
              {t("presentCard.loading", {
                defaultValue: "Đang tải thẻ gửi xe...",
              })}
            </Typography>
          </Stack>
        ) : !card ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#64748b",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {t("presentCard.noCard", {
              defaultValue: "Bạn chưa có thẻ gửi xe.",
            })}
          </Box>
        ) : (
          <>
            <Stack spacing={1.25}>
              <InfoRow
                label={t("presentCard.studentName", {
                  defaultValue: "Họ tên sinh viên:",
                })}
                value={user?.full_name || "—"}
              />

              <InfoRow
                label={t("presentCard.studentCode", {
                  defaultValue: "Mã sinh viên:",
                })}
                value={user?.user_code || "—"}
              />
            </Stack>

            <Divider sx={{ my: 2, borderColor: "#dbe7dd" }} />

            <Box sx={{ textAlign: "center" }}>
              {barcodeImageUrl ? (
                <Box
                  component="img"
                  src={barcodeImageUrl}
                  alt={barcodeToken}
                  sx={{
                    width: "100%",
                    maxWidth: 390,
                    height: 82,
                    objectFit: "contain",
                    display: "block",
                    mx: "auto",
                  }}
                />
              ) : (
                <Typography
                  sx={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}
                >
                  {t("presentCard.noBarcode", {
                    defaultValue: "Chưa có mã barcode.",
                  })}
                </Typography>
              )}

              {barcodeToken ? (
                <Typography
                  sx={{
                    mt: -1,
                    fontSize: 14,
                    lineHeight: 1.2,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#111827",
                  }}
                >
                  {barcodeToken}
                </Typography>
              ) : null}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "120px 1fr", sm: "150px 1fr" },
        gap: 1.5,
        alignItems: "flex-start",
      }}
    >
      <Typography
        sx={{
          color: "#111827",
          fontSize: 14,
          lineHeight: 1.4,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#000",
          fontSize: 14,
          lineHeight: 1.4,
          fontWeight: 700,
          textTransform: "uppercase",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
