import { Component } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { spacing, radius } from '@/theme';

let primaryColor = '#FF6B35';
export function setErrorBoundaryColor(color) { primaryColor = color; }

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="alert-circle-outline" size={56} color={primaryColor} />
          </View>
          <Text variant="h3" style={styles.title}>Something went wrong</Text>
          <Text variant="body" style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable style={[styles.btn, { backgroundColor: primaryColor }]} onPress={this.handleReset}>
            <Text variant="body" style={styles.btnText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, backgroundColor: '#FAFAFA',
  },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { fontWeight: '700', fontSize: 20, marginBottom: spacing.sm },
  message: { textAlign: 'center', color: '#6B7280', lineHeight: 22, marginBottom: spacing.xl },
  btn: {
    paddingVertical: spacing.base, paddingHorizontal: spacing['2xl'],
    borderRadius: radius.full,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
