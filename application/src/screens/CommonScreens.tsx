import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Colors } from '../theme/colors';
import { ArrowLeft, User, FileText, Smartphone, Activity, Pill, Smile, MessageSquare, CheckCircle, Clock } from 'lucide-react-native';
import { request } from '../services/api';

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
            onPress={() => navigation.navigate('ReportScreen', { patient, role: 'doctor' })}
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

export const ReportScreen = ({ route, navigation, role: propRole }: any) => {
  const role = propRole || route?.params?.role || 'guardian';
  // patientId can come from PatientDetail (passes full patient obj) or directly as a param
  const patientId: string | undefined =
    route?.params?.patient?._id || route?.params?.patientId;
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      let endpoint: string;
      if (role === 'doctor') {
        endpoint = patientId
          ? `/doctor/reports?patientId=${patientId}`
          : '/doctor/reports';
      } else {
        // Guardian: server already scopes to linked patient via botId
        endpoint = '/guardian/reports';
      }
      const res = await request(endpoint);
      const raw: any[] = res.data?.reports ?? [];
      const sorted = [...raw].sort(
        (a, b) => new Date(b.createdAt || b.startedAt).getTime() - new Date(a.createdAt || a.startedAt).getTime()
      );
      setReports(sorted);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, patientId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  const onRefresh = () => { setRefreshing(true); fetchReports(); };

  const handleApprove = async (reportId: string) => {
    try {
      await request(`/doctor/reports/${reportId}/approve`, { method: 'POST', body: JSON.stringify({ notes: '' }) });
      Alert.alert('✅ Approved', 'Report approved and now visible to the guardian.');
      fetchReports();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not approve report');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.secondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{role === 'doctor' ? 'Reports' : 'CarePlus Insights'}</Text>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('SessionHistoryScreen', { role, patientId })}
        >
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          <View style={styles.bentoGrid}>
            {reports.length === 0 ? (
              <View style={styles.emptyReport}>
                <FileText color={Colors.gray} size={40} />
                <Text style={styles.emptyReportText}>No reports yet</Text>
              </View>
            ) : (
              reports.map((session: any, idx: number) => {
                const date = new Date(session.startedAt || session.createdAt);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const analysis = session.analyses?.[0] ?? {};
                const mood = analysis.mood || 'Unknown';
                const intensity = analysis.mood_intensity ?? 5;
                const meds = analysis.medicine_log ?? [];
                const takenCount = meds.filter((m: any) => m.status === 'taken').length;
                const adherence = meds.length > 0 ? Math.round((takenCount / meds.length) * 100) : null;
                const approved = session.reportStatus === 'approved';

                return (
                  <View key={session._id || idx} style={styles.reportCard}>
                    <View style={styles.reportHeaderBlock}>
                      <Text style={styles.reportDay}>{dayName}</Text>
                      <Text style={styles.reportDate}>{dateStr}</Text>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.bentoCard, { width: HALF_WIDTH, height: 160 }]}>
                        <Smile color={Colors.primary} size={28} />
                        <Text style={styles.insightTitle}>Mood</Text>
                        <Text style={styles.insightVal}>{mood}</Text>
                        <Text style={styles.insightDesc}>Intensity: {intensity}/10</Text>
                      </View>
                      <View style={[styles.bentoCard, { width: HALF_WIDTH, height: 160, backgroundColor: Colors.gold }]}>
                        <Pill color={Colors.secondary} size={28} />
                        <Text style={[styles.insightTitle, { color: 'rgba(25,52,61,0.6)' }]}>Medication</Text>
                        <Text style={[styles.insightVal, { color: Colors.secondary }]}>
                          {adherence !== null ? `${adherence}%` : 'N/A'}
                        </Text>
                        <Text style={[styles.insightDesc, { color: 'rgba(25,52,61,0.6)' }]}>
                          {takenCount}/{meds.length} taken
                        </Text>
                      </View>
                    </View>

                    {session.report ? (
                      <View style={[styles.bentoCard, { width: FULL_WIDTH }]}>
                        <Text style={styles.sectionTitle}>AI Summary</Text>
                        <Text style={styles.reportBodyText}>{session.report}</Text>
                      </View>
                    ) : null}

                    {session.doctorNotes ? (
                      <View style={[styles.bentoCard, { width: FULL_WIDTH, backgroundColor: Colors.softGold }]}>
                        <Text style={styles.sectionTitle}>Doctor Notes</Text>
                        <Text style={styles.reportBodyText}>{session.doctorNotes}</Text>
                      </View>
                    ) : null}

                    <View style={styles.statusRow}>
                      <View style={[approved ? styles.approvedBadge : styles.pendingBadge]}>
                        {approved
                          ? <CheckCircle color={Colors.success} size={14} />
                          : <Clock color={Colors.gold} size={14} />}
                        <Text style={[approved ? styles.approvedText : styles.pendingText]}>
                          {approved ? 'Approved' : 'Pending Review'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => {
                          const pid = session.patientId?._id || session.patientId;
                          navigation.navigate('SessionHistoryScreen', { role, patientId: pid });
                        }}
                      >
                        <Text style={styles.chatBtnText}>View Chat →</Text>
                      </TouchableOpacity>
                    </View>

                    {role === 'doctor' && !approved && (
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleApprove(session._id)}>
                        <Text style={styles.actionBtnText}>Approve Report</Text>
                      </TouchableOpacity>
                    )}

                    {idx < reports.length - 1 && <View style={styles.reportDivider} />}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export const SessionHistoryScreen = ({ route, navigation }: any) => {
  const role = route?.params?.role || 'guardian';
  const patientId: string | undefined = route?.params?.patientId;
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      let endpoint: string;
      if (role === 'doctor') {
        // Doctor: filter by patientId if provided
        endpoint = patientId
          ? `/doctor/sessions?patientId=${patientId}`
          : '/doctor/sessions';
      } else {
        // Guardian: server already scopes to linked patient
        endpoint = '/guardian/sessions';
      }
      const res = await request(endpoint);
      const raw: any[] = res.data?.sessions ?? [];
      setSessions([...raw].sort(
        (a, b) => new Date(b.startedAt || b.createdAt).getTime() - new Date(a.startedAt || a.createdAt).getTime()
      ));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, patientId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  const onRefresh = () => { setRefreshing(true); fetchSessions(); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.secondary} size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>All Sessions</Text>
          {!loading && <Text style={styles.sessionSubtitle}>{sessions.length} sessions · most recent first</Text>}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {sessions.length === 0 ? (
            <View style={styles.emptyReport}>
              <FileText color={Colors.gray} size={40} />
              <Text style={styles.emptyReportText}>No sessions recorded yet</Text>
            </View>
          ) : (
            sessions.map((session: any, idx: number) => {
              const date = new Date(session.startedAt);
              const isToday = new Date().toDateString() === date.toDateString();
              const dateLabel = isToday
                ? 'Today'
                : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const durationMins = Math.round((session.durationSeconds || 0) / 60);
              const turnCount = session.turns?.length ?? 0;
              const mood = session.analyses?.[0]?.mood;
              const approved = session.reportStatus === 'approved';

              return (
                <TouchableOpacity
                  key={session._id || idx}
                  style={styles.sessionCard}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('ConversationScreen', { sessionId: session._id, role })}
                >
                  <View style={[styles.sessionAccent, { backgroundColor: approved ? Colors.success : Colors.gold }]} />
                  <View style={styles.sessionBody}>
                    <View style={styles.sessionTopRow}>
                      <Text style={styles.sessionDate}>{dateLabel}</Text>
                      <Text style={styles.sessionTime}>{timeLabel}</Text>
                    </View>
                    <View style={styles.sessionChips}>
                      <View style={styles.chip}>
                        <MessageSquare color={Colors.gray} size={11} />
                        <Text style={styles.chipText}>{turnCount} msg{turnCount !== 1 ? 's' : ''}</Text>
                      </View>
                      {durationMins > 0 && (
                        <View style={styles.chip}>
                          <Clock color={Colors.gray} size={11} />
                          <Text style={styles.chipText}>{durationMins} min</Text>
                        </View>
                      )}
                      {mood && (
                        <View style={[styles.chip, { backgroundColor: Colors.primary + '15' }]}>
                          <Smile color={Colors.primary} size={11} />
                          <Text style={[styles.chipText, { color: Colors.primary }]}>{mood}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.sessionBottomRow}>
                      <View style={[styles.statusPill, approved ? styles.approvedPill : styles.pendingPill]}>
                        {approved
                          ? <CheckCircle color={Colors.success} size={11} />
                          : <Clock color={Colors.gold} size={11} />}
                        <Text style={[styles.statusPillText, { color: approved ? Colors.success : Colors.gold }]}>
                          {approved ? 'Approved' : 'Pending'}
                        </Text>
                      </View>
                      <Text style={styles.viewChatArrow}>View Chat →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

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
  // ReportScreen
  reportCard: { gap: 12 },
  reportDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 20 },
  reportBodyText: { fontSize: 14, color: Colors.secondary, lineHeight: 22, marginTop: 8, fontWeight: '500' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  approvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.success + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  approvedText: { fontSize: 12, fontWeight: '800', color: Colors.success },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.gold + '30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pendingText: { fontSize: 12, fontWeight: '800', color: Colors.gold },
  chatBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  chatBtnText: { fontSize: 13, fontWeight: '800', color: Colors.white },
  emptyReport: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyReportText: { fontSize: 15, color: Colors.gray, fontWeight: '600', textAlign: 'center' },
  // History button in ReportScreen header
  historyBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  historyBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  // SessionHistoryScreen cards
  sessionSubtitle: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  sessionCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, overflow: 'hidden' },
  sessionAccent: { width: 5, borderRadius: 0 },
  sessionBody: { flex: 1, padding: 14, gap: 8 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionDate: { fontSize: 15, fontWeight: '800', color: Colors.secondary },
  sessionTime: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  sessionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F4F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '700', color: Colors.gray },
  sessionBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  approvedPill: { backgroundColor: Colors.success + '20' },
  pendingPill: { backgroundColor: Colors.gold + '25' },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  sessionActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  approveBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  approveBtnText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  viewChatArrow: { fontSize: 13, fontWeight: '800', color: Colors.primary },
});
