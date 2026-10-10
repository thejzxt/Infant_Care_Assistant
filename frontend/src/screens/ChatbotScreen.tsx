import React, { useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
FlatList,
StyleSheet,
Keyboard,
KeyboardAvoidingView,
Platform
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

export default function ChatbotScreen() {

const [message, setMessage] = useState("");
const [messages, setMessages] = useState([
{ id: "1", text: "Hello! I'm your Infant Care Assistant 🤖", sender: "bot" }
]);

const sendMessage = async () => {

if (!message.trim()) return;

const userMsg = {
id: Date.now().toString() + Math.random(),
text: message,
sender: "user"
};

setMessages(prev => [...prev, userMsg]);

try {

const response = await fetch("http://10.160.144.230:8001/chat", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
user_id: "parent_app",
message: message
})
});

const data = await response.json();

const botMsg = {
id: Date.now().toString() + Math.random(),
text: data.reply || "I couldn't understand that.",
sender: "bot"
};

setMessages(prev => [...prev, botMsg]);

} catch (error) {

const botMsg = {
id: Date.now().toString() + Math.random(),
text: "Server error. Please try again.",
sender: "bot"
};

setMessages(prev => [...prev, botMsg]);

}

setMessage("");
Keyboard.dismiss();

};

const renderItem = ({ item }) => {

const isUser = item.sender === "user";

return (
<View
style={[
styles.bubble,
isUser ? styles.userBubble : styles.botBubble
]}
>
<Text style={isUser ? styles.userText : styles.botText}>
{item.text}
</Text>
</View>
);
};

return (

<KeyboardAvoidingView
style={{ flex: 1 }}
behavior={Platform.OS === "ios" ? "padding" : "height"}
>

<LinearGradient
colors={['#EAF7FF', '#CFEFFF', '#A9DCFF']}
style={styles.container}
>

<FlatList
data={messages}
renderItem={renderItem}
keyExtractor={item => item.id}
contentContainerStyle={{ padding: 20, paddingTop: 60 }}
/>

<View style={styles.inputRow}>

<TextInput
value={message}
onChangeText={setMessage}
placeholder="Ask about baby care..."
style={styles.input}
/>

<TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
<Text style={{color:"#fff"}}>Send</Text>
</TouchableOpacity>

</View>

</LinearGradient>

</KeyboardAvoidingView>

);
}

const styles = StyleSheet.create({

container:{
flex:1
},

bubble:{
padding:12,
borderRadius:16,
marginVertical:6,
maxWidth:"75%"
},

userBubble:{
backgroundColor:"#3FA9F5",
alignSelf:"flex-end"
},

botBubble:{
backgroundColor:"#FFFFFF",
alignSelf:"flex-start"
},

userText:{
color:"#fff"
},

botText:{
color:"#333"
},

inputRow:{
flexDirection:"row",
padding:10,
backgroundColor:"#fff"
},

input:{
flex:1,
backgroundColor:"#f2f7ff",
borderRadius:20,
paddingHorizontal:15
},

sendBtn:{
backgroundColor:"#3FA9F5",
paddingHorizontal:20,
justifyContent:"center",
marginLeft:10,
borderRadius:20
}

});