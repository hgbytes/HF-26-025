import { Stack } from 'expo-router';

export default function ManufacturerLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Manufacturer Dashboard' }} />
    </Stack>
  );
}
