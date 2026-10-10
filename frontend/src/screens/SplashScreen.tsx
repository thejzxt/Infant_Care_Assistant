import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const babyX = useRef(new Animated.Value(width)).current;
  const babyScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(babyX, {
        toValue: 0,
        duration: 2200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(babyScale, {
        toValue: 1.05,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(babyScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 900,
        delay: 2200,
        useNativeDriver: true,
      }),
      Animated.spring(textScale, {
        toValue: 1,
        friction: 6,
        delay: 2200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#D9F0FF', '#A9DCFF', '#aed9fa']}


      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.Image
        source={require('../assets/images/babylaunch.png')}
        style={[
          styles.baby,
          {
            transform: [{ translateX: babyX }, { scale: babyScale }],
          },
        ]}
      />

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        Infant Care Assist
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baby: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3FA9F5',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
