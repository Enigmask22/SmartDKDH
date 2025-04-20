import { View, StyleSheet, Text } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

interface SummaryCardProps {
    total: number;
    on: number;
    off: number;
    type: 'fan' | 'bulb';
}

export default function SummaryCard({
    total,
    on,
    off,
    type
}: SummaryCardProps) {
    return (
        <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
                <View style={styles.iconContainer}>
                    {
                        type == 'bulb' ? (
                            <Ionicons name="bulb-outline" size={24} color="black" />
                        ) : (
                            <MaterialCommunityIcons name="fan" size={24} color="black" />
                        )
                    }
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.summaryTitle}>{
                        type == 'bulb' ? 'Light Controller' : 'Fan Controller'
                    }</Text>
                    <Text style={styles.totalText}>Total: {total}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={[styles.statusText, styles.statusOn]}>
                        ON: {on}
                    </Text>
                    <Text style={[styles.statusText, styles.statusOff]}>
                        OFF: {off}
                    </Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalText: {
        color: '#666',
        marginTop: 4,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusText: {
        marginVertical: 2,
    },
    statusOn: {
        color: '#3b82f6',
        fontWeight: '500',
    },
    statusOff: {
        color: '#9ca3af',
        fontWeight: '500',
    },
});