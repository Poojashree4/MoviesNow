// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const Login = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

// //   const handleLogin = async () => {
// //     if (!email || !password) {
// //       return Alert.alert('Error', 'Please enter email and password');
// //     }

// //     try {
// //       const response = await fetch('http://192.168.1.17:5000/login', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ email, password }),
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         // Save token and user to AsyncStorage
// //         await AsyncStorage.setItem('token', data.token);
// //         await AsyncStorage.setItem('user', JSON.stringify(data.user));
// //         // await AsyncStorage.setItem('userId', data.user.userId);
// //         console.log("Loaded user object:", user);
// //         Alert.alert('Success', 'Logged in successfully');
// //         navigation.navigate('home'); // Navigate to Home screen
// //       } else {
// //         Alert.alert('Login Failed', data.error || 'Invalid credentials');
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       Alert.alert('Error', 'Something went wrong');
// //     }
// //   };


// const handleLogin = async () => {
//     if (!email || !password) {
//       return Alert.alert('Error', 'Please enter email and password');
//     }
  
//     try {
//       const response = await fetch('http://192.168.1.17:5000/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok && data.user) {
//         await AsyncStorage.setItem('token', data.token);
//         await AsyncStorage.setItem('user', JSON.stringify(data.user));
//         console.log("Loaded user object:", data.user);
  
//         Alert.alert('Success', 'Logged in successfully');
//         navigation.navigate('home');
//       } else {
//         Alert.alert('Login Failed', data.error || 'Invalid credentials');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Something went wrong');
//     }
//   };
  
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Movie Booking Login</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         autoCapitalize="none"
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         secureTextEntry
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>

//       <TouchableOpacity >
//         <Text style={styles.link}>Don't have an account? Register</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Login;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//     justifyContent: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 24,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   input: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   buttonText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   link: {
//     textAlign: 'center',
//     color: '#007BFF',
//     marginTop: 12,
//   },
// });


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

//   const handleLogin = async () => {
//     if (!email || !password) {
//       return Alert.alert('Error', 'Please enter email and password');
//     }

//     try {
//       const response = await fetch('http://192.168.1.17:5000/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Save token and user to AsyncStorage
//         await AsyncStorage.setItem('token', data.token);
//         await AsyncStorage.setItem('user', JSON.stringify(data.user));
//         // await AsyncStorage.setItem('userId', data.user.userId);
//         console.log("Loaded user object:", user);
//         Alert.alert('Success', 'Logged in successfully');
//         navigation.navigate('home'); // Navigate to Home screen
//       } else {
//         Alert.alert('Login Failed', data.error || 'Invalid credentials');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Something went wrong');
//     }
//   };


const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter email and password');
    }
  
    try {
      const response = await fetch('http://192.168.1.26:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.user) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        console.log("Loaded user object:", data.user);
  
        Alert.alert('Success', 'Logged in successfully');
        navigation.navigate('home');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movie Booking Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity >
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#007BFF',
    marginTop: 12,
  },
});
