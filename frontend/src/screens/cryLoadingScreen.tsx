import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function CryLoadingScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(40)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const { audioPath, childName,infantId} = route.params;

  useEffect(() => {
    // ✅ Bottom Fade-Up Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation (UNCHANGED)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    sendAudio();

  }, []);

  const sendAudio = async () => {
    try {

      const formData = new FormData();

      formData.append('audio', {
        uri: audioPath,
        type: 'audio/mp4',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(
        'http://10.160.144.230:5001/detect-cry',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.isCry) {

        navigation.replace('CryResult', {
          reason: data.reason,
          confidence: 90,
          childName: childName,
          infantId: infantId,
        }, 3000);

      } else {

        navigation.goBack();

      }

    } catch (error) {
      console.log('API error:', error);
      navigation.goBack();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: riseAnim }],
        },
      ]}
    >
      <Animated.Image
        source={require('../assets/images/loading.jpeg')}
        style={[
          styles.image,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
        resizeMode="cover"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>Analyze cry pattern...</Text>
        <Text style={styles.subtitle}>
          We'll help you understand what your baby might need
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9FF',
  },
  image: {
    bottom: -10,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});