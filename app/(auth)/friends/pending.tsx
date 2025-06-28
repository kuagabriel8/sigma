import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import firestore, { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  deleteField 
} from '@react-native-firebase/firestore';
import auth, { getAuth } from '@react-native-firebase/auth';
/*
interface PendingRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderProfileImage?: string;
  status: 'pending';
}

interface FriendshipData {
  pending?: Record<string, {
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
}

const fetchPendingRequests = async () => {
  try {
    if (!currentUser) return;
    setLoading(true);

    // 1. Get friendship document
    const friendshipDoc = await getDoc(doc(db, 'friendships', currentUser.uid));
    
    if (!friendshipDoc.exists()) {
      setPendingRequests([]);
      return;
    }

    // 2. Process pending requests with type safety
    const friendshipData = friendshipDoc.data() as FriendshipData;
    const pendingData = friendshipData?.pending || {};

    // 3. Convert to array and filter requests where current user is receiver
    const pendingRequests = await Promise.all(
      Object.entries(pendingData)
        .filter(([_, request]) => request.receiverId === currentUser.uid && request.status === 'pending')
        .map(async ([requestId, request]) => {
          // 4. Fetch sender details
          const senderDoc = await getDoc(doc(db, 'users', request.senderId));
          const senderData = senderDoc.data();
          
          return {
            id: requestId,
            senderId: request.senderId,
            senderName: senderData?.username || 'Unknown User',
            senderEmail: senderData?.email || 'No email',
            senderProfileImage: senderData?.profileImage,
            status: 'pending' as const
          };
        })
    );

    setPendingRequests(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    Alert.alert('Error', 'Failed to load pending requests');
  } finally {
    setLoading(false);
  }
};

const PendingScreen = () => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchPendingRequests();
    }
  }, [currentUser]);

  const fetchPendingRequests = async () => {
    try {
      if (!currentUser) return;

      // Get current user's friendship document
      const friendshipDoc = await getDoc(doc(db, 'friendships', currentUser.uid));
      
      if (!friendshipDoc.exists()) {
        setLoading(false);
        return;
      }

      const friendshipData = friendshipDoc.data();
      const pendingData = friendshipData.pending || {};
      
      // Filter for requests where current user is the receiver
      const pendingRequestsArray: PendingRequest[] = [];
      
      for (const [requestId, requestData] of Object.entries(pendingData)) {
        const data = requestData as any;
        if (data.receiverId === currentUser.uid && data.status === 'pending') {
          // Fetch sender details
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          
          if (senderDoc.exists()) {
            const senderData = senderDoc.data();
            pendingRequestsArray.push({
              id: requestId,
              senderId: data.senderId,
              senderName: senderData.username || 'Unknown User',
              senderEmail: senderData.email || '',
              senderProfileImage: senderData.profileImage,
              status: 'pending'
            });
          }
        }
      }
      
      setPendingRequests(pendingRequestsArray);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      Alert.alert('Error', 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: PendingRequest) => {
    try {
      if (!currentUser) return;
      
      // Update current user's document
      const currentUserRef = doc(db, 'friendships', currentUser.uid);
      
      // Add sender to friends list
      await updateDoc(currentUserRef, {
        friendsId: arrayUnion(request.senderId),
        [`pending.${request.id}`]: deleteField()
      });
      
      // Update sender's document
      const senderRef = doc(db, 'friendships', request.senderId);
      
      // Add current user to sender's friends list
      await updateDoc(senderRef, {
        friendsId: arrayUnion(currentUser.uid),
        [`pending.${request.id}`]: deleteField()
      });
      
      // Update local state
      setPendingRequests(prevRequests => 
        prevRequests.filter(req => req.id !== request.id)
      );
      
      Alert.alert('Success', `You are now friends with ${request.senderName}`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (request: PendingRequest) => {
    try {
      if (!currentUser) return;
      
      // Update current user's document to remove the pending request
      const currentUserRef = doc(db, 'friendships', currentUser.uid);
      await updateDoc(currentUserRef, {
        [`pending.${request.id}`]: deleteField()
      });
      
      // Update sender's document to remove the pending request
      const senderRef = doc(db, 'friendships', request.senderId);
      await updateDoc(senderRef, {
        [`pending.${request.id}`]: deleteField()
      });
      
      // Update local state
      setPendingRequests(prevRequests => 
        prevRequests.filter(req => req.id !== request.id)
      );
      
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const renderPendingRequest = ({ item }: { item: PendingRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.userInfo}>
        <Image
          source={
            item.senderProfileImage
              ? { uri: item.senderProfileImage }
              : require('../../../assets/images/icon.png') // Use a default image from your assets
          }
          style={styles.profileImage}
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.senderName}</Text>
          <Text style={styles.email}>{item.senderEmail}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item)}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00809D" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending friend requests</Text>
          <Text style={styles.emptySubtext}>
            When someone sends you a friend request, it will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={renderPendingRequest}
          keyExtractor={(item) => item.id}
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
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#00809D', // Azure from your palette
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FF7601', // Dark orange from your palette
  },
  rejectButtonText: {
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

export default PendingScreen; */

const PendingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pending Friend Requests</Text>
    </View>
  );
};
export default PendingScreen;