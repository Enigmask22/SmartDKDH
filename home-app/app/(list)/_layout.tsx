import { Stack } from "expo-router";
export default function ListLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="fanDetails"/>
            <Stack.Screen name="fan" />
            <Stack.Screen name="light" />
        </Stack>
    )
}