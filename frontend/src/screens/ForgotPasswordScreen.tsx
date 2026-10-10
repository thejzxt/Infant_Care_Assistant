import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');

  // STEP 1 → SEND OTP
  const sendOTP = async () => {

    if (!email) {
      Alert.alert("Error", "Enter email");
      return;
    }

    try {

      const response = await fetch(
        "http://10.160.144.230:5000/api/auth/forgot-password",
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if(!response.ok){
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("OTP Sent", "Check your email");

      setStep(2);

    } catch(error){
      Alert.alert("Server error");
    }

  };

  // STEP 2 → VERIFY OTP
  const verifyOTP = async () => {

    if(!otp){
      Alert.alert("Error","Enter OTP");
      return;
    }

    try {

      const response = await fetch(
        "http://10.160.144.230:5000/api/auth/verify-otp",
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            email,
            otp
          })
        }
      );

      const data = await response.json();

      if(!response.ok){
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("Success","OTP Verified");

      setStep(3);

    } catch(error){
      Alert.alert("Server error");
    }

  };

  // STEP 3 → RESET PASSWORD
  const resetPassword = async () => {

    if(!password){
      Alert.alert("Error","Enter new password");
      return;
    }

    try{

      const response = await fetch(
        "http://10.160.144.230:5000/api/auth/reset-password",
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            email,
            otp,
            newPassword: password
          })
        }
      );

      const data = await response.json();

      if(!response.ok){
        Alert.alert("Error", data.message);
        return;
      }

      Alert.alert("Success","Password updated");

      navigation.navigate("Login");

    }catch(error){
      Alert.alert("Server error");
    }

  };

  return (
    <View style={styles.container}>

      <View style={styles.card}>

        <Image
          source={require('../assets/images/forgetpassword.png')}
          style={styles.lockImage}
        />

        <Text style={styles.title}>Reset Password</Text>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <TextInput
              placeholder="Enter Email"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.button} onPress={sendOTP}>
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.button} onPress={verifyOTP}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <TextInput
              placeholder="Enter New Password"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={resetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:'center',
    padding:30,
    backgroundColor:'#f2f6fc'
  },

  card:{
    backgroundColor:'#e9f4fd',
    borderRadius:16,
    padding:25,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.15,
    shadowRadius:6,
    elevation:6
  },

  lockImage:{
    width:80,
    height:80,
    alignSelf:'center',
    marginBottom:10,
    resizeMode:'contain'
  },

  title:{
    fontSize:24,
    fontWeight:'bold',
    marginBottom:20,
    textAlign:'center'
  },

  input:{
    borderWidth:1,
    borderColor:'#ccc',
    padding:12,
    borderRadius:10,
    marginBottom:20
  },

  button:{
    backgroundColor:'#2D9CDB',
    padding:14,
    borderRadius:10
  },

  buttonText:{
    color:'#fff',
    textAlign:'center'
  }

});