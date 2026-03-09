import { Stack } from 'expo-router';

export default function DistributorLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Distributor Dashboard' }} />
    </Stack>
  );
}
