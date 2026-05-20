import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { User, Lock, ShieldCheck, ArrowRight, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'guardian'>('guardian');
  const [isPasswordVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const roleSlideAnim = useRef(new Animated.Value(role === 'guardian' ? 0 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const toggleRole = (newRole: 'doctor' | 'guardian') => {
    setRole(newRole);
    Animated.spring(roleSlideAnim, {
      toValue: newRole === 'guardian' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handleLogin = () => {
    if (role === 'doctor') {
      navigation.replace('DoctorHome');
    } else {
      navigation.replace('GuardianHome');
    }
  };

  const roleTabTranslateX = roleSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (width - 50 - 48) / 2 + 2],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#E0F7F7', '#FFFFFF', '#fcfcf0']} // Muted gold tint
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Animated.View 
              style={[
                styles.content, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              {/* Top Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/CAREPLUS_transparent.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <View style={styles.goldBadge}>
                    <Zap color={Colors.white} size={12} fill={Colors.white} />
                  </View>
                </View>
                <Text style={styles.brandName}>CarePlus<Text style={styles.dot}>.</Text></Text>
                <Text style={styles.welcomeText}>Empowering Compassionate Care</Text>
              </View>

              {/* Login Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sign In</Text>
                
                {/* Segmented Role Switcher */}
                <View style={styles.roleContainer}>
                  <Animated.View 
                    style={[
                      styles.roleActiveIndicator, 
                      { 
                        transform: [{ translateX: roleTabTranslateX }],
                        width: '48%' 
                      }
                    ]} 
                  />
                  <TouchableOpacity 
                    style={styles.roleBtn} 
                    onPress={() => toggleRole('guardian')}
                    activeOpacity={1}
                  >
                    <ShieldCheck color={role === 'guardian' ? Colors.secondary : Colors.gray} size={18} />
                    <Text style={[styles.roleText, role === 'guardian' && styles.roleTextActive]}>Guardian</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.roleBtn} 
                    onPress={() => toggleRole('doctor')}
                    activeOpacity={1}
                  >
                    <User color={role === 'doctor' ? Colors.secondary : Colors.gray} size={18} />
                    <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>Doctor</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputBox}>
                    <User color={Colors.gray} size={20} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. hello@careplus.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputBox}>
                    <Lock color={Colors.gray} size={20} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      secureTextEntry={!isPasswordVisible}
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotLabel}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.primaryBtn} 
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <ArrowRight color={Colors.white} size={20} style={styles.btnIcon} />
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.noAccount}>Need help accessing? </Text>
                <TouchableOpacity>
                  <Text style={styles.contactSupport}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  goldBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.gold,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  dot: { color: Colors.primary },
  welcomeText: {
    fontSize: 14,
    color: Colors.secondary,
    opacity: 0.6,
    fontWeight: '600',
    marginTop: 6,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 35,
    padding: 24,
    elevation: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F8F8',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
    height: 52,
    alignItems: 'center',
  },
  roleActiveIndicator: {
    position: 'absolute',
    height: 44,
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray,
    marginLeft: 8,
  },
  roleTextActive: {
    color: Colors.secondary,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF2F2',
    paddingHorizontal: 16,
    height: 56,
  },
  fieldIcon: {
    marginRight: 12,
    opacity: 0.4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gold,
    opacity: 0.9,
  },
  primaryBtn: {
    backgroundColor: Colors.secondary,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  btnIcon: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  noAccount: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  contactSupport: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
