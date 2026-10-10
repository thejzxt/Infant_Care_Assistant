import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';

export default function CryResultScreen({ route, navigation }: any) {

  const reason = route?.params?.reason ?? 'Hungry';
  const confidence = route?.params?.confidence ?? 87;
  const childName = route?.params?.childName ?? 'Baby'; // ✅ added
  const infantId = route?.params?.infantId;

  // 🔥 Left fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <SafeAreaView style={{ flex: 1 , justifyContent: 'center' }}>

        {/* 🔙 Back Button */}
       
        {/* Baby Avatar */}
        <Image
          source={require('../assets/images/cryprediction.png')}
          style={styles.avatar}
        />

        {/* Title */}
        <Text style={styles.title}>
          {childName} might be... <Text style={styles.bold}>{reason}</Text>
        </Text>

        {/* Confidence Badge */}
        

        {/* Description */}
        <Text style={styles.description}>
          We’ve compared the cry pattern to thousands of similar recordings.
        </Text>

      {/* Go to Questionnaire Button */}
<TouchableOpacity
  style={styles.questionBtn}
  onPress={() =>
    navigation.navigate('questionareScreen', {
  reason: reason,
  childName: childName,
  infantId: infantId
})
  }
>
  <Text style={styles.questionText}>Answer a Few Questions</Text>
</TouchableOpacity>
        

      </SafeAreaView>
    </Animated.View>
    

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    top: -50,
  },


  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 30,
    alignSelf: 'center',
  },

  title: {
    marginTop: 20,
    fontSize: 22,
    textAlign: 'center',
    color: '#222',
  },

  bold: {
    fontWeight: '700',
  },

  confidenceBadge: {
    marginTop: 15,
    backgroundColor: '#CDEFD9',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: 'center',
  },

  confidenceText: {
    color: '#1F7A4C',
    fontWeight: '600',
  },

  description: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 10,
  },

  suggestedCard: {
    flexDirection: 'row',
    backgroundColor: '#EBD7FF',
    padding: 20,
    borderRadius: 20,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D8B9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    elevation: 2,
  },

  cardTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },

  cardText: {
    color: '#666',
    fontSize: 14,
  },

  questionBtn: {
  marginTop: 40,
  backgroundColor: '#83c7f7',
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 30,
  alignSelf: 'center',
  elevation: 4,
},

questionText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},

});