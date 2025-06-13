import { Text, View, StyleSheet, KeyboardAvoidingView, TextInput, Button, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert("User account created & signed in!");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
  const signIn = async () => { 
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      alert("User signed in!");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <View
      style={{...styles.container, backgroundColor: "#fff" }}
    >
      <KeyboardAvoidingView
        behavior="padding">
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
                <ActivityIndicator size={'small'} color="#0000ff" />
              ) : (
                <>
              <Button onPress = {signIn} title="Sign In" />
              <Button onPress = {signUp} title="Sign Up" />
              </>
              )}
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
