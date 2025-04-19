import React from 'react';
import { View, Image, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';

const { width, height } = Dimensions.get("window");

type Avatar = {
  online: boolean
}

export function Avatar(props : Avatar) {
  return (
      <View style={styles.img}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.avatar}
        />
        <View style={props.online ? styles.onlineIndicator : styles.offlineIndicator} />
      </View>
  );
};

type Info = {
  name: string,
  email: string
}
export function AvatarInfo(props: Info) {
  return (
    <View style={styles.infocontainer}>
      <View style={styles.img}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.avatar}
        />
        <View style={styles.onlineIndicator} />
      </View>
      <View>
        <Text style={styles.name}>
          {props.name}
        </Text>
        <Text style={styles.email}>
          {props.email}
        </Text>
      </View>
    </View>
  );
};

type Profile = {
  name: string
}
export function AvatarProfile(props : Profile) {
  return(
    <View style={styles.profilecontainer}>
      <View style={styles.imgbig}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.avatarbig}
        />
        <View style={styles.camera}>
          <Feather name="camera" size={20} color="black" /> 
        </View>
      </View>
      <View style={{flexDirection: 'row', gap: 10, alignItems:'center'}}>
      <Text style={styles.namebig}>
        {props.name}
      </Text>
      <Pressable onPress={()=>{}} style={styles.editButton}>
        <Octicons name="pencil" size={24} color="black"/>
      </Pressable>
      </View>
  </View>
  )
};

const styles = StyleSheet.create({
  infocontainer: {
    flexDirection: 'row',
    gap:10
  },
  profilecontainer: {
    flexDirection: 'column',
    alignItems:'center',
    gap:10
  },
  img: {
    justifyContent:'center',
    height:40
  },
  imgbig: {
    justifyContent:'center',
    height: height*0.2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarbig: {
    width: height*0.2,
    height: height*0.2,
    borderRadius: height*0.1, // Half of width/height for a perfect circle
  },
  onlineIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2666de',
    position: 'absolute',
    bottom: 26,
    right: -4,
    borderWidth: 2,
    borderColor: '#fff', 
  },
  offlineIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    position: 'absolute',
    bottom: 26,
    right: -4,
    borderWidth: 2,
    borderColor: '#fff', 
  },
  camera: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5', // Green color for online
    position: 'absolute',
    bottom: 0,
    right: 5,
    borderWidth: 2,
    borderColor: '#fff', // Optional: white border to separate from avatar
    alignItems:'center',
    padding: 7
  },
  editButton: {
    borderRadius: 5,
    backgroundColor: '#f2f6fc',
    alignItems: 'center',
    height: 30,
    width: 30,
    elevation: 5
  },
  name: {
    fontSize: 20,
    fontWeight:500
  },
  namebig: {
    fontSize: 30,
    fontWeight:500
  },
  email: {
    fontSize:10,
    color:'#2666de'
  }
});