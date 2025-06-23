import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

{/*}
interface Friend {
  id: string;
  username?: string;
  profileImage?: string;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('friendships')
      .doc(userId)
      .onSnapshot((doc) => {
        const friendIds: string[] = doc.data()?.friends || [];
        setFriends(friendIds.map(id => ({ id }))); // Initialize with just IDs
      });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FriendItem userId={item.id} />}
      />
    </View>
  );
}

function FriendItem({ userId }: { userId: string }) {
  const [user, setUser] = useState<Friend | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const doc = await firestore().collection('users').doc(userId).get();
      setUser({ id: userId, ...doc.data() } as Friend);
    };
    fetchUser();
  }, [userId]);

  if (!user) return null;

  return (
    <View style={styles.friendItem}>
      <Image 
        source={{ uri: user.profileImage || 'https://i.imgur.com/smk7dld.png' }} 
        style={styles.avatar}
      />
      <Text style={styles.username}>{user.username || 'Unknown User'}</Text>
    </View>
  );
}

const usersCollection = firestore().collection('users');


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
  },
});
*/}
const FriendsScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Friends Paage</Text>
        </View>
    );
};

const usersCollection = firestore().collection('users');

export default FriendsScreen;