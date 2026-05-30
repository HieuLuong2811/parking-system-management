import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import ReportLostCardModal from "../component/ReportLostCardModal";
import { useAuth } from "../auth/AuthContext";
import {
  useMyParkingAccessCard,
  useReportMyParkingAccessCardLost,
} from "../api/parking_access_cards";
import { showAppToast } from "../ultis/toast";
import ListScreen from "../component/ListScreen";

const PRIMARY = "#2f9f3a";

export default function PresentCardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: card, isLoading } = useMyParkingAccessCard();

  const [reportLostModalVisible, setReportLostModalVisible] = useState(false);

  const reportLostMutation = useReportMyParkingAccessCardLost();

  const canReportLost = Boolean(card && card.status !== "LOST");

  const handleOpenReportLostModal = () => {
    if (!canReportLost) return;

    setReportLostModalVisible(true);
  };

  const handleCloseReportLostModal = () => {
    if (isLoading) return;

    setReportLostModalVisible(false);
  };

  const handleConfirmReportLost = async () => {
    if (!card || isLoading) return;

    try {
      await reportLostMutation.mutateAsync(card.id);
      setReportLostModalVisible(false);
      showAppToast(t("presentCard.reportLostSuccess"), "success");
    } catch (error) {
      console.error("Failed to report lost card:", error);
      showAppToast(t("presentCard.reportLostFailed"), "error");
    }
  };

  const barcodeToken = useMemo(() => {
    return card?.barcode_token?.trim().toUpperCase() || "";
  }, [card?.barcode_token]);

  const barcodeImageUrl = useMemo(() => {
    if (!barcodeToken) return null;

    console.log("barcodeToken", barcodeToken);

    const token = encodeURIComponent(barcodeToken);

    return (
      `https://bwipjs-api.metafloor.com/` +
      `?bcid=code128` +
      `&text=${token}` +
      `&scale=4` +
      `&height=14` +
      `&includetext=false` +
      `&paddingwidth=28` +
      `&paddingheight=8`
    );
  }, [barcodeToken]);

  return (
    <ListScreen
      title={t("presentCard.title")}
      subtitle={t("presentCard.subtitle")}
      hiddenHeader={false}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.cardWrapper}>
          <View style={styles.studentCard}>
            <LinearGradient
              colors={["#43B14B", "#31963a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.schoolHeader}
            >
              <View style={styles.logoBox}>
                <Image
                  source={require("../../assets/Logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>
                  {t("presentCard.schoolName")}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.cardTitleBox}>
              <Text style={styles.cardTitle}>THẺ GỬI XE SINH VIÊN</Text>
            </View>

            {isLoading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.stateText}>{t("presentCard.loading")}</Text>
              </View>
            ) : !user ? (
              <View style={styles.stateBox}>
                <Text style={styles.empty}>{t("presentCard.noUser")}</Text>
              </View>
            ) : !card ? (
              <View style={styles.stateBox}>
                <Text style={styles.empty}>{t("presentCard.noCard")}</Text>
              </View>
            ) : (
              <View style={styles.cardBody}>
                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Họ tên sinh viên:</Text>
                    <Text style={styles.value}>{user.full_name || "—"}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Mã sinh viên:</Text>
                    <Text style={styles.value}>{user.user_code || "—"}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.barcodeSection}>
                  <View style={styles.barcodeFrame}>
                    {barcodeImageUrl ? (
                      <Image
                        source={{ uri: barcodeImageUrl }}
                        style={styles.barcode}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.empty}>
                        {t("presentCard.noBarcode")}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.barcodeToken}>{barcodeToken}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            Qua định sử dụng thẻ gửi xe sinh viên
          </Text>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>1</Text>
            <Text style={styles.warningText}>
              {t("presentCard.warning.rule1")}
            </Text>
          </View>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>2</Text>
            <Text style={styles.warningText}>
              {t("presentCard.warning.rule2")}
            </Text>
          </View>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>3</Text>
            <Text style={styles.warningText}>
              {t("presentCard.warning.rule3")}
            </Text>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {t("presentCard.warning.rule4")}
            </Text>
          </View>
        </View>

        <View style={styles.actionBox}>
          <Pressable
            style={({ pressed }) => [
              styles.reportLostButton,
              !canReportLost && styles.reportLostButtonDisabled,
              pressed && canReportLost && styles.reportLostButtonPressed,
            ]}
            onPress={handleOpenReportLostModal}
            disabled={!canReportLost || isLoading}
          >
            <Text style={styles.reportLostButtonText}>
              {card?.status === "LOST"
                ? "Thẻ đã được báo mất"
                : "Thông báo mất thẻ"}
            </Text>
          </Pressable>

          <Text style={styles.reportLostHint}>
            Chỉ sử dụng khi bạn nghi ngờ thẻ bị gửi xe bị mất.
          </Text>
        </View>

        <ReportLostCardModal
          visible={reportLostModalVisible}
          isSubmitting={reportLostMutation.isPending}
          onClose={handleCloseReportLostModal}
          onConfirm={handleConfirmReportLost}
        />
      </ScrollView>
    </ListScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f7f4",
  },

  content: {
    paddingBottom: 28,
  },

  cardWrapper: {
    marginBottom: 18,
  },

  studentCard: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe7dd",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  schoolHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomColor: "#d12121",
    borderBottomWidth: 2,
  },

  logoBox: {
    width: 50,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  logoImage: {
    width: "100%",
    height: "100%",
  },

  schoolInfo: {
    flex: 1,
  },

  schoolName: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "800",
    color: "#ffffff",
    textTransform: "uppercase",
    textAlign: "right",
  },

  cardTitleBox: {
    paddingTop: 12,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    color: "#d12121",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  infoBlock: {
    gap: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  label: {
    width: 128,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: "#111827",
  },

  value: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: "#000000",
    textTransform: "uppercase",
  },

  divider: {
    height: 1,
    backgroundColor: "#dbe7dd",
    marginTop: 16,
  },

  barcodeSection: {
    alignItems: "center",
    paddingBottom: 18,
  },

  barcodeFrame: {
    width: "100%",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  barcode: {
    width: "100%",
    height: 70,
  },

  barcodeToken: {
    marginTop: -10,
    fontSize: 13,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },

  stateBox: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },

  stateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },

  empty: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textAlign: "center",
  },

  footer: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe7dd",
    padding: 16,
  },

  footerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },

  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e8f7ea",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "900",
    color: PRIMARY,
    marginRight: 10,
  },

  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#334155",
  },

  noticeBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#9a3412",
    textAlign: "justify",
  },

  actionBox: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fee2e2",
    padding: 14,
  },

  reportLostButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },

  reportLostButtonPressed: {
    opacity: 0.82,
  },

  reportLostButtonDisabled: {
    backgroundColor: "#94a3b8",
  },

  reportLostButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  reportLostHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },
});
