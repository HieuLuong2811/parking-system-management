import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionPlanRecord } from "../../api/clientApi";
import { useAcademicTerms } from "../../api/academic_terms";
import { useVehicles } from "../../api/vehicles";
import { useAppAuth } from "../../contexts/useAppAuth";
import { getPlanCardKey } from "../../ultis/planCards";
import { useCheckoutState } from "./hooks/useCheckoutState";
import { usePlanCheckoutPricing } from "./hooks/usePlanCheckoutPricing";
import { useCheckoutValidation } from "./hooks/useCheckoutValidation";
import { useCheckoutPayment } from "./hooks/useCheckoutPayment";

import { AcademicTermOption, paymentModes, RawTermCard } from "./types";
import { payment_plan, PlanType } from "../../constant/config";

import VehicleRegistrationModal from '../../components/vehicle/VehicleRegistrationModal';
import useModal from '../../hooks/useModal';

// Component con
import VehicleStep from "./components/VehicleStep";
import TermStep from "./components/TermStep";
import PaymentModeStep from "./components/PaymentModeStep";

// Utils
import CheckoutSummaryPanel from "./components/CheckoutSummaryPanel";
import PaymentDetailStep from "./components/PaymentDetailStep";
import CheckoutStepActions from "./components/CheckoutStepActions";
import { formatCurrency } from "../../ultis/formatters";

type PlanCheckoutPanelProps = {
  plan: SubscriptionPlanRecord;
  initialVehicleId?: string;
  planType?: PlanType;
};

export default function PlanCheckoutPanel({
  plan,
  initialVehicleId,
  planType,
}: PlanCheckoutPanelProps) {
  const { t } = useTranslation();

  const planKey = getPlanCardKey(plan.plans_type);
  const planTitle = planKey !== null
    ? t(`plan.cards.${planKey}.title`, { defaultValue: plan.plans_type })
    : plan.plans_type;
  const planSubtitle = planKey !== null
    ? t(`plan.cards.${planKey}.subtitle`, { defaultValue: "" })
    : "";

  const { user: currentUser } = useAppAuth();
  const { data: academicTerms = [] } = useAcademicTerms();
  const { data: vehicles = [] } = useVehicles();

  const registerModal = useModal();

  // Handlers cho modal
  const handleOpenCreate = () => registerModal.openModal();
  const handleCloseModal = () => registerModal.closeModal();

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles;
  }, [vehicles]);

  const checkoutSteps = useMemo(
    () => t("plan.checkoutStepper.steps", { returnObjects: true }) as string[],
    [t]
  );

  const translationTermCards = useMemo(() => {
    const result = (t("plan.checkoutStepper.termCards", { returnObjects: true }) as RawTermCard[]) ?? [];
    const raw = Array.isArray(result) ? result : [];
    return raw.map((card) => ({
      id: card.id,
      termName: card.term_name,
      startDate: card.start_date,
      endDate: card.end_date,
    }));
  }, [t]);

  const academicTermOptions = useMemo<AcademicTermOption[]>(() => {
    return academicTerms.map((term) => ({
      id: term.id,
      termName: term.term_name,
      startDate: term.start_date,
      endDate: term.end_date,
    }));
  }, [academicTerms]);

  const availableTermCards = academicTermOptions.length > 0 ? academicTermOptions : translationTermCards;

  // Checkout State
  const { state: checkoutState, actions } = useCheckoutState(
    plan?.id,
    academicTermOptions,
    vehicles,
    initialVehicleId
  );

  const {
    activeStep,
    selectedTermId,
    selectedPaymentMode,
    selectedLicensedVehicleId,
    selectedUnlicensedVehicleId,
    isProcessing,
    processingError,
  } = checkoutState;

  const {
    setActiveStep,
    selectTerm,
    selectPaymentMode,
    setLicensedVehicleId,
    setUnlicensedVehicleId,
  } = actions;

  const selectedTermRecord = academicTerms.find((term) => term.id === selectedTermId) ?? null;

  // Pricing
  const {
    planPricing,
    planPricingBusy,
    planPricingReady,
    recurringModePricing,
    fullModePricing,
  } = usePlanCheckoutPricing(plan?.id, selectedTermRecord?.id, activeStep >= 1);

  // Selected Vehicle & Summary
  const selectedLicensedVehicle = filteredVehicles.find((vehicle) => vehicle.id === selectedLicensedVehicleId);
  const selectedUnlicensedVehicle = filteredVehicles.find((vehicle) => vehicle.id === selectedUnlicensedVehicleId);
  const licensedVehicles = filteredVehicles.filter(v => Boolean((v as any)?.license_plate?.trim?.() || (v as any)?.license_plate));
  const unlicensedVehicles = filteredVehicles.filter(v => !Boolean((v as any)?.license_plate?.trim?.() || (v as any)?.license_plate));

  const recurringPlanId = recurringModePricing?.payment_plan_id ?? null;
  const fullPlanId = fullModePricing?.payment_plan_id ?? null;

  // Ready states
  const momoReady =
    Boolean(currentUser) &&
    Boolean(selectedTermRecord) &&
    Boolean(fullPlanId) &&
    (Boolean(selectedLicensedVehicle) || Boolean(selectedUnlicensedVehicle)) &&
    planPricingReady &&
    Boolean(fullModePricing);

  const { handleRecurringSetup, handleMomoCheckout } = useCheckoutPayment({
    plan,
    selectedTermRecord,
    selectedLicensedVehicle,
    selectedUnlicensedVehicle,
    recurringModePricing,
    fullModePricing,
    recurringPlanId,
    fullPlanId,
    currentUser,
    t,
    setProcessing: actions.setProcessing,
    setProcessingError: actions.setProcessingError,
  });

  // Validation Hook
  const { primaryDisabled, getPrimaryLabel } = useCheckoutValidation({
    state: checkoutState,
    plan,
    selectedVehicle: selectedLicensedVehicle || selectedUnlicensedVehicle,
    momoReady,
    isProcessing,
    checkoutSteps,
  });

  const handlePrimaryAction = async () => {
      if (!plan) return;

      if (activeStep < checkoutSteps.length - 1) {
        actions.setActiveStep(activeStep + 1);
        return;
      }

      if (selectedPaymentMode === payment_plan.RECURRING) {
        await handleRecurringSetup();
      } else if (selectedPaymentMode === payment_plan.ONE_TIME) {
        await handleMomoCheckout();
      }
    };

  const handleBackStep = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  return (
    <Box className="checkout-page-grid">
      <Box className="checkout-main-panel">
        <Box className="checkout-payment-panel">
          <Stepper activeStep={activeStep} className="checkout-stepper">
            {checkoutSteps.map((label, index) => (
              <Step
                key={label}
                completed={
                  (index === 0 && Boolean(selectedTermRecord)) ||
                  (index === 1 && Boolean(selectedPaymentMode)) ||
                  false
                }
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="checkout-step-content">
            {activeStep === 0 && (
              <VehicleStep
                licensedVehicles={licensedVehicles}
                unlicensedVehicles={unlicensedVehicles}
                selectedLicensedVehicleId={selectedLicensedVehicleId}
                selectedUnlicensedVehicleId={selectedUnlicensedVehicleId}
                setLicensedVehicleId={setLicensedVehicleId}
                setUnlicensedVehicleId={setUnlicensedVehicleId}
                handleOpenCreate={handleOpenCreate}
                t={t}
              />
            )}

            {activeStep === 1 && (
              <TermStep
                availableTermCards={availableTermCards}
                selectedTermId={selectedTermId}
                selectTerm={selectTerm}
                t={t}
              />
            )}

            {activeStep === 2 && (
              <PaymentModeStep
                plan={plan}
                paymentModes={paymentModes}
                selectedPaymentMode={selectedPaymentMode}
                selectPaymentMode={selectPaymentMode}
                planPricing={planPricing}
                recurringModePricing={recurringModePricing}
                fullModePricing={fullModePricing}
                planPricingBusy={planPricingBusy}
                t={t}
                formatCurrency={formatCurrency}
              />
            )}

            {activeStep === 3 && (
              <PaymentDetailStep
                selectedPaymentMode={selectedPaymentMode}
                t={t}
              />
            )}
          </Box>
        </Box>

        <CheckoutStepActions
          activeStep={activeStep}
          onBack={handleBackStep}
          onPrimary={handlePrimaryAction}
          disabled={primaryDisabled}
          label={getPrimaryLabel()}
          processingError={processingError}
        />

        <Typography variant="body2" className="checkout-rules">
          {t("plan.checkoutRules")}
        </Typography>
      </Box>

      <CheckoutSummaryPanel
        plan={plan}
        planTitle={planTitle}
        planSubtitle={planSubtitle}
        formatCurrency={formatCurrency}
        t={t}
      />

      <VehicleRegistrationModal open={registerModal.open} onClose={handleCloseModal} />
    </Box>
  );
}
