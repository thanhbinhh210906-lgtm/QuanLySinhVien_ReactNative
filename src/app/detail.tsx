import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfirmDialog from '../components/ConfirmDialog';
import i18n from '../i18n';
import { Student } from '../database/studentStorage';

export default function StudentDetailScreen() {
  const params = useLocalSearchParams<{ student: string }>();
  const student: Student = JSON.parse(params.student || '{}');
  const router = useRouter();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const goEdit = () => {
    setConfirmVisible(false);
    router.replace({
      pathname: '/form',
      params: { mode: 'edit', student: JSON.stringify(student) },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
          <Text style={styles.header}>{i18n.t('studentDetail')}</Text>

          <View style={styles.avatarWrapper}>
            {student.avatar ? (
              <Image source={{ uri: student.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {student.fullName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          <Field label={i18n.t('fullName')} value={student.fullName} />
          <Field label={i18n.t('studentId')} value={student.studentCode} />
          <Field label={i18n.t('email')} value={student.email} />

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.closeBtn]}
              onPress={() => router.back()}
            >
              <Text style={styles.closeText}>{i18n.t('close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.editBtn]}
              onPress={() => setConfirmVisible(true)}
            >
              <Text style={styles.editText}>{i18n.t('edit')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        message={i18n.t('confirmEdit')}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={goEdit}
      />
    </View>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '90%' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#222' },
  avatarWrapper: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 42, fontWeight: 'bold' },
  field: { marginBottom: 12 },
  label: { fontSize: 12, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#222', fontWeight: '500' },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  closeBtn: { backgroundColor: '#eee' },
  closeText: { color: '#333', fontWeight: '600' },
  editBtn: { backgroundColor: '#4a90e2' },
  editText: { color: '#fff', fontWeight: '600' },
});