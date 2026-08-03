import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "../components/AppHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";
import {
  mockJobs,
  mockPaymentDue,
  mockStats,
  mockUser,
  revenueData,
} from "../data/mock";

type TabMode = "overview" | "dues";

const statusToneMap: Record<string, "blue" | "orange" | "green" | "gray"> = {
  "in-progress": "blue",
  "waiting-parts": "orange",
  completed: "green",
  cancelled: "gray",
};

function Currency({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <Text style={[styles.mono, { fontSize: size }]}>
      ${value.toLocaleString()}
    </Text>
  );
}

export function DashboardScreen() {
  const [mode, setMode] = useState<TabMode>("overview");

  const activeJobs = useMemo(
    () =>
      mockJobs.filter(
        (job) => job.status === "in-progress" || job.status === "waiting-parts",
      ),
    [],
  );
  const overdueItems = useMemo(
    () => mockPaymentDue.filter((item) => item.daysOverdue > 0),
    [],
  );

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

  return (
    <View style={styles.screen}>
      <AppHeader title="Dashboard" />
      <View style={styles.segment}>
        {(
          [
            { key: "overview" as const, label: "Overview" },
            {
              key: "dues" as const,
              label: `Payment Due (${mockPaymentDue.length})`,
            },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.segmentButton,
              mode === item.key && styles.segmentButtonActive,
            ]}
            onPress={() => setMode(item.key)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.segmentText,
                mode === item.key && styles.segmentTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "overview" ? (
        <FlatList
          data={activeJobs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.body}>
              <View>
                <Text style={styles.greeting}>
                  {greeting}, {mockUser.name.split(" ")[0]}
                </Text>
                <Text style={styles.date}>{today}</Text>
              </View>

              <LinearGradient
                colors={["#131a27", "#0b1017"]}
                style={styles.revenueCard}
              >
                <View style={styles.revenueTop}>
                  <View>
                    <Text style={styles.sectionKicker}>Today’s Revenue</Text>
                    <Currency value={mockStats.todayRevenue} size={36} />
                    <View style={styles.deltaRow}>
                      <Ionicons
                        name="arrow-up"
                        size={14}
                        color={Colors.success}
                      />
                      <Text style={styles.deltaText}>+12.4% vs yesterday</Text>
                    </View>
                  </View>
                  <View style={styles.revenueBadge}>
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.chartRow}>
                  <View style={styles.chart}>
                    {revenueData.map((item, index) => {
                      const max = Math.max(
                        ...revenueData.map((entry) => entry.amount),
                      );
                      const height = Math.max(12, (item.amount / max) * 92);
                      const isToday = index === revenueData.length - 1;
                      return (
                        <View key={item.day} style={styles.barWrap}>
                          <View
                            style={[
                              styles.bar,
                              {
                                height,
                                backgroundColor: isToday
                                  ? Colors.primary
                                  : "rgba(255,255,255,0.06)",
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.chartLabel,
                              isToday && { color: Colors.primary },
                            ]}
                          >
                            {item.day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.weekSide}>
                    <Text style={styles.sectionKicker}>This week</Text>
                    <Currency value={mockStats.weekRevenue} size={18} />
                  </View>
                </View>
              </LinearGradient>

              {overdueItems.length > 0 ? (
                <TouchableOpacity
                  style={styles.alertBanner}
                  onPress={() => setMode("dues")}
                  activeOpacity={0.86}
                >
                  <View style={styles.alertIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={Colors.danger}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>
                      {overdueItems.length} overdue payments need attention
                    </Text>
                    <Text style={styles.alertText}>
                      Open the Payment Due tab to contact customers and mark
                      invoices paid.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              ) : null}

              <Text style={styles.sectionTitle}>Active Jobs</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View
                style={[
                  styles.jobBar,
                  {
                    backgroundColor:
                      item.status === "waiting-parts"
                        ? Colors.warning
                        : Colors.info,
                  },
                ]}
              />
              <View style={styles.jobMain}>
                <View style={styles.jobTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobCustomer}>{item.customer}</Text>
                    <Text style={styles.jobVehicle}>{item.vehicle}</Text>
                  </View>
                  <StatusBadge
                    label={item.status.replace("-", " ")}
                    tone={statusToneMap[item.status]}
                  />
                </View>
                <Text style={styles.jobService}>{item.service}</Text>
                <View style={styles.jobBottomRow}>
                  <Text style={styles.monoDim}>{item.id}</Text>
                  <Text style={styles.monoPrice}>${item.total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footerBlock}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickGrid}>
                {[
                  ["New Job Order", "add-circle-outline"],
                  ["Create Invoice", "receipt-outline"],
                  ["Check Stock", "cube-outline"],
                  ["Add Customer", "person-add-outline"],
                ].map(([label, icon]) => (
                  <Pressable key={label} style={styles.quickCard}>
                    <Ionicons
                      name={icon as any}
                      size={22}
                      color={Colors.primary}
                    />
                    <Text style={styles.quickLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={mockPaymentDue}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.duesHeader}>
              <LinearGradient
                colors={["rgba(239,68,68,0.2)", "rgba(80,16,18,0.65)"]}
                style={styles.duesSummary}
              >
                <Text style={styles.sectionKicker}>Outstanding Balance</Text>
                <Currency value={mockStats.totalDue} size={34} />
                <View style={styles.duesMetaRow}>
                  <Text style={styles.duesMeta}>
                    {mockStats.overdueCount} overdue
                  </Text>
                  <Text style={styles.duesMeta}>
                    {
                      mockPaymentDue.filter((item) => item.daysOverdue === 0)
                        .length
                    }{" "}
                    due today
                  </Text>
                </View>
              </LinearGradient>
            </View>
          }
          renderItem={({ item }) => {
            const urgencyTone = item.daysOverdue === 0 ? "amber" : "red";
            const urgencyLabel =
              item.daysOverdue === 0
                ? "Due Today"
                : `${item.daysOverdue}d overdue`;
            return (
              <View style={styles.dueCard}>
                <View style={styles.jobTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobCustomer}>{item.customer}</Text>
                    <Text style={styles.jobVehicle}>{item.vehicle}</Text>
                  </View>
                  <StatusBadge label={urgencyLabel} tone={urgencyTone as any} />
                </View>

                <View style={styles.chipRow}>
                  {item.services.map((service) => (
                    <View key={service} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{service}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.dueFooter}>
                  <View>
                    <Text style={styles.monoPrice}>
                      ${item.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.monoDim}>{item.id}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.secondaryAction}>
                      <Text style={styles.secondaryActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryAction}>
                      <Text style={styles.primaryActionText}>Mark Paid</Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segment: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  segmentText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  segmentTextActive: {
    color: Colors.black,
  },
  body: {
    paddingHorizontal: 16,
    gap: 16,
  },
  greeting: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  date: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    marginTop: 4,
  },
  revenueCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  revenueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionKicker: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  mono: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    letterSpacing: -0.6,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  deltaText: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  revenueBadge: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,212,170,0.12)",
  },
  chartRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barWrap: {
    alignItems: "center",
    gap: 8,
  },
  bar: {
    width: 24,
    borderRadius: 8,
  },
  chartLabel: {
    color: Colors.textDim,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  weekSide: {
    minWidth: 88,
    alignItems: "flex-end",
    gap: 6,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.18)",
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    color: Colors.danger,
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  alertText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 16,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  jobCard: {
    flexDirection: "row",
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  jobBar: {
    width: 6,
  },
  jobMain: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  jobTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  jobCustomer: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 15,
  },
  jobVehicle: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  jobService: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  jobBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monoDim: {
    color: Colors.textDim,
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  monoPrice: {
    color: Colors.textPrimary,
    fontFamily: Fonts.monoBold,
    fontSize: 18,
  },
  footerBlock: {
    marginTop: 8,
    gap: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "48%",
    minHeight: 88,
    borderRadius: 20,
    padding: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  quickLabel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 13,
  },
  duesHeader: {
    paddingBottom: 4,
  },
  duesSummary: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.18)",
    gap: 8,
  },
  duesMetaRow: {
    flexDirection: "row",
    gap: 14,
  },
  duesMeta: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  dueCard: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,212,170,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.16)",
  },
  serviceChipText: {
    color: Colors.primary,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  dueFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryAction: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  secondaryActionText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
  },
  primaryAction: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
  },
});
