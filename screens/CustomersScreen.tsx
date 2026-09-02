import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomerDetailDto, getAllCustomersApi } from "../api/pos.api";
import { AppHeader } from "../components/AppHeader";
import { StatCard } from "../components/StatCard";
import { AccentColors, Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

const PAGE_SIZE = 10;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

function getCustomerStats(customer: CustomerDetailDto) {
  const invoices = customer.vehicles
    .flatMap((vehicle) => vehicle.invoices)
    .filter((invoice) => invoice.status !== "Cancelled");

  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const visits = invoices.length;

  const lastVisitDate = invoices.reduce<Date | null>((latest, invoice) => {
    const date = new Date(invoice.createdAt);
    return !latest || date > latest ? date : latest;
  }, null);

  return { totalSpent, visits, lastVisitDate };
}

function formatLastVisit(date: Date | null) {
  if (!date) {
    return "No visits yet";
  }

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerDetailDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (pageToLoad: number, mode: "initial" | "refresh" | "more") => {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") setLoadingMore(true);
      setError(null);

      try {
        const result = await getAllCustomersApi(pageToLoad, PAGE_SIZE);
        setCustomers((current) =>
          pageToLoad === 1 ? result.items : [...current, ...result.items],
        );
        setPage(result.page);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.log("[CustomersScreen] Failed to load customers:", err);
        setError("Couldn't load customers. Pull down to retry.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadPage(1, "initial");
  }, [loadPage]);

  const handleRefresh = () => {
    if (loading || refreshing) return;
    loadPage(1, "refresh");
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing) return;
    if (page >= totalPages) return;
    loadPage(page + 1, "more");
  };

  // Search runs client-side against whatever customers have been fetched
  // so far (this page + any previously loaded pages). Scroll to load more
  // before searching for someone further down the list.
  const filtered = useMemo(
    () =>
      customers.filter((item) =>
        `${item.name} ${item.phone} ${item.email ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, customers],
  );

  // NOTE: visitsToday / avgSpend are computed from the customers loaded so
  // far, not the entire customer base — totalCount below is the only
  // figure guaranteed to reflect every customer on the server. For exact
  // global stats, a dedicated aggregate endpoint would be needed.
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    let visitsToday = 0;
    let spendSum = 0;

    customers.forEach((customer) => {
      const { totalSpent, lastVisitDate } = getCustomerStats(customer);
      spendSum += totalSpent;
      if (lastVisitDate && lastVisitDate.toDateString() === today) {
        visitsToday += 1;
      }
    });

    return {
      total: totalCount,
      visitsToday,
      avgSpend: customers.length ? Math.round(spendSum / customers.length) : 0,
    };
  }, [customers, totalCount]);

  return (
    <View style={styles.screen}>
      <AppHeader title="Customers" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={18}
                color={Colors.textMuted}
              />
              <TextInput
                placeholder="Search customer"
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard label="Total Customers" value={String(stats.total)} />
              <StatCard
                label="Today's Visits"
                value={String(stats.visitsToday)}
                accent={Colors.success}
              />
              <StatCard
                label="Avg Spend"
                value={`$${stats.avgSpend}`}
                accent={Colors.primary}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {error ? " " : "No customers found."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const active = expanded === item.id;
          const color = AccentColors[index % AccentColors.length];
          const { totalSpent, visits, lastVisitDate } = getCustomerStats(item);
          const lastVisit = formatLastVisit(lastVisitDate);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setExpanded(active ? null : item.id)}
              activeOpacity={0.86}
            >
              <View style={[styles.avatar, { backgroundColor: `${color}26` }]}>
                <Text style={[styles.avatarText, { color }]}>
                  {initials(item.name)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.phone}>{item.phone}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.spend}>
                      ${totalSpent.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.lastVisit,
                        lastVisit === "Today" && styles.lastVisitToday,
                      ]}
                    >
                      {lastVisit}
                    </Text>
                  </View>
                </View>

                {active ? (
                  <View style={styles.expanded}>
                    {item.email ? (
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="mail-outline"
                          size={14}
                          color={Colors.textMuted}
                        />
                        <Text style={styles.metaText}>{item.email}</Text>
                      </View>
                    ) : null}
                    {item.vehicles.length === 0 ? (
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="car-outline"
                          size={14}
                          color={Colors.textMuted}
                        />
                        <Text style={styles.metaText}>No vehicles on file</Text>
                      </View>
                    ) : (
                      item.vehicles.map((vehicle) => (
                        <View key={vehicle.id} style={styles.metaRow}>
                          <Ionicons
                            name="car-outline"
                            size={14}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.metaText}>
                            {vehicle.plateNumber}
                            {vehicle.make || vehicle.model
                              ? ` · ${[vehicle.make, vehicle.model].filter(Boolean).join(" ")}`
                              : ""}
                          </Text>
                        </View>
                      ))
                    )}
                    <View style={styles.grid}>
                      <View style={styles.gridCell}>
                        <Text style={styles.gridValue}>{visits}</Text>
                        <Text style={styles.gridLabel}>Total Visits</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.gridValue}>
                          ${totalSpent.toLocaleString()}
                        </Text>
                        <Text style={styles.gridLabel}>Total Spent</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionText}>New Job</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.primaryAction]}
                      >
                        <Text style={styles.primaryActionText}>Call</Text>
                      </TouchableOpacity>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body },
  statsRow: { flexDirection: "row", gap: 10 },
  errorText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 13 },
  footerLoading: { paddingVertical: 20 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 16 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  name: { color: Colors.textPrimary, fontFamily: Fonts.semibold, fontSize: 15 },
  phone: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  spend: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 16,
  },
  lastVisit: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 11,
    marginTop: 3,
  },
  lastVisitToday: { color: Colors.success },
  expanded: { gap: 10, paddingTop: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    flex: 1,
  },
  grid: { flexDirection: "row", gap: 10 },
  gridCell: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridValue: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 16,
  },
  gridLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 11,
    marginTop: 4,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  actionText: { color: Colors.textPrimary, fontFamily: Fonts.semibold },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryActionText: { color: Colors.black, fontFamily: Fonts.bold },
});
