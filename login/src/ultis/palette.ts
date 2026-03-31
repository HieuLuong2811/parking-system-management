const palette = {
  primary: '#0c5ed7',
  dark: '#0c1f4b',
  gradientStart: '#0d1b4a',
  gradientEnd: '#12214b',
  inputBorder: 'rgba(12, 23, 90, 0.25)',
  inputBackground: '#f5f7ff',
  error: '#d32f2f',
};

export function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--login-${key}`, String(value));
  });
}

export default palette;
