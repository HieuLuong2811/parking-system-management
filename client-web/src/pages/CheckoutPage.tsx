import { Box, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlanRecord } from '../api/clientApi';
import PlanCheckoutPanel from '../components/plan/PlanCheckoutPanel';

type CheckoutState = {
  plan?: SubscriptionPlanRecord;
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { plan } = (location.state as CheckoutState) ?? {};

  if (!plan) {
    return (
      <Box className="checkout-page-shell">
        <Box className="checkout-page-container">
          <Box className="checkout-empty-state">
            <Typography variant="h5">{t('plan.checkoutSubtitle')}</Typography>
            <Typography variant="body2" className="checkout-empty-description">
              {t('plan.notChosen')}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/plan')}>
              {t('plan.registerPlanButton')}
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
          <Box>
            <Typography variant="h4">{t('plan.checkoutTitle')}</Typography>
            <Typography variant="body2">{t('plan.checkoutSubtitle')}</Typography>
          </Box>
          <Button variant="text" onClick={() => navigate('/plan')}>
            {t('plan.checkoutCancel')}
          </Button>
        </Box>
        <PlanCheckoutPanel plan={plan} />
      </Box>
    </Box>
  );
}
