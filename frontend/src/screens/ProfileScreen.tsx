import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');
const API_URL = 'http://10.160.144.230:5000/api';

export default function ProfileScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('parent');

  // Get user from route params if available
  const routeUser = route?.params?.user || null;
  const routeInfant = route?.params?.activeInfant || null;

  // Parent state with initial values from route
  const [email, setEmail] = useState(routeUser?.email || '');
  const [parentName, setParentName] = useState(routeUser?.parentName || '');

  // Infant state with initial values from route
  const [infantId, setInfantId] = useState(routeInfant?._id || null);
  const [infantName, setInfantName] = useState(routeInfant?.name || '');
  const [infantDob, setInfantDob] = useState(routeInfant?.dob || '');
  const [infantWeight, setInfantWeight] = useState(routeInfant?.weight || '');
  const [infantHeight, setInfantHeight] = useState(routeInfant?.height || '');

  // New infant state
  const [newInfantName, setNewInfantName] = useState('');
  const [newInfantDob, setNewInfantDob] = useState('');
  const [newInfantWeight, setNewInfantWeight] = useState('');
  const [newInfantHeight, setNewInfantHeight] = useState('');
  const [gender, setGender] = useState('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateTarget, setDateTarget] = useState(null);

  // Animations
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ⭐ UPDATED LOAD PROFILE - Combine route data with API data */
  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      console.log('Route User:', routeUser);
      console.log('Route Infant:', routeInfant);

      // First check if we have route data
      if (routeUser) {
        setEmail(routeUser.email || '');
        setParentName(routeUser.parentName || '');
      }

      // Also try to get from AsyncStorage as fallback
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        console.log('Stored User:', user);
        
        // Only update if not already set from route
        if (!email && user.email) setEmail(user.email);
        if (!parentName && user.parentName) setParentName(user.parentName);
      }

      // Get current email for API call
      const currentEmail = email || routeUser?.email;
      if (!currentEmail) {
        console.log('No email available for API call');
        return;
      }

      console.log('Fetching profile for email:', currentEmail);
      
      // Fetch updated profile from API
      const res = await fetch(`${API_URL}/profile?email=${currentEmail}`);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);

      if (data) {
        setParentName(data.parentName || parentName);

        // Handle infants data
        if (data.infants?.length > 0) {
          console.log('Infants found:', data.infants);
          
          const activeId = await AsyncStorage.getItem('activeInfantId');
          console.log('Active Infant ID from storage:', activeId);
          
          let infant = data.infants[0];

          // Priority: 1. Route infant, 2. Stored active infant, 3. First infant
          if (routeInfant) {
            console.log('Using route infant:', routeInfant);
            infant = routeInfant;
          } else if (activeId) {
            const found = data.infants.find(i => i._id === activeId);
            if (found) {
              console.log('Using stored active infant:', found);
              infant = found;
            }
          }

          setInfantId(infant._id || null);
          setInfantName(infant.name || '');
          setInfantDob(infant.dob || '');
          setInfantWeight(infant.weight || '');
          setInfantHeight(infant.height || '');
          
          console.log('Set infant data:', {
            name: infant.name,
            dob: infant.dob,
            weight: infant.weight,
            height: infant.height
          });
        } else {
          console.log('No infants found in API response');
        }
      }
    } catch (err) {
      console.log('Profile Load Error', err);
      Alert.alert('Error', 'Failed to load profile data. Please check your connection.');
    }
  };

  /* ⭐ FIX → REFRESH WHEN SCREEN OPENS */
  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused, loading profile...');
      loadProfile();
    }, [route?.params?.user, route?.params?.activeInfant])
  );

  /* ANIMATION */
  useFocusEffect(
    useCallback(() => {
      slideAnim.setValue(20);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, [activeTab])
  );

  /* DATE HANDLER */
  const handleDateChange = (e, date) => {
    setShowDatePicker(false);
    if (!date) return;

    const formatted = date.toLocaleDateString('en-GB');

    if (dateTarget === 'infant') setInfantDob(formatted);
    if (dateTarget === 'add') setNewInfantDob(formatted);
  };

  /* SAVE PARENT - Updated without phone */
  const saveParent = async () => {
    try {
      const userEmail = email || routeUser?.email;
      if (!userEmail) {
        Alert.alert('Error', 'No email found. Please login again.');
        return;
      }

      if (!parentName.trim()) {
        Alert.alert('Validation Error', 'Please enter parent name');
        return;
      }

      const response = await fetch(`${API_URL}/profile/parent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          parentName
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Parent details updated successfully');
        
        // Update AsyncStorage
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const userObj = JSON.parse(stored);
          userObj.parentName = parentName;
          await AsyncStorage.setItem('user', JSON.stringify(userObj));
        }
        
        // Reload profile
        loadProfile();
      } else {
        Alert.alert('Error', result.message || 'Failed to update parent details');
      }
    } catch (err) {
      console.log('Save Parent Error', err);
      Alert.alert('Error', 'Failed to update parent details. Please check your connection.');
    }
  };

  /* SAVE INFANT - Updated */
  const saveInfant = async () => {
    try {
      const userEmail = email || routeUser?.email;
      if (!userEmail) {
        Alert.alert('Error', 'No email found. Please login again.');
        return;
      }

      if (!infantId) {
        Alert.alert('Error', 'No infant selected. Please select an infant first.');
        return;
      }

      if (!infantName.trim()) {
        Alert.alert('Validation Error', 'Please enter infant name');
        return;
      }

      const response = await fetch(`${API_URL}/profile/infant`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          infantId,
          updatedData: {
            name: infantName,
            dob: infantDob,
            weight: infantWeight,
            height: infantHeight,
          },
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Infant details updated successfully');
        
        // Update AsyncStorage active infant if needed
        const activeId = await AsyncStorage.getItem('activeInfantId');
        if (activeId === infantId) {
          const stored = await AsyncStorage.getItem('user');
          if (stored) {
            const userObj = JSON.parse(stored);
            if (userObj.infants) {
              const infantIndex = userObj.infants.findIndex(i => i._id === infantId);
              if (infantIndex !== -1) {
                userObj.infants[infantIndex] = {
                  ...userObj.infants[infantIndex],
                  name: infantName,
                  dob: infantDob,
                  weight: infantWeight,
                  height: infantHeight,
                };
                await AsyncStorage.setItem('user', JSON.stringify(userObj));
              }
            }
          }
        }
        
        // Reload profile
        loadProfile();
      } else {
        Alert.alert('Error', result.message || 'Failed to update infant details');
      }
    } catch (err) {
      console.log('Save Infant Error', err);
      Alert.alert('Error', 'Failed to update infant details. Please check your connection.');
    }
  };

  /* ADD INFANT - Updated */
  const addInfant = async () => {
    try {
      // Validate required fields
      if (!newInfantName.trim()) {
        Alert.alert('Missing Information', 'Please enter infant name');
        return;
      }

      if (!newInfantDob) {
        Alert.alert('Missing Information', 'Please select date of birth');
        return;
      }

      if (!gender) {
        Alert.alert('Missing Information', 'Please select gender');
        return;
      }

      // Weight validation (same as signup)
if (newInfantWeight) {
  const weightValue = parseFloat(newInfantWeight);

  if (isNaN(weightValue) || weightValue <= 0 || weightValue > 15) {
    Alert.alert('Invalid Weight', 'Please enter a valid weight between 0 and 15 kg');
    return;
  }
}

      const userEmail = email || routeUser?.email;
      if (!userEmail) {
        Alert.alert('Error', 'No email found. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/auth/add-infant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          infant: {
            name: newInfantName,
            dob: newInfantDob,
            gender,
            weight: newInfantWeight,
            height: newInfantHeight,
          },
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Infant added successfully', [
          {
            text: 'OK',
            onPress: async () => {
              // Clear form
              setNewInfantName('');
              setNewInfantDob('');
              setNewInfantWeight('');
              setNewInfantHeight('');
              setGender('');
              
              // Reload profile to show new infant
              await loadProfile();
              
              // Switch to infant tab to see the new infant
              setActiveTab('infant');
              
              // Update AsyncStorage with new infant
              const stored = await AsyncStorage.getItem('user');
              if (stored) {
                const userObj = JSON.parse(stored);
                if (!userObj.infants) userObj.infants = [];
                userObj.infants.push(result.infant);
                await AsyncStorage.setItem('user', JSON.stringify(userObj));
                
                // Set as active infant
                if (result.infant._id) {
                  await AsyncStorage.setItem('activeInfantId', result.infant._id);
                }
              }
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to add infant');
      }
    } catch (err) {
      console.log('Add Infant Error', err);
      Alert.alert('Error', 'Failed to add infant. Please check your connection.');
    }
  };

  return (
    <LinearGradient colors={['#EEF6FF', '#FFFFFF']} style={styles.container}>
      <Image source={require('../assets/images/profilepage.png')} style={styles.backgroundImage} />

      <View style={styles.header}>
        <Text style={styles.headerName}>{parentName || 'Parent Name'}</Text>
        <Text style={styles.headerEmail}>{email || 'user@email.com'}</Text>
      </View>

      <View style={styles.tabRow}>
        {['parent', 'infant', 'add'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
              {tab === 'parent'
                ? 'Parent Details'
                : tab === 'infant'
                ? 'Infant Details'
                : 'Add Infant'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={[
          styles.glassContainer,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={25}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

            {activeTab === 'parent' && (
  <>
    <Text style={styles.title}>Parent Details</Text>

    <Text style={styles.fieldLabel}>Parent Name</Text>
    <TextInput 
      style={styles.input} 
      value={parentName} 
      onChangeText={setParentName} 
      placeholder="Parent Name" 
      placeholderTextColor="#9CA3AF"
    />

    <Text style={styles.fieldLabel}>Email</Text>
    <TextInput 
      style={styles.input} 
      value={email} 
      editable={false}
      placeholder="Email"
      placeholderTextColor="#9CA3AF"
    />

    <SaveButton onPress={saveParent} />
  </>
)}

           {activeTab === 'infant' && (
  <>
    <Text style={styles.title}>Infant Details</Text>
    {infantName ? (
      <>
        <Text style={styles.fieldLabel}>Infant Name</Text>
        <TextInput 
          style={styles.input} 
          value={infantName} 
          onChangeText={setInfantName} 
          placeholder="Infant Name"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <TouchableOpacity onPress={() => { setDateTarget('infant'); setShowDatePicker(true); }}>
          <TextInput 
            style={styles.input} 
            value={infantDob} 
            editable={false} 
            placeholder="Date of Birth"
            placeholderTextColor="#9CA3AF"
          />
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <TextInput 
          style={styles.input} 
          value={infantWeight} 
          onChangeText={setInfantWeight} 
          placeholder="Weight (kg)"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
        />

        <SaveButton onPress={saveInfant} />
      </>
                ) : (
                  <View style={styles.noInfantContainer}>
                    <Text style={styles.noInfantText}>No infant found</Text>
                    <Text style={styles.noInfantSubtext}>
                      Please add an infant using the "Add Infant" tab
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'add' && (
              <>
                <Text style={styles.title}>Add Infant</Text>

                <TextInput 
                  style={styles.input} 
                  value={newInfantName} 
                  onChangeText={setNewInfantName} 
                  placeholder="Infant Name *" 
                  placeholderTextColor="#9CA3AF" 
                />

                <TouchableOpacity onPress={() => { setDateTarget('add'); setShowDatePicker(true); }}>
                  <TextInput 
                    style={styles.input} 
                    value={newInfantDob} 
                    editable={false} 
                    placeholder="Date of Birth *" 
                    placeholderTextColor="#9CA3AF" 
                  />
                </TouchableOpacity>

                <TextInput 
                  style={styles.input} 
                  value={newInfantWeight} 
                  onChangeText={setNewInfantWeight} 
                  placeholder="Weight (kg)" 
                  placeholderTextColor="#9CA3AF" 
                  keyboardType="decimal-pad"
                />
                

                <Text style={styles.genderLabel}>Gender *</Text>
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

                <SaveButton label="Add Infant" onPress={addInfant} />
              </>
            )}

          </ScrollView>
        </BlurView>
      </Animated.View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </LinearGradient>
  );
}

const SaveButton = ({ label = 'Save Changes', onPress }) => (
  <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
    <Text style={styles.saveText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  backgroundImage: { 
    position: 'absolute', 
    width: width * 0.9, 
    height: height * 0.45, 
    right: 2, 
    top: 270 
  },
  header: { 
    alignItems: 'center', 
    marginTop: 90 
  },
  headerName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#2D9CDB' 
  },
  headerEmail: { 
    fontSize: 13, 
    color: '#7A9CC6' 
  },
  tabRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 14 
  },
  tab: { 
    paddingHorizontal: 16,
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#EAF4FF' 
  },
  activeTab: { 
    backgroundColor: '#2D9CDB' 
  },
  tabText: { 
    color: '#2D9CDB',
    fontSize: 12,
    fontWeight: '500'
  },
  activeTabText: { 
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },

  fieldLabel: {
  fontSize: 13,
  color: '#6B93C5',
  marginBottom: 4,
  marginTop: 6,
  fontWeight: '600'
},

  glassContainer: { 
    alignSelf: 'center', 
    top: 40, 
    width: width * 0.9, 
    height: 500, 
    borderRadius: 30, 
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurView: { 
    flex: 1 
  },
  form: { 
    padding: 22 
  },
  title: { 
    fontSize: 22, 
    color: '#2D9CDB', 
    marginBottom: 20,
    fontWeight: '600'
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#D1E3FF',
    marginBottom: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333'
  },
  saveBtn: { 
    backgroundColor: '#2D9CDB', 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 20,
    alignSelf: 'center',
    width: '100%'
  },
  saveText: { 
    color: '#fff', 
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  genderLabel: { 
    fontWeight: '600', 
    color: '#6B93C5', 
    marginBottom: 10,
    fontSize: 16
  },
  radioGroup: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  radioOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 30 
  },
  radioCircle: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#2D9CDB', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8 
  },
  radioSelected: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#2D9CDB' 
  },
  radioText: { 
    color: '#333', 
    fontSize: 14 
  },
  noInfantContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noInfantText: {
    fontSize: 18,
    color: '#2D9CDB',
    fontWeight: '600',
    marginBottom: 10,
  },
  noInfantSubtext: {
    fontSize: 14,
    color: '#7A9CC6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});