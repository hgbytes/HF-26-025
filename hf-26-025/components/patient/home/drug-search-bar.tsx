import { StyleSheet, View, TextInput } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export function DrugSearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search medicines..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
});
