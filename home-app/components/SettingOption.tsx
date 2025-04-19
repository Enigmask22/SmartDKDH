import React, { useState } from 'react';
import { Text, View, StyleSheet, Switch, Dimensions } from 'react-native';
import { Link, RelativePathString } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width, height } = Dimensions.get("window");
type Props = {
    name: String;
    link?: RelativePathString;
    button: Boolean; 
}

export function SettingOption(props : Props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <View style={styles.container}>
      <Text style={{fontSize:16, fontFamily:'Rubik-Regular'}}>{props.name}</Text>
      { props.button ? 
      <Switch
          trackColor={{false: '#767577', true: '#2666de'}}
          thumbColor='#f4f3f4'
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={{}}
        /> 
        : <Link href={props.link ?? "/"}><MaterialIcons name="navigate-next" size={24} color="black" /></Link>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    height: 40,
    flexDirection: "row",
    justifyContent: 'space-between'
  },
});