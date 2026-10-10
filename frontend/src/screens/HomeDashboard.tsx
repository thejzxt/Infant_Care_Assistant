import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function HomeDashboard({ route, navigation }) {

  const [user, setUser] = useState(route?.params?.user || null)
  const [menuVisible, setMenuVisible] = useState(false);
  const [showInfantSwitcher, setShowInfantSwitcher] = useState(false);
  const [activeInfant, setActiveInfant] = useState<any>(null);
  const [ageExceeded, setAgeExceeded] = useState(false);

  /* LOGOUT FUNCTION */
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  /* LOAD SAVED INFANT */
useEffect(() => {
  const loadSavedInfant = async () => {
    const savedId = await AsyncStorage.getItem('activeInfantId');

    let infant = null;

    if (savedId && user?.infants?.length > 0) {
      const found = user.infants.find(i => i._id === savedId);
      infant = found || user.infants[0];
    } else if (user?.infants?.length > 0) {
      infant = user.infants[0];
    }

    if (infant) {
      setActiveInfant(infant);

      // ⭐ CHECK AGE
      if (infant.dob) {
        const today = new Date();
        const dobParts = infant.dob.split('/');
        const dobDate = new Date(
          dobParts[2],
          dobParts[1] - 1,
          dobParts[0]
        );

        const diffDays =
          (today - dobDate) / (1000 * 60 * 60 * 24);

        if (diffDays > 365) {
          setAgeExceeded(true);
        } else {
          setAgeExceeded(false);
        }
      }
    }
  };

  loadSavedInfant();
}, [user]);

  /* REFRESH USER */
  useFocusEffect(
    useCallback(() => {
      if (!user?.email) return; 
      const refreshUser = async () => {
        try {
          const res = await fetch(`http://10.160.144.230:5000/api/profile?email=${user.email}`);
          const data = await res.json();
          setUser(data);
        } catch (err) {
          console.log('Refresh user error', err);
        }
      };

      refreshUser();
    }, [user?.email])
  );

  /* ANIMATIONS */
  const imageTranslateY = useRef(new Animated.Value(height)).current;
  const shadowScale = useRef(new Animated.Value(0)).current;

  const cryHistoryScale = useRef(new Animated.Value(0)).current;
  const cryRecordScale = useRef(new Animated.Value(0)).current;
  const emergencyScale = useRef(new Animated.Value(0)).current;
  const feedingScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(shadowScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(180, [
        Animated.spring(cryHistoryScale, { toValue: 1, useNativeDriver: true }),
        Animated.spring(cryRecordScale, { toValue: 1, useNativeDriver: true }),
        Animated.spring(emergencyScale, { toValue: 1, useNativeDriver: true }),
        Animated.spring(feedingScale, { toValue: 1, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
      locations={[0, 0.55, 1]}
      style={styles.container}
    >

      {ageExceeded && (
  <View style={styles.warningBanner}>
    <Text style={styles.warningText}>
      This app is only valid for infants below 1 year.
    </Text>
  </View>
)}

      {/* HAMBURGER */}
      <TouchableOpacity
        style={styles.menuWrapper}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <LinearGradient colors={['#E6F4FF', '#FFFFFF']} style={styles.menuIconCircle}>
          <Icon name="menu" size={28} color="#333" />
        </LinearGradient>
      </TouchableOpacity>

      {/* WELCOME */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeName}>{user?.parentName}</Text>
      </View>

      {/* MENU */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>

            {/* PROFILE */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile', {
                  user: user,
                  activeInfant: activeInfant
                });
              }}
            >
              <Icon name="account-circle-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
            >
              <Icon name="logout" size={22} color="#333" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      )}

      {/* CENTER IMAGE */}
      <Animated.View style={[styles.centerWrapper, { transform: [{ translateY: imageTranslateY }] }]}>
        <Animated.View style={[styles.blueShadow, { transform: [{ scale: shadowScale }] }]} />
        <Image source={require('../assets/images/mom_baby.png')} style={styles.centerImage} />
      </Animated.View>

      {/* ICONS */}
 <Animated.View
  style={[styles.iconBlock, styles.topLeft, { transform: [{ scale: cryRecordScale }] }]}
>
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() =>
  navigation.navigate('RecordingScreen', {
     childName: activeInfant ? activeInfant.name : 'Baby',
     infantId: activeInfant ? activeInfant._id : null
  })
}
    style={{ alignItems: 'center' }}
  >
    <LinearGradient colors={['#bfdef6', '#FFFFFF']} style={styles.iconCircle}>
      <Image
        source={require('../assets/images/cryrecord.png')}
        style={styles.iconImg}
      />
    </LinearGradient>

    <Text style={styles.iconLabel}>Cry Record</Text>
  </TouchableOpacity>
</Animated.View>

<Animated.View
        style={[styles.iconBlock, styles.topRight, { transform: [{ scale: feedingScale }] }]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
  navigation.navigate('FeedingDashboardScreen', {
    activeInfant: activeInfant
  })
}
          style={{ alignItems: 'center' }}
        >
          <LinearGradient colors={['#bfdef6', '#FFFFFF']} style={styles.iconCircle}>
            <Image
              source={require('../assets/images/feedingdashboard.png')}
              style={styles.iconImg}
            />
          </LinearGradient>

          <Text style={styles.iconLabel}>Feeding</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.iconBlock, styles.bottomLeft, { transform: [{ scale: cryHistoryScale }] }]}>
  
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() =>
      navigation.navigate('CryHistory', {
  infantId: activeInfant ? activeInfant._id : null,
  childName: activeInfant ? activeInfant.name : 'Baby'
})
    }
    style={{ alignItems: 'center' }}
  >

    <LinearGradient colors={['#bfdef6', '#FFFFFF']} style={styles.iconCircle}>
      <Image
        source={require('../assets/images/cryhistory.png')}
        style={{ width: 90, height: 80, resizeMode: 'contain' }}
      />
    </LinearGradient>

    <Text style={styles.iconLabel}>Cry History</Text>

  </TouchableOpacity>

</Animated.View>

      <Animated.View style={[styles.iconBlock, styles.bottomRight, { transform: [{ scale: emergencyScale }] }]}>
        <TouchableOpacity
  onPress={() =>
    navigation.navigate('EmergencySupport', {
      parentId: user._id
    })}>
          <LinearGradient colors={['#bfdef6', '#FFFFFF']} style={styles.iconCircle}>
            <Image source={require('../assets/images/hospital.png')} style={styles.iconImg} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.iconLabel}>Emergency</Text>
      </Animated.View>

      {/* ACTIVE INFANT */}
      {activeInfant && (
        <View style={styles.activeInfantNameWrapper}>
          <Text style={styles.activeInfantName}>{activeInfant.name}</Text>
        </View>
      )}

      {/* OVERLAY */}
      {showInfantSwitcher && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
          onPress={() => setShowInfantSwitcher(false)}
        />
      )}

      {/* CHATBOT BUTTON */}
<TouchableOpacity
  style={styles.chatbotBtn}
  onPress={() => navigation.navigate('Chatbot')}
>
  <View style={styles.chatbotInner}>
    <Icon name="robot-outline" size={22} color="#d5e7f4" />
  </View>
</TouchableOpacity>


      {/* SWITCH BUTTON */}
      <TouchableOpacity
        style={styles.switchBtn}
        onPress={() => setShowInfantSwitcher(!showInfantSwitcher)}
      >
        {showInfantSwitcher && (
          <TouchableOpacity activeOpacity={1} style={styles.infantPopup}>
            {user?.infants?.map((infant) => (
              <TouchableOpacity
                key={infant._id}
                style={styles.infantItem}
                onPress={async () => {
                  setActiveInfant(infant);
                  setShowInfantSwitcher(false);
                  await AsyncStorage.setItem('activeInfantId', infant._id);
                }}
              >
                <Icon name="baby-face-outline" size={22} color="#3FA9F5" />
                <Text style={styles.infantName}>{infant.name}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        )}

        <LinearGradient colors={['#bfdef6', '#FFFFFF']} style={styles.iconCircle}>
          <Image source={require('../assets/images/baby1.png')} style={{ width: 55, height: 85, resizeMode: 'contain', bottom: -3 }} />
        </LinearGradient>
      </TouchableOpacity>

    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },

  menuWrapper: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 30,
  },

  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },

  menuDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 170,
    backgroundColor: '#d2e9fa',
    borderRadius: 12,
    elevation: 7,
    paddingVertical: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  menuText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  welcomeContainer: {
    position: 'absolute',
    top: 55,
    left: 30,
  },

  welcomeTitle: {
    fontSize: 64,
    fontFamily: 'Cookie-Regular',
    color: '#3FA9F5',
  },

  welcomeName: {
    fontSize: 39,
    fontFamily: 'Cookie-Regular',
    color: '#3FA9F5',
  },

  centerWrapper: {
    position: 'absolute',
    top: height * 0.18,
    alignSelf: 'center',
    width: 550,
    height: 760,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  blueShadow: {
    position: 'absolute',
    bottom: 120,
    width: 360,
    height: 360,
    backgroundColor: '#9FD6FF',
    borderRadius: 180,
    opacity: 0.35,
  },

  iconBlock: {
    position: 'absolute',
    alignItems: 'center',
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDEBFF',
    elevation: 4,
  },

  iconImg: {
    width: 80,
    height: 54,
    resizeMode: 'contain',
  },

  iconLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },

  topLeft: { top: height * 0.28, left: 98 },
  topRight: { top: height * 0.28, right: 45 },
  bottomLeft: { top: height * 0.38, left: 35 },
  bottomRight: { top: height * 0.25, right: 25, left: 65 },

  switchBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    zIndex: 5,
  },

  infantPopup: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#EAF7FF',
    borderRadius: 16,
    paddingVertical: 8,
    width: 180,
    elevation: 8,
    zIndex: 6,
  },

  infantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  infantName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  activeInfantNameWrapper: {
    position: 'absolute',
    bottom: 42,
    right: 95,
  },

  activeInfantName: {
    fontFamily: 'Cookie-Regular',
    fontSize: 44,
    color: '#068ff1',
  },
  chatbotBtn: {
  position: 'absolute',
  bottom: 35,
  left: 20,
  width: 48,   // Smaller than switch button (60)
  height: 48,
  borderRadius: 24,
  backgroundColor: '#6db7ec', // Blur glass effect
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
  zIndex: 5,
},

chatbotInner: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: '#69b3e8',
  justifyContent: 'center',
  alignItems: 'center',
},

warningBanner: {
  position: 'absolute',
  top: 205,
  width: '100%',
  backgroundColor: '#FF6B6B',
  paddingVertical: 6,
  alignItems: 'center',
  zIndex: 50,
},

warningText: {
  color: '#fff',
  fontSize: 13,
  fontWeight: '600',
},

});
