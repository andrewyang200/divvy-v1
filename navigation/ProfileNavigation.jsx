import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import FriendsScreen from "../screens/profile/FriendsScreen";
import SearchUsersScreen from "../screens/profile/SearchUsersScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import CreateGroupScreen from "../screens/profile/CreateGroupScreen";
import GroupDetailsScreen from "../screens/profile/GroupDetailsScreen";
import { FriendsProvider } from "../hooks/useFriends";
import { GroupsProvider } from "../context/GroupsContext";  // Updated import

const ProfileStack = createNativeStackNavigator();

const initialFriends = [
    { 
        id: 1, 
        name: "Sarah Miller", 
        username: "@sarahm", 
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    { 
        id: 2, 
        name: "Mike Chen", 
        username: "@mikechen", 
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=mike"
    },
    { 
        id: 3, 
        name: "Jordan Lee", 
        username: "@jlee", 
        status: "active",
        avatar: "https://i.pravatar.cc/150?u=jordan"
    }
];

const initialGroups = [];

export default function ProfileNavigator() {
    return (
        <FriendsProvider initialFriends={initialFriends}>
            <GroupsProvider initialGroups={initialGroups}>
                <ProfileStack.Navigator>
                    <ProfileStack.Screen 
                        name="Profile" 
                        component={ProfileScreen} 
                        options={{
                            headerShown: false,
                        }}
                    />
                    <ProfileStack.Screen
                        name="Friends"
                        component={FriendsScreen}
                        options={{
                            animation: "slide_from_right",
                            headerShown: false,
                        }}
                    />
                    <ProfileStack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            headerShown: false,
                            animation: "slide_from_right",
                        }}
                    />
                    <ProfileStack.Screen
                        name="SearchUsers"
                        component={SearchUsersScreen}
                        options={{
                            presentation: "modal",
                            animation: "slide_from_bottom",
                            headerShown: false,
                        }}
                    />
                    <ProfileStack.Screen
                        name="CreateGroup"
                        component={CreateGroupScreen}
                        options={{
                            animation: "slide_from_right",
                            headerShown: false,
                        }}
                    />
                    <ProfileStack.Screen
                        name="GroupDetails"
                        component={GroupDetailsScreen}
                        options={{
                            animation: "slide_from_right",
                            headerShown: false,
                        }}
                    />
                </ProfileStack.Navigator>
            </GroupsProvider>
        </FriendsProvider>
    );
}