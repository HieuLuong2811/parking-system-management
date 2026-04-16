import { Box, Typography } from '@mui/material';
import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const FETCH_ENTER_DELAY = 120;
const MIN_VISIBLE_DURATION = 250;
const FETCH_EXIT_DELAY = 180;

export default function QueryLoadingOverlay() {
  const activeFetches = useIsFetching();
  const [visible, setVisible] = useState(false);
  const entryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeFetches > 0) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (!visible && !entryTimerRef.current) {
        entryTimerRef.current = setTimeout(() => {
          setVisible(true);
          showStartRef.current = Date.now();
          entryTimerRef.current = null;
        }, FETCH_ENTER_DELAY);
      }
      return () => {
        if (entryTimerRef.current) {
          clearTimeout(entryTimerRef.current);
          entryTimerRef.current = null;
        }
      };
    }

    if (visible) {
      if (entryTimerRef.current) {
        clearTimeout(entryTimerRef.current);
        entryTimerRef.current = null;
      }
      const elapsed = showStartRef.current ? Date.now() - showStartRef.current : 0;
      const remaining = Math.max(MIN_VISIBLE_DURATION - elapsed, 0);
      exitTimerRef.current = setTimeout(() => {
        setVisible(false);
        showStartRef.current = null;
      }, remaining + FETCH_EXIT_DELAY);
    }

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [activeFetches, visible]);

  if (!visible) return null;

  return (
    <Box className="query-loading-overlay">
      <Box className="query-loading-content">
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
          Loading
        </Typography>
        <Box className="query-loading-bars" aria-hidden>
          <span className="query-loading-bar" />
          <span className="query-loading-bar short" />
          <span className="query-loading-bar" />
        </Box>
      </Box>
    </Box>
  );
}
