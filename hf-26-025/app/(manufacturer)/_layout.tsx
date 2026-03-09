import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MFG } from '@/constants/theme';
import { Platform, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/contexts/auth-context';

export default function ManufacturerLayout() {
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MFG.primary,
        tabBarInactiveTintColor: MFG.textMuted,
        headerShown: true,
        headerStyle: {
          backgroundColor: MFG.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: MFG.borderLight,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: MFG.text,
        },
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: MFG.card,
          borderTopWidth: 1,
          borderTopColor: MFG.borderLight,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: MFG.primaryFaint }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: MFG.primary }}>Switch Role</Text>
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-batch"
        options={{
          title: 'Add Batch',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.rectangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="distributors"
        options={{
          title: 'Distributors',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="exclamationmark.triangle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
