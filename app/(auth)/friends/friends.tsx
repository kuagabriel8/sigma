import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { Text, View } from 'react-native';

const FriendsScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Friends Paage</Text>
        </View>
    );
};

const usersCollection = firestore().collection('users');

export default FriendsScreen;
