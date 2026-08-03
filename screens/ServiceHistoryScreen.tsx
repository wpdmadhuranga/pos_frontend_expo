import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import { mockHistory } from "../data/mock";
import { StatusBadge } from "../components/StatusBadge";

type Row = { type: "header"; title: string; total: number } | { type: "item"; id: string; index: number };

const paymentTone: Record<string, "blue" | "green" | "purple"> = { Card: "blue", Cash: "green", Transfer: "purple" };

export function ServiceHistoryScreen() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(mockHistory[0]?.id ?? null);

  const rows = useMemo<Row[]>(() => {
    const filtered = mockHistory.filter((item) => `${item.customer} ${item.vehicle} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
    const groups = ["TODAY", "YESTERDAY", "JUL 22"];
    const output: Row[] = [];
    groups.forEach((title) => {
      const matches = filtered.filter((item) => item.date.toUpperCase().includes(title));
      if (!matches.length) {
        return;
      }
      output.push({ type: "header", title, total: matches.reduce((sum, item) => sum + item.total, 0) });
      matches.forEach((item) => output.push({ type: "item", id: item.id, index: mockHistory.findIndex((row) => row.id === item.id) }));
    });
    return output;
  }, [search]);

  const totalRevenue = mockHistory.reduce((sum, item) => sum + item.total, 0);

  return (
    <View style={styles.screen}>
      <AppHeader title="Service History" />
      <FlatList
        data={rows}
        keyExtractor={(item) => (item.type === "header" ? item.title : item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <TextInput placeholder="Search invoice, customer or vehicle" placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} style={styles.searchInput} />
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}><Text style={styles.summaryValue}>{mockHistory.length}</Text><Text style={styles.summaryLabel}>Invoices</Text></View>
              <View style={styles.summaryCard}><Text style={styles.summaryValue}>${totalRevenue.toLocaleString()}</Text><Text style={styles.summaryLabel}>Revenue</Text></View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{item.title}</Text>
                <Text style={styles.groupTotal}>${item.total.toLocaleString()}</Text>
              </View>
            );
          }

          const invoice = mockHistory[item.index];
          const open = expanded === invoice.id;
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(open ? null : invoice.id)} activeOpacity={0.86}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customer}>{invoice.customer}</Text>
                  <Text style={styles.vehicle}>{invoice.vehicle}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={styles.total}>${invoice.total.toFixed(2)}</Text>
                  <Text style={styles.id}>{invoice.id}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <StatusBadge label={invoice.payMethod} tone={paymentTone[invoice.payMethod]} />
                <Text style={styles.time}>{invoice.date}</Text>
              </View>

              {open ? (
                <View style={styles.expanded}>
                  <View style={styles.listSection}>
                    <Text style={styles.listTitle}>Services used</Text>
                    {invoice.services.map((service) => (
                      <View key={service} style={styles.rowItem}><Ionicons name="construct-outline" size={14} color={Colors.primary} /><Text style={styles.rowText}>{service}</Text></View>
                    ))}
                  </View>
                  <View style={styles.listSection}>
                    <Text style={styles.listTitle}>Parts used</Text>
                    {invoice.parts.length ? invoice.parts.map((part) => (
                      <View key={part} style={styles.rowItem}><Ionicons name="cube-outline" size={14} color={Colors.warning} /><Text style={styles.rowText}>{part}</Text></View>
                    )) : <Text style={styles.emptyText}>No parts were added on this invoice.</Text>}
                  </View>
                  <View style={styles.rowItem}><Ionicons name="person-outline" size={14} color={Colors.textMuted} /><Text style={styles.rowText}>{invoice.tech}</Text></View>
                  <TouchableOpacity style={styles.printButton}><Text style={styles.printButtonText}>Print Invoice</Text></TouchableOpacity>
                </View>
              ) : null}
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
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, minHeight: 76, borderRadius: 20, padding: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, justifyContent: "space-between" },
  summaryValue: { color: Colors.primary, fontFamily: Fonts.monoBold, fontSize: 18 },
  summaryLabel: { color: Colors.textMuted, fontFamily: Fonts.medium, fontSize: 12 },
  groupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 2 },
  groupTitle: { color: Colors.textPrimary, fontFamily: Fonts.bold, fontSize: 13, letterSpacing: 0.8 },
  groupTotal: { color: Colors.textMuted, fontFamily: Fonts.monoBold, fontSize: 12 },
  card: { padding: 14, borderRadius: 22, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  customer: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 15 },
  vehicle: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, marginTop: 2 },
  total: { color: Colors.textPrimary, fontFamily: Fonts.monoBold, fontSize: 18 },
  id: { color: Colors.textDim, fontFamily: Fonts.mono, fontSize: 11 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  time: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12 },
  expanded: { gap: 12, paddingTop: 4 },
  listSection: { gap: 8 },
  listTitle: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 13 },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowText: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12, flex: 1 },
  emptyText: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 12 },
  printButton: { minHeight: 44, borderRadius: 16, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  printButtonText: { color: Colors.black, fontFamily: Fonts.bold, fontSize: 13 },
});
