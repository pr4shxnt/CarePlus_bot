import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { ArrowLeft, User, FileText, Smartphone, Activity, Pill, Smile, MessageSquare } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const FULL_WIDTH = width - 40;
const HALF_WIDTH = (width - 55) / 2;

export const PatientDetail = ({ route, navigation }: any) => {
  const { patient } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.secondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bentoGrid}>
          {/* Profile Bento Block */}
          <View style={[styles.bentoCard, styles.profileCard]}>
            <View style={styles.avatarLarge}>
              <User color={Colors.white} size={40} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.meta}>Psych-Monitoring • Age: {patient.age}</Text>
              <View style={[styles.conditionTag, { backgroundColor: Colors.softGold }]}>
                <Text style={[styles.conditionText, { color: Colors.secondary }]}>
                  {patient.mood || 'Stable'} Mood
                </Text>
              </View>
            </View>
          </View>

          {/* Vitals Summary Row - Mood, Med, Lonely */}
          <View style={styles.row}>
            <View style={[styles.bentoCard, styles.vitalSmall, { width: HALF_WIDTH }]}>
              <Smile color={Colors.secondary} size={20} />
              <Text style={styles.vitalVal}>Good</Text>
              <Text style={styles.vitalLab}>Current Mood</Text>
            </View>
            <View style={[styles.bentoCard, styles.vitalSmall, { width: HALF_WIDTH, backgroundColor: Colors.gold }]}>
              <MessageSquare color={Colors.secondary} size={20} />
              <Text style={styles.vitalVal}>12%</Text>
              <Text style={styles.vitalLab}>% Lonely</Text>
            </View>
          </View>

          {/* Psychology Analysis Wide Block */}
          <TouchableOpacity 
            style={[styles.bentoCard, styles.reportWide]}
            onPress={() => navigation.navigate('ReportScreen', { patient })}
          >
            <View style={styles.reportIconBox}>
              <Activity color={Colors.secondary} size={24} />
            </View>
            <View style={styles.reportMain}>
              <Text style={styles.reportTitle}>Psych-Sentiment Analysis</Text>
              <Text style={styles.reportSub}>Last interaction: Today, 8:45 AM</Text>
            </View>
            <Text style={styles.reviewBtn}>View</Text>
          </TouchableOpacity>

          {/* Prescriptions Section */}
          <View style={[styles.bentoCard, { width: FULL_WIDTH }]}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Medication Schedule</Text>
              <Pill color={Colors.primary} size={20} />
            </View>
            <View style={styles.medItem}>
              <View style={styles.medBullet} />
              <Text style={styles.medName}>Metformin <Text style={styles.medDose}>500mg</Text></Text>
              <Text style={styles.medFreq}>8:00 AM</Text>
            </View>
            <View style={styles.medItem}>
              <View style={[styles.medBullet, { backgroundColor: Colors.gold }]} />
              <Text style={styles.medName}>Atorvastatin <Text style={styles.medDose}>20mg</Text></Text>
              <Text style={styles.medFreq}>10:00 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const CriticalScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft color={Colors.secondary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>High Isolation</Text>
      <View style={styles.headerSpacer} />
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.bentoGrid}>
        <TouchableOpacity 
          style={[styles.bentoCard, styles.criticalItem]}
          onPress={() => navigation.navigate('PatientDetail', { patient: { id: '2', name: 'Shyam Thapa', age: 65, condition: 'Critical', mood: 'Lonely' } })}
        >
          <View style={styles.criticalHeader}>
            <Text style={styles.criticalName}>Shyam Thapa</Text>
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>High Lonely %</Text>
            </View>
          </View>
          <View style={styles.criticalMetrics}>
            <View style={styles.critMetric}>
              <MessageSquare color={Colors.danger} size={18} />
              <Text style={styles.critVal}>45% Lonely</Text>
            </View>
            <View style={styles.critMetric}>
              <Smile color={Colors.gray} size={18} />
              <Text style={styles.critVal}>Mood: Low</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);

export const ReportScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft color={Colors.secondary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>CarePlus Insight</Text>
      <View style={styles.headerSpacer} />
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.bentoGrid}>
        <View style={styles.reportHeaderBlock}>
          <Text style={styles.reportDay}>Wednesday</Text>
          <Text style={styles.reportDate}>May 20, 2026</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.bentoCard, { width: HALF_WIDTH, height: 180 }]}>
            <Smile color={Colors.primary} size={30} />
            <Text style={styles.insightTitle}>Mood Score</Text>
            <Text style={styles.insightVal}>85/100</Text>
            <Text style={styles.insightDesc}>High positive sentiment detected.</Text>
          </View>
          <View style={[styles.bentoCard, { width: HALF_WIDTH, height: 180, backgroundColor: Colors.gold }]}>
            <MessageSquare color={Colors.secondary} size={30} />
            <Text style={[styles.insightTitle, { color: 'rgba(25, 52, 61, 0.6)' }]}>Loneliness</Text>
            <Text style={[styles.insightVal, { color: Colors.secondary }]}>12%</Text>
            <Text style={[styles.insightDesc, { color: 'rgba(25, 52, 61, 0.6)' }]}>Minimal signs of isolation.</Text>
          </View>
        </View>

        <View style={[styles.bentoCard, { width: FULL_WIDTH }]}>
          <Text style={styles.sectionTitle}>Medication Adherence</Text>
          <View style={styles.complianceRow}>
            <View style={styles.compCircle}>
              <Text style={styles.compPerc}>100%</Text>
            </View>
            <View style={styles.compInfo}>
              <Text style={styles.compTitle}>Perfect Adherence</Text>
              <Text style={styles.compSub}>Last Dose: 8:45 AM (On-time)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Approve Psych-Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);

export const ConnectDevice = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft color={Colors.secondary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Bot Link</Text>
      <View style={styles.headerSpacer} />
    </View>
    <View style={[styles.bentoGrid, styles.centerContent, { flex: 1 }]}>
      <View style={styles.radarContainer}>
        <View style={styles.radarRing1} />
        <View style={styles.radarRing2} />
        <Smartphone color={Colors.primary} size={48} />
      </View>
      <Text style={styles.searchTxt}>Scanning for nearby CarePlus Bot...</Text>
      <TouchableOpacity style={styles.connectPrimaryBtn}>
        <Text style={styles.connectBtnTxt}>Link via Bluetooth</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

export const ProfileScreen = ({ navigation, role }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft color={Colors.secondary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Account</Text>
      <View style={styles.headerSpacer} />
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, styles.profileHeader]}>
          <View style={styles.largeAvatarBox}>
            <User color={Colors.white} size={50} />
          </View>
          <Text style={styles.profileName}>{role === 'doctor' ? 'Dr. Smith' : 'Careplus Guardian'}</Text>
          <Text style={styles.profileRole}>{role === 'doctor' ? 'Chief Psychologist' : 'Verified Caregiver'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBento} onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutBentoText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { backgroundColor: Colors.white, padding: 8, borderRadius: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: '900', color: Colors.secondary },
  headerSpacer: { width: 40 },
  scrollContent: { paddingBottom: 130 },
  bentoGrid: { paddingHorizontal: 20, gap: 15 },
  bentoCard: { borderRadius: 30, backgroundColor: Colors.white, padding: 20, elevation: 3, shadowColor: Colors.black, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  row: { flexDirection: 'row', gap: 15 },
  profileCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 25 },
  avatarLarge: { width: 70, height: 70, borderRadius: 25, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '900', color: Colors.secondary },
  meta: { fontSize: 12, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  conditionTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  conditionText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  vitalSmall: { height: 110, justifyContent: 'center', alignItems: 'center' },
  vitalVal: { fontSize: 20, fontWeight: '900', color: Colors.secondary, marginTop: 8 },
  vitalLab: { fontSize: 11, fontWeight: '700', color: Colors.gray, marginTop: 2, textTransform: 'uppercase' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.secondary },
  medItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  medBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  medName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.secondary, marginLeft: 12 },
  medDose: { fontWeight: '500', color: Colors.gray },
  medFreq: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  reportWide: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  reportIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  reportMain: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: '800', color: Colors.secondary },
  reportSub: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  reviewBtn: { fontSize: 13, fontWeight: '900', color: Colors.primary },
  criticalItem: { borderLeftWidth: 6, borderLeftColor: Colors.danger, paddingVertical: 25 },
  criticalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  criticalName: { fontSize: 20, fontWeight: '900', color: Colors.secondary },
  criticalBadge: { backgroundColor: Colors.danger, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  criticalBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  criticalMetrics: { flexDirection: 'row', gap: 20 },
  critMetric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  critVal: { fontSize: 14, fontWeight: '700', color: Colors.secondary },
  reportHeaderBlock: { marginTop: 10, marginBottom: 5 },
  reportDay: { fontSize: 32, fontWeight: '900', color: Colors.secondary },
  reportDate: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  insightTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray, marginTop: 15 },
  insightVal: { fontSize: 28, fontWeight: '900', color: Colors.secondary, marginTop: 2 },
  insightDesc: { fontSize: 12, color: Colors.gray, marginTop: 8, lineHeight: 16 },
  complianceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  compCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
  compPerc: { fontSize: 14, fontWeight: '900', color: Colors.secondary },
  compInfo: { flex: 1, marginLeft: 15 },
  compTitle: { fontSize: 16, fontWeight: '800', color: Colors.secondary },
  compSub: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  actionBtn: { backgroundColor: Colors.secondary, height: 64, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 4, marginTop: 10 },
  actionBtnText: { color: Colors.white, fontSize: 17, fontWeight: 'bold' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  radarContainer: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center' },
  radarRing1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.primary, opacity: 0.3 },
  radarRing2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: Colors.primary, opacity: 0.1 },
  searchTxt: { fontSize: 15, fontWeight: '600', color: Colors.gray, marginTop: 30, textAlign: 'center' },
  connectPrimaryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, marginTop: 30 },
  connectBtnTxt: { color: Colors.white, fontWeight: '900', fontSize: 15 },
  profileHeader: { alignItems: 'center', paddingVertical: 40 },
  largeAvatarBox: { width: 100, height: 100, borderRadius: 35, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  profileName: { fontSize: 24, fontWeight: '900', color: Colors.secondary },
  profileRole: { fontSize: 15, color: Colors.gray, fontWeight: '600', marginTop: 4 },
  logoutBento: { backgroundColor: Colors.danger + '15', height: 64, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  logoutBentoText: { color: Colors.danger, fontSize: 17, fontWeight: 'bold' },
});
