import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Dimensions
} from "react-native";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {AvatarInfo} from "@/components/Avatar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get("window");
import Feather from '@expo/vector-icons/Feather';
import { SettingOption } from "@/components/SettingOption";
import { RelativePathString } from "expo-router";
import Octicons from '@expo/vector-icons/Octicons';

// API configuration
// const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
const API_BASE_URL = `https://smartdkdh.onrender.com`;
export default function SettingScreen() {
  const colorScheme = useColorScheme();
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [serverIp, setServerIp] = useState(
    API_BASE_URL.replace("http://", "").replace(":8000", "")
  );
  const [userNo, setUserNo] = useState<number | null>(null);

  // Lấy user_no từ AsyncStorage
  useEffect(() => {
    const getUserNo = async () => {
      try {
        const storedUserNo = await AsyncStorage.getItem("user_no");
        if (storedUserNo) {
          setUserNo(parseInt(storedUserNo));
          console.log("Đã lấy user_no:", storedUserNo);
        } else {
          console.warn("Không tìm thấy user_no trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy user_no từ AsyncStorage:", error);
      }
    };

    getUserNo();
  }, []);

  useEffect(() => {
    async function fetchUserData(userId: number | null = userNo): Promise<Record<string, string>> {
    if (userId == null) throw new Error(`User id is null`);
    try {
      const response = await fetch(`https://smartdkdh.onrender.com/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      
      const data: Record<string, string> = await response.json();
      setUserData(data)
      console.log(data)
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  fetchUserData()
  }, [userNo]);

  const AccountOption = [{name: 'Edit Profile', link:'/profile', button:false}, {name: 'Change Password', link:'/', button:false}, 
                  {name: 'Push Notification', link: null, button:true}]
  const OtherOption = [{name: 'About us', link:'/', button:false}, {name: 'Privacy Policy', link:'/', button:false},
                        {name: 'Terms and condition', link:'/', button:false}]
  return (
    <View style={{backgroundColor:'#f2f6fc', height: height}}>
      <View style={styles.titleContainer}>
        <View style={styles.title}>
          <Octicons name="gear" size={30} color="black" />
          <ThemedText type="title" style={{fontSize:25}}> Setting</ThemedText>
        </View>
        <View style={styles.titleBox}>
            <AvatarInfo name={userData.name} email = {userData.email}/>
            {/*Tao mot cai ham logout o day*/}
            <Feather name="log-out" size={40} color="#2666de" />
        </View>
      </View>
      <View
        style={styles.line}
      />
      <ScrollView>
        <ThemedView style={styles.optionContainer}>
            <ThemedText type="subtitle" style={{paddingBottom: 10}}>Account Setting</ThemedText>
            {AccountOption.map((val: typeof AccountOption[0], index) => <SettingOption key={index} name={val.name} link={val.link as RelativePathString ?? '/'} button={val.button}/>)}
        </ThemedView>
        <ThemedView style={styles.optionContainer}>
            <ThemedText type="subtitle" style={{paddingBottom: 10}}>More</ThemedText>
            {OtherOption.map((val: typeof OtherOption[0], index) => <SettingOption key={index} name={val.name} link={val.link as RelativePathString} button={val.button}/>)}
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: '#ffffff',
    height: height * 0.257,
    flexDirection: "column",
    padding: 30,
    alignItems: "center",
    gap: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
    ,
    marginBottom: 16,
  },
  title: {
    flexDirection: 'row'
  },
  titleBox: {
    flexDirection: "row",
    gap: width*0.2
  },
  line: {
    backgroundColor:'#f2f6fc',
    borderBottomColor: '#4b4b4b',
    borderBottomWidth: 1,
    height: height*0.05,
    width: width*0.8,
    marginHorizontal: width*0.1
  },
  optionContainer: {
    padding: 30,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 5,
    paddingLeft: width / 10
  },
});
