import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ArrowLeft, Bot, User, Pill, Smile, FileText, CheckCircle, Clock } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { request } from '../services/api';

const ConversationScreen = ({ route, navigation }: any) => {
  const { sessionId, role } = route.params;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const endpoint =
          role === 'doctor'
            ? `/doctor/sessions/${sessionId}`
            : `/guardian/sessions/${sessionId}`;
        const res = await request(endpoint);
        setSession(res.data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load conversation');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, role, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) return null;

  const date = new Date(session.startedAt);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const durationMins = Math.round((session.durationSeconds || 0) / 60);
  const turns: { role: string; content: string }[] = session.turns || [];
  const analysis = session.analyses?.[0] ?? {};
  const mood = analysis.mood || null;
  const intensity = analysis.mood_intensity ?? null;
  const meds: { name: string; status: string }[] = analysis.medicine_log ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.secondary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Conversation</Text>
          <Text style={styles.headerSub}>{dateLabel}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Clock color={Colors.primary} size={14} />
              <Text style={styles.metaBadgeText}>{timeLabel}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>⏱ {durationMins} min</Text>
            </View>
            <View
              style={[
                styles.metaBadge,
                {
                  backgroundColor:
                    session.reportStatus === 'approved'
                      ? Colors.success + '20'
                      : Colors.gold + '30',
                },
              ]}
            >
              {session.reportStatus === 'approved' ? (
                <CheckCircle color={Colors.success} size={13} />
              ) : (
                <Clock color={Colors.gold} size={13} />
              )}
              <Text
                style={[
                  styles.metaBadgeText,
                  {
                    color:
                      session.reportStatus === 'approved' ? Colors.success : Colors.gold,
                  },
                ]}
              >
                {session.reportStatus === 'approved' ? 'Approved' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Summary Strip */}
        {(mood || meds.length > 0) && (
          <View style={styles.analysisBanner}>
            {mood && (
              <View style={styles.analysisPill}>
                <Smile color={Colors.primary} size={14} />
                <Text style={styles.analysisPillText}>
                  {mood} {intensity !== null ? `• ${intensity}/10` : ''}
                </Text>
              </View>
            )}
            {meds.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.analysisPill,
                  {
                    backgroundColor:
                      m.status === 'taken'
                        ? Colors.success + '20'
                        : Colors.danger + '20',
                  },
                ]}
              >
                <Pill
                  color={m.status === 'taken' ? Colors.success : Colors.danger}
                  size={13}
                />
                <Text
                  style={[
                    styles.analysisPillText,
                    {
                      color:
                        m.status === 'taken' ? Colors.success : Colors.danger,
                    },
                  ]}
                >
                  {m.name} • {m.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider label */}
        <View style={styles.sectionLabel}>
          <View style={styles.labelLine} />
          <Text style={styles.labelText}>CHAT LOG</Text>
          <View style={styles.labelLine} />
        </View>

        {/* Chat Bubbles */}
        {turns.length === 0 ? (
          <View style={styles.emptyTurns}>
            <Text style={styles.emptyTurnsText}>No conversation recorded for this session.</Text>
          </View>
        ) : (
          turns.map((turn, idx) => {
            const isBot = turn.role === 'assistant';
            return (
              <View
                key={idx}
                style={[
                  styles.bubbleRow,
                  isBot ? styles.bubbleRowLeft : styles.bubbleRowRight,
                ]}
              >
                {isBot && (
                  <View style={styles.avatarBot}>
                    <Bot color={Colors.white} size={14} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isBot ? styles.bubbleBot : styles.bubbleUser,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isBot ? styles.bubbleTextBot : styles.bubbleTextUser,
                    ]}
                  >
                    {turn.content}
                  </Text>
                </View>
                {!isBot && (
                  <View style={styles.avatarUser}>
                    <User color={Colors.white} size={14} />
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* AI Report Summary */}
        {session.report && (
          <>
            <View style={styles.sectionLabel}>
              <View style={styles.labelLine} />
              <Text style={styles.labelText}>AI SUMMARY</Text>
              <View style={styles.labelLine} />
            </View>
            <View style={styles.summaryCard}>
              <FileText color={Colors.primary} size={18} style={{ marginBottom: 8 }} />
              <Text style={styles.summaryText}>{session.report}</Text>
            </View>
          </>
        )}

        {/* Doctor Notes */}
        {session.doctorNotes && (
          <>
            <View style={styles.sectionLabel}>
              <View style={styles.labelLine} />
              <Text style={styles.labelText}>DOCTOR NOTES</Text>
              <View style={styles.labelLine} />
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.softGold }]}>
              <Text style={styles.summaryText}>{session.doctorNotes}</Text>
              {session.reviewedBy?.name && (
                <Text style={styles.reviewedBy}>— {session.reviewedBy.name}</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.gray, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 12,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: Colors.secondary },
  headerSub: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  headerSpacer: { width: 40 },

  scrollContent: { paddingBottom: 50 },

  metaCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  metaBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.secondary },

  analysisBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  analysisPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  analysisPillText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
    gap: 10,
  },
  labelLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  labelText: { fontSize: 10, fontWeight: '900', color: Colors.gray, letterSpacing: 1.5 },

  emptyTurns: { alignItems: 'center', paddingVertical: 30 },
  emptyTurnsText: { color: Colors.gray, fontWeight: '600', fontSize: 14 },

  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },

  avatarBot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarUser: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.secondary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextBot: { color: Colors.secondary, fontWeight: '500' },
  bubbleTextUser: { color: Colors.white, fontWeight: '500' },

  summaryCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  summaryText: { fontSize: 14, color: Colors.secondary, lineHeight: 22, fontWeight: '500' },
  reviewedBy: { marginTop: 10, fontSize: 13, color: Colors.gray, fontWeight: '700', fontStyle: 'italic' },
});

export default ConversationScreen;
