import { Feather } from "@expo/vector-icons";
import { Text, View, StyleSheet, Dimensions, Pressable, FlatList } from "react-native";
import DeviceCard from "./Card";

const { width, height } = Dimensions.get("window");

type Props = {
    runningLed: number,
    availLed: number,
    runningFan: number,
    availFan: number,
}
export function Devices(props: Props) {
    const Device = [['light', props.availLed, props.runningLed], ['fan', props.availFan, props.runningFan]]
    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <View style={styles.title}>
                    <Text style={{ fontFamily: 'Poppins', fontSize: 15, fontWeight: '800' }}>Available Device</Text>
                    <View style={styles.available}>
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>
                            {props.availFan + props.availLed}
                        </Text>
                    </View>
                </View>
                <Pressable style={styles.addButton} onPress={() => { }}>
                    <Feather name="plus" size={24} color="white" />
                </Pressable>
            </View>
            <FlatList
                data={Device}
                horizontal={false}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <DeviceCard avail={item[1]} on={item[2]} type={item[0]} />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: width * 0.9,
        height: '55%'
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    available: {
        padding: 2,
        backgroundColor: '#2666de',
        width: 25,
        height: 25,
        borderRadius: 12.5,
        margin: 10,
        alignItems: 'center'
    },
    addButton: {
        backgroundColor: '#2666de',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        paddingTop: 8
    },
    list: {
        flexDirection: 'row',
    }
});