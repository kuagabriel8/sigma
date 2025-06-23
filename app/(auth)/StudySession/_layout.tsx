import { Tabs } from 'expo-router';

const StudySessionLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderBottomColor: '#C7C7CC',
                    borderBottomWidth: 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                },
                tabBarLabelPosition: 'below-icon',
            }}
        >
            <Tabs.Screen
                name="start"
                options={{
                    title: 'Start a Study Session!',
                    tabBarIcon: () => null,
                }}
            />
            <Tabs.Screen
                name="invitations"
                options={{
                    title: 'Invitations',
                    tabBarIcon: () => null,
                }}
            />
        </Tabs>
    );
};

export default StudySessionLayout;
