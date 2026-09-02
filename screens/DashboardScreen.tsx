import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getInvoiceOverviewApi,
  InvoiceDetailDto,
  PosDashboardInvoicesResponse,
  updateInvoicePaymentApi,
} from "../api/pos.api";
import { AppHeader } from "../components/AppHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

type TabMode = "overview" | "dues";

const statusToneMap: Record<string, "blue" | "orange" | "green" | "gray"> = {
  Draft: "gray",
  Completed: "green",
  Cancelled: "gray",
  Unpaid: "orange",
  PartiallyPaid: "blue",
  Paid: "green",
};

function Currency({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <Text style={[styles.mono, { fontSize: size }]}>
      Rs. {value.toLocaleString()}
    </Text>
  );
}

export function DashboardScreen() {
  const [mode, setMode] = useState<TabMode>("overview");
  const [overviewData, setOverviewData] =
    useState<PosDashboardInvoicesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOverview = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getInvoiceOverviewApi();
      setOverviewData(data);
    } catch (err) {
      console.error("Failed to load dashboard invoice overview", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Handle Mark Paid action with the new API service
  const handleMarkPaid = async (item: InvoiceDetailDto) => {
    try {
      setUpdatingId(item.id);
      const balanceDue = item.total - (item.amountPaid || 0);

      await updateInvoicePaymentApi(item.id, {
        amountPaid: balanceDue,
        paymentStatus: 2, // 2 corresponds to Paid (adjust if your backend enum differs)
      });

      await loadOverview(true);
      Alert.alert("Success", "Invoice marked as paid successfully.");
    } catch (error: any) {
      console.error("Error updating invoice payment:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not update the payment status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const todayRevenue = useMemo(() => {
    if (!overviewData?.todayInvoices) return 0;
    return overviewData.todayInvoices.reduce(
      (sum, inv) => sum + (inv.amountPaid || 0),
      0,
    );
  }, [overviewData]);

  const weekRevenue = useMemo(() => {
    if (!overviewData?.weeklyInvoices?.items) return 0;
    return overviewData.weeklyInvoices.items.reduce(
      (sum, inv) => sum + (inv.amountPaid || 0),
      0,
    );
  }, [overviewData]);

  const monthlyRevenue = useMemo(() => {
    if (!overviewData?.monthlyInvoices?.items) return 0;
    return overviewData.monthlyInvoices.items.reduce(
      (sum, inv) => sum + (inv.amountPaid || 0),
      0,
    );
  }, [overviewData]);

  const monthlyTotalInvoices = overviewData?.monthlyInvoices?.totalCount || 0;
  const duePayments = overviewData?.allTimeDuePayments || [];

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const chartDaysData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    overviewData?.weeklyInvoices?.items?.forEach((inv) => {
      const d = new Date(inv.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = days[d.getDay()];
        map[dayName] = (map[dayName] || 0) + inv.total;
      }
    });

    return days.map((day) => ({ day, amount: map[day] }));
  }, [overviewData]);

  return (
    <View className="flex-1 bg-[#0b1017]">
      <View className="flex-row items-center justify-between pr-4">
        <View className="flex-1">
          <AppHeader title="Dashboard" />
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-[14px] bg-[#131a27] border border-[#1f293d] items-center justify-center"
          onPress={() => loadOverview(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2.5 px-4 pb-3">
        {(
          [
            { key: "overview" as const, label: "Overview" },
            {
              key: "dues" as const,
              label: `Payment Due (${duePayments.length})`,
            },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            className={`flex-1 min-h-[44px] rounded-[18px] bg-[#131a27] border border-[#1f293d] items-center justify-center ${
              mode === item.key ? "bg-[#00d4aa] border-[#00d4aa]" : ""
            }`}
            onPress={() => setMode(item.key)}
            activeOpacity={0.85}
          >
            <Text
              className={`text-[#94a3b8] font-semibold text-xs ${
                mode === item.key ? "text-black" : ""
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "overview" ? (
        <FlatList
          data={overviewData?.todayInvoices || []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOverview(true)}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <View className="px-4 gap-4">
              <View>
                <Text className="text-white font-bold text-2xl tracking-tight">
                  {greeting}, User
                </Text>
                <Text className="text-[#94a3b8] font-normal mt-1">{today}</Text>
              </View>

              <LinearGradient
                colors={["#131a27", "#0b1017"]}
                className="rounded-[24px] p-[18px] border border-[#1f293d]"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-[#94a3b8] font-medium text-xs uppercase tracking-wider">
                      Today’s Revenue
                    </Text>
                    <Currency value={todayRevenue} size={36} />
                    <View className="flex-row items-center gap-1 mt-1.5">
                      <Ionicons
                        name="arrow-up"
                        size={14}
                        color={Colors.success}
                      />
                      <Text className="text-[#00d4aa] font-semibold text-xs">
                        +12.4% vs yesterday
                      </Text>
                    </View>
                  </View>
                  <View className="w-[46px] h-[46px] rounded-[18px] items-center justify-center bg-[rgba(0,212,170,0.12)]">
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                <View className="mt-5 flex-row items-end justify-between gap-3.5">
                  <View className="flex-1 flex-row items-end justify-between">
                    {chartDaysData.map((item, index) => {
                      const max = Math.max(
                        ...chartDaysData.map((entry) => entry.amount),
                        100,
                      );
                      const height = Math.max(12, (item.amount / max) * 92);
                      const isToday = index === chartDaysData.length - 1;
                      return (
                        <View key={item.day} className="items-center gap-2">
                          <View
                            style={{ height }}
                            className={`w-6 rounded-lg ${
                              isToday
                                ? "bg-[#00d4aa]"
                                : "bg-[rgba(255,255,255,0.06)]"
                            }`}
                          />
                          <Text
                            className={`text-[#64748b] font-medium text-[11px] ${
                              isToday ? "text-[#00d4aa]" : ""
                            }`}
                          >
                            {item.day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <View className="min-w-[88px] items-end gap-1.5">
                    <Text className="text-[#94a3b8] font-medium text-xs uppercase tracking-wider">
                      This week
                    </Text>
                    <Currency value={weekRevenue} size={18} />
                  </View>
                </View>
              </LinearGradient>

              {duePayments.length > 0 ? (
                <TouchableOpacity
                  className="flex-row items-center gap-3 p-3.5 rounded-[20px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.18)]"
                  onPress={() => setMode("dues")}
                  activeOpacity={0.86}
                >
                  <View className="w-9 h-9 rounded-[14px] bg-[rgba(239,68,68,0.12)] items-center justify-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={Colors.danger}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#ef4444] font-semibold text-[13px]">
                      {duePayments.length} due payments need attention
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-xs mt-0.5">
                      Open the Payment Due tab to inspect and record
                      collections.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              ) : null}

              <View className="rounded-[20px] bg-[#131a27] border border-[#1f293d] p-4 gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#94a3b8] font-medium text-xs uppercase tracking-wider">
                    Monthly Summary
                  </Text>
                  <StatusBadge label="This Month" tone="blue" />
                </View>
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-white font-mono-bold text-2xl">
                      Rs. {monthlyRevenue.toLocaleString()}
                    </Text>
                    <Text className="text-[#64748b] text-xs mt-0.5">
                      {monthlyTotalInvoices} total invoices recorded
                    </Text>
                  </View>
                  <Ionicons
                    name="stats-chart"
                    size={24}
                    color={Colors.primary}
                  />
                </View>
              </View>

              <Text className="text-white font-semibold text-base mt-0.5">
                Today’s Invoices
              </Text>
            </View>
          }
          renderItem={({ item }: { item: InvoiceDetailDto }) => (
            <View className="mx-4 flex-row rounded-[20px] bg-[#131a27] border border-[#1f293d] overflow-hidden">
              <View className="w-1.5 bg-[#3b82f6]" />
              <View className="flex-1 p-3.5 gap-2.5">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-[15px]">
                      {item.customer?.name || "Walk-in Customer"}
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-xs mt-0.5">
                      {item.vehicle?.plateNumber} • {item.vehicle?.make}{" "}
                      {item.vehicle?.model}
                    </Text>
                  </View>
                  <StatusBadge
                    label={item.paymentStatus}
                    tone={statusToneMap[item.paymentStatus] || "blue"}
                  />
                </View>
                <Text className="text-white font-normal text-[13px]">
                  Invoice #{item.invoiceNumber}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#64748b] font-mono text-xs">
                    {item.id.slice(0, 8)}
                  </Text>
                  <Text className="text-white font-mono-bold text-lg">
                    Rs. {item.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View className="px-4 mt-2 gap-3">
              <Text className="text-white font-semibold text-base">
                Quick Actions
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {[
                  ["New Job Order", "add-circle-outline"],
                  ["Create Invoice", "receipt-outline"],
                  ["Check Stock", "cube-outline"],
                  ["Add Customer", "person-add-outline"],
                ].map(([label, icon]) => (
                  <Pressable
                    key={label}
                    className="w-[48%] min-h-[88px] rounded-[20px] p-3.5 bg-[#131a27] border border-[#1f293d] gap-2.5"
                  >
                    <Ionicons
                      name={icon as any}
                      size={22}
                      color={Colors.primary}
                    />
                    <Text className="text-white font-semibold text-[13px]">
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={duePayments}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOverview(true)}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            gap: 12,
          }}
          ListHeaderComponent={
            <View className="pb-1">
              <LinearGradient
                colors={["rgba(239,68,68,0.2)", "rgba(80,16,18,0.65)"]}
                className="rounded-[24px] p-[18px] border border-[rgba(239,68,68,0.18)] gap-2"
              >
                <Text className="text-[#94a3b8] font-medium text-xs uppercase tracking-wider">
                  Outstanding Balance
                </Text>
                <Currency
                  value={duePayments.reduce(
                    (sum, inv) => sum + (inv.total - inv.amountPaid),
                    0,
                  )}
                  size={34}
                />
                <View className="flex-row gap-3.5">
                  <Text className="text-[#94a3b8] font-medium text-xs">
                    {duePayments.length} total pending invoices
                  </Text>
                </View>
              </LinearGradient>
            </View>
          }
          renderItem={({ item }: { item: InvoiceDetailDto }) => {
            const balanceDue = item.total - (item.amountPaid || 0);
            const isUpdating = updatingId === item.id;
            return (
              <View className="rounded-[20px] bg-[#131a27] border border-[#1f293d] p-3.5 gap-3.5">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-[15px]">
                      {item.customer?.name || "Customer"}
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-xs mt-0.5">
                      {item.vehicle?.plateNumber} • {item.vehicle?.make}{" "}
                      {item.vehicle?.model}
                    </Text>
                  </View>
                  <StatusBadge label={item.paymentStatus} tone="orange" />
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {item.invoiceItems?.map((i) => (
                    <View
                      key={i.id}
                      className="px-2.5 py-1.5 rounded-full bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.16)]"
                    >
                      <Text className="text-[#00d4aa] font-medium text-[11px]">
                        {i.nameSnapshot} (x{i.quantity})
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-end justify-between gap-3">
                  <View>
                    <Text className="text-white font-mono-bold text-lg">
                      Rs. {balanceDue.toFixed(2)}
                    </Text>
                    <Text className="text-[#64748b] font-mono text-xs">
                      Inv: {item.invoiceNumber}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity className="min-h-[40px] px-3.5 rounded-2xl border border-[#1f293d] items-center justify-center bg-[rgba(255,255,255,0.02)]">
                      <Text className="text-white font-semibold text-xs">
                        Call
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(item)}
                      disabled={isUpdating}
                      className={`min-h-[40px] px-3.5 rounded-2xl bg-[#00d4aa] items-center justify-center ${
                        isUpdating ? "opacity-50" : ""
                      }`}
                    >
                      <Text className="text-black font-bold text-xs">
                        {isUpdating ? "Updating..." : "Mark Paid"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = {
  mono: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    letterSpacing: -0.6,
  },
};
