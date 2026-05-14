import { useEffect, useMemo, useReducer } from 'react';
import { AcademicTermOption, PaymentModeId } from '../types';

export type CheckoutState = {
  activeStep: number;
  selectedTermId: string;
  selectedPaymentMode: PaymentModeId | null;
  selectedFullPaymentMethod: 'WALLET' | 'MOMO' | null;
  cardComplete: boolean;
  cardError: string | null;
  isProcessing: boolean;
  processingError: string | null;
};

export type CheckoutActions = {
  setActiveStep: (step: number) => void;
  selectTerm: (termId: string) => void;
  selectPaymentMode: (paymentMode: PaymentModeId | null) => void;
  selectFullPaymentMethod: (method: 'WALLET' | 'MOMO' | null) => void;
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
  | { type: 'setFullPaymentMethod'; payload: 'WALLET' | 'MOMO' | null }
  | { type: 'setCardComplete'; payload: boolean }
  | { type: 'setCardError'; payload: string | null }
  | { type: 'setProcessing'; payload: boolean }
  | { type: 'setProcessingError'; payload: string | null };

const createInitialState = (): CheckoutState => ({
  activeStep: 0,
  selectedTermId: '',
  selectedPaymentMode: null,
  selectedFullPaymentMethod: null,
  cardComplete: false,
  cardError: null,
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
        selectedFullPaymentMethod: action.payload ? 'MOMO' : null,
      };
    case 'setFullPaymentMethod':
      return {
        ...state,
        selectedFullPaymentMethod: action.payload,
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

  const actions = useMemo<CheckoutActions>(
    () => ({
      setActiveStep: (payload) => dispatch({ type: 'setActiveStep', payload }),
      selectTerm: (payload) => dispatch({ type: 'selectTerm', payload }),
      selectPaymentMode: (payload) => dispatch({ type: 'setPaymentMode', payload }),
      selectFullPaymentMethod: (payload) => dispatch({ type: 'setFullPaymentMethod', payload }),
      setCardComplete: (payload) => dispatch({ type: 'setCardComplete', payload }),
      setCardError: (payload) => dispatch({ type: 'setCardError', payload }),
      setProcessing: (payload) => dispatch({ type: 'setProcessing', payload }),
      setProcessingError: (payload) => dispatch({ type: 'setProcessingError', payload }),
    }),
    []
  );

  return { state, actions };
};
