import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Pill, Activity, Smartphone, User, TrendingUp, Smile, Zap, MessageSquare, Coffee } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const FULL_WIDTH = width - 40;
const HALF_WIDTH = (width - 50) / 2;

const GuardianHomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Overview</Text>
            <Text style={styles.userName}>Guardian Dashboard</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => navigation.navigate('GuardianProfile')}
          >
            <View style={styles.avatarMini}>
              <User color={Colors.white} size={20} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          
          {/* Main Patient Card - Psychology Focus */}
          <TouchableOpacity 
            style={[styles.bentoCard, styles.mainCard]}
            activeOpacity={0.9}
          >
            <View style={styles.patientTop}>
              <View>
                <Text style={styles.patientLabel}>PSYCH-MONITORING</Text>
                <Text style={styles.patientName}>Prashant Adhikari</Text>
              </View>
              <View style={styles.statusBadge}>
                <Zap color={Colors.gold} size={14} fill={Colors.gold} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Smile color={Colors.secondary} size={20} />
                <Text style={styles.metricVal}>Good</Text>
                <Text style={styles.metricLab}>Mood</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Pill color={Colors.primary} size={20} />
                <Text style={styles.metricVal}>8:45 AM</Text>
                <Text style={styles.metricLab}>Last Med</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <MessageSquare color={Colors.gold} size={20} />
                <Text style={styles.metricVal}>12%</Text>
                <Text style={styles.metricLab}>% Lonely</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            {/* Medication Card - Gold */}
            <TouchableOpacity 
              style={[styles.bentoCard, { width: HALF_WIDTH, backgroundColor: Colors.gold }]}
            >
              <View style={styles.whiteIconBox}>
                <Pill color={Colors.gold} size={24} />
              </View>
              <Text style={styles.cardTitleGold}>Medication</Text>
              <Text style={styles.cardValGold}>12:30 PM</Text>
              <Text style={styles.cardSubGold}>Next Schedule</Text>
            </TouchableOpacity>

            {/* Mood Trend Card */}
            <TouchableOpacity 
              style={[styles.bentoCard, { width: HALF_WIDTH, backgroundColor: Colors.white }]}
              onPress={() => navigation.navigate('ReportScreen')}
            >
              <Smile color={Colors.primary} size={32} />
              <Text style={styles.cardTitle}>Daily Mood</Text>
              <Text style={styles.cardValue}>Positive</Text>
              <View style={styles.activeTag}>
                <TrendingUp color={Colors.primary} size={12} />
                <Text style={styles.activeTagText}>Stable</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bot Sync Wide Block */}
          <TouchableOpacity 
            style={[styles.bentoCard, styles.botCard]}
            onPress={() => navigation.navigate('ConnectDevice')}
          >
            <View style={styles.botIconWrapper}>
              <Smartphone color={Colors.white} size={28} />
            </View>
            <View style={styles.botTextWrapper}>
              <Text style={styles.botLabel}>DEVICE STATUS</Text>
              <Text style={styles.botTitle}>CarePlus Bot Linked</Text>
              <Text style={styles.botSub}>Real-time synchronization enabled</Text>
            </View>
          </TouchableOpacity>

          {/* Loneliness Analysis */}
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.bentoCard, { width: HALF_WIDTH, backgroundColor: Colors.secondary }]}
              onPress={() => navigation.navigate('ReportScreen')}
            >
              <MessageSquare color={Colors.primary} size={24} />
              <Text style={[styles.smallTitle, { color: Colors.white }]}>Social Isolation</Text>
              <Text style={styles.smallVal}>12% Lonely</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bentoCard, { width: HALF_WIDTH, backgroundColor: Colors.white }]}
            >
              <Coffee color={Colors.gold} size={24} />
              <Text style={styles.smallTitle}>Care Log</Text>
              <Text style={styles.smallVal}>Daily check-in done</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, marginBottom: 20 },
  welcome: { fontSize: 13, color: Colors.gray, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  userName: { fontSize: 24, fontWeight: '900', color: Colors.secondary, marginTop: 2 },
  profileBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colors.white, padding: 3, elevation: 5, shadowColor: Colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  avatarMini: { flex: 1, borderRadius: 13, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' },
  bentoGrid: { paddingHorizontal: 20, gap: 15 },
  bentoCard: { borderRadius: 30, padding: 22, elevation: 3, shadowColor: Colors.black, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  mainCard: { width: FULL_WIDTH, backgroundColor: Colors.white },
  row: { flexDirection: 'row', gap: 15 },
  patientTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  patientLabel: { color: Colors.gray, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  patientName: { color: Colors.secondary, fontSize: 22, fontWeight: '900', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.softGold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: Colors.secondary, fontSize: 11, fontWeight: '900', marginLeft: 5 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.lightGray, padding: 18, borderRadius: 24, alignItems: 'center' },
  metricItem: { alignItems: 'center', flex: 1 },
  metricVal: { color: Colors.secondary, fontSize: 16, fontWeight: '900', marginTop: 4 },
  metricLab: { fontSize: 9, color: Colors.gray, fontWeight: '800', textTransform: 'uppercase', marginTop: 2 },
  divider: { width: 1, height: 25, backgroundColor: 'rgba(0,0,0,0.05)' },
  whiteIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitleGold: { fontSize: 13, fontWeight: '800', color: Colors.secondary, opacity: 0.8 },
  cardValGold: { fontSize: 18, fontWeight: '900', color: Colors.secondary, marginTop: 2 },
  cardSubGold: { fontSize: 11, color: Colors.secondary, fontWeight: '700', marginTop: 4, opacity: 0.7 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.secondary, marginTop: 5 },
  cardValue: { fontSize: 18, fontWeight: '900', color: Colors.secondary, marginTop: 2 },
  activeTag: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeTagText: { fontSize: 10, fontWeight: '900', color: Colors.primary, marginLeft: 4 },
  botCard: { width: FULL_WIDTH, backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingVertical: 25 },
  botIconWrapper: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  botTextWrapper: { flex: 1 },
  botLabel: { color: Colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  botTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 2 },
  botSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
  smallTitle: { fontSize: 14, fontWeight: '800', color: Colors.secondary },
  smallVal: { fontSize: 12, color: Colors.gray, fontWeight: '700', marginTop: 4 },
});

export default GuardianHomeScreen;
