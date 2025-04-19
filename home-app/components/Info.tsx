import {Text, View, StyleSheet, Dimensions } from "react-native";
import { Avatar } from "./Avatar";
import { useEffect, useState } from "react";

const { width, height } = Dimensions.get("window");

type Props = {
    device: number,
    online: boolean
}

export function Info(props: Props) {
    const CurrentDate = () => {
        const [currentDate, setCurrentDate] = useState(getFormattedDate());
      
        useEffect(() => {
          const intervalId = setInterval(() => {
            const newDate = getFormattedDate();
            if (newDate !== currentDate) {
              setCurrentDate(newDate);
            }
          }, 60 * 1000); // check every minute
      
          return () => clearInterval(intervalId);
        }, [currentDate]);
      
        return (
            <Text style={styles.date}>{currentDate}</Text>
        );
      };
      
    const getFormattedDate = () => {
        const today = new Date();
        return today.toDateString(); // e.g., "Mon Apr 19 2025"
    };

    return(
        <View style={styles.container}>
            <View style={{flex:1, justifyContent:'flex-start', gap: 5}}>
                <CurrentDate/>
                <Text style={{fontSize:20, fontWeight:800}}>Smart Home</Text>
                <View style={{flexDirection:'row', gap: 6}}>
                    <View style={props.device != 0 ? styles.onlineIndicator : styles.offlineIndicator} />
                    <Text style={{fontSize:10, fontWeight:500}}>{props.device} devices running</Text>
                </View>
            </View>
            <Avatar online={props.online}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding:width*0.05,
        width: width*0.9,
        height: height*0.13,
        borderRadius: 30,
        borderCurve:'continuous',
        backgroundColor:'#ffffff',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        elevation: 5
    },
    onlineIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2666de',
        borderWidth: 2,
        borderColor: '#fff', 
      },
    offlineIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#fff', 
    },
    date: {
        fontSize:10, 
        fontWeight:500
    }
});
