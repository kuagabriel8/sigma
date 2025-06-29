import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const StartStudySession = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    interface Friend {
        userId: string;
        username: string;
    }

    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const router = useRouter();
    const currentUser = auth().currentUser;

    const openModal = () => {
        setModalVisible(true);
        fetchFriends();
    };

    const fetchFriends = async () => {
        try {
            if (!currentUser) return;
            const friendshipDoc = await firestore().collection('friendships').doc(currentUser.uid).get();
            if (friendshipDoc.exists()) {
                const friendshipData = friendshipDoc.data();
                const friendsIds = friendshipData?.friendsId || [];
                if (friendsIds.length > 0) {
                    const friendsData = [];
                    for (const friendId of friendsIds) {
                        const userDoc = await firestore().collection('users').doc(friendId).get();
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            friendsData.push({
                                userId: friendId,
                                username: userData?.username || 'Unknown User',
                            });
                        }
                    }
                    setFriends(friendsData);
                }
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const toggleFriendSelection = (friendId: string) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    };

    const createStudySession = async () => {
        try {
            if (!currentUser) return;
            if (!date || !time || !location) {
                alert('Please fill in all details for the study session.');
                return;
            }

            const sessionData = {
                creatorId: currentUser.uid,
                date: date,
                time: time,
                location: location,
                participants: [currentUser.uid, ...selectedFriends],
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            await firestore().collection('studySessions').add(sessionData);

            // Send invitations to selected friends
            for (const friendId of selectedFriends) {
                const invitationId = `${currentUser.uid}_${friendId}_${Date.now()}`;
                await firestore().collection('invitations').doc(invitationId).set({
                    sessionId: invitationId,
                    senderId: currentUser.uid,
                    receiverId: friendId,
                    status: 'pending',
                    date: date,
                    time: time,
                    location: location,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
            }

            setModalVisible(false);
            alert('Study session created successfully!');
        } catch (error) {
            console.error('Error creating study session:', error);
            alert('Failed to create study session.');
        }
    };

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <TouchableOpacity
            style={[
                styles.friendItem,
                selectedFriends.includes(item.userId) && styles.selectedFriendItem
            ]}
            onPress={() => toggleFriendSelection(item.userId)}
        >
            <Text style={styles.friendName}>{item.username}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={openModal}>
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Start a Study Session!</Text>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Study Session</Text>
                        
                        <Text style={styles.label}>Date (e.g., YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter date"
                            value={date}
                            onChangeText={setDate}
                        />
                        
                        <Text style={styles.label}>Time (e.g., HH:MM)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter time"
                            value={time}
                            onChangeText={setTime}
                        />
                        
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter location"
                            value={location}
                            onChangeText={setLocation}
                        />
                        <TouchableOpacity
                            style={styles.locationButton}
                            onPress={() => router.push('/Map')}
                        >
                            <Text style={styles.locationButtonText}>Select Location on Map</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.label}>Invite Friends</Text>
                        {friends.length > 0 ? (
                            <FlatList
                                data={friends}
                                renderItem={renderFriendItem}
                                keyExtractor={(item) => item.userId}
                                style={styles.friendsList}
                            />
                        ) : (
                            <Text style={styles.noFriendsText}>No friends to invite</Text>
                        )}
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.createButton]}
                                onPress={createStudySession}
                            >
                                <Text style={styles.createButtonText}>Create Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 30,
        color: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000000',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    locationButton: {
        width: '100%',
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    locationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    friendsList: {
        width: '100%',
        maxHeight: 150,
        marginBottom: 15,
    },
    friendItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    selectedFriendItem: {
        backgroundColor: '#E0F7FA',
    },
    friendName: {
        fontSize: 16,
        color: '#333',
    },
    noFriendsText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        marginRight: 5,
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#007AFF',
        marginLeft: 5,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default StartStudySession;
