import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#C7C7CC',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="friends/index"
                options={{
                    title: 'Friends',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="studySession"
                options={{
                    title: 'Study Session',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
            name = "Timetable"
            options = {{ 
                title: 'Timetable',
                tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-number-outline" color={color} size = {size} />
            )
            }}
            />
        </Tabs>
    );
};

export default Layout;
