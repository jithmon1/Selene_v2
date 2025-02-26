import React, { useState } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert('Login successful');
      router.push('/(tabs)/homeScreen');
    } catch (error) {
      console.error(error);
      alert('Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        email: user.email,
        name: name.trim(),
        userId: user.uid,
      });

      console.log('User registered:', user.uid);
      alert('Registration successful');
      router.push('/(tabs)/homeScreen');
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, value, setValue, icon, isPassword = false) => (
    <View style={styles.inputContainer}>
      <Feather name={icon} size={20} color="#9CA3AF" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={isPassword}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.heading}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

        {!isLogin && renderInput('Full Name', name, setName, 'user')}
        {renderInput('Email', email, setEmail, 'mail')}
        {renderInput('Password', password, setPassword, 'lock', true)}

        {loading ? (
          <ActivityIndicator size="large" color="teal" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={isLogin ? signIn : signUp}
          >
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    color: '#2D3748',
    marginBottom: 32,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
    width: width * 0.9,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 16,
    color: '#2D3748',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: 'teal',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  toggleText: {
    color: 'teal',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  loader: {
    marginVertical: 16,
  },
});

export default Login;