import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  deleteStudent,
  getStudents,
  Student,
} from "../database/studentStorage";
import i18n from "../i18n";

export default function StudentListScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const loadData = useCallback(() => {
    getStudents().then(setStudents);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const askDelete = (id: string) => {
    setSelectedId(id);
    setConfirmVisible(true);
  };

  const doDelete = async () => {
    if (!selectedId) return;
    await deleteStudent(selectedId);
    setConfirmVisible(false);
    setSelectedId(null);
    loadData();
    Alert.alert("", i18n.t("deletedSuccess"));
  };

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/detail",
          params: { student: JSON.stringify(item) },
        })
      }
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.fullName?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={styles.sub}>
          {i18n.t("studentId")}: {item.studentCode}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => askDelete(item.id)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}></Text>
            <Text style={styles.emptyText}>{i18n.t("emptyList")}</Text>
            <Text style={styles.emptyHint}>{i18n.t("emptyListHint")}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/form")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={confirmVisible}
        message={i18n.t("confirmDelete")}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={doDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: "#222" },
  sub: { fontSize: 13, color: "#666", marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 20 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#555" },
  emptyHint: { fontSize: 13, color: "#999", marginTop: 6 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 32, lineHeight: 34, fontWeight: "300" },
});
