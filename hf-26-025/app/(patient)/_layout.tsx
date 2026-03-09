import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Patient Dashboard' }} />
    </Stack>
  );
}
