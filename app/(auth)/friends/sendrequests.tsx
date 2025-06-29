import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface User {
  userId: string;
  username: string;
  email: string;
  profileImage?: string;
}

const SendRequestsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  const currentUser = auth().currentUser;
  const db = firestore();

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      if (!currentUser) return;

      // Search for users by email or username
      const queryLower = searchQuery.toLowerCase();
      const usersSnapshot = await db.collection('users')
        .where('email', '>=', queryLower)
        .where('email', '<=', queryLower + '\uf8ff')
        .get();

      const usernameSnapshot = await db.collection('users')
        .where('username', '>=', queryLower)
        .where('username', '<=', queryLower + '\uf8ff')
        .get();

      const userMap: Record<string, User> = {};
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id !== currentUser.uid) {
          userMap[doc.id] = {
            userId: doc.id,
            username: data.username || 'Unknown User',
            email: data.email || 'No email',
            profileImage: data.profileImage
          };
        }
      });

      usernameSnapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id !== currentUser.uid && !userMap[doc.id]) {
          userMap[doc.id] = {
            userId: doc.id,
            username: data.username || 'Unknown User',
            email: data.email || 'No email',
            profileImage: data.profileImage
          };
        }
      });

      const results = Object.values(userMap);
      setSearchResults(results);

      // Check if requests have already been sent to these users
      const friendshipDoc = await db.collection('friendships').doc(currentUser.uid).get();
      if (friendshipDoc.exists()) {
        const friendshipData = friendshipDoc.data();
        const pendingRequests = friendshipData?.pending || {};
        const newSentRequests: Record<string, boolean> = {};
        Object.values(pendingRequests).forEach((req: any) => {
          if (req.status === 'pending' && req.senderId === currentUser.uid) {
            newSentRequests[req.receiverId] = true;
          }
        });
        setSentRequests(newSentRequests);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (user: User) => {
    try {
      if (!currentUser) return;

      // Check if request already sent
      if (sentRequests[user.userId]) {
        Alert.alert('Already Sent', 'Friend request already sent to this user');
        return;
      }

      const requestId = `${currentUser.uid}_${user.userId}_${Date.now()}`;

      // Update sender's document with pending request
      await db.collection('friendships').doc(currentUser.uid).set({
        pending: {
          [requestId]: {
            senderId: currentUser.uid,
            receiverId: user.userId,
            status: 'pending'
          }
        }
      }, { merge: true });

      // Update receiver's document with pending request
      await db.collection('friendships').doc(user.userId).set({
        pending: {
          [requestId]: {
            senderId: currentUser.uid,
            receiverId: user.userId,
            status: 'pending'
          }
        }
      }, { merge: true });

      // Update local state to prevent duplicate requests
      setSentRequests(prev => ({ ...prev, [user.userId]: true }));
      Alert.alert('Success', `Friend request sent to ${user.username}`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Image
          source={
            item.profileImage
              ? { uri: item.profileImage }
              : require('../../../assets/images/icon.png') // Use a default image
          }
          style={styles.profileImage}
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          sentRequests[item.userId] && styles.sentButton
        ]}
        onPress={() => sendFriendRequest(item)}
        disabled={sentRequests[item.userId]}
      >
        <Text style={styles.sendButtonText}>
          {sentRequests[item.userId] ? 'Sent' : 'Send Request'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Friend Requests</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by email or username..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00809D" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim().length > 2 ? 'No users found' : 'Type to search for users'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery.trim().length > 2 ? 'Try a different search term' : 'Enter an email or username to find friends'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUser}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  sendButton: {
    backgroundColor: '#00809D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sentButton: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SendRequestsScreen;
