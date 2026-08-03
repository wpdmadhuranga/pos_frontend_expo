import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { BottomSheet } from "../components/BottomSheet";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { JobStatus, mockJobs } from "../data/mock";
import { StatusBadge } from "../components/StatusBadge";

const statusConfig: Record<JobStatus, { label: string; tone: "blue" | "orange" | "green" | "gray" }> = {
  "in-progress": { label: "In Progress", tone: "blue" },
  "waiting-parts": { label: "Waiting Parts", tone: "orange" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "gray" },
};

const filters: { label: string; value: JobStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Waiting Parts", value: "waiting-parts" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function JobsScreen() {
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(mockJobs[0]?.id ?? null);
  const [newJobVisible, setNewJobVisible] = useState(false);

  const filteredJobs = useMemo(() => mockJobs.filter((job) => filter === "all" || job.status === filter), [filter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: mockJobs.length };
    filters.slice(1).forEach((item) => {
      result[item.value] = mockJobs.filter((job) => job.status === item.value).length;
    });
    return result;
  }, []);

  return (
    <View style={styles.screen}>
      <AppHeader title="Job Orders" />

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.chipRow}>
              {filters.map((item) => {
                const active = filter === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setFilter(item.value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{item.label}</Text>
                    <View style={[styles.countPill, active && styles.countPillActive]}>
                      <Text style={[styles.countText, active && styles.countTextActive]}>{counts[item.value]}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const expandedRow = expanded === item.id;
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(expandedRow ? null : item.id)} activeOpacity={0.86}>
              <View style={[styles.statusBar, { backgroundColor: item.status === "waiting-parts" ? Colors.warning : item.status === "completed" ? Colors.success : item.status === "cancelled" ? Colors.textMuted : Colors.info }]} />
              <View style={styles.cardBody}>
                <View style={styles.rowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customer}>{item.customer}</Text>
                    <Text style={styles.vehicle}>{item.vehicle}</Text>
                  </View>
                  <StatusBadge label={statusConfig[item.status].label} tone={statusConfig[item.status].tone} />
                </View>
                <Text style={styles.service}>{item.service}</Text>
                <View style={styles.rowBottom}>
                  <Text style={styles.monoDim}>{item.id}</Text>
                  <Text style={styles.monoTotal}>${item.total.toFixed(2)}</Text>
                </View>

                {expandedRow ? (
                  <View style={styles.expandedBlock}>
                    <View style={styles.metaGrid}>
                      {[
                        ["Plate", item.plate],
                        ["Assigned", item.tech],
                        ["ETA", item.eta],
                        ["Created", item.created],
                      ].map(([label, value]) => (
                        <View key={label} style={styles.metaCell}>
                          <Text style={styles.metaLabel}>{label}</Text>
                          <Text style={styles.metaValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.actionRow}>
                      {item.status === "completed" ? (
                        <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>View Invoice</Text></TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>Assign Tech</Text></TouchableOpacity>
                          <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}><Text style={styles.primaryActionText}>Update Status</Text></TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={<View style={{ height: 84 }} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setNewJobVisible(true)} activeOpacity={0.9}>
        <Ionicons name="add" size={22} color={Colors.black} />
        <Text style={styles.fabText}>New Job Order</Text>
      </TouchableOpacity>

      <BottomSheet visible={newJobVisible} onClose={() => setNewJobVisible(false)} title="New Job Order" snapPoints={["62%"]}>
        <View style={styles.formBlock}>
          {[
            ["Customer Name", "text"],
            ["Vehicle (Year Make Model)", "text"],
            ["License Plate", "text"],
            ["Service Required", "text"],
          ].map(([label, keyboard]) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput placeholder={label} placeholderTextColor={Colors.textDim} style={styles.input} keyboardType={keyboard as any} />
            </View>
          ))}
          <TouchableOpacity style={styles.confirmButton} onPress={() => setNewJobVisible(false)}>
            <Text style={styles.confirmButtonText}>Create Job Order</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  headerWrap: { paddingBottom: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { color: Colors.textMuted, fontFamily: Fonts.semibold, fontSize: 12 },
  filterLabelActive: { color: Colors.black },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 6,
  },
  countPillActive: { backgroundColor: "rgba(0,0,0,0.16)" },
  countText: { color: Colors.textMuted, fontFamily: Fonts.bold, fontSize: 11 },
  countTextActive: { color: Colors.black },
  card: {
    flexDirection: "row",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: "hidden",
  },
  statusBar: { width: 6 },
  cardBody: { flex: 1, padding: 14, gap: 10 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  customer: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 15 },
  vehicle: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 2 },
  service: { color: Colors.textPrimary, fontFamily: Fonts.body, fontSize: 13 },
  rowBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  monoDim: { color: Colors.textDim, fontFamily: Fonts.mono, fontSize: 12 },
  monoTotal: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 18 },
  expandedBlock: { gap: 12, paddingTop: 2 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaCell: {
    width: "48%",
    borderRadius: 16,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 11 },
  metaValue: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 13 },
  primaryAction: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  primaryActionText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 13 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 18,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
  },
  fabText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 13 },
  formBlock: { gap: 12 },
  inputGroup: { gap: 8 },
  inputLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 12 },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    fontFamily: Fonts.body,
  },
  confirmButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  confirmButtonText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 14 },
});
