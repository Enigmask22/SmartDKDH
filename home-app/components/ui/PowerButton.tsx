import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for the power icon
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const PowerButton = ({ onPress, isOff, dissabled }: {
  onPress: () => void;
  isOff: boolean;
  dissabled?: boolean;
}) => {
  return (
    <TouchableOpacity style={{
      ...styles.button,
      backgroundColor: isOff ? '#FFFFFF' : '#1E88E5', // Change color based on isOff prop
    }} onPress={onPress} activeOpacity={0.7} disabled={dissabled}>
      <View style={styles.iconContainer}>
        {
          dissabled ? (
            <FontAwesome6 name="superpowers" size={24} color="#1E88E5" />
          ) : (
            <Ionicons name="power" size={24} color={isOff ? "black" : "white"} />
          )
        }
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,          // Fully rounded to form a circle
    width: 60,                 // Fixed width for circular shape
    height: 60,                // Fixed height for circular shape
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,              // Subtle shadow for Android
    shadowColor: '#000',       // Subtle shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PowerButton;