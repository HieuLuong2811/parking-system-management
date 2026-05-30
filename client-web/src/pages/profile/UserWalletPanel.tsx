import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { FormInput } from "../../components/common/FormInput";
import { FilterPill } from "../../components/userWallet/FilterPill";
import { useMyWallet, useWalletTopUp } from "../../api/wallets";
import { formatCurrencyInput } from "../../ultis/formatters";
import { useMyPaymentTransactionsPaginated } from "../../api/payment_transactions";
import { useNavigate } from "react-router-dom";
import { transactionType } from "../../constant/config";

type TransactionType = "income" | "expense";
type DirectionFilter = "all" | "in" | "out";

type WalletTransaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  icon: "wallet" | "car" | "reader" | "refund";
};

const formatVnd = (value: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionIcon = (icon: WalletTransaction["icon"]) => {
  switch (icon) {
    case "wallet":
      return <AccountBalanceWalletOutlinedIcon />;
    case "car":
      return <DirectionsCarOutlinedIcon />;
    case "reader":
      return <ArticleOutlinedIcon />;
    case "refund":
      return <ReplyOutlinedIcon />;
    default:
      return <ReceiptLongOutlinedIcon />;
  }
};

const getIconByTransactionType = (
  transactionType?: string | null,
  direction?: string | null,
): WalletTransaction["icon"] => {
  const type = String(transactionType ?? "").toUpperCase();
  const dir = String(direction ?? "").toUpperCase();

  if (type.includes("TOP_UP") || type.includes("DEPOSIT")) {
    return "wallet";
  }

  if (type.includes("PARKING") || type.includes("SESSION")) {
    return "car";
  }

  if (
    type.includes("SUBSCRIPTION") ||
    type.includes("PLAN") ||
    type.includes("REGISTER")
  ) {
    return "reader";
  }

  if (type.includes("REFUND") || dir === "IN") {
    return "refund";
  }

  return "reader";
};

const getTransactionTypeByDirection = (item: any): TransactionType => {
  const direction = String(
    item?.direction ??
      item?.transaction_direction ??
      item?.payment_direction ??
      "",
  ).toUpperCase();

  if (direction === "IN") return "income";
  if (direction === "OUT") return "expense";

  const amount = Number(item?.amount ?? 0);

  return amount >= 0 ? "income" : "expense";
};

const getTransactionTitle = (item: any, type: TransactionType, t: any) => {
  if (item?.title) return item.title;

  const transactionType = String(
    item?.transaction_type ?? item?.type ?? "",
  ).toUpperCase();

  if (transactionType.includes("TOP_UP")) {
    return t("wallet.transactionTitle.topup", {
      defaultValue: "Nạp tiền ví",
    });
  }

  if (transactionType.includes("PARKING")) {
    return t("wallet.transactionTitle.parkingPayment", {
      defaultValue: "Thanh toán gửi xe",
    });
  }

  if (
    transactionType.includes("SUBSCRIPTION") ||
    transactionType.includes("PLAN")
  ) {
    return t("wallet.transactionTitle.subscription", {
      defaultValue: "Đăng ký vé gửi xe tháng",
    });
  }

  if (transactionType.includes("REFUND")) {
    return t("wallet.transactionTitle.refund", {
      defaultValue: "Hoàn tiền",
    });
  }

  return type === "income"
    ? t("wallet.transactionTitle.income", {
        defaultValue: "Tiền vào",
      })
    : t("wallet.transactionTitle.expense", {
        defaultValue: "Tiền ra",
      });
};

const getTransactionDescription = (item: any) => {
  return (
    item?.description ??
    item?.note ??
    item?.payment_method ??
    item?.transaction_code ??
    formatDateTime(item?.created_at ?? item?.createdAt) ??
    ""
  );
};

const getTransactionItems = (data: any) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.payment_transactions))
    return data.payment_transactions;

  return [];
};

export const UserWalletPanel: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data: wallet, isLoading: walletLoading } = useMyWallet();
  const { mutateAsync: topUpWallet, isPending } = useWalletTopUp();

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>("50000");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");

  const transactionParams = useMemo(() => {
    return {
      page: 1,
      limit: 5,
      ...(directionFilter === "in" ? { direction: "IN" } : {}),
      ...(directionFilter === "out" ? { direction: "OUT" } : {}),
      transaction_type: transactionType.TOP_UP,
    };
  }, [directionFilter]);

  const {
    data: transactionsPaginated,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useMyPaymentTransactionsPaginated(transactionParams);

  const [toast, setToast] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const balance = Number(wallet?.balance ?? 0);
  const currency = wallet?.currency ?? "đ";

  const formattedBalance = useMemo(() => {
    if (!wallet) return "0 đ";

    if (currency.toUpperCase() === "VND" || currency === "đ") {
      return formatVnd(balance);
    }

    return `${new Intl.NumberFormat("vi-VN").format(balance)} ${currency}`;
  }, [wallet, balance, currency]);

  const walletCode = String(
    (wallet as any)?.wallet_code ??
      (wallet as any)?.wallet_id ??
      (wallet as any)?.id ??
      "000000",
  );

  const lastSixCardDigits = walletCode.slice(-6).padStart(6, "0");

  const transactions = useMemo<WalletTransaction[]>(() => {
    return getTransactionItems(transactionsPaginated).map((item: any) => {
      const type = getTransactionTypeByDirection(item);
      const direction = String(item?.direction ?? "").toUpperCase();
      const transactionType = item?.transaction_type ?? item?.type;
      const amount = Math.abs(Number(item?.amount ?? 0));

      return {
        id: String(
          item?.id ??
            item?.transaction_id ??
            item?.payment_transaction_id ??
            `${transactionType}-${item?.created_at}-${amount}`,
        ),
        title: getTransactionTitle(item, type, t),
        description: getTransactionDescription(item),
        amount,
        type,
        icon: getIconByTransactionType(transactionType, direction),
      };
    });
  }, [transactionsPaginated, t]);

  const handleTopUp = async () => {
    const amount = Number(String(topUpAmount || "").replace(/\D/g, ""));

    if (!amount || amount <= 0) {
      setToast({
        open: true,
        severity: "error",
        message: t("wallet.invalidAmount", {
          defaultValue: "Số tiền nạp không hợp lệ.",
        }),
      });
      return;
    }

    try {
      const res = await topUpWallet({
        amount,
        redirect_url: `${window.location.origin}/profile`,
        description: "Wallet top-up",
      });

      const url = res.pay_url || res.short_link || res.qr_code_url;

      if (!url) {
        throw new Error(
          t("wallet.noPaymentUrl", {
            defaultValue: "Không tìm thấy liên kết thanh toán.",
          }),
        );
      }

      setTopUpOpen(false);
      window.location.assign(url);
    } catch (e) {
      setToast({
        open: true,
        severity: "error",
        message: e instanceof Error ? e.message : t("common.error"),
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 820,
        mx: "auto",
        pb: 2.5,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(320px, 480px) minmax(220px, 1fr)",
          },
          gap: 2,
          alignItems: "stretch",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            borderRadius: "22px",
            boxShadow: "0 16px 30px rgba(79, 70, 229, 0.20)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              minHeight: 156,
              borderRadius: "22px",
              p: 2.4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                "linear-gradient(135deg, #8b7cf6 0%, #6d5df2 48%, #4f46e5 100%)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 150,
                height: 150,
                borderRadius: "50%",
                right: -52,
                top: -48,
                bgcolor: "rgba(255,255,255,0.10)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: "50%",
                left: -52,
                bottom: -70,
                bgcolor: "rgba(255,255,255,0.08)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.78)",
                    mb: 0.75,
                  }}
                >
                  {t("wallet.balance", { defaultValue: "Số dư khả dụng" })}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 24, sm: 26 },
                      lineHeight: 1.2,
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      color: "#fff",
                    }}
                  >
                    {walletLoading
                      ? "..."
                      : balanceHidden
                        ? "••••••"
                        : formattedBalance}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => setBalanceHidden((prev) => !prev)}
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.14)",
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.22)",
                      },
                      "& svg": {
                        fontSize: 17,
                      },
                    }}
                  >
                    {balanceHidden ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{
                  width: 42,
                  height: 36,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#facc15",
                  flexShrink: 0,
                  "& svg": {
                    fontSize: 26,
                  },
                }}
              >
                <CreditCardOutlinedIcon />
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
                mt: 3.5,
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                •••••• {lastSixCardDigits}
              </Typography>

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.1,
                  py: 0.6,
                  borderRadius: 999,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.20)",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#22c55e",
                  }}
                />

                <Typography
                  component="span"
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {wallet?.status ?? "ACTIVE"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: "22px",
            bgcolor: "#ffffff",
            border: "1px solid #eef2f7",
            p: 2,
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {t("wallet.quickActions", {
                defaultValue: "Thao tác ví",
              })}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                fontWeight: 600,
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              {t("wallet.quickActionsDesc", {
                defaultValue:
                  "Nạp tiền vào ví để thanh toán gửi xe và đăng ký vé gửi xe.",
              })}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<AccountBalanceWalletOutlinedIcon />}
            onClick={() => setTopUpOpen(true)}
            disabled={isPending || wallet?.status === "LOCKED"}
            sx={{
              height: 44,
              borderRadius: "14px",
              bgcolor: "#2563eb",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "none",
              },
            }}
          >
            {t("wallet.topup", { defaultValue: "Nạp tiền" })}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          borderRadius: "22px",
          bgcolor: "#ffffff",
          border: "1px solid #eef2f7",
          p: 2,
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.75,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#0f172a",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              {t("wallet.transactionsHistory", {
                defaultValue: "Lịch sử giao dịch",
              })}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                color: "#64748b",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {t("wallet.transactionsPreviewDesc", {
                defaultValue: "Các giao dịch gần đây của ví.",
              })}
            </Typography>
          </Box>

          <Button
            sx={{
              minWidth: "auto",
              px: 1,
              color: "#2563eb",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#eff6ff",
              },
            }}
            onClick={() => navigate("/transactions")}
          >
            {t("wallet.seeAll", { defaultValue: "Xem tất cả" })}
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.25,
            mb: 1.75,
          }}
        >
          <FilterPill
            active={directionFilter === "all"}
            label={t("wallet.all", { defaultValue: "Tất cả" })}
            onClick={() => setDirectionFilter("all")}
          />

          <FilterPill
            active={directionFilter === "in"}
            label={t("wallet.income", { defaultValue: "Tiền vào" })}
            dotColor="#dcfce7"
            onClick={() => setDirectionFilter("in")}
          />

          <FilterPill
            active={directionFilter === "out"}
            label={t("wallet.expense", { defaultValue: "Tiền ra" })}
            dotColor="#fee2e2"
            onClick={() => setDirectionFilter("out")}
          />
        </Box>

        {transactionsLoading ? (
          <Box
            sx={{
              minHeight: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : transactionsError ? (
          <Box
            sx={{
              minHeight: 96,
              borderRadius: "16px",
              bgcolor: "#fff7ed",
              border: "1px solid #fed7aa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#c2410c",
              }}
            >
              {t("wallet.transactionsLoadError", {
                defaultValue: "Không thể tải lịch sử giao dịch.",
              })}
            </Typography>
          </Box>
        ) : transactions.length === 0 ? (
          <Box
            sx={{
              minHeight: 96,
              borderRadius: "16px",
              bgcolor: "#f8fafc",
              border: "1px solid #eef2f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              {t("wallet.noTransactions", {
                defaultValue: "Chưa có giao dịch nào.",
              })}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {transactions.map((item) => {
              const isIncome = item.type === "income";

              return (
                <Box
                  key={item.id}
                  sx={{
                    minHeight: 68,
                    borderRadius: "16px",
                    bgcolor: "#f8fafc",
                    border: "1px solid #eef2f7",
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 1.35,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "14px",
                      bgcolor: isIncome ? "#ecfdf5" : "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isIncome ? "#10b981" : "#2563eb",
                      mr: 1.5,
                      flexShrink: 0,
                      "& svg": {
                        fontSize: 21,
                      },
                    }}
                  >
                    {getTransactionIcon(item.icon)}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "#1e293b",
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        color: "#94a3b8",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      ml: 1.5,
                      whiteSpace: "nowrap",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: isIncome ? "#10b981" : "#0f172a",
                    }}
                  >
                    {isIncome ? "+ " : "- "}
                    {formatVnd(item.amount)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Dialog
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#0f172a",
            fontSize: 16,
            fontWeight: 700,
            pb: 1,
          }}
        >
          {t("wallet.topup", { defaultValue: "Nạp tiền" })}

          <IconButton onClick={() => setTopUpOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.5}>
            <FormInput
              id="wallet-topup-amount"
              label={t("wallet.topupAmount", { defaultValue: "Số tiền nạp" })}
              value={formatCurrencyInput(topUpAmount)}
              onChange={(v) => setTopUpAmount(v.replace(/\D/g, ""))}
              inputClassName="plain-input"
              labelClassName="profile-field-label"
              placeholder={t("wallet.topupAmountPlaceholder", {
                defaultValue: "Nhập số tiền muốn nạp",
              })}
            />

            <Typography
              sx={{
                color: "#b45309",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              {t("wallet.topupWarning", {
                defaultValue:
                  "Bạn sẽ được chuyển sang MoMo để hoàn tất thanh toán.",
              })}
            </Typography>

            <Button
              variant="contained"
              onClick={handleTopUp}
              disabled={isPending || wallet?.status === "LOCKED"}
              sx={{
                height: 46,
                borderRadius: "14px",
                bgcolor: "#2563eb",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              {isPending
                ? t("common.loading", { defaultValue: "Đang xử lý..." })
                : t("wallet.confirmTopup", {
                    defaultValue: "Xác nhận nạp tiền",
                  })}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((p) => ({ ...p, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
