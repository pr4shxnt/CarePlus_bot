import React from 'react';
import { View, StyleSheet, Platform, StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, User, BarChart2, Smartphone, ClipboardList } from 'lucide-react-native';

import { Colors } from './src/theme/colors';
import LoginScreen from './src/screens/LoginScreen';
import DoctorHomeScreen from './src/screens/DoctorHomeScreen';
import GuardianHomeScreen from './src/screens/GuardianHomeScreen';
import { 
  PatientDetail, 
  CriticalScreen, 
  ReportScreen, 
  ConnectDevice, 
  ProfileScreen 
} from './src/screens/CommonScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ Icon, color, size, focused, label }: any) => (
  <View style={styles.tabItemContainer}>
    <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
      <Icon color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
    </View>
    <Text style={[styles.tabLabel, { color: color, fontWeight: focused ? '800' : '600' }]}>
      {label}
    </Text>
  </View>
);

const DoctorTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.secondary,
      tabBarInactiveTintColor: Colors.gray,
    }}
  >
    <Tab.Screen 
      name="DoctorHomeTab" 
      component={DoctorHomeScreen} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={Home} label="Home" {...props} />
      }}
    />
    <Tab.Screen 
      name="CriticalTab" 
      component={CriticalScreen} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={ClipboardList} label="Alerts" {...props} />
      }}
    />
    <Tab.Screen 
      name="DoctorProfileTab" 
      children={(props) => <ProfileScreen {...props} role="doctor" />} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={User} label="Profile" {...props} />
      }}
    />
  </Tab.Navigator>
);

const GuardianTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.secondary,
      tabBarInactiveTintColor: Colors.gray,
    }}
  >
    <Tab.Screen 
      name="GuardianHomeTab" 
      component={GuardianHomeScreen} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={Home} label="Home" {...props} />
      }}
    />
    <Tab.Screen 
      name="ReportTab" 
      component={ReportScreen} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={BarChart2} label="Reports" {...props} />
      }}
    />
    <Tab.Screen 
      name="ConnectTab" 
      component={ConnectDevice} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={Smartphone} label="Bot" {...props} />
      }}
    />
    <Tab.Screen 
      name="GuardianProfileTab" 
      children={(props) => <ProfileScreen {...props} role="guardian" />} 
      options={{
        tabBarIcon: (props) => <TabBarIcon Icon={User} label="Profile" {...props} />
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <View style={styles.blackBackground}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
        <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
          <View style={styles.appContent}>
            <NavigationContainer>
              <Stack.Navigator 
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right'
                }}
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="DoctorHome" component={DoctorTabs} />
                <Stack.Screen name="GuardianHome" component={GuardianTabs} />
                <Stack.Screen name="PatientDetail" component={PatientDetail} />
                <Stack.Screen name="CriticalScreen" component={CriticalScreen} />
                <Stack.Screen name="ReportScreen" component={ReportScreen} />
                <Stack.Screen name="ConnectDevice" component={ConnectDevice} />
                <Stack.Screen name="DoctorProfile" children={(props) => <ProfileScreen {...props} role="doctor" />} />
                <Stack.Screen name="GuardianProfile" children={(props) => <ProfileScreen {...props} role="guardian" />} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  blackBackground: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  safeContainer: {
    flex: 1,
  },
  appContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    position: 'absolute',
    bottom: 15, // Closer to the bottom safe area
    left: 15,
    right: 15,
    elevation: 10,
    backgroundColor: Colors.white,
    borderRadius: 25,
    height: 75, // Slightly more compact
    borderTopWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 70, // Fixed width for better centering
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: Colors.softGold,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

export default App;
