import type { ReactNode } from 'react';

export type ResourceId =
  | 'users'
  | 'vehicles'
  | 'roles'
  | 'user_roles'
  | 'terms'
  | 'plans'
  | 'subscriptions'
  | 'parking_sessions'
  | 'invoices'
  | 'payment_transactions'
  | 'billing_event_logs';

export type ResourceRow = Record<string, unknown>;

export interface ColumnConfig {
  field: string;
  label: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (value: unknown, row: ResourceRow) => ReactNode;
}

export type InputType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'boolean'
  | 'date'
  | 'datetime-local'
  | 'textarea';

export interface FormField {
  field: string;
  label: string;
  type: InputType;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

export type SearchField = {
  field: string;
  label: string;
  type?: 'text' | 'number';
};

export interface ResourceConfig {
  id: ResourceId;
  label: string;
  translationKey?: string;
  endpoint: string;
  primaryKey: string;
  columns: ColumnConfig[];
  formFields: FormField[];
  searchFields: SearchField[];
  hasSoftDelete?: boolean;
  allowAdd?: boolean;
  allowUpdate?: boolean;
  allowDelete?: boolean;
  buildDeletePath?: (row: ResourceRow) => string;
  rowId?: (row: ResourceRow) => string;
}
