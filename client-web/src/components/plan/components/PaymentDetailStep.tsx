import { Box, Typography } from "@mui/material";
import { payment_plan } from "../../../constant/config";

type Props = {
  selectedPaymentMode: string | null;
  t: any;
};

export default function PaymentDetailStep({
  selectedPaymentMode,
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
            {t("plan.checkoutStepper.momoTitle")}
          </Typography>
          <Typography variant="body2">
            {t("plan.checkoutStepper.momoDescription")}
          </Typography>

          <Typography variant="body2" className="checkout-momo-account">
            {t("plan.checkoutMomoAccount")}
          </Typography>

          <Typography variant="body2" className="checkout-step-help">
            {t("plan.checkoutStepper.momoRedirect")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}