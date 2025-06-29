import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

const Page = () => {
    const user = auth().currentUser;
    const [username, setUsername] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        if (user) {
            fetchUsername();
        }
    }, [user]);
    
    const fetchUsername = async () => {
        try {
            if (!user) return;
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUsername(userData?.username || user.email || 'User');
            } else {
                setUsername(user.email || 'User');
            }
        } catch (error) {
            console.error('Error fetching username:', error);
            setUsername(user?.email || 'User');
        }
    };
    
    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Welcome {username || user?.email}</Text>
            <Button title="Sign Out" onPress={() => auth().signOut()} />
        </View>
    );
}

export default Page
