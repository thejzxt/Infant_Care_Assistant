import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';

export default function NearbyHospitalsScreen() {

  useEffect(() => {
    openHospitals();
  }, []);

  const openHospitals = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const url = Platform.select({
        android: 'google.navigation:q=hospitals',
        ios: 'http://maps.apple.com/?q=hospitals',
      });

      console.log('Attempting to open URL:', url);

      // Check if we can open this URL first
      const canOpen = await Linking.canOpenURL(url);
      console.log('Can open URL?', canOpen);

      if (canOpen) {
        Linking.openURL(url).catch((error) => {
          console.error('Error opening URL:', error);
          Alert.alert('Error', 'Unable to open Google Maps');
        });
      } else {
        // Try alternative URLs if the first one fails
        openAlternativeMaps();
      }
    } catch (error) {
      console.error('Error in openHospitals:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const openAlternativeMaps = () => {
    // Try different URL formats
    const alternativeUrls = {
      android: [
        'comgooglemaps://?q=hospitals',
        'https://www.google.com/maps/search/hospitals',
        'geo:0,0?q=hospitals',
      ],
      ios: [
        'comgooglemaps://?q=hospitals',
        'http://maps.apple.com/?q=hospitals+near+me',
        'https://www.google.com/maps/search/hospitals',
      ],
    };

    const urls = Platform.OS === 'android' ? alternativeUrls.android : alternativeUrls.ios;

    // Try each URL until one works
    for (const url of urls) {
      Linking.canOpenURL(url).then(canOpen => {
        if (canOpen) {
          console.log('Opening alternative URL:', url);
          Linking.openURL(url);
          return;
        }
      }).catch(() => {});
    }

    // If nothing works, show installation prompt
    Alert.alert(
      'Google Maps Not Available',
      'Please install Google Maps to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Install',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('https://apps.apple.com/app/google-maps/id585027354');
            } else {
              Linking.openURL('market://details?id=com.google.android.apps.maps');
            }
          }
        }
      ]
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Allow location access to find nearby hospitals',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to find hospitals near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3FA9F5" />
      <Text style={styles.text}>Finding nearby hospitals…</Text>
      <Text style={styles.subtext}>Opening Google Maps Navigation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 18,
    color: '#3FA9F5',
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});