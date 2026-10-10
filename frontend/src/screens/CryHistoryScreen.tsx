import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CryHistoryScreen({ route, navigation }) {

  const infantId = route?.params?.infantId;
  const childName = route?.params?.childName ?? 'Baby';

  const [history, setHistory] = useState([]);

  const isFocused = useIsFocused();

  const fetchHistory = async () => {
    try {
      console.log("InfantId received:", infantId);

      const res = await fetch(
        `http://10.160.144.230:5000/api/cry/history/${infantId}`
      );

      const data = await res.json();

      setHistory(data);

    } catch (err) {
      console.log('Fetch history error:', err);
    }
  };

  // fetch when screen first loads
  useEffect(() => {
    if (infantId) {
      fetchHistory();
    }
  }, [infantId]);

  // fetch whenever screen becomes focused
  useEffect(() => {
    if (isFocused && infantId) {
      fetchHistory();
    }
  }, [isFocused, infantId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      <View style={styles.row}>
        <Icon name="baby-face-outline" size={22} color="#3FA9F5" />
        <Text style={styles.reason}>{item.reason}</Text>
      </View>

      <Text style={styles.time}>
        {item.date}   •   {item.time}
      </Text>

    </View>
  );

  return (

    <LinearGradient
      colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
      style={styles.container}
    >

      <SafeAreaView style={{ flex: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#2C6FA3" />
          </TouchableOpacity>

          <Text style={styles.title}>{childName}'s Cry History</Text>
        </View>

        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

      </SafeAreaView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 90,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2C6FA3',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reason: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },

  time: {
    marginTop: 6,
    color: '#666',
    fontSize: 13,
  },

});