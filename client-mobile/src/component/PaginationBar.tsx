import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PaginationBarProps = {
  page: number;
  limit: number;
  total: number;
  onChangePage: (nextPage: number) => void;
};

export default function PaginationBar({ page, limit, total, onChangePage }: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.button, !canPrev && styles.buttonDisabled]}
        disabled={!canPrev}
        onPress={() => onChangePage(page - 1)}
      >
        <Text style={styles.buttonText}>Prev</Text>
      </Pressable>

      <Text style={styles.pageText}>
        {page}/{totalPages}
      </Text>

      <Pressable
        style={[styles.button, !canNext && styles.buttonDisabled]}
        disabled={!canNext}
        onPress={() => onChangePage(page + 1)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  pageText: {
    color: '#334155',
    fontWeight: '800',
  },
});

