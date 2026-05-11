import { Box, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlanCheckoutPanel from "../components/plan/PlanCheckoutPanel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PlanType } from "../constant/config";
import { useSearchParams } from "react-router-dom";
import { useSubscriptionPlans } from "../api/subscription_plans";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = searchParams.get("planId");
  const planType = searchParams.get("type") as PlanType | null;

  const { data: plans = [] } = useSubscriptionPlans();

  const plan = plans.find((p) => p.id === planId);

  if (!plan || !planType) {
    return (
      <Box className="checkout-page-shell">
        <Box className="checkout-page-container">
          <Box className="checkout-empty-state">
            <Typography variant="h5">{t("plan.checkoutSubtitle")}</Typography>
            <Typography variant="body2">{t("plan.notChosen")}</Typography>
            <Button onClick={() => navigate("/plan")}>
              {t("plan.registerPlanButton")}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="checkout-page-shell">
      <Box className="checkout-page-container">
        <Box className="checkout-page-header">
          <Button
            component={Link}
            to="/plan"
            startIcon={<ArrowBackIcon />}
            className="checkout-back-link"
          >
            {t("common.button.back")}
          </Button>
          <Typography variant="h4">{t("plan.checkoutTitle")}</Typography>
          <Typography variant="body2">
            {t("plan.checkoutSubtitle")}
          </Typography>
        </Box>

        {plan ? (
          <Box className="plan-checkout-frame">
            <PlanCheckoutPanel plan={plan} planType={planType} />
          </Box>
        ) : (
          <Box className="plan-checkout-placeholder">
            <Typography variant="body1">{t("plan.notChosen")}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
