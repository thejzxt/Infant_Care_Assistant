import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import WaveBackground from '../components/waveBackground';

const { height, width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  // ================= STATE =================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ================= ANIMATIONS =================
  const cardAnim = useRef(new Animated.Value(200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ================= VALIDATION =================
  const validateLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter email and password');
      return false;
    }

    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid @gmail.com email address'
      );
      return false;
    }

    return true;
  };

  // ================= LOGIN HANDLER =================
  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const response = await fetch(
        'http://10.160.144.230:5000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return;
      }

      Alert.alert('Success', 'Login successful');

      navigation.replace('HomeDashboard', {
        user: data.user,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    }
  };

  // ================= UI =================
  return (
    <LinearGradient
      colors={['#EAF4FF', '#FFFFFF']}
      style={styles.container}
    >
      {/* 🌊 Wave */}
      <WaveBackground />

      {/* 👶 Baby inside wave */}
      <Image
        source={require('../assets/images/babyvector.png')}
        style={styles.baby}
      />

      {/* Transparent Floating Container */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: cardAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.title}>Login</Text>
        <View style={styles.underline} />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Icon name="envelope-o" size={16} color="#9BBCE6" />
          <TextInput
            placeholder="demo@email.com"
            placeholderTextColor="#AFC8E8"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={18} color="#9BBCE6" />
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#AFC8E8"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-slash' : 'eye'}
              size={16}
              color="#9BBCE6"
            />
          </TouchableOpacity>
        </View>

        {/* Remember / Forgot */}
        <View style={styles.row}>
          <Text style={styles.remember}>Remember Me</Text>
          <TouchableOpacity
  onPress={() => navigation.navigate('ForgotPassword')}
>
  <Text style={styles.forgot}>Forgot Password?</Text>
</TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Bottom */}
        <Text style={styles.bottomText}>
          Don’t have an Account?{' '}
          <Text
            style={styles.signup}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign up
          </Text>
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // 👶 Baby image inside wave
  baby: {
    position: 'absolute',
    top: height * 0.07,     // ⬅ adjust if needed
    alignSelf: 'center',
    width: width * 0.55,
    height: width * 0.55,
    resizeMode: 'contain',
    zIndex: 2,
  },

  card: {
    position: 'absolute',
    top: height * 0.36,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    borderRadius: 28,
    padding: 24,
    paddingTop: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2D9CDB',
  },

  underline: {
    width: 80,
    height: 3,
    backgroundColor: '#2D9CDB',
    marginVertical: 12,
    borderRadius: 10,
  },

  label: {
    fontSize: 13,
    color: '#6B93C5',
    marginTop: 16,
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#CFE2F7',
    paddingVertical: 10,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  remember: {
    fontSize: 12,
    color: '#7FA8D8',
  },

  forgot: {
    fontSize: 12,
    color: '#2D9CDB',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#3AA6E4',
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 14,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#7FA8D8',
  },

  signup: {
    color: '#2D9CDB',
    fontWeight: '600',
  },
});
