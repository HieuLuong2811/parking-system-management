import {
  Alert,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { payment_plan } from "../../../constant/config";

type Props = {
  selectedPaymentMode: string | null;
  selectedFullPaymentMethod?: "WALLET" | "MOMO" | null;
  onSelectFullPaymentMethod?: (value: "WALLET" | "MOMO") => void;
  walletReady?: boolean;
  walletBalance?: number;
  requiredAmount?: number | null;
  t: any;
};

export default function PaymentDetailStep({
  selectedPaymentMode,
  selectedFullPaymentMethod,
  onSelectFullPaymentMethod,
  walletReady,
  walletBalance,
  requiredAmount,
  t,
}: Props) {
  return (
    <Box>
      {selectedPaymentMode === payment_plan.RECURRING ? (
        <Box className="checkout-step-box">
          <Typography variant="subtitle1">
            {t("plan.recurring.title", { defaultValue: "Thanh toán định kỳ hàng tháng" })}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {t("plan.recurring.description", {
              defaultValue:
                "Hệ thống sẽ tự động tạo hóa đơn và gửi thông báo thanh toán mỗi tháng.",
            })}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">• Gửi email nhắc thanh toán mỗi kỳ</Typography>
            <Typography variant="body2">• Tối đa 3 lần retry nếu thanh toán thất bại</Typography>
            <Typography variant="body2">• Nhắc lại mỗi 30 phút nếu chưa thanh toán</Typography>
            <Typography variant="body2">• Sau 3 lần sẽ thông báo admin</Typography>
            <Typography variant="body2">• Nếu không thanh toán → tài khoản có thể bị tạm ngưng</Typography>
          </Box>
        </Box>
      ) : (
        <Box className="checkout-step-box">
          <Typography variant="subtitle1">
            {t("plan.checkoutStepper.fullPaymentTitle", { defaultValue: "Thanh toán toàn bộ" })}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {t("plan.checkoutStepper.fullPaymentDescription", {
              defaultValue: "Chọn phương thức thanh toán cho gói.",
            })}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <FormControl>
              <RadioGroup
                value={selectedFullPaymentMethod ?? "MOMO"}
                onChange={(e) =>
                  onSelectFullPaymentMethod?.(e.target.value as "WALLET" | "MOMO")
                }
              >
                <FormControlLabel
                  value="WALLET"
                  control={<Radio />}
                  disabled={!walletReady}
                  label={t("wallet.method.wallet", { defaultValue: "Ví điện tử" })}
                />
                <FormControlLabel
                  value="MOMO"
                  control={<Radio />}
                  label={t("wallet.method.momo", { defaultValue: "MoMo" })}
                />
              </RadioGroup>
            </FormControl>

            {!walletReady && requiredAmount != null && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                {t("wallet.insufficient", {
                  defaultValue:
                    "Số dư ví không đủ, vui lòng nạp thêm hoặc chọn MoMo",
                })}
              </Alert>
            )}

            {walletBalance != null && (
              <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("wallet.balance", { defaultValue: "Số dư ví" })}: {walletBalance}
                </Typography>
                {requiredAmount != null && (
                  <Typography variant="body2" color="text.secondary">
                    {t("wallet.required", { defaultValue: "Cần thanh toán" })}: {requiredAmount}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
