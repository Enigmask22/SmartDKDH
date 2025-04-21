import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Pressable,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {AvatarProfile} from "@/components/Avatar";
import { useColorScheme } from "@/hooks/useColorScheme";
import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import {InputBox, InputHiddenBox} from "@/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");
// API configuration
// const API_BASE_URL = `http://${Constants.expoConfig?.extra?.serverIp}:${Constants.expoConfig?.extra?.apiPort}`;
const API_BASE_URL = `https://smartdkdh.onrender.com`;
export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [userNo, setUserNo] = useState<number | null>(null);
  const [userData, setUserData] = useState<Record<string, string>>({});

  const [hidden, setHidden] = useState([true, true, true]); // State to manage password visibility

  function changeHidden(idx: number) {
    setHidden(hidden.map((e, index) => index == idx ? !e : e)); // Toggle password visibility
  }

  // const handleChangePassword = (password: string) => {
  //   setPassword(password); // Update password state
  // };

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

  
  // useEffect(() => {
  //   async function fetchUserData(userId: number | null = userNo): Promise<Record<string, string>> {
  //   if (userId == null) throw new Error(`User id is null`);
  //   try {
  //     const response = await fetch(`https://smartdkdh.onrender.com/api/users/${userId}`);
      
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
  //     }
      
  //     const data: Record<string, string> = await response.json();
  //     setUserData(data)
  //     console.log(data)
  //     return userData;
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //     throw error;
  //   }
  // }

  // fetchUserData()
  // }, [userNo]);

  useEffect(() => {
    async function fetchUserData() {
      let name = await AsyncStorage.getItem("user_name");
      let email = await AsyncStorage.getItem("user_email");
      let ada = await AsyncStorage.getItem("user_ada");
      let key = await AsyncStorage.getItem("user_key");
      let password = await AsyncStorage.getItem("user_password");
      setUserData(
        {name: name != null ? name : "",
         email: email != null ? email : "",
         ada: ada != null ? ada : "",
         key: key != null ? key : "",
         password: password != null ? password : ""
      })
  }

  fetchUserData()
  }, []);

  const PersonalData = {"username": userData.name, "email": userData.email,"password":userData.password}
  const AdaData =  {"AIO_USERNAME": userData.ada, "AIO_KEY": userData.key}
  return (
    <View style={{backgroundColor:'#ffffff', height: height*1.1}}>
      <StatusBar backgroundColor="#ffffff"/>
      <View style={styles.titleContainer}>
        <View style={{flexDirection:'row', width:width}}>
          <View style={styles.backButton}></View>
          <View style={styles.title}>
            <Feather name="user" size={30} color="black" />
            <ThemedText type="title" style={{fontSize:25}}> Profile</ThemedText>
          </View>
          <View style={styles.backButton}>
          <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-forward" size={24} color="black"/>
          </TouchableOpacity>
          </View>
        </View>
        <AvatarProfile name={userData.name}/>
      </View>
      <ScrollView style={{borderRadius: 30, backgroundColor:'#f2f6fc'}} contentContainerStyle={{flexDirection:'column', alignItems:'center'}}>
        <ThemedView style={styles.optionContainer}>
          <InputBox title={"Username"} data={PersonalData.username} setData={()=>{}}/>
          <InputBox title={"Email"} data={PersonalData.email} setData={()=>{}}/>
          <InputHiddenBox title={"Password"} data={PersonalData.password} setData={()=>{}}/>
        </ThemedView>
        <View style={styles.line}/>
        <ThemedView style={styles.optionContainer}>
            <ThemedText type="subtitle" style={{paddingBottom: 10}}>More</ThemedText>
            <InputHiddenBox title={"AIO_USERNAME"} data={AdaData.AIO_USERNAME} setData={()=>{}}/>
            <InputHiddenBox title={"AIO_KEY"} data={AdaData.AIO_KEY} setData={()=>{}}/>
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: '#ffffff',
    height: height * 0.45,
    flexDirection: "column",
    padding: 40,
    alignItems: "center",
    gap: 40,
    marginBottom: 16,
  },
  title: {
    flexDirection: 'row',
    gap: width * 0.01,
    width: width*0.8,
    justifyContent:'center'
  },
  backButton: {
    width:width*0.1,
  },
  line: {
    backgroundColor:'#f2f6fc',
    borderBottomColor: '#4b4b4b',
    borderBottomWidth: 1,
    width: width*0.6,
    marginHorizontal: width*0.2
  },
  optionContainer: {
    padding: 30,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: width / 10,
  },
  editButton: {
    paddingTop:5,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    height: 40,
    width: 60,
  }
});
