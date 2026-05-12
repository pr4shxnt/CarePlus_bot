import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const BOT_URL = 'http://localhost:3000'; // Change to your local machine IP
const SERVER_URL = 'http://localhost:3000'; // Change to your server IP
const USER_ID = 'mobile-user';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [view, setView] = useState('chat'); // 'chat' or 'history'
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', content: message };
    setChatLog([...chatLog, userMsg]);
    setMessage('');

    try {
      const response = await fetch(`${BOT_URL}/api/chat/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, message }),
      });
      const data = await response.json();
      const botMsg = { role: 'assistant', content: data.reply };
      setChatLog(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/history?userId=${USER_ID}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>CarePlus</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setView('chat')} style={[styles.tab, view === 'chat' && styles.activeTab]}>
            <Text style={[styles.tabText, view === 'chat' && styles.activeTabText]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView('history')} style={[styles.tab, view === 'history' && styles.activeTab]}>
            <Text style={[styles.tabText, view === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {view === 'chat' ? (
        <View style={styles.chatContainer}>
          <FlatList
            data={chatLog}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
            contentContainerStyle={styles.chatList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: isDarkMode ? '#fff' : '#000' }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.historyContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={styles.historyRole}>{item.role === 'user' ? 'You' : 'Assistant'}:</Text>
                  <Text style={styles.historyContent}>{item.content}</Text>
                  <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleString()}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No history synced yet.</Text>}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  tabBar: { flexDirection: 'row' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, marginRight: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { fontSize: 16, color: '#888' },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  chatContainer: { flex: 1 },
  chatList: { padding: 16 },
  messageBubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  messageText: { fontSize: 16, color: '#fff' },
  assistantBubbleText: { color: '#000' },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, marginRight: 8 },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  historyContainer: { flex: 1, padding: 16 },
  historyItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyRole: { fontWeight: 'bold', marginBottom: 4 },
  historyContent: { fontSize: 14, color: '#333' },
  historyTime: { fontSize: 10, color: '#999', marginTop: 4 },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
);
