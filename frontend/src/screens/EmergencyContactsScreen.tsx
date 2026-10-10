
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  Modal
} from "react-native";

const API = "http://10.160.144.230:5000";

export default function EmergencyContactsScreen({ route }: any) {

  const parentId = route?.params?.parentId;

  const [doctors, setDoctors] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  /* NEW STATES */
  const [countryCode, setCountryCode] = useState("+91");
  const [modalVisible, setModalVisible] = useState(false);

  /* ---------------- FETCH PEDIATRICIANS ---------------- */

  const fetchDoctors = async () => {
    try {

      const res = await fetch(`${API}/api/pediatrician/${parentId}`);

      const data = await res.json();

      setDoctors(data);

    } catch (err) {
      console.log(err);
    }
  };

 useEffect(() => {
  if (parentId) {
    fetchDoctors();
  }
}, [parentId]);

  /* ---------------- ADD PEDIATRICIAN ---------------- */

  const addDoctor = async () => {

  if (!parentId) {
    Alert.alert("Parent ID missing");
    return;
  }

  if (!name || !phone) {
    Alert.alert("Please enter name and phone number");
    return;
  }

  try {

    const response = await fetch(`${API}/api/pediatrician/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parentId,
        name,
        phone: `${countryCode}${phone}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Add error:", data);
      Alert.alert("Error", data?.error || "Failed to add contact");
      return;
    }

    Alert.alert("Success", "Contact added");

    setName("");
    setPhone("");
    setCountryCode("+91");

    setModalVisible(false);

    fetchDoctors();

  } catch (err) {
    console.log(err);
    Alert.alert("Server Error", "Unable to connect to server");
  }
};

  /* ---------------- CALL FUNCTION ---------------- */

  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  /* ---------------- STATIC EMERGENCY NUMBERS ---------------- */

  const emergencyNumbers = [
    { name: "National Emergency", phone: "112" },
    { name: "Ambulance", phone: "102" },
    { name: "Police", phone: "100" },
    { name: "Childline", phone: "1098" },
    { name: "Women Helpline", phone: "1091" },
  ];

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Emergency Contacts</Text>

      {/* ---------- NATIONAL HELPLINES ---------- */}

      <Text style={styles.sectionTitle}>Emergency Helplines</Text>

      {emergencyNumbers.map((item, index) => (
        <View key={index} style={styles.card}>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => callNumber(item.phone)}
          >
            <Text style={styles.callText}>CALL</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* ---------- PEDIATRICIANS ---------- */}

      <Text style={styles.sectionTitle}>Pediatricians</Text>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => callNumber(item.phone)}
            >
              <Text style={styles.callText}>CALL</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ---------- ADD PEDIATRICIAN BUTTON ---------- */}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>Add Contact</Text>
      </TouchableOpacity>

      {/* ---------- ADD CONTACT MODAL ---------- */}

      <Modal visible={modalVisible} transparent animationType="fade">

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>Add Pediatrician</Text>

           <TextInput
  placeholder="Country Code (+91)"
  placeholderTextColor="#999"
  style={styles.input}
  value={countryCode}
  onChangeText={setCountryCode}
/>

           <TextInput
  placeholder="Doctor Name"
  placeholderTextColor="#999"
  style={styles.input}
  value={name}
  onChangeText={setName}
/>

<TextInput
  placeholder="Phone Number"
  placeholderTextColor="#999"
  style={styles.input}
  keyboardType="phone-pad"
  value={phone}
  onChangeText={setPhone}
/>

            <TouchableOpacity style={styles.saveButton} onPress={addDoctor}>
              <Text style={{color:"#fff",fontWeight:"bold"}}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={()=>setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7FBFF",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3FA9F5",
    textAlign: "center",
    marginBottom: 20,
     marginTop: 30
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#3FA9F5",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  phone: {
    color: "gray",
    marginTop: 4,
  },

  callButton: {
    backgroundColor: "#3FA9F5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  callText: {
    color: "#fff",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  addButton: {
    backgroundColor: "#3FA9F5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  addText: {
    color: "#fff",
    fontWeight: "bold",
    
  },

  /* MODAL STYLES */

  modalOverlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"center",
    alignItems:"center"
  },

  modalCard:{
    width:"85%",
    backgroundColor:"#fff",
    borderRadius:16,
    padding:20
  },

  modalTitle:{
    fontSize:20,
    fontWeight:"bold",
    color:"#3FA9F5",
    marginBottom:15,
    textAlign:"center"
  },

  saveButton:{
    backgroundColor:"#3FA9F5",
    padding:12,
    borderRadius:10,
    alignItems:"center",
    marginTop:10
  },

  cancelButton:{
    alignItems:"center",
    marginTop:10
  },

});