import React, { useState, ReactNode, useContext, createContext, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ViewStyle,
  Dimensions
} from 'react-native';
const { width, height } = Dimensions.get("window");

interface ToggleDropdownProps {
  id: string; // Unique identifier for this dropdown
  state: boolean
  stateChange: React.Dispatch<React.SetStateAction<boolean[]>>
  triggerComponent: ReactNode;
  dropdownContent: ReactNode;
  containerStyle?: ViewStyle;
  triggerStyle?: ViewStyle;
  dropdownStyle?: ViewStyle;
  maxHeight?: number;
  isFirst?: boolean; // Added to identify if this is the first dropdown
}

const ToggleDropdown: React.FC<ToggleDropdownProps> = ({
  id,
  state,
  stateChange,
  triggerComponent,
  dropdownContent,
  triggerStyle,
  dropdownStyle,
  maxHeight = height*0.7,
}) => {
  const [isOpen, setIsOpen] = useState(state);
  const animatedValue = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    setIsOpen(state);
  },[state]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOpen ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const toggleDropdown = (): void => {
    if (isOpen) {
      if (id == 'chart') {
        stateChange([false, true])
        console.log(state)
      }
      else {
        stateChange([true, false])
      }
    } else {
      if (id == 'chart') {
        stateChange([true, false])
        console.log(state)
      }
      else {
        stateChange([false, true])
      }
    }
  };

  const dropdownHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxHeight],
  });

  return (
    <View style={[styles.container]}>
      <TouchableOpacity 
        onPress={toggleDropdown}
        style={[styles.trigger, triggerStyle]}
      >
        {triggerComponent}
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.dropdown,
          dropdownStyle,
          { height: dropdownHeight }
        ]}
      >
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 10}}
          showsVerticalScrollIndicator={false}
        >
          {dropdownContent}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxHeight:height*0.80
  },
  trigger: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    elevation:5
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#ced4da',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
});

export default ToggleDropdown;