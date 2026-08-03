import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { StatCard } from "../components/StatCard";
import { AccentColors, Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { mockCustomers } from "../data/mock";

const initials = (name: string) => name.split(" ").map((part) => part[0]).slice(0, 2).join("");

export function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(mockCustomers[0]?.id ?? null);

  const filtered = useMemo(() => mockCustomers.filter((item) => `${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(search.toLowerCase())), [search]);

  const stats = useMemo(() => ({
    total: mockCustomers.length,
    visitsToday: mockCustomers.filter((item) => item.lastVisit === "Today").length,
    avgSpend: Math.round(mockCustomers.reduce((sum, item) => sum + item.totalSpent, 0) / mockCustomers.length),
  }), []);

  return (
    <View style={styles.screen}>
      <AppHeader title="Customers" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <TextInput placeholder="Search customer" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} style={styles.searchInput} />
            </View>

            <View style={styles.statsRow}>
              <StatCard label="Total Customers" value={String(stats.total)} />
              <StatCard label="Today's Visits" value={String(stats.visitsToday)} accent={Colors.success} />
              <StatCard label="Avg Spend" value={`$${stats.avgSpend}`} accent={Colors.primary} />
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const active = expanded === item.id;
          const color = AccentColors[index % AccentColors.length];
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(active ? null : item.id)} activeOpacity={0.86}>
              <View style={[styles.avatar, { backgroundColor: `${color}26` }]}>
                <Text style={[styles.avatarText, { color }]}>{initials(item.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.phone}>{item.phone}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.spend}>${item.totalSpent.toLocaleString()}</Text>
                    <Text style={[styles.lastVisit, item.lastVisit === "Today" && styles.lastVisitToday]}>{item.lastVisit}</Text>
                  </View>
                </View>

                {active ? (
                  <View style={styles.expanded}>
                    <View style={styles.metaRow}><Ionicons name="mail-outline" size={14} color={Colors.textMuted} /><Text style={styles.metaText}>{item.email}</Text></View>
                    {item.vehicles.map((vehicle) => (
                      <View key={vehicle} style={styles.metaRow}><Ionicons name="car-outline" size={14} color={Colors.textMuted} /><Text style={styles.metaText}>{vehicle}</Text></View>
                    ))}
                    <View style={styles.grid}>
                      <View style={styles.gridCell}><Text style={styles.gridValue}>{item.visits}</Text><Text style={styles.gridLabel}>Total Visits</Text></View>
                      <View style={styles.gridCell}><Text style={styles.gridValue}>${item.totalSpent.toLocaleString()}</Text><Text style={styles.gridLabel}>Total Spent</Text></View>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>New Job</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}><Text style={styles.primaryActionText}>Call</Text></TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { gap: 14, paddingBottom: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, borderRadius: 18, paddingHorizontal: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body },
  statsRow: { flexDirection: "row", gap: 10 },
  card: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.bold, fontSize: 16 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  name: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 15 },
  phone: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 2 },
  spend: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 16 },
  lastVisit: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 11, marginTop: 3 },
  lastVisitToday: { color: Colors.success },
  expanded: { gap: 10, paddingTop: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, flex: 1 },
  grid: { flexDirection: "row", gap: 10 },
  gridCell: { flex: 1, borderRadius: 16, padding: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  gridValue: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 16 },
  gridLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 11, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, minHeight: 44, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  actionText: { color: Colors.textPrimary, fontFamily: Fonts.semibold },
  primaryAction: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  primaryActionText: { color: Colors.black, fontFamily: Fonts.bold },
});
