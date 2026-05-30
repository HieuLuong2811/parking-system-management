import { Alert, Box, Typography } from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { payment_plan } from "../../../constant/config";
import { formatCurrency } from "../../../ultis/formatters";

type FullPaymentMethod = "WALLET" | "MOMO";

type Props = {
  selectedPaymentMode: string | null;
  selectedFullPaymentMethod?: FullPaymentMethod | null;
  onSelectFullPaymentMethod?: (value: FullPaymentMethod) => void;
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
  const currentMethod = selectedFullPaymentMethod ?? "MOMO";

  if (selectedPaymentMode === payment_plan.RECURRING) {
    return (
      <Box className="checkout-step-box">
        <Typography variant="subtitle1">
          {t("plan.recurring.title", {
            defaultValue: "Thanh toán định kỳ hàng tháng",
          })}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("plan.recurring.description", {
            defaultValue:
              "Hệ thống sẽ tự động tạo hóa đơn và gửi thông báo thanh toán mỗi tháng.",
          })}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            • Gửi email nhắc thanh toán mỗi kỳ
          </Typography>
          <Typography variant="body2">
            • Tối đa 3 lần retry nếu thanh toán thất bại
          </Typography>
          <Typography variant="body2">
            • Nhắc lại mỗi 30 phút nếu chưa thanh toán
          </Typography>
          <Typography variant="body2">
            • Sau 3 lần sẽ thông báo admin
          </Typography>
          <Typography variant="body2">
            • Nếu không thanh toán → tài khoản có thể bị tạm ngưng
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="checkout-step-box">
      <Typography variant="subtitle1">
        {t("plan.checkoutStepper.fullPaymentTitle", {
          defaultValue: "Thanh toán toàn bộ",
        })}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        {t("plan.checkoutStepper.fullPaymentDescription", {
          defaultValue: "Chọn phương thức thanh toán cho vé gửi xe.",
        })}
      </Typography>

      <Box className="payment-method-list">
        <Box className="payment-method-block">
          <Box
            className={[
              "payment-method-card",
              currentMethod === "WALLET" ? "payment-method-card--active" : "",
              !walletReady ? "payment-method-card--disabled" : "",
            ].join(" ")}
            onClick={() => {
              if (!walletReady) return;
              onSelectFullPaymentMethod?.("WALLET");
            }}
          >
            <Box className="payment-method-card__icon payment-method-card__icon--wallet">
              <AccountBalanceWalletRoundedIcon />
            </Box>

            <Box className="payment-method-card__content">
              <Box className="payment-method-card__top">
                <Typography className="payment-method-card__title">
                  {t("wallet.method.wallet", { defaultValue: "Ví điện tử" })}
                </Typography>

                {currentMethod === "WALLET" && walletReady && (
                  <CheckCircleRoundedIcon className="payment-method-card__check" />
                )}
              </Box>

              <Typography className="payment-method-card__sub">
                {t("wallet.availableBalance", {
                  defaultValue: "Số dư khả dụng",
                })}
                : {formatCurrency(walletBalance)}
              </Typography>
            </Box>
          </Box>

          {!walletReady && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {t("wallet.insufficient", {
                defaultValue: "Số dư ví không đủ để thanh toán.",
              })}
            </Alert>
          )}
        </Box>

        <Box className="payment-method-block">
          <Box
            className={[
              "payment-method-card",
              currentMethod === "MOMO" ? "payment-method-card--active" : "",
            ].join(" ")}
            onClick={() => onSelectFullPaymentMethod?.("MOMO")}
          >
            <Box className="payment-method-card__icon payment-method-card__icon--momo">
              <img src="/momo.png" alt="" className="payment-method-card__icon-img" />
            </Box>

            <Box className="payment-method-card__content">
              <Box className="payment-method-card__top">
                <Typography className="payment-method-card__title">
                  {t("wallet.method.momo", { defaultValue: "Ví MoMo" })}
                </Typography>

                {currentMethod === "MOMO" && (
                  <CheckCircleRoundedIcon className="payment-method-card__check" />
                )}
              </Box>

              <Typography className="payment-method-card__sub">
                {t("wallet.required", { defaultValue: "Cần thanh toán" })}:{" "}
                {formatCurrency(requiredAmount)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
