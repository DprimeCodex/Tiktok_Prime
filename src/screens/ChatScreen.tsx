import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';

// Sample user data
const initialUsers = [
  { id: '1', name: 'John Doe', avatar: 'JD', lastMessage: 'Hey, how are you?' },
  { id: '2', name: 'Sarah Smith', avatar: 'SS', lastMessage: 'Did you see the meeting notes?' },
  { id: '3', name: 'Mike Johnson', avatar: 'MJ', lastMessage: 'Lunch tomorrow?' },
  { id: '4', name: 'Emily Davis', avatar: 'ED', lastMessage: 'Thanks for your help!' },
  { id: '5', name: 'Chris Wilson', avatar: 'CW', lastMessage: 'Can we talk about the project?' },
];

const ChatScreen = () => {
  const [users] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [chats, setChats] = useState({});

  // Initialize chat if needed and return messages for the current user
  const getCurrentChat = (userId) => {
    if (!chats[userId]) {
      setChats(prevChats => ({
        ...prevChats,
        [userId]: []
      }));
      return [];
    }
    return chats[userId];
  };

  const openChat = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
    // Ensure the user has a chat initialized
    getCurrentChat(user.id);
  };

  const closeChat = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const sendMessage = () => {
    if (text.trim() && selectedUser) {
      const newMessage = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChats(prevChats => ({
        ...prevChats,
        [selectedUser.id]: [...(prevChats[selectedUser.id] || []), newMessage]
      }));
      
      setText('');
      
      // Simulate response (optional)
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          text: `Response to: ${text.trim()}`,
          sender: selectedUser.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChats(prevChats => ({
          ...prevChats,
          [selectedUser.id]: [...(prevChats[selectedUser.id] || []), response]
        }));
      }, 1000);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => openChat(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'me' ? styles.sentMessage : styles.receivedMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.header}>Chats</Text>
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        style={styles.userList}
      />

      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={closeChat}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={closeChat} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            {selectedUser && (
              <View style={styles.chatHeaderInfo}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.avatarText}>{selectedUser.avatar}</Text>
                </View>
                <Text style={styles.chatHeaderName}>{selectedUser.name}</Text>
              </View>
            )}
          </View>

          {selectedUser && (
            <FlatList
              data={getCurrentChat(selectedUser.id)}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              style={styles.chatList}
              inverted={false}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor="#777"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    padding: 16,
    marginTop:20,
    backgroundColor: '#111',
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    color: '#aaa',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#222',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    paddingRight: 16,
    paddingBottom:12
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 4,
    borderRadius: 15,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0078fe',
    borderBottomRightRadius: 5,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;