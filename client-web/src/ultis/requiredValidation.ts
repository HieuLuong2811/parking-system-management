import i18n from '../i18n';

export function getRequiredFields(form: HTMLFormElement) {
  return Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-required-first]')
  );
}

const ERROR_CLASS = 'input-error';

const getFieldLabel = (label?: string) => {
  if (label?.trim()) {
    return label.trim();
  }
  return i18n.t('validation.fieldFallback', { defaultValue: 'Field' });
};

function buildMessage(firstPart: string) {
  return i18n.t('validation.requiredField', {
    field: getFieldLabel(firstPart),
  });
}

function createErrorNode(message: string) {
  const node = document.createElement('span');
  node.className = 'required-error-msg';
  node.textContent = message;
  return node;
}

export function clearFieldError(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  field.classList.remove(ERROR_CLASS);
  const next = field.nextElementSibling;
  if (next && next.classList.contains('required-error-msg')) {
    next.remove();
  }
}

export function showFieldError(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const first = field.dataset.requiredFirst?.trim() ?? field.getAttribute('aria-label') ?? field.name;
  const message = buildMessage(first);
  field.classList.add(ERROR_CLASS);
  const existing = field.nextElementSibling;
  if (existing && existing.classList.contains('required-error-msg')) {
    existing.textContent = message;
    return;
  }
  field.insertAdjacentElement('afterend', createErrorNode(message));
}

export function validateRequiredFields(form: HTMLFormElement) {
  const fields = getRequiredFields(form);
  if (!fields.length) return true;
  let isValid = true;
  fields.forEach((field) => {
    clearFieldError(field);
    const value = field.value?.trim?.() ?? '';
    if (!value) {
      showFieldError(field);
      isValid = false;
    }
  });
  return isValid;
}
