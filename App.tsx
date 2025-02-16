import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CreatePollScreen from './screens/CreatePollScreen';
import PollDetailsScreen from './screens/PollDetailsScreen';
import VoteScreen from './screens/VoteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreatePoll" component={CreatePollScreen} />
        <Stack.Screen name="PollDetails" component={PollDetailsScreen} />
         <Stack.Screen name="Vote" component={VoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
