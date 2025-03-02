import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ReelsScreen from '../screens/ReelsScreen';
import ChatScreen from '../screens/ChatScreen'; 

import reelsActive from '../assets/reels_active.png';
import reelsInactive from '../assets/reels_inactive.png';
import chatActive from '../assets/messages_active.png';
import chatInactive from '../assets/messages_inactive.png';
import { Image, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: 'white',
          tabBarShowLabel: false, // Hide labels for a cleaner UI
        }}
      >
        <Tab.Screen 
          name="Reels" 
          component={ReelsScreen} 
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? reelsActive : reelsInactive}
                style={styles.icon}
              />
            ),
            headerShown: false,
          }} 
        />
        <Tab.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? chatActive : chatInactive}
                style={styles.icon}
              />
            ),
            headerShown: false,
          }} 
        />
      </Tab.Navigator>
    );
  };
  
  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: 'black',
      height: 60,
      borderTopWidth: 0,
      paddingTop:10
    },
    icon: {
      width: 30,  // Adjust size based on your image dimensions
      height: 30, // Adjust size based on your image dimensions
      resizeMode: 'contain',
    },
  });
  
  export default BottomTabs;
