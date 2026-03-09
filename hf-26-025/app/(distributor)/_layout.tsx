import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HC, RoleColors } from '@/constants/theme';
import { Platform, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/contexts/auth-context';

const R = RoleColors.distributor;

export default function DistributorLayout() {
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: R.accent,
        tabBarInactiveTintColor: HC.textMuted,
        headerShown: true,
        headerStyle: {
          backgroundColor: HC.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: HC.borderLight,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: HC.text,
          letterSpacing: -0.2,
        },
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: HC.card,
          borderTopWidth: 1,
          borderTopColor: HC.borderLight,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: R.accentBg }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: R.accent, letterSpacing: 0.1 }}>Switch Role</Text>
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="archivebox.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: 'Transfers',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="arrow.left.arrow.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Chain History',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
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
