import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ReportLostCardModalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ReportLostCardModal({
  visible,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ReportLostCardModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>!</Text>
          </View>

          <Text style={styles.title}>Xác nhận báo mất thẻ</Text>

          <Text style={styles.description}>
            Sau khi xác nhận mất thẻ, thẻ gửi xe sẽ được khoá tạm thời và sẽ được thông báo cho quản trị viên.
          </Text>

          <View style={styles.guideBox}>
            <Text style={styles.guideText}>
              Hãy liên hệ ngay với phòng công tác sinh viên qua Bộ phận một cửa
              để xác minh thông tin và được hỗ trợ cấp lại thẻ.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Trong thời gian thẻ bị khoá, bạn có thể không sử dụng được thẻ này
              để ra/vào bãi gửi xe.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && !isSubmitting && styles.pressed,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Để sau</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && !isSubmitting && styles.pressed,
                isSubmitting && styles.disabledConfirmButton,
              ]}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Xác nhận mất thẻ
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 20,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  iconText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#dc2626",
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginBottom: 12,
  },

  guideBox: {
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10,
  },

  guideText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#334155",
    textAlign: "justify",
  },

  warningBox: {
    borderRadius: 14,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    padding: 12,
    marginBottom: 16,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#9a3412",
    textAlign: "justify",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#334155",
  },

  confirmButton: {
    flex: 1.35,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },

  confirmButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },

  pressed: {
    opacity: 0.82,
  },

  disabledButton: {
    opacity: 0.6,
  },

  disabledConfirmButton: {
    backgroundColor: "#ef4444",
    opacity: 0.75,
  },
});