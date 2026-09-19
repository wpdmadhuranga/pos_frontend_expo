import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  getInvoiceOverviewApi,
  InvoiceDetailDto,
  PosDashboardInvoicesResponse,
} from "../api/pos.api";
import { AppHeader } from "../components/AppHeader";
import { InvoiceDetailSheet } from "../components/InvoiceDetailSheet";
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Currency({ value, size = 22 }: { value: number; size?: number }) {
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
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceDetailDto | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const openInvoiceDetail = (invoice: InvoiceDetailDto) => {
    setSelectedInvoice(invoice);
    setDetailVisible(true);
  };

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

  // Revenue figures now come straight from the payload — no client-side reduce needed
  const todayRevenue = overviewData?.todayRevenue ?? 0;
  const weekRevenue = overviewData?.weeklyRevenue ?? 0;
  const monthlyRevenue = overviewData?.monthlyRevenue ?? 0;
  const duePaymentsRevenue = overviewData?.duePaymentsRevenue ?? 0;
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

  // Build chart data straight from weeklyRevenueByDay (already Sun -> Sat, 7 entries)
  const chartDaysData = useMemo(() => {
    const byDay = overviewData?.weeklyRevenueByDay || [];
    return byDay.map((entry) => {
      const d = new Date(entry.date);
      const dayName = !isNaN(d.getTime()) ? DAY_LABELS[d.getUTCDay()] : "";
      return { day: dayName, amount: entry.revenue };
    });
  }, [overviewData]);

  const todayDayLabel = DAY_LABELS[new Date().getDay()];

  return (
    <View className="flex-1 bg-[#0b1017]">
      {/* Header + Refresh */}
      <View className="flex-row items-center justify-between pr-4">
        <View className="flex-1">
          <AppHeader title="Dashboard" />
        </View>
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-[#131a27] border border-[#1f293d] items-center justify-center"
          onPress={() => loadOverview(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs - larger */}
      <View className="flex-row gap-3 px-4 pb-4">
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
            className={`flex-1 min-h-[52px] rounded-2xl bg-[#131a27] border border-[#1f293d] items-center justify-center ${
              mode === item.key ? "bg-[#00d4aa] border-[#00d4aa]" : ""
            }`}
            onPress={() => setMode(item.key)}
            activeOpacity={0.85}
          >
            <Text
              className={`text-[#94a3b8] font-semibold text-[16px] ${
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
            <View className="px-4 gap-5">
              {/* Greeting - larger */}
              <View>
                <Text className="text-white font-bold text-4xl tracking-tight">
                  {greeting}, User
                </Text>
                <Text className="text-[#94a3b8] font-normal text-[16px] mt-1.5">
                  {today}
                </Text>
              </View>

              {/* Revenue Card - larger */}
              <LinearGradient
                colors={["#131a27", "#0b1017"]}
                className="rounded-[26px] p-5 border border-[#1f293d]"
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-[#94a3b8] font-medium text-[15px] uppercase tracking-wider">
                      Today’s Revenue
                    </Text>
                    <Currency value={todayRevenue} size={44} />
                  </View>
                  <View className="w-14 h-14 rounded-2xl items-center justify-center bg-[rgba(0,212,170,0.12)]">
                    <Ionicons
                      name="cash-outline"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                {/* Chart */}
                <View className="mt-6 flex-row items-end justify-between gap-4">
                  <View className="flex-1 flex-row items-end justify-between">
                    {chartDaysData.map((item, index) => {
                      const max = Math.max(
                        ...chartDaysData.map((entry) => entry.amount),
                        100,
                      );
                      const height = Math.max(14, (item.amount / max) * 100);
                      const isToday = item.day === todayDayLabel;
                      return (
                        <View
                          key={`${item.day}-${index}`}
                          className="items-center gap-2.5"
                        >
                          <View
                            style={{ height }}
                            className={`w-7 rounded-lg ${
                              isToday
                                ? "bg-[#00d4aa]"
                                : "bg-[rgba(255,255,255,0.06)]"
                            }`}
                          />
                          <Text
                            className={`text-[#64748b] font-medium text-[13px] ${
                              isToday ? "text-[#00d4aa]" : ""
                            }`}
                          >
                            {item.day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <View className="min-w-[100px] items-end gap-2">
                    <Text className="text-[#94a3b8] font-medium text-[14px] uppercase tracking-wider">
                      This week
                    </Text>
                    <Currency value={weekRevenue} size={22} />
                  </View>
                </View>
              </LinearGradient>

              {/* Due payments alert - larger */}
              {duePayments.length > 0 ? (
                <TouchableOpacity
                  className="flex-row items-center gap-4 p-4 rounded-[22px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.18)]"
                  onPress={() => setMode("dues")}
                  activeOpacity={0.86}
                >
                  <View className="w-12 h-12 rounded-2xl bg-[rgba(239,68,68,0.12)] items-center justify-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color={Colors.danger}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#ef4444] font-semibold text-[16px]">
                      {duePayments.length} due payments need attention
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-[14px] mt-1">
                      Open the Payment Due tab to inspect and record
                      collections.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              ) : null}

              {/* Monthly Summary - larger */}
              <View className="rounded-[22px] bg-[#131a27] border border-[#1f293d] p-5 gap-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#94a3b8] font-medium text-[15px] uppercase tracking-wider">
                    Monthly Summary
                  </Text>
                  <StatusBadge label="This Month" tone="blue" />
                </View>
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-white font-mono-bold text-3xl">
                      Rs. {monthlyRevenue.toLocaleString()}
                    </Text>
                  </View>
                  <Ionicons
                    name="stats-chart"
                    size={28}
                    color={Colors.primary}
                  />
                </View>
              </View>

              <Text className="text-white font-semibold text-xl mt-1">
                Today’s Invoices
              </Text>
            </View>
          }
          renderItem={({ item }: { item: InvoiceDetailDto }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openInvoiceDetail(item)}
              className="mx-4 flex-row rounded-[22px] bg-[#131a27] border border-[#1f293d] overflow-hidden"
            >
              <View className="w-2 bg-[#3b82f6]" />
              <View className="flex-1 p-4 gap-3">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-[17px]">
                      {item.customer?.name || "Walk-in Customer"}
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-[15px] mt-1">
                      {item.vehicle?.plateNumber} • {item.vehicle?.make}{" "}
                      {item.vehicle?.model}
                    </Text>
                  </View>
                  <StatusBadge
                    label={item.paymentStatus}
                    tone={statusToneMap[item.paymentStatus] || "blue"}
                  />
                </View>
                <Text className="text-white font-normal text-[15px]">
                  Invoice #{item.invoiceNumber}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#64748b] font-mono text-[14px]">
                    {item.id.slice(0, 8)}
                  </Text>
                  <Text className="text-white font-mono-bold text-2xl">
                    Rs. {item.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="px-4 py-10 items-center">
                <Text className="text-[#64748b] text-[15px]">
                  No invoices recorded today yet.
                </Text>
              </View>
            ) : null
          }
          // ListFooterComponent={
          //   <View className="px-4 mt-3 gap-4">
          //     <Text className="text-white font-semibold text-xl">
          //       Quick Actions
          //     </Text>
          //     <View className="flex-row flex-wrap gap-3.5">
          //       {[
          //         ["New Job Order", "add-circle-outline"],
          //         ["Create Invoice", "receipt-outline"],
          //         ["Check Stock", "cube-outline"],
          //         ["Add Customer", "person-add-outline"],
          //       ].map(([label, icon]) => (
          //         <Pressable
          //           key={label}
          //           className="w-[48%] min-h-[100px] rounded-[22px] p-4 bg-[#131a27] border border-[#1f293d] gap-3"
          //         >
          //           <Ionicons
          //             name={icon as any}
          //             size={26}
          //             color={Colors.primary}
          //           />
          //           <Text className="text-white font-semibold text-[15px]">
          //             {label}
          //           </Text>
          //         </Pressable>
          //       ))}
          //     </View>
          //   </View>
          // }
          contentContainerStyle={{ paddingBottom: 28 }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // ==================== DUES TAB ====================
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
            paddingBottom: 28,
            gap: 14,
          }}
          ListHeaderComponent={
            <View className="pb-2">
              <LinearGradient
                colors={["rgba(239,68,68,0.2)", "rgba(80,16,18,0.65)"]}
                className="rounded-[26px] p-5 border border-[rgba(239,68,68,0.18)] gap-2.5"
              >
                <Text className="text-[#94a3b8] font-medium text-[15px] uppercase tracking-wider">
                  Outstanding Balance
                </Text>
                <Currency value={duePaymentsRevenue} size={42} />
                <View className="flex-row gap-4">
                  <Text className="text-[#94a3b8] font-medium text-[15px]">
                    {duePayments.length} total pending invoices
                  </Text>
                </View>
              </LinearGradient>
            </View>
          }
          renderItem={({ item }: { item: InvoiceDetailDto }) => {
            const balanceDue = item.total - (item.amountPaid || 0);
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openInvoiceDetail(item)}
                className="rounded-[22px] bg-[#131a27] border border-[#1f293d] p-4 gap-4"
              >
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-[17px]">
                      {item.customer?.name || "Customer"}
                    </Text>
                    <Text className="text-[#94a3b8] font-normal text-[15px] mt-1">
                      {item.vehicle?.plateNumber} • {item.vehicle?.make}{" "}
                      {item.vehicle?.model}
                    </Text>
                  </View>
                  <StatusBadge label={item.paymentStatus} tone="orange" />
                </View>

                <View className="flex-row flex-wrap gap-2.5">
                  {item.items?.map((i) => (
                    <View
                      key={i.id}
                      className="px-3 py-2 rounded-full bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.16)]"
                    >
                      <Text className="text-[#00d4aa] font-medium text-[13px]">
                        {i.nameSnapshot} (x{i.quantity})
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-end justify-between gap-3">
                  <View>
                    <Text className="text-white font-mono-bold text-2xl">
                      Rs. {balanceDue.toFixed(2)}
                    </Text>
                    <Text className="text-[#64748b] font-mono text-[14px] mt-1">
                      Inv: {item.invoiceNumber}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openInvoiceDetail(item)}
                    className="min-h-[48px] px-5 rounded-2xl border border-[#1f293d] items-center justify-center bg-[rgba(255,255,255,0.02)]"
                  >
                    <Text className="text-white font-semibold text-[15px]">
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <InvoiceDetailSheet
        visible={detailVisible}
        invoice={selectedInvoice}
        onClose={() => setDetailVisible(false)}
        onPaymentRecorded={() => loadOverview(true)}
      />
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
