import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CancelInvoiceResponse,
  InvoiceDetailDto,
  PagedResult,
  searchInvoicesApi,
} from "../api/pos.api";
import { AppHeader } from "../components/AppHeader";
import { InvoiceDetailModal } from "../components/InvoiceDetailsModal";
import { InvoiceResultCard } from "../components/InvoiceResultCard";
import {
  InvoiceSearchFilters,
  InvoiceSearchFiltersValue,
} from "../components/InvoiceSearchFilters";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

export function JobsScreen() {
  const [results, setResults] = useState<InvoiceDetailDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceDetailDto | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [lastFilters, setLastFilters] =
    useState<InvoiceSearchFiltersValue | null>(null);

  const performSearch = useCallback(
    async (filters: InvoiceSearchFiltersValue, pageNum = 1) => {
      try {
        setLoading(true);
        setError(null);

        const data: PagedResult<InvoiceDetailDto> = await searchInvoicesApi({
          customerName: filters.customerName || undefined,
          plateNumber: filters.plateNumber || undefined,
          date: filters.useRange ? undefined : filters.date || undefined,
          fromDate: filters.useRange
            ? filters.fromDate || undefined
            : undefined,
          toDate: filters.useRange ? filters.toDate || undefined : undefined,
          page: pageNum,
          pageSize: 10,
        });

        setResults(data.items);
        setTotalCount(data.totalCount);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setHasSearched(true);
        setLastFilters(filters);
      } catch (err: any) {
        setError(err?.message || "Failed to search invoices");
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = (filters: InvoiceSearchFiltersValue) => {
    setPage(1);
    performSearch(filters, 1);
  };

  const handleClear = () => {
    setResults([]);
    setTotalCount(0);
    setPage(1);
    setTotalPages(0);
    setHasSearched(false);
    setError(null);
    setLastFilters(null);
  };

  const goToPage = (newPage: number) => {
    if (!lastFilters || newPage < 1 || newPage > totalPages || loading) return;
    performSearch(lastFilters, newPage);
  };

  const openDetail = (invoice: InvoiceDetailDto) => {
    setSelectedInvoice(invoice);
    setDetailVisible(true);
  };

  const handleDeleted = (
    invoiceId: string,
    response: CancelInvoiceResponse,
  ) => {
    setResults((prev) => prev.filter((inv) => inv.id !== invoiceId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    Alert.alert(
      "Invoice Deleted",
      response?.message || "Invoice deleted successfully.",
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Invoice Search" />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <InvoiceSearchFilters
              loading={loading}
              onSearch={handleSearch}
              onClear={handleClear}
            />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {hasSearched && !loading && (
              <Text style={styles.resultCount}>
                {totalCount === 0
                  ? "No invoices found"
                  : `Found ${totalCount} invoice${totalCount !== 1 ? "s" : ""}`}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <InvoiceResultCard invoice={item} onPress={() => openDetail(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Searching invoices...</Text>
            </View>
          ) : hasSearched ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No matching invoices</Text>
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                Enter filters and press Search
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                onPress={() => goToPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                <Text style={styles.pageBtnText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                Page {page} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  page >= totalPages && styles.pageBtnDisabled,
                ]}
                onPress={() => goToPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <InvoiceDetailModal
        visible={detailVisible}
        invoice={selectedInvoice}
        onClose={() => {
          setDetailVisible(false);
          setSelectedInvoice(null);
        }}
        onDeleted={handleDeleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerWrap: {
    gap: 16,
    paddingBottom: 12,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#f87171",
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  resultCount: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  centered: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 17,
  },
  emptyText: {
    color: Colors.textDim,
    fontFamily: Fonts.body,
    fontSize: 17,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 12,
  },
  pageBtn: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
  pageInfo: {
    color: Colors.textMuted,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
});
