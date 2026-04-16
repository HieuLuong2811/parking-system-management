import { useEffect, useMemo, useReducer } from 'react';
import type { VehicleInfo } from '../../../api/clientApi';
import { AcademicTermOption, PaymentModeId } from '../types';

export type CheckoutState = {
  activeStep: number;
  selectedTermId: string;
  selectedPaymentMode: PaymentModeId | null;
  cardComplete: boolean;
  cardError: string | null;
  selectedVehicleId: string;
  isProcessing: boolean;
  processingError: string | null;
};

export type CheckoutActions = {
  setActiveStep: (step: number) => void;
  selectTerm: (termId: string) => void;
  selectPaymentMode: (paymentMode: PaymentModeId | null) => void;
  setVehicleId: (vehicleId: string) => void;
  setCardComplete: (complete: boolean) => void;
  setCardError: (message: string | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProcessingError: (error: string | null) => void;
};

type CheckoutAction =
  | { type: 'reset' }
  | { type: 'setActiveStep'; payload: number }
  | { type: 'selectTerm'; payload: string }
  | { type: 'setPaymentMode'; payload: PaymentModeId | null }
  | { type: 'setVehicleId'; payload: string }
  | { type: 'setCardComplete'; payload: boolean }
  | { type: 'setCardError'; payload: string | null }
  | { type: 'setProcessing'; payload: boolean }
  | { type: 'setProcessingError'; payload: string | null };

const createInitialState = (): CheckoutState => ({
  activeStep: 0,
  selectedTermId: '',
  selectedPaymentMode: null,
  cardComplete: false,
  cardError: null,
  selectedVehicleId: '',
  isProcessing: false,
  processingError: null,
});

const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
  switch (action.type) {
    case 'reset':
      return createInitialState();
    case 'setActiveStep':
      return { ...state, activeStep: Math.max(0, action.payload) };
    case 'selectTerm':
      if (state.selectedTermId === action.payload) {
        return state;
      }
      return {
        ...state,
        selectedTermId: action.payload,
        selectedPaymentMode: null,
        cardComplete: false,
        cardError: null,
        processingError: null,
        isProcessing: false,
      };
    case 'setPaymentMode':
      return {
        ...state,
        selectedPaymentMode: action.payload,
      };
    case 'setVehicleId':
      return {
        ...state,
        selectedVehicleId: action.payload,
      };
    case 'setCardComplete':
      return {
        ...state,
        cardComplete: action.payload,
      };
    case 'setCardError':
      return {
        ...state,
        cardError: action.payload,
      };
    case 'setProcessing':
      return {
        ...state,
        isProcessing: action.payload,
      };
    case 'setProcessingError':
      return {
        ...state,
        processingError: action.payload,
      };
    default:
      return state;
  }
};

export const useCheckoutState = (
  planId: string | undefined,
  academicTermOptions: AcademicTermOption[],
  vehicles: VehicleInfo[]
) => {
  const [state, dispatch] = useReducer(checkoutReducer, undefined, createInitialState);

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [planId]);

  useEffect(() => {
    if (!state.selectedTermId && academicTermOptions.length > 0) {
      dispatch({ type: 'selectTerm', payload: academicTermOptions[0].id });
    }
  }, [academicTermOptions, state.selectedTermId]);

  useEffect(() => {
    if (!state.selectedVehicleId && vehicles.length > 0) {
      dispatch({ type: 'setVehicleId', payload: vehicles[0].id });
    }
  }, [state.selectedVehicleId, vehicles]);

  const actions = useMemo<CheckoutActions>(
    () => ({
      setActiveStep: (payload) => dispatch({ type: 'setActiveStep', payload }),
      selectTerm: (payload) => dispatch({ type: 'selectTerm', payload }),
      selectPaymentMode: (payload) => dispatch({ type: 'setPaymentMode', payload }),
      setVehicleId: (payload) => dispatch({ type: 'setVehicleId', payload }),
      setCardComplete: (payload) => dispatch({ type: 'setCardComplete', payload }),
      setCardError: (payload) => dispatch({ type: 'setCardError', payload }),
      setProcessing: (payload) => dispatch({ type: 'setProcessing', payload }),
      setProcessingError: (payload) => dispatch({ type: 'setProcessingError', payload }),
    }),
    []
  );

  return { state, actions };
};
