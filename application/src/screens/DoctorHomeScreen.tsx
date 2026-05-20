import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Search, User, FileText, Filter, Zap, Users, Smile, MessageSquare } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const HALF_WIDTH = (width - 50) / 2;

const DoctorHomeScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const patients = [
    { id: '1', name: 'Prashant Adhikari', age: 72, condition: 'Stable', mood: 'Good', lastUpdate: '2h ago' },
    { id: '2', name: 'Shyam Thapa', age: 65, condition: 'Critical', mood: 'Lonely', lastUpdate: '10m ago' },
    { id: '3', name: 'Gita Devi', age: 80, condition: 'Monitoring', mood: 'Stable', lastUpdate: '5h ago' },
  ];

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Clinical Portal</Text>
          <Text style={styles.userName}>Dr. Smith</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('DoctorProfile')}>
          <View style={styles.avatarMini}>
            <User color={Colors.white} size={20} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.bentoGrid}>
            {/* Search Bento Block */}
            <View style={[styles.bentoCard, styles.searchCard]}>
              <Search color={Colors.gray} size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search patient file..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={Colors.gray}
              />
              <View style={styles.filterBadge}>
                <Filter color={Colors.secondary} size={16} />
              </View>
            </View>

            {/* Psychology Metrics Row */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.bentoCard, styles.statsCard, { width: HALF_WIDTH, backgroundColor: Colors.softGold }]}
                onPress={() => navigation.navigate('CriticalScreen')}
              >
                <View style={styles.statsIconBox}>
                  <Smile color={Colors.gold} size={22} />
                </View>
                <View>
                  <Text style={styles.statsValue}>03</Text>
                  <Text style={styles.statsLabel}>High Isolation</Text>
                </View>
                <View style={styles.activeTag}>
                  <Zap color={Colors.gold} size={10} fill={Colors.gold} />
                  <Text style={styles.activeTagText}>Priority</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.bentoCard, styles.statsCard, { width: HALF_WIDTH, backgroundColor: Colors.white }]}
              >
                <View style={[styles.statsIconBox, { backgroundColor: Colors.lightGray }]}>
                  <MessageSquare color={Colors.primary} size={22} />
                </View>
                <View>
                  <Text style={styles.statsValue}>12%</Text>
                  <Text style={styles.statsLabel}>Avg Lonely</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Reports Block - Professional Gold Wide */}
            <TouchableOpacity 
              style={[styles.bentoCard, styles.wideCard, { backgroundColor: Colors.gold }]}
            >
              <View style={styles.wideCardText}>
                <Text style={styles.wideCardLabel}>MENTAL HEALTH REVIEW</Text>
                <Text style={styles.wideCardTitle}>Analyze Sentiments</Text>
                <Text style={styles.wideCardSub}>AI detected shifts in 4 patients</Text>
              </View>
              <View style={styles.iconCircleGlass}>
                <FileText color={Colors.secondary} size={24} />
              </View>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Psych-Profiles</Text>
              <Text style={styles.seeAll}>Recent</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.bentoCard, styles.patientCard]}
            onPress={() => navigation.navigate('PatientDetail', { patient: item })}
          >
            <View style={[styles.statusLine, { backgroundColor: item.condition === 'Critical' ? Colors.danger : Colors.gold }]} />
            <View style={styles.patientAvatar}>
              <User color={Colors.gray} size={20} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text style={styles.patientMeta}>Mood: {item.mood} • Age: {item.age}</Text>
            </View>
            <View style={styles.patientUpdate}>
              <Text style={styles.updateTime}>{item.lastUpdate}</Text>
              <View style={styles.arrowBox}>
                <Zap color={Colors.gold} size={12} fill={Colors.gold} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcome: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '700',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.secondary,
    marginTop: 2,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 3,
    elevation: 4,
  },
  avatarMini: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoGrid: {
    gap: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  bentoCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: Colors.white,
    elevation: 3,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
    color: Colors.secondary,
  },
  filterBadge: {
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 10,
  },
  statsCard: {
    height: 150,
    justifyContent: 'space-between',
  },
  statsIconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.secondary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '700',
    marginTop: 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.gold,
    marginLeft: 4,
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  wideCardText: {
    flex: 1,
  },
  wideCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
    opacity: 0.8,
  },
  wideCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.secondary,
    marginTop: 4,
  },
  wideCardSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
    fontWeight: '600',
    opacity: 0.6,
  },
  iconCircleGlass: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.secondary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 15,
    borderRadius: 22,
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    borderRadius: 2,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  patientMeta: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  patientUpdate: {
    alignItems: 'flex-end',
  },
  updateTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    opacity: 0.5,
  },
  arrowBox: {
    marginTop: 6,
    backgroundColor: Colors.softGold,
    padding: 6,
    borderRadius: 8,
  },
});

export default DoctorHomeScreen;
