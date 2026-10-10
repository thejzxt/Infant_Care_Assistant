import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  Image,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

import NitroSound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';

const SIZE = 220;

export default function RecordingScreen({ navigation, route }: any) {

  const infantId = route?.params?.infantId;   // ✅ added
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNoCryModal, setShowNoCryModal] = useState(false);

  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startRecording = async () => {
    const permission = await requestPermission();
    if (!permission) {
      Alert.alert('Microphone permission denied');
      return;
    }

    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/babyCry_${Date.now()}.m4a`;
      await NitroSound.startRecorder(filePath);

      setIsRecording(true);
      setShowActions(false);
      startAnimation();
    } catch (error) {
      console.log('Start error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await NitroSound.stopRecorder();
      const stat = await RNFS.stat(result);

      console.log('Recorded file path:', result);
      console.log('File size:', stat.size);

      setAudioPath(result);
      setIsRecording(false);
      setShowActions(true);
    } catch (error) {
      console.log('Stop error:', error);
    }
  };

  const playRecording = async () => {
    if (!audioPath) return;

    try {
      if (!isPlaying) {
        await NitroSound.startPlayer(audioPath);
        setIsPlaying(true);

        NitroSound.addPlayBackListener((e: any) => {
          if (e.currentPosition >= e.duration) {
            NitroSound.stopPlayer();
            NitroSound.removePlayBackListener();
            setIsPlaying(false);
          }
        });
      } else {
        await NitroSound.pausePlayer();
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Play/Pause error:', error);
    }
  };

  const startAnimation = () => {
    const createRing = (ring: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(ring, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ring, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    createRing(ring1, 0).start();
    createRing(ring2, 600).start();
    createRing(ring3, 1200).start();
  };

  const handlePress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const ringStyle = (ring: Animated.Value) => ({
    position: 'absolute' as const,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    opacity: ring.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 0],
    }),
    transform: [
      {
        scale: ring.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
  });

  return (
    <LinearGradient
      colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
      style={styles.container}
    >
      <View style={styles.closeContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#2C6FA3" />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        {isRecording && (
          <>
            <Animated.View style={ringStyle(ring1)}>
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(63,169,245,0.2)']}
                style={styles.gradientRing}
              />
            </Animated.View>

            <Animated.View style={ringStyle(ring2)}>
              <LinearGradient
                colors={['rgba(255,255,255,0.6)', 'rgba(63,169,245,0.15)']}
                style={styles.gradientRing}
              />
            </Animated.View>

            <Animated.View style={ringStyle(ring3)}>
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(63,169,245,0.1)']}
                style={styles.gradientRing}
              />
            </Animated.View>
          </>
        )}

        <TouchableOpacity onPress={handlePress}>
          <Image
            source={require('../assets/images/cryingBaby.png')}
            style={styles.babyImage}
          />
        </TouchableOpacity>

        <Text style={styles.recordText}>
          {isRecording ? 'Listening...' : 'Tap Baby To Record'}
        </Text>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={async () => {
              if (isPlaying) {
                await NitroSound.stopPlayer();
                NitroSound.removePlayBackListener();
                setIsPlaying(false);
              }

              if (audioPath) {
                const exists = await RNFS.exists(audioPath);
                if (exists) await RNFS.unlink(audioPath);
              }

              setAudioPath(null);
              setShowActions(false);
            }}
          >
            <Text style={styles.secondaryText}>Re-record</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              if (!audioPath) return;

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
                console.log("Backend response:", data);

                if (data.isCry) {
                  navigation.navigate('CryLoading', { 
                    audioPath, 
                    childName: route?.params?.childName,
                    infantId: infantId     // ✅ added
                  });
                } else {
                  setShowNoCryModal(true);
                }
              } catch (error) {
                console.log('API Error:', error);
                Alert.alert('Server connection failed');
              }
            }}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {showNoCryModal && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#EAF7FF', '#CFEFFF']}
            style={styles.modalBox}
          >
            <Text style={styles.modalTitle}>Cry Not Detected</Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setShowNoCryModal(false);
                setShowActions(false);
                setAudioPath(null);
              }}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  babyImage: { width: 170, height: 170, resizeMode: 'contain' },
  recordText: {
    marginTop: 20,
    fontSize: 28,
    color: '#2C6FA3',
    fontFamily: 'Cookie-Regular',
    textAlign: 'center',
  },
  gradientRing: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  playButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#3FA9F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    elevation: 4,
  },
  secondaryText: { color: '#2C6FA3', fontWeight: '600', fontSize: 16 },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    elevation: 6,
  },
  primaryText: { color: '#2C6FA3', fontWeight: '600', fontSize: 16 },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '75%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C6FA3',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#3FA9F5',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  okText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});