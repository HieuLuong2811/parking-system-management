import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenShell from '../component/ScreenShell';
import { useAuth } from '../auth/AuthContext';
import { useMyParkingAccessCard } from '../api/parking_access_cards';

const PRIMARY = '#43B14B';

export default function PresentCardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: card, isLoading } = useMyParkingAccessCard();

  const barcodeImageUrl = useMemo(() => {
    if (!card?.barcode_token) return null;
    const token = encodeURIComponent(card.barcode_token);

    return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${token}&scale=4&height=18&includetext=false`;
  }, [card?.barcode_token]);

  return (
    <ScreenShell>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Xuất trình thẻ gửi xe</Text>
          <Text style={styles.subtitle}>
            Sử dụng mã thẻ điện tử để định danh khi ra / vào bãi gửi xe của trường.
          </Text>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          <View style={styles.card}>
            <LinearGradient
              colors={['#5ecb65', '#43B14B', '#31963a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeader}
            >
              <View style={styles.logo}>
                <Image
                  source={require('../../assets/Logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.schoolTextBox}>
                <Text style={styles.schoolName}>
                  {t('presentCard.schoolName')}
                </Text>
                <Text style={styles.cardType}>THẺ GỬI XE SINH VIÊN</Text>
              </View>
            </LinearGradient>

            {isLoading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.stateText}>Đang tải thông tin thẻ...</Text>
              </View>
            ) : !user ? (
              <View style={styles.stateBox}>
                <Text style={styles.empty}>{t('presentCard.noUser')}</Text>
              </View>
            ) : !card ? (
              <View style={styles.stateBox}>
                <Text style={styles.empty}>{t('presentCard.noCard')}</Text>
              </View>
            ) : (
              <>
                <View style={styles.infoSection}>
                  <View style={styles.row}>
                    <Text style={styles.label}>{t('presentCard.fullName')}</Text>
                    <Text style={styles.value}>{user.full_name || '—'}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>{t('presentCard.userCode')}</Text>
                    <Text style={styles.value}>{user.user_code}</Text>
                  </View>
                </View>

                <View style={styles.barcodeBox}>
                  {barcodeImageUrl ? (
                    <Image
                      source={{ uri: barcodeImageUrl }}
                      style={styles.barcode}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.empty}>{t('presentCard.noBarcode')}</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Lưu ý sử dụng thẻ</Text>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>1</Text>
            <Text style={styles.warningText}>
              Thẻ gửi xe sinh viên có giá trị trong thời gian sinh viên học tập tại trường.
            </Text>
          </View>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>2</Text>
            <Text style={styles.warningText}>
              Thẻ gửi xe sinh viên được dùng để định danh sinh viên khi gửi xe trong khuôn viên trường.
            </Text>
          </View>

          <View style={styles.warningItem}>
            <Text style={styles.bullet}>3</Text>
            <Text style={styles.warningText}>
              Sinh viên không được cho mượn, tẩy xoá hoặc tự ý chỉnh sửa thông tin thẻ.
            </Text>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Trường hợp bị mất hoặc hỏng thẻ, sinh viên cần liên hệ ngay với phòng Công tác sinh viên qua Bộ phận một cửa để được hỗ trợ cấp lại.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f7f4',
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  pageHeader: {
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#64748b',
  },

  body: {
    marginBottom: 18,
  },

  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7dd',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginRight: 12,
  },

  logoImage: {
    width: '100%',
    height: '100%',
  },

  schoolTextBox: {
    flex: 1,
  },

  schoolName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
  },

  cardType: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '800',
    color: '#eaffec',
    letterSpacing: 0.6,
  },

  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  label: {
    width: 140,
    fontSize: 13,
    fontWeight: '600',
  },

  value: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },

  barcodeBox: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbe7dd',
    alignItems: 'center',
  },

  barcode: {
    width: '100%',
    height: 120,
  },

  stateBox: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },

  stateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },

  empty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },

  footer: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7dd',
    padding: 16,
  },

  footerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },

  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f7ea',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '900',
    color: PRIMARY,
    marginRight: 10,
  },

  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#334155',
  },

  noticeBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: '#9a3412',
  },
});