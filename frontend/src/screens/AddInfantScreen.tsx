import DateTimePicker from '@react-native-community/datetimepicker';
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
import LinearGradient from 'react-native-linear-gradient';
import WaveBackground from '../components/waveBackground';

const { height, width } = Dimensions.get('window');

export default function AddInfantScreen({ navigation, route }) {
  // ================= RECEIVE SIGNUP DATA =================
  const { parentName, email, password } = route.params;

  // ================= STATE =================
  const [infantName, setInfantName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [heightValue, setHeightValue] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

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

  // ================= API CALLS =================

  const signupWithFirstInfant = async () => {
    const payload = {
      parentName,
      email,
      password,
      infants: [
        {
          name: infantName,
          dob,
          gender,
          weight,
          height: heightValue,
        },
      ],
    };

    return fetch('http://10.160.144.230:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const addInfant = async () => {
    const payload = {
      email,
      infant: {
        name: infantName,
        dob,
        gender,
        weight,
        height: heightValue,
      },
    };

    return fetch('http://10.160.144.230:5000/api/auth/add-infant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  // ================= SAVE INFANT =================
  const saveInfantToDB = async () => {
    if (!infantName || !dob || !gender || !weight) {
  Alert.alert('Missing Info', 'Please fill all infant details');
  return false;
}

// Convert weight to number
const weightValue = parseFloat(weight);

// Check if weight is valid
if (isNaN(weightValue)) {
  Alert.alert("Invalid Weight", "Please enter a valid number");
  return false;
}

// Check max weight
if (weightValue > 15) {
  Alert.alert(
    "Weight Limit Exceeded",
    "Infant weight cannot exceed 15 kg."
  );
  return false;
}

    try {
      const response = isRegistered
        ? await addInfant()
        : await signupWithFirstInfant();

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Operation failed');
        return false;
      }

      setIsRegistered(true);
      return true;
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
      return false;
    }
  };

  // ================= HANDLERS =================
  const handleAddAnother = async () => {
    const saved = await saveInfantToDB();
    if (!saved) return;

    setInfantName('');
    setDob('');
    setGender('');
    setWeight('');
    setHeightValue('');
  };

  // ✅ UPDATED FUNCTION (Only change made)
  const handleDone = async () => {
    const saved = await saveInfantToDB();
    if (!saved) return;

    Alert.alert(
      "Signup Successful",
      "Please login to continue",
      [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]
    );
  };

  // ================= UI =================
  return (
    <LinearGradient colors={['#EAF4FF', '#FFFFFF']} style={styles.container}>
      <WaveBackground />

      <Image
        source={require('../assets/images/babyvector.png')}
        style={styles.baby}
      />

      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY: cardAnim }], opacity: opacityAnim },
        ]}
      >
        <Text style={styles.title}>Infant Details</Text>
        <View style={styles.underline} />

        <TextInput
          placeholder="Infant Name"
          value={infantName}
          onChangeText={setInfantName}
          style={styles.input}
          placeholderTextColor="#AFC8E8"
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            placeholder="Date of Birth (DD/MM/YYYY)"
            value={dob}
            style={styles.input}
            editable={false}
            placeholderTextColor="#AFC8E8"
          />
        </TouchableOpacity>
{showDatePicker && (
  <DateTimePicker
    value={new Date()}
    mode="date"
    maximumDate={new Date()}
    onChange={(e, date) => {
      setShowDatePicker(false);

      if (date) {
        const today = new Date();

        const diffTime = today - date; 
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays > 365) {
          Alert.alert(
            "Age Limit Exceeded",
            "This app is designed for infants below 1 year."
          );
          return;
        }

        setDob(date.toLocaleDateString('en-GB'));
      }
    }}
  />
)}

        <TextInput
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor="#AFC8E8"
        />


        <Text style={styles.genderLabel}>Gender</Text>
        <View style={styles.radioGroup}>
          {['Male', 'Female'].map(item => (
            <TouchableOpacity
              key={item}
              style={styles.radioOption}
              onPress={() => setGender(item)}
            >
              <View style={styles.radioCircle}>
                {gender === item && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddAnother}>
          <Text style={styles.addButtonText}>+ Add Another Infant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },

  baby: {
    position: 'absolute',
    top: height * 0.07,
    alignSelf: 'center',
    width: width * 0.55,
    height: width * 0.55,
    resizeMode: 'contain',
  },

  card: {
    position: 'absolute',
    top: height * 0.36,
    left: 20,
    right: 20,
    padding: 24,
  },

  title: {
    fontSize: 28,
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

  input: {
    borderBottomWidth: 1,
    borderColor: '#CFE2F7',
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    color: '#2C3E50',
  },

  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B93C5',
    marginBottom: 8,
  },

  radioGroup: { flexDirection: 'row', marginBottom: 16 },

  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 30 },

  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2D9CDB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2D9CDB',
  },

  radioText: { fontSize: 15, color: '#2C3E50' },

  addButton: {
    backgroundColor: '#EAF4FF',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  addButtonText: {
    color: '#2D9CDB',
    textAlign: 'center',
    fontWeight: '600',
  },

  doneButton: {
    backgroundColor: '#2D9CDB',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
  },

  doneButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
