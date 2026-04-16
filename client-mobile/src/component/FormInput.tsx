import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
} from 'react-native';

type FormInputProps = {
  label: string;
  required?: boolean;
  type?: 'text' | 'password';
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export default function FormInput({
  label,
  required = false,
  type = 'text',
  value,
  onChangeText,
  error,
  disabled = false,
  placeholder,
  ...rest
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredIcon}>*</Text>}
      </Text>

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={isPassword ? !showPassword : false}
          style={styles.input}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.8}
            style={styles.passwordToggle}
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? '🙈' : '👁'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  requiredIcon: {
    color: '#dc2626',
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    minHeight: 48,
    justifyContent: 'center',
  },
  inputWrapperError: {
    borderColor: '#dc2626',
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    paddingRight: 44,
    fontSize: 15,
    color: '#0f172a',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  passwordToggleText: {
    fontSize: 16,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
});