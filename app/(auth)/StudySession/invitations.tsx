import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Invitations = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Study Session Invitations</Text>
            <Text style={styles.message}>No invitations yet.</Text>
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: '#8E8E93',
    },
});

export default Invitations;
