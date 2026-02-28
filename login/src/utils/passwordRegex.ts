export const passwordRegex = {
  allowedChars: /^[A-Za-z0-9!@#$%^&*()\-_=+\[\]{}?/|]+$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digits: /\d/,
  special: /[!@#$%^&*()\-_=+\[\]{}?/|]/,
  specialOnly: /^[!@#$%^&*()\-_=+\[\]{}?/|]+$/,
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isPasswordComplex = (password: string) => {
  const { allowedChars, uppercase, lowercase, digits, special, specialOnly } = passwordRegex;
  if (!password) {
    return false;
  }
  if (!allowedChars.test(password)) {
    return false;
  }
  if (
    !uppercase.test(password) ||
    !lowercase.test(password) ||
    !digits.test(password) ||
    !special.test(password)
  ) {
    return false;
  }

  const strippedSpecials = password.replace(/[A-Za-z0-9]/g, '');
  if (strippedSpecials && !specialOnly.test(strippedSpecials)) {
    return false;
  }

  if (password.length < 8 || password.length > 40) {
    return false;
  }

  return true;
};
