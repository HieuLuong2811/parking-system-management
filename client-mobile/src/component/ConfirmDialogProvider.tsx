import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type ConfirmOptions = {
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);
    setVisible(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const closeWithResult = (result: boolean) => {
    setVisible(false);

    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const isDanger = Boolean(options.danger);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => closeWithResult(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => closeWithResult(false)}
          />

          <View style={styles.dialog}>
            <View
              style={[
                styles.iconBox,
                isDanger ? styles.iconBoxDanger : styles.iconBoxInfo,
              ]}
            >
              <Ionicons
                name={isDanger ? 'warning-outline' : 'information-circle-outline'}
                size={24}
                color={isDanger ? '#dc2626' : '#2563eb'}
              />
            </View>

            <Text style={styles.title}>{options.title}</Text>

            <Text style={styles.message}>{options.message}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => closeWithResult(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>
                  {options.cancelText || 'Hủy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isDanger ? styles.confirmButtonDanger : styles.confirmButtonPrimary,
                ]}
                onPress={() => closeWithResult(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>
                  {options.confirmText || 'Tiếp tục'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error('useConfirmDialog must be used inside ConfirmDialogProvider');
  }

  return context.confirm;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconBoxDanger: {
    backgroundColor: '#fee2e2',
  },
  iconBoxInfo: {
    backgroundColor: '#eff6ff',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 24,
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 22,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    height: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  confirmButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonPrimary: {
    backgroundColor: '#43B14B',
  },
  confirmButtonDanger: {
    backgroundColor: '#dc2626',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});