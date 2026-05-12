export type PasswordRuleKey =
  | 'min'
  | 'max'
  | 'allowedChars'
  | 'hasUpper'
  | 'hasDigit'
  | 'hasSpecial'
  | 'hasLower';

export type PasswordRuleConfig = {
  min: number;
  max: number;
};

export const DEFAULT_PASSWORD_RULES: PasswordRuleConfig = {
  min: 8,
  max: 20,
};

// Allowed special charset (as per legacy checklist)
export const PASSWORD_ALLOWED_SPECIAL = '!@#$%^&*()-_=+[]{}?/|';
const escapeForCharClass = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const allowedRegex = new RegExp(`^[A-Za-z0-9${escapeForCharClass(PASSWORD_ALLOWED_SPECIAL)}]+$`);
const specialRegex = new RegExp(`[${escapeForCharClass(PASSWORD_ALLOWED_SPECIAL)}]`);

export const getPasswordRuleFailures = (
  password: string,
  rules: PasswordRuleConfig = DEFAULT_PASSWORD_RULES
): PasswordRuleKey[] => {
  const failures: PasswordRuleKey[] = [];

  if (password.length < rules.min) failures.push('min');
  if (password.length > rules.max) failures.push('max');
  if (password.length > 0 && !allowedRegex.test(password)) failures.push('allowedChars');
  if (!/[A-Z]/.test(password)) failures.push('hasUpper');
  if (!/\d/.test(password)) failures.push('hasDigit');
  if (!specialRegex.test(password)) failures.push('hasSpecial');
  if (!/[a-z]/.test(password)) failures.push('hasLower');

  return failures;
};

export const isPasswordValid = (
  password: string,
  rules: PasswordRuleConfig = DEFAULT_PASSWORD_RULES
) => getPasswordRuleFailures(password, rules).length === 0;

export const passwordRuleKeyToComplexityIndex = (ruleKey: PasswordRuleKey): number | null => {
  switch (ruleKey) {
    case 'allowedChars':
      return 0;
    case 'hasUpper':
      return 1;
    case 'hasDigit':
      return 2;
    case 'hasSpecial':
      return 3;
    case 'hasLower':
      return 5;
    default:
      return null;
  }
};
