import auth , {getAuth} from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      const user = await auth().createUserWithEmailAndPassword(email, password);
      console.log('Auth success, UID:', user.user.uid); // Verify UID exists
      console.log('Preparing Firestore data...'); // 3

    const userData = {
      userId: user.user.uid,
      email: email,
      username: email.split('@')[0],
      profileImage: '',
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    console.log('User data prepared:', userData); // 4
    
    console.log(
      'Firestore check:',
     // Should exist
      typeof firestore().collection, // Should be "function"
      firestore().app.name // Should show "[DEFAULT]"
    );

    console.log('Attempting Firestore write...'); // 5
    await firestore()
      .collection('users')
      .doc(user.user.uid)
      .set(userData);
    
    console.log('Firestore write completed successfully!'); // 6
    alert("User account created & signed in!"); 
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      alert("User signed in!");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ ...styles.container, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size={"small"} color="#0000ff" />
        ) : (
          <>
            <Button onPress={signIn} title="Sign In" />
            <Button onPress={signUp} title="Sign Up" />
          </>
        )}
        <View style={{ marginTop: 20 }}>
          <Button
            title="Go to Map"
            onPress={() => router.push("/Map")}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    padding: 10,
  },
});
