import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import WaveBackground from '../components/waveBackground';

const { height, width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  // ================= STATE =================
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const validateSignup = () => {
    if (!parentName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Password and Confirm Password do not match'
      );
      return false;
    }

    const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;

if (!gmailRegex.test(email)) {
  Alert.alert(
    'Invalid Email',
    'Email must be lowercase and end with @gmail.com'
  );
  return false;
}

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
 if (!strongPasswordRegex.test(password)) {
    Alert.alert(
      'Weak Password',
      'Password must be at least 8 characters long and include:\n\n• 1 Uppercase letter\n• 1 Lowercase letter\n• 1 Number\n• 1 Special character (@$!%*?&)'
    );
    return false;
  }


    return true;
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

      {/* Transparent Floating Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: cardAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.underline} />

        {/* Parent Name */}
        <Text style={styles.label}>Parent Name</Text>
        <View style={styles.inputWrapper}>
          <Icon name="user" size={16} color="#9BBCE6" />
          <TextInput
            placeholder="Parent Name"
            placeholderTextColor="#AFC8E8"
            style={styles.input}
            value={parentName}
            onChangeText={setParentName}
          />
        </View>

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
            placeholder="Enter password"
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

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={18} color="#9BBCE6" />
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#AFC8E8"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'eye-slash' : 'eye'}
              size={16}
              color="#9BBCE6"
            />
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (validateSignup()) {
              navigation.navigate('AddInfant', {
                parentName,
                email,
                password,
              });
            }
          }}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* Bottom */}
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            style={styles.login}
            onPress={() => navigation.navigate('Login')}
          >
            Login
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

  // 👶 Baby image
  baby: {
    position: 'absolute',
    top: height * 0.07,
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
    padding: 24,
    paddingTop: 0,
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
    marginTop: 10,
    marginBottom: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#CFE2F7',
    paddingVertical: 6,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
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

  login: {
    color: '#2D9CDB',
    fontWeight: '600',
  },
});
