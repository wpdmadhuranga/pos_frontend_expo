import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { CustomerDetailDto, CustomerInvoiceSummaryDto } from "../api/pos.api";

import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

interface CustomerDetailsModalProps {
  visible: boolean;
  customer: CustomerDetailDto | null;
  onClose: () => void;
  onCall: (phone: string) => void;

  onViewMoreInvoices?: (
    customer: CustomerDetailDto,
    vehicleId?: string,
  ) => void;
}

function InvoiceCard({ invoice }: { invoice: CustomerInvoiceSummaryDto }) {
  const isPaid = invoice.paymentStatus === "Paid";

  return (
    <View className="bg-[#121214] border border-[#27272a] rounded-xl p-4 gap-3.5">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-2">
          <Text
            className="text-white text-[15px]"
            style={{
              fontFamily: Fonts.monoBold,
            }}
          >
            {invoice.invoiceNumber}
          </Text>

          <Text
            className="text-zinc-500 text-[13px] mt-1"
            style={{
              fontFamily: Fonts.body,
            }}
          >
            Visit Date:{" "}
            {new Date(invoice.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        <View
          className={`px-3 py-1.5 rounded-full ${
            isPaid ? "bg-emerald-500/20" : "bg-amber-500/20"
          }`}
        >
          <Text
            className={`text-[13px] font-medium ${
              isPaid ? "text-emerald-400" : "text-amber-400"
            }`}
            style={{
              fontFamily: Fonts.medium,
            }}
          >
            {invoice.paymentStatus}
          </Text>
        </View>
      </View>

      <View className="border-t border-b border-[#27272a] py-3 gap-2.5">
        {invoice.items.map((item) => (
          <View key={item.id} className="flex-row justify-between items-center">
            <View className="flex-1 pr-2">
              <Text
                className="text-white text-[15px]"
                style={{
                  fontFamily: Fonts.medium,
                }}
              >
                {item.itemName}
              </Text>

              <Text
                className="text-zinc-400 text-[13px] mt-1"
                style={{
                  fontFamily: Fonts.body,
                }}
              >
                Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}
              </Text>
            </View>

            <Text
              className="text-white text-[15px]"
              style={{
                fontFamily: Fonts.monoBold,
              }}
            >
              ${item.totalPrice.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {invoice.notes ? (
        <View>
          <Text
            className="text-zinc-500 text-[13px]"
            style={{
              fontFamily: Fonts.body,
            }}
          >
            Notes
          </Text>

          <Text
            className="text-zinc-300 text-[14px] mt-1"
            style={{
              fontFamily: Fonts.body,
            }}
          >
            {invoice.notes}
          </Text>
        </View>
      ) : null}

      <View className="flex-row justify-between items-center pt-1">
        <View>
          <Text
            className="text-zinc-400 text-[14px]"
            style={{
              fontFamily: Fonts.body,
            }}
          >
            Total Amount
          </Text>

          <Text
            className="text-zinc-500 text-[13px] mt-1"
            style={{
              fontFamily: Fonts.body,
            }}
          >
            Paid: ${invoice.amountPaid.toLocaleString()}
          </Text>
        </View>

        <Text
          className="text-white text-[18px]"
          style={{
            fontFamily: Fonts.monoBold,
          }}
        >
          ${invoice.total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function ViewMoreButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="min-h-[46px] rounded-xl border border-[#27272a] bg-[#121214] items-center justify-center"
    >
      <View className="flex-row items-center gap-2">
        <Text
          className="text-white text-[14px]"
          style={{
            fontFamily: Fonts.semibold,
          }}
        >
          View More
        </Text>

        <Ionicons name="chevron-forward" size={17} color="#a1a1aa" />
      </View>
    </TouchableOpacity>
  );
}

export function CustomerDetailsModal({
  visible,
  customer,
  onClose,
  onCall,
  onViewMoreInvoices,
}: CustomerDetailsModalProps) {
  if (!customer) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-[#121214] border-t border-[#27272a] rounded-t-[30px] max-h-[85%] flex-1">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-[#27272a]">
            <View className="flex-1 pr-3">
              <Text
                className="text-white text-[22px]"
                style={{
                  fontFamily: Fonts.semibold,
                }}
              >
                {customer.name}
              </Text>

              <Text
                className="text-zinc-400 text-[14px] mt-1"
                style={{
                  fontFamily: Fonts.body,
                }}
              >
                {customer.phone}
                {customer.email ? ` • ${customer.email}` : ""}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] items-center justify-center"
            >
              <Ionicons name="close" size={21} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerClassName="p-5 pb-10 gap-6"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-[#18181b] border border-[#27272a] rounded-[20px] p-4 gap-3.5">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-zinc-400 text-[14px]"
                    style={{
                      fontFamily: Fonts.body,
                    }}
                  >
                    Address
                  </Text>

                  <Text
                    className="text-white text-[16px] mt-1"
                    style={{
                      fontFamily: Fonts.medium,
                    }}
                  >
                    {customer.address || "No address provided"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                  }}
                  className="px-4 py-2.5 rounded-xl"
                  onPress={() => onCall(customer.phone)}
                >
                  <Text
                    className="text-black text-[14px]"
                    style={{
                      fontFamily: Fonts.bold,
                    }}
                  >
                    Call Customer
                  </Text>
                </TouchableOpacity>
              </View>

              {customer.notes ? (
                <View className="border-t border-[#27272a] pt-3.5 mt-1">
                  <Text
                    className="text-zinc-400 text-[14px]"
                    style={{
                      fontFamily: Fonts.body,
                    }}
                  >
                    Notes
                  </Text>

                  <Text
                    className="text-zinc-200 text-[15px] mt-1"
                    style={{
                      fontFamily: Fonts.body,
                    }}
                  >
                    {customer.notes}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-4">
              <Text
                className="text-white text-[19px]"
                style={{
                  fontFamily: Fonts.semibold,
                }}
              >
                Vehicles & Invoices ({customer.vehicles.length})
              </Text>

              {customer.vehicles.length === 0 ? (
                <View className="py-8 items-center">
                  <Text
                    className="text-zinc-500 text-[14px]"
                    style={{
                      fontFamily: Fonts.body,
                    }}
                  >
                    No vehicles registered for this customer.
                  </Text>
                </View>
              ) : (
                customer.vehicles.map((vehicle) => {
                  const hasMoreInvoices =
                    vehicle.totalInvoiceCount > vehicle.invoices.length;

                  return (
                    <View
                      key={vehicle.id}
                      className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 gap-3.5"
                    >
                      <View className="flex-row justify-between items-center border-b border-[#27272a] pb-3.5">
                        <View className="flex-row items-center gap-2.5">
                          <View className="w-9 h-9 rounded-lg bg-zinc-800 items-center justify-center">
                            <Ionicons
                              name="car-outline"
                              size={19}
                              color={Colors.primary}
                            />
                          </View>

                          <View>
                            <Text
                              className="text-white text-[16px] tracking-wide uppercase"
                              style={{
                                fontFamily: Fonts.monoBold,
                              }}
                            >
                              {vehicle.plateNumber}
                            </Text>

                            <Text
                              className="text-zinc-400 text-[13px]"
                              style={{
                                fontFamily: Fonts.body,
                              }}
                            >
                              {[vehicle.make, vehicle.model, vehicle.year]
                                .filter(Boolean)
                                .join(" ") || "Vehicle Profile"}
                            </Text>
                          </View>
                        </View>

                        {vehicle.odometerReading ? (
                          <Text
                            className="text-zinc-400 text-[14px]"
                            style={{
                              fontFamily: Fonts.monoMedium,
                            }}
                          >
                            {vehicle.odometerReading.toLocaleString()} km
                          </Text>
                        ) : null}
                      </View>

                      {vehicle.invoices.length === 0 ? (
                        <Text
                          className="text-zinc-500 text-[14px] italic py-1"
                          style={{
                            fontFamily: Fonts.body,
                          }}
                        >
                          No invoices found for this vehicle.
                        </Text>
                      ) : (
                        <View className="gap-3">
                          {vehicle.invoices.map((invoice) => (
                            <InvoiceCard key={invoice.id} invoice={invoice} />
                          ))}

                          {hasMoreInvoices ? (
                            <ViewMoreButton
                              onPress={() =>
                                onViewMoreInvoices?.(customer, vehicle.id)
                              }
                            />
                          ) : null}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            {customer.noVehicleInvoiceCount > 0 ? (
              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text
                      className="text-white text-[19px]"
                      style={{
                        fontFamily: Fonts.semibold,
                      }}
                    >
                      Other Invoices
                    </Text>

                    <Text
                      className="text-zinc-500 text-[13px] mt-1"
                      style={{
                        fontFamily: Fonts.body,
                      }}
                    >
                      Invoices without a vehicle
                    </Text>
                  </View>

                  <Text
                    className="text-zinc-400 text-[14px]"
                    style={{
                      fontFamily: Fonts.monoMedium,
                    }}
                  >
                    {customer.noVehicleInvoiceCount}
                  </Text>
                </View>

                <View className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 gap-3">
                  {customer.invoicesWithoutVehicle.map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}

                  {customer.noVehicleInvoiceCount >
                  customer.invoicesWithoutVehicle.length ? (
                    <ViewMoreButton
                      onPress={() => onViewMoreInvoices?.(customer, undefined)}
                    />
                  ) : null}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
