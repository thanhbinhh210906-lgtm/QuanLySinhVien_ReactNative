import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import i18n from '../i18n';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#4a90e2' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: i18n.t('studentList') }}
        />
        <Stack.Screen
          name="detail"
          options={{
            title: i18n.t('studentDetail'),
            presentation: 'transparentModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="form"
          options={{ title: i18n.t('addStudent') }}
        />
      </Stack>
    </>
  );
}