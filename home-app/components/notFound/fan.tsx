import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export const FanNotFound = () => {
    const router = useRouter()
    return (
        <View style={styles.notFoundContainer}>
            <Ionicons name="alert-circle-outline" size={80} color="#CBD5E0" />
            <Text style={styles.notFoundTitle}>Fan Not Found</Text>
            <Text style={styles.notFoundDescription}>
                The fan you're looking for is not available or may have been disconnected.
            </Text>
            <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.goBackButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        notFoundContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#FFFFFF',
            height: '100%',
        },
        notFoundTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#2D3748',
            marginTop: 20,
            marginBottom: 10,
        },
        notFoundDescription: {
            fontSize: 16,
            color: '#718096',
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 22,
            maxWidth: '80%',
        },
        goBackButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#3B82F6',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
        },
        goBackButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
        buttonIcon: {
            marginRight: 8,
        },
    }
)