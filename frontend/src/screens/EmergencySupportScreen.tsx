import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function EmergencySupportScreen({ navigation, route }: any) {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Support</Text>

      {/* NEARBY HOSPITALS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('NearbyHospitals')}
      >
        <Icon name="hospital-o" size={32} color="#3FA9F5" />
        <Text style={styles.cardText}>Nearby Hospitals</Text>
      </TouchableOpacity>

      {/* EMERGENCY CONTACTS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
  navigation.navigate('EmergencyContacts', {
    parentId: route?.params?.parentId
  })
}
      >
        <Icon name="phone" size={32} color="#3FA9F5" />
        <Text style={styles.cardText}>Emergency Contacts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBFF',
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3FA9F5',
    textAlign: 'center',
    marginBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  cardText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
    fontWeight: '600',
  },
});