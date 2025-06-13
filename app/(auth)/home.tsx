import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import auth from '@react-native-firebase/auth';

const Page = () => {
    const user = auth().currentUser;
  return (
    <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Welcome {user?.email}</Text>
        <Button title ="Sign Out" onPress={() => auth().signOut()} />
    </View>
  )

  
}

export default Page
