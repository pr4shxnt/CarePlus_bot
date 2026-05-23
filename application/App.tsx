import React from 'react';
import { View, StyleSheet, Platform, StatusBar, Text, TouchableOpacity } from 'react-native';
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

const TabBarIcon = ({ Icon, color, focused, label }: any) => (
  <View style={styles.tabItemContainer}>
    <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
      <Icon color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
    </View>
    <Text style={[styles.tabLabel, { color: color, fontWeight: focused ? '800' : '600' }]}>
      {label}
    </Text>
  </View>
);

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.customTabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        if (options.tabBarButton && options.tabBarButton() === null) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.customTabItem}
            activeOpacity={0.7}
          >
            {options.tabBarIcon({ focused: isFocused, color: isFocused ? Colors.secondary : Colors.gray })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DoctorTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
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
    <Tab.Screen 
      name="PatientDetail" 
      component={PatientDetail} 
      options={{ tabBarButton: () => null }} 
    />
    <Tab.Screen 
      name="ReportScreen" 
      component={ReportScreen} 
      options={{ tabBarButton: () => null }} 
    />
  </Tab.Navigator>
);

const GuardianTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
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
      children={(props) => <ReportScreen {...props} role="guardian" />} 
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
    <Tab.Screen 
      name="PatientDetail" 
      component={PatientDetail} 
      options={{ tabBarButton: () => null }} 
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
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    height: 70, // Smaller height
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 15 : 5, // Reduced safe area padding
  },
  customTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6, // Smaller padding
    borderRadius: 12,
  },
  activeIconWrapper: {
    backgroundColor: Colors.softGold,
  },
  tabLabel: {
    fontSize: 9, // Smaller font
    marginTop: 2, // Smaller margin
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  }
});

export default App;
