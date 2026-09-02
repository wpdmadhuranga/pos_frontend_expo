import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomerDetailDto, getAllCustomersApi } from "../api/pos.api";
import { AppHeader } from "../components/AppHeader";
import { CustomerDetailsModal } from "../components/CustomerDetailsModal";
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
  if (!date) return "No visits yet";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetailDto | null>(null);

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

  const filtered = useMemo(
    () =>
      customers.filter((item) =>
        `${item.name} ${item.phone} ${item.email ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, customers],
  );

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

  const handleCall = (phone: string) => {
    console.log("Calling customer:", phone);
  };

  return (
    <View className="flex-1 bg-[#09090b]">
      <AppHeader title="Customers" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-6"
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="gap-3.5 pb-3.5">
            <View className="flex-row items-center gap-2.5 min-h-[48px] rounded-[18px] px-3.5 bg-[#121214] border border-[#27272a]">
              <Ionicons name="search-outline" size={18} color="#a1a1aa" />
              <TextInput
                placeholder="Search customer"
                placeholderTextColor="#a1a1aa"
                value={search}
                onChangeText={setSearch}
                style={{ fontFamily: Fonts.body }}
                className="flex-1 text-white"
              />
            </View>

            <View className="flex-row gap-2.5">
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

            {error ? (
              <Text
                className="text-zinc-400 text-xs mt-1"
                style={{ fontFamily: Fonts.body }}
              >
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text
                className="text-zinc-400 text-xs"
                style={{ fontFamily: Fonts.body }}
              >
                {error ? " " : "No customers found."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-5">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const color = AccentColors[index % AccentColors.length];
          const { totalSpent, lastVisitDate } = getCustomerStats(item);
          const lastVisit = formatLastVisit(lastVisitDate);

          return (
            <View className="flex-row gap-3 p-3.5 rounded-[22px] border border-[#27272a] bg-[#18181b] mb-3">
              <View
                style={{ backgroundColor: `${color}26` }}
                className="w-[52px] h-[52px] rounded-[18px] items-center justify-center"
              >
                <Text
                  style={{ color, fontFamily: Fonts.bold }}
                  className="text-base"
                >
                  {initials(item.name)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-3 mb-3">
                  <View className="flex-1">
                    <Text
                      className="text-white text-[15px]"
                      style={{ fontFamily: Fonts.semibold }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-zinc-400 text-xs mt-0.5"
                      style={{ fontFamily: Fonts.body }}
                    >
                      {item.phone}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-white text-base"
                      style={{ fontFamily: Fonts.monoBold }}
                    >
                      ${totalSpent.toLocaleString()}
                    </Text>
                    <Text
                      style={{ fontFamily: Fonts.medium }}
                      className={`text-[11px] mt-0.5 ${
                        lastVisit === "Today"
                          ? "text-emerald-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {lastVisit}
                    </Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View className="flex-row gap-2.5">
                  <TouchableOpacity
                    className="flex-1 min-h-[40px] rounded-[14px] border border-[#27272a] items-center justify-center bg-[#121214]"
                    onPress={() => setSelectedCustomer(item)}
                  >
                    <Text
                      className="text-white text-[13px]"
                      style={{ fontFamily: Fonts.semibold }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: Colors.primary }}
                    className="flex-1 min-h-[40px] rounded-[14px] items-center justify-center"
                    onPress={() => handleCall(item.phone)}
                  >
                    <Text
                      className="text-black text-[13px]"
                      style={{ fontFamily: Fonts.bold }}
                    >
                      Call
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Customer Details Popup Modal */}
      <CustomerDetailsModal
        visible={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onCall={handleCall}
      />
    </View>
  );
}
