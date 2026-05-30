import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../auth/AuthContext";
import { languageOptions } from "../constant/languageOptions";
import { useUi } from "../ui/UiContext";
import type { AppStackParamList } from "../navigation/AppStack";
import { avatarText } from "../ultis/format";

const DRAWER_WIDTH = 320;

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function AppDrawer() {
  const navigation = useNavigation<Nav>();
  const { drawerOpen, closeDrawer } = useUi();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const [languageOpen, setLanguageOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const currentLanguage = useMemo(
    () =>
      languageOptions.find((item) => item.code === i18n.language) ??
      languageOptions[0],
    [i18n.language],
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: drawerOpen ? 0 : DRAWER_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start();

    if (!drawerOpen) {
      setLanguageOpen(false);
    }
  }, [drawerOpen, slideAnim]);

  const handleChangeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    setLanguageOpen(false);
  };

  const goToTab = (screen: string) => {
    closeDrawer();
    navigation.navigate('Tabs', { screen } as any);
  };

  const goToStack = (screen: keyof AppStackParamList) => {
    closeDrawer();
    navigation.navigate(screen as never);
  };

  const handleLogout = () => {
    closeDrawer();
    void signOut();
  };

  return (
    <Modal
      visible={drawerOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={closeDrawer} />

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t("drawer.title")}</Text>
              <Text style={styles.headerSubtitle}>{t("drawer.subtitle")}</Text>
            </View>

            <Pressable
              onPress={closeDrawer}
              hitSlop={10}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#0f172a" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.userCard}>
              {user ? (
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarText(user?.full_name)}</Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text numberOfLines={1} style={styles.userName}>
                      {user.full_name}
                    </Text>

                      <Text numberOfLines={1} style={styles.userCodeText}>
                        {user.user_code}
                      </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyUserBox}>
                  <Ionicons
                    name="person-circle-outline"
                    size={32}
                    color="#94a3b8"
                  />
                  <Text style={styles.muted}>{t("drawer.noUserInfo")}</Text>
                </View>
              )}
            </View>

            <DrawerSection title={t("drawer.quickAccess")}>
              <DrawerMenuItem
                icon="person-outline"
                title={t('tabs.profile')}
                subtitle={t('drawer.profileDesc')}
                onPress={() => goToTab('Profile')}
              />

              <DrawerMenuItem
                icon="reader-outline"
                title={t("profile.subscriptions")}
                subtitle={t("profile.subscriptionsDesc")}
                onPress={() => goToStack("UserSubscriptions")}
              />
            </DrawerSection>

            <DrawerSection title={t("drawer.language")}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  languageOpen && styles.languageButtonActive,
                ]}
                onPress={() => setLanguageOpen((prev) => !prev)}
                activeOpacity={0.85}
              >
                <View style={styles.languageCurrentLeft}>
                  <Image
                    source={{ uri: currentLanguage.flag }}
                    style={styles.flag}
                  />

                  <View>
                    <Text style={styles.languageLabel}>
                      {t("drawer.currentLanguage")}
                    </Text>
                    <Text style={styles.languageCurrentText}>
                      {currentLanguage.name}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name={languageOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>

              {languageOpen ? (
                <View style={styles.languageDropdown}>
                  {languageOptions.map((item) => {
                    const selected = item.code === currentLanguage.code;

                    return (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.languageItem,
                          selected && styles.languageItemActive,
                        ]}
                        onPress={() => void handleChangeLanguage(item.code)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: item.flag }}
                          style={styles.flag}
                        />

                        <Text
                          style={[
                            styles.languageItemText,
                            selected && styles.languageItemTextActive,
                          ]}
                        >
                          {item.name}
                        </Text>

                        {selected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#43B14B"
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </DrawerSection>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={18} color="#dc2626" />

              <View style={styles.logoutTextBox}>
                <Text style={styles.logoutButtonText}>
                  {t("profile.logout")}
                </Text>
                <Text style={styles.logoutDesc}>{t("profile.logoutDesc")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function DrawerMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>

      <View style={styles.menuTextBox}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 14,
    paddingBottom: 24,
  },

  userCard: {
    padding: 14,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 6,
    backgroundColor: "#43B14B",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  userCodeText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    lineHeight: 19,
  },
  emptyUserBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  muted: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "700",
    textAlign: "center",
  },

  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 9,
    paddingHorizontal: 2,
    fontSize: 12,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionBody: {
    gap: 10,
  },

  menuItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextBox: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  menuSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 17,
  },

  languageButton: {
    minHeight: 58,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageButtonActive: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  languageCurrentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  languageCurrentText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  languageDropdown: {
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  languageItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  languageItemActive: {
    backgroundColor: "#f0fdf4",
  },
  languageItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  languageItemTextActive: {
    color: "#15803d",
    fontWeight: "900",
  },
  flag: {
    width: 24,
    height: 17,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
  },

  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  logoutButton: {
    minHeight: 58,
    borderRadius: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  logoutTextBox: {
    flex: 1,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#dc2626",
  },
  logoutDesc: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
});
