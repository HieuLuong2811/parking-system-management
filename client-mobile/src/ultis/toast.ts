import Toast from 'react-native-root-toast';

type ToastType = 'success' | 'error' | 'info';

const getToastBackground = (type: ToastType) => {
  if (type === 'success') return '#16a34a';
  if (type === 'error') return '#dc2626';
  return '#0f172a';
};

export const showAppToast = (
  message: string,
  type: ToastType = 'info'
) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: 10,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: getToastBackground(type),
    textColor: '#ffffff',
    opacity: 1,
    containerStyle: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignSelf: 'center',
    },
    textStyle: {
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
};