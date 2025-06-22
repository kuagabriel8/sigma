import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FriendsScreen from './friends'; // Adjust path as needed
import PendingScreen from './pending';
import SendRequestsScreen from './sendrequests';

export default function FriendsLayout() {
  const [activeTab, setActiveTab] = useState<'friends' | 'sendrequests' | 'pending'>('friends');

  return (
    <View style={styles.container}>
      {/* Navigation Buttons */}
      <View style={styles.navBar}>
        <Pressable
          style={[styles.navButton, activeTab === 'friends' && styles.activeButton]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.navText, activeTab === 'friends' && styles.activeText]}>Friends</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, activeTab === 'sendrequests' && styles.activeButton]}
          onPress={() => setActiveTab('sendrequests')}
        >
          <Text style={[styles.navText, activeTab === 'sendrequests' && styles.activeText]}>Send Requests</Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, activeTab === 'pending' && styles.activeButton]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.navText, activeTab === 'pending' && styles.activeText]}>Pending</Text>
        </Pressable>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'friends' && <FriendsScreen />}
        {activeTab === 'sendrequests' && <SendRequestsScreen />}
        {activeTab === 'pending' && <PendingScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#007AFF',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
});