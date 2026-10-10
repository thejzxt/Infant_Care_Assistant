import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function FinalResultScreen({ route, navigation }: any) {

  const reason = route?.params?.reason ?? 'Hungry';
  const childName = route?.params?.childName ?? 'Baby';
  const infantId = route?.params?.infantId;

  // Save cry result to database
  const saveCryResult = async () => {
    try {

      await fetch("http://10.160.144.230:5000/api/cry/addCry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          infantId: infantId,
          reason: reason,
        }),
      });

    } catch (error) {
      console.log("Error saving cry:", error);
    }
  };

  // When Done button is pressed
  const handleDone = async () => {

    await saveCryResult();

    navigation.navigate('HomeDashboard');
  };

  return (

    <LinearGradient
      colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
      style={styles.container}
    >

      <SafeAreaView style={styles.center}>

        {/* 🔙 Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('HomeDashboard')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Baby Image */}
        <Image
          source={require('../assets/images/finalbaby.png')}
          style={styles.image}
        />

        {/* Title */}
        <Text style={styles.title}>Final Result</Text>

        {/* Result Text */}
        <Text style={styles.result}>
          {childName} might be <Text style={styles.bold}>{reason}</Text>
        </Text>

        {/* ✅ Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>

      </SafeAreaView>

    </LinearGradient>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },

  backText: {
    fontSize: 16,
    color: '#2C6FA3',
    fontWeight: '600',
    top: 20,
  },

  image: {
    width: 420,
    height: 420,
    resizeMode: 'contain',
  },

  title: {
    marginTop: 0,
    fontSize: 26,
    fontWeight: '700',
    color: '#2C6FA3',
  },

  result: {
    marginTop: 15,
    fontSize: 20,
    color: '#333',
  },

  bold: {
    fontWeight: '700',
    color: '#2C6FA3',
  },

  // ✅ Done Button Style
  doneButton: {
    marginTop: 30,
    backgroundColor: '#2C6FA3',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },

  doneText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

});