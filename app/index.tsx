import { Text, View, StyleSheet, KeyboardAvoidingView, TextInput, Button } from "react-native";
import React, { useState } from "react";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = () => {
  }
  const signIn = () => {
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
              <Button onPress = {signIn} title="Sign In" />
              <Button onPress = {signUp} title="Sign Up" />
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
