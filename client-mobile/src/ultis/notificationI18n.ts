import type { TFunction } from 'i18next';
import type { Notification } from '../api/clientApi';

function extractInvoiceId(text: string) {
  const m = text.match(/invoice\s+([0-9a-fA-F-]{6,})/i);
  return m?.[1] ?? undefined;
}

function extractAmount(text: string) {
  const m = text.match(/amount\s+([0-9]+(?:\.[0-9]+)?)/i);
  return m?.[1] ?? undefined;
}

export function localizeNotification(n: Notification, t: TFunction) {
  const title = String(n.title || '').trim();
  const content = String(n.content || '').trim();

  // Stable title keys (preferred)
  if (title === 'TOP_UP_SUCCESS' || title === 'TOP_UP_FAILED') {
    const invoiceId = extractInvoiceId(content);
    const amount = extractAmount(content);
    const amountPart = amount ? ` (+${amount})` : '';
    return {
      title: t('notifications.topUp.title', { defaultValue: 'Top up' }),
      content:
        title === 'TOP_UP_SUCCESS'
          ? t('notifications.topUp.success', {
              defaultValue: 'Top up successful{{amountPart}}{{invoicePart}}.',
              amountPart,
              invoicePart: invoiceId ? ` (${invoiceId})` : '',
            })
          : t('notifications.topUp.failed', {
              defaultValue: 'Top up failed{{invoicePart}}.',
              invoicePart: invoiceId ? ` (${invoiceId})` : '',
            }),
    };
  }

  if (title === 'SUBSCRIPTION_PAYMENT_SUCCESS' || title === 'SUBSCRIPTION_PAYMENT_PENDING' || title === 'SUBSCRIPTION_PAYMENT_FAILED') {
    const invoiceId = extractInvoiceId(content);
    const invoicePart = invoiceId ? ` (${invoiceId})` : '';
    const key =
      title === 'SUBSCRIPTION_PAYMENT_SUCCESS'
        ? 'success'
        : title === 'SUBSCRIPTION_PAYMENT_PENDING'
          ? 'pending'
          : 'failed';
    return {
      title: t('notifications.subscription.title', { defaultValue: 'Subscription' }),
      content: t(`notifications.subscription.${key}`, {
        defaultValue: 'Subscription update{{invoicePart}}.',
        invoicePart,
      }),
    };
  }

  // Payment success (EN)
  if (title.toLowerCase() === 'payment successful') {
    const invoiceId = extractInvoiceId(content);
    return {
      title: t('notifications.payment.title', { defaultValue: 'Payment' }),
      content: t('notifications.payment.success', {
        defaultValue: 'Payment successful{{invoicePart}}.',
        invoicePart: invoiceId ? ` (${invoiceId})` : '',
      }),
    };
  }

  // Payment invoice (VI)
  if (title.toLowerCase().includes('thanh toán hóa đơn') || title.toLowerCase().includes('thanh to')) {
    const invoiceId = extractInvoiceId(content);
    const normalized = content.toLowerCase();
    if (normalized.includes('thành công') || normalized.includes('paid successfully')) {
      return {
        title: t('notifications.payment.title', { defaultValue: 'Payment' }),
        content: t('notifications.payment.success', {
          defaultValue: 'Payment successful{{invoicePart}}.',
          invoicePart: invoiceId ? ` (${invoiceId})` : '',
        }),
      };
    }
    return {
      title: t('notifications.payment.title', { defaultValue: 'Payment' }),
      content: t('notifications.payment.failed', {
        defaultValue: 'Payment failed{{invoicePart}}.',
        invoicePart: invoiceId ? ` (${invoiceId})` : '',
      }),
    };
  }

  return { title, content };
}
