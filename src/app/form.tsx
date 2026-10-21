import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addStudent,
  updateStudent,
  isDuplicateStudentCode,
  Student,
} from '../database/studentStorage';
import i18n from '../i18n';

export default function StudentFormScreen() {
  const params = useLocalSearchParams<{ mode?: string; student?: string }>();
  const isEdit = params.mode === 'edit' && !!params.student;
  const initial: Student | null = isEdit ? JSON.parse(params.student!) : null;
  const router = useRouter();

  const [fullName, setFullName] = useState(initial?.fullName || '');
  const [studentCode, setStudentCode] = useState(initial?.studentCode || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [avatar, setAvatar] = useState(initial?.avatar || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('', 'Cần quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('', 'Cần quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const validate = async () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = i18n.t('requiredField');
    if (!studentCode.trim()) e.studentCode = i18n.t('requiredField');
    if (!email.trim()) e.email = i18n.t('requiredField');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = i18n.t('invalidEmail');

    if (studentCode.trim()) {
      const dup = await isDuplicateStudentCode(
        studentCode,
        isEdit ? initial?.id : null
      );
      if (dup) e.studentCode = i18n.t('duplicateId');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    const ok = await validate();
    if (!ok) return;

    const data = {
      fullName: fullName.trim(),
      studentCode: studentCode.trim(),
      email: email.trim(),
      avatar,
    };

    if (isEdit && initial) {
      await updateStudent(initial.id, data);
    } else {
      await addStudent(data);
    }
    Alert.alert('', i18n.t('savedSuccess'), [
      { text: 'OK', onPress: () => router.dismissAll() },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View style={styles.avatarWrapper}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {fullName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
                <View style={styles.avatarButtons}>
          <TouchableOpacity style={styles.smallBtn} onPress={pickImage}>
            <Text style={styles.smallBtnText}>🖼️ {i18n.t('fromLibrary')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={takePhoto}>
            <Text style={styles.smallBtnText}>📷 {i18n.t('takePhoto')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Phần thêm mới: Nhập link ảnh */}
      <Text style={styles.label}>{i18n.t('avatar')} (URL)</Text>
      <TextInput
        style={styles.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="https://example.com/avatar.jpg"
        keyboardType="url"
        autoCapitalize="none"
      />
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
        {i18n.locale === 'vi' ? 'Dán link ảnh trực tiếp vào đây' : 'Or paste an image URL here'}
      </Text>

      <Text style={styles.label}>{i18n.t('fullName')} *</Text>
      <TextInput
        style={[styles.input, errors.fullName && styles.inputError]}
        value={fullName}
        onChangeText={setFullName}
        placeholder={i18n.t('placeholderName')}
      />
      {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

      <Text style={styles.label}>{i18n.t('studentId')} *</Text>
      <TextInput
        style={[styles.input, errors.studentCode && styles.inputError]}
        value={studentCode}
        onChangeText={setStudentCode}
        placeholder={i18n.t('placeholderId')}
        autoCapitalize="characters"
      />
      {errors.studentCode && <Text style={styles.error}>{errors.studentCode}</Text>}

      <Text style={styles.label}>{i18n.t('email')} *</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={email}
        onChangeText={setEmail}
        placeholder={i18n.t('placeholderEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.cancelBtn]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>{i18n.t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
          <Text style={styles.saveText}>{i18n.t('save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fa' },
  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 42, fontWeight: 'bold' },
  avatarButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  smallBtnText: { fontSize: 13, color: '#333' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e3e6ec',
  },
  inputError: { borderColor: '#e53935' },
  error: { color: '#e53935', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#eee' },
  cancelText: { color: '#333', fontWeight: '600' },
  saveBtn: { backgroundColor: '#4a90e2' },
  saveText: { color: '#fff', fontWeight: '700' },
});
