import { getAuth } from '@react-native-firebase/auth';
import { arrayRemove, doc, getDoc, getFirestore, updateDoc } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Friend {
  userId: string;
  username: string;
  email: string;
  profileImage?: string;
}

interface FriendshipData {
  friendsId?: string[]; // Make optional since it might not exist
}

interface UserData {
  username: string;
  email: string;
  profileImage?: string;
  // Add other fields you expect from users collection
}

const FriendsScreen: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
    }
  }, [currentUser]);

  const fetchFriends = async () => {
    try {
      if (!currentUser) return;

      // Get current user's friendship document
      const friendshipDoc = await getDoc(doc(db, 'friendships', currentUser.uid));
    
      if (!friendshipDoc.exists()) {
        setLoading(false);
        return;
      }

      const friendshipData = friendshipDoc.data() as FriendshipData; // Type assertion
      const friendsIds = friendshipData?.friendsId || []; // Safe access with fallback
      
      if (friendsIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Fetch friend details from users collection
      const friendsData: Friend[] = [];
      for (const friendId of friendsIds) {
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData) {
            friendsData.push({
              userId: friendId,
              username: userData.username,
              email: userData.email,
              profileImage: userData.profileImage,
            });
          }
        }
      }
      
      const friendsPromises = friendsIds.map(async (friendId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', friendId));
          if (!userDoc.exists()) {
            console.warn(`Friend ${friendId} not found in users collection`);
            return null;
          }

          const userData = userDoc.data() as UserData;
          return {
            userId: friendId,
            username: userData.username, // These are now guaranteed by UserData
            email: userData.email,
            profileImage: userData.profileImage
          } as Friend;
        } catch (error) {
          console.error(`Error fetching friend ${friendId}:`, error);
          return null;
        }
      });

      const resolvedFriends = (await Promise.all(friendsPromises)).filter(Boolean) as Friend[];
      setFriends(resolvedFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const deleteFriend = async (friendId: string, friendUsername: string) => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to remove ${friendUsername} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!currentUser) return;

              // Remove friend from current user's friends list
              await updateDoc(doc(db, 'friendships', currentUser.uid), {
                friendsId: arrayRemove(friendId),
              });

              // Remove current user from friend's friends list
              await updateDoc(doc(db, 'friendships', friendId), {
                friendsId: arrayRemove(currentUser.uid),
              });

              // Update local state
              setFriends(prevFriends => 
                prevFriends.filter(friend => friend.userId !== friendId)
              );

              Alert.alert('Success', 'Friend removed successfully');
            } catch (error) {
              console.error('Error deleting friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Image
          source={
            item.profileImage
              ? { uri: item.profileImage }
              : require('./avatar.jpg') // Add default avatar
          }
          style={styles.profileImage}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFriend(item.userId, item.username)}
      >
        <Text style={styles.deleteButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Friends</Text>
      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Send friend requests to connect with others!
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
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
  friendCard: {
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
  friendInfo: {
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
  friendDetails: {
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
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

export default FriendsScreen;
