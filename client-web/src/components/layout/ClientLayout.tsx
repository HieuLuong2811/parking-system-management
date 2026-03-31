import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';
import { useEffect } from 'react';
import { validateRequiredFields, clearFieldError } from '../../ultis/requiredValidation';

export default function ClientLayout() {
  useEffect(() => {
    const handleSubmit = (event: Event) => {
      const target = event.target as HTMLFormElement;
      if (!(target instanceof HTMLFormElement)) return;
      if (!target.querySelector('[data-required-first]')) return;
      if (!validateRequiredFields(target)) {
        event.preventDefault();
        target.querySelector('[data-required-first].input-error')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleInput = (event: Event) => {
      const field = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
        return;
      }
      if (!field.dataset.requiredFirst) return;
      if (field.value.trim()) {
        clearFieldError(field);
      }
    };

    document.addEventListener('submit', handleSubmit, true);
    document.addEventListener('input', handleInput, true);

    return () => {
      document.removeEventListener('submit', handleSubmit, true);
      document.removeEventListener('input', handleInput, true);
    };
  }, []);

  return (
    <Box className="client-shell">
      <Navbar />

      <Box className="client-body">
        <Box className="client-content">
          <Outlet />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
