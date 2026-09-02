import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CustomerDetailDto } from "../api/pos.api";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/typography";

interface CustomerDetailsModalProps {
  visible: boolean;
  customer: CustomerDetailDto | null;
  onClose: () => void;
  onCall: (phone: string) => void;
}

export function CustomerDetailsModal({
  visible,
  customer,
  onClose,
  onCall,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-[#121214] border-t border-[#27272a] rounded-t-[30px] max-h-[85%] flex-1">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-[#27272a]">
            <View className="flex-1 pr-3">
              <Text
                className="text-white text-lg"
                style={{ fontFamily: Fonts.semibold }}
              >
                {customer.name}
              </Text>
              <Text
                className="text-zinc-400 text-xs mt-0.5"
                style={{ fontFamily: Fonts.body }}
              >
                {customer.phone} {customer.email ? `• ${customer.email}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Modal Content Scrollable Area */}
          <ScrollView
            contentContainerClassName="p-5 pb-10 gap-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Customer Contact & Notes Info Card */}
            <View className="bg-[#18181b] border border-[#27272a] rounded-[20px] p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text
                    className="text-zinc-400 text-xs"
                    style={{ fontFamily: Fonts.body }}
                  >
                    Address
                  </Text>
                  <Text
                    className="text-white text-sm mt-0.5"
                    style={{ fontFamily: Fonts.medium }}
                  >
                    {customer.address || "No address provided"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary }}
                  className="px-4 py-2 rounded-xl"
                  onPress={() => onCall(customer.phone)}
                >
                  <Text
                    className="text-black text-xs"
                    style={{ fontFamily: Fonts.bold }}
                  >
                    Call Customer
                  </Text>
                </TouchableOpacity>
              </View>

              {customer.notes ? (
                <View className="border-t border-[#27272a] pt-3 mt-1">
                  <Text
                    className="text-zinc-400 text-xs"
                    style={{ fontFamily: Fonts.body }}
                  >
                    Notes
                  </Text>
                  <Text
                    className="text-zinc-200 text-xs mt-0.5"
                    style={{ fontFamily: Fonts.body }}
                  >
                    {customer.notes}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Vehicles & Invoices Section */}
            <View className="gap-4">
              <Text
                className="text-white text-base"
                style={{ fontFamily: Fonts.semibold }}
              >
                Vehicles & Invoices ({customer.vehicles.length})
              </Text>

              {customer.vehicles.length === 0 ? (
                <View className="py-8 items-center">
                  <Text
                    className="text-zinc-500 text-xs"
                    style={{ fontFamily: Fonts.body }}
                  >
                    No vehicles registered for this customer.
                  </Text>
                </View>
              ) : (
                customer.vehicles.map((vehicle) => (
                  <View
                    key={vehicle.id}
                    className="bg-[#18181b] border border-[#27272a] rounded-[22px] p-4 gap-3.5"
                  >
                    {/* Vehicle Header */}
                    <View className="flex-row justify-between items-center border-b border-[#27272a] pb-3">
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-lg bg-zinc-800 items-center justify-center">
                          <Ionicons
                            name="car-outline"
                            size={16}
                            color={Colors.primary}
                          />
                        </View>
                        <View>
                          <Text
                            className="text-white text-sm tracking-wide uppercase"
                            style={{ fontFamily: Fonts.monoBold }}
                          >
                            {vehicle.plateNumber}
                          </Text>
                          <Text
                            className="text-zinc-400 text-[11px]"
                            style={{ fontFamily: Fonts.body }}
                          >
                            {[vehicle.make, vehicle.model, vehicle.year]
                              .filter(Boolean)
                              .join(" ") || "Vehicle Profile"}
                          </Text>
                        </View>
                      </View>
                      {vehicle.odometerReading ? (
                        <Text
                          className="text-zinc-400 text-xs"
                          style={{ fontFamily: Fonts.monoMedium }}
                        >
                          {vehicle.odometerReading.toLocaleString()} km
                        </Text>
                      ) : null}
                    </View>

                    {/* Invoices List for this Vehicle */}
                    {vehicle.invoices.length === 0 ? (
                      <Text
                        className="text-zinc-500 text-xs italic py-1"
                        style={{ fontFamily: Fonts.body }}
                      >
                        No invoices found for this vehicle.
                      </Text>
                    ) : (
                      <View className="gap-3">
                        {vehicle.invoices.map((invoice) => (
                          <View
                            key={invoice.id}
                            className="bg-[#121214] border border-[#27272a] rounded-xl p-3.5 gap-3"
                          >
                            {/* Invoice Meta Row */}
                            <View className="flex-row justify-between items-center">
                              <View>
                                <Text
                                  className="text-white text-xs"
                                  style={{ fontFamily: Fonts.monoBold }}
                                >
                                  {invoice.invoiceNumber}
                                </Text>
                                {/* Updated Date Layout to display Visit Date */}
                                <Text
                                  className="text-zinc-500 text-[10px] mt-0.5"
                                  style={{ fontFamily: Fonts.body }}
                                >
                                  Visit Date:{" "}
                                  {new Date(
                                    invoice.createdAt,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </Text>
                              </View>

                              {/* Payment Status Badge */}
                              <View
                                className={`px-2.5 py-1 rounded-full ${
                                  invoice.paymentStatus === "Paid"
                                    ? "bg-emerald-500/20"
                                    : "bg-amber-500/20"
                                }`}
                              >
                                <Text
                                  className={`text-[11px] font-medium ${
                                    invoice.paymentStatus === "Paid"
                                      ? "text-emerald-400"
                                      : "text-amber-400"
                                  }`}
                                  style={{ fontFamily: Fonts.medium }}
                                >
                                  {invoice.paymentStatus}
                                </Text>
                              </View>
                            </View>

                            <View className="border-t border-b border-[#27272a] py-2.5 gap-2">
                              {invoice.items.map((item) => (
                                <View
                                  key={item.id}
                                  className="flex-row justify-between items-center"
                                >
                                  <View className="flex-1 pr-2">
                                    <Text
                                      className="text-white text-[13px]"
                                      style={{ fontFamily: Fonts.medium }}
                                    >
                                      {item.itemName}
                                    </Text>
                                    <Text
                                      className="text-zinc-400 text-[11px] mt-0.5"
                                      style={{ fontFamily: Fonts.body }}
                                    >
                                      Qty: {item.quantity} × ${item.unitPrice}
                                    </Text>
                                  </View>
                                  <Text
                                    className="text-white text-[13px]"
                                    style={{ fontFamily: Fonts.monoBold }}
                                  >
                                    ${item.totalPrice}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Invoice Financial Summary Footer */}
                            <View className="flex-row justify-between items-center pt-1">
                              <Text
                                className="text-zinc-400 text-xs"
                                style={{ fontFamily: Fonts.body }}
                              >
                                Total Amount
                              </Text>
                              <Text
                                className="text-white text-sm"
                                style={{ fontFamily: Fonts.monoBold }}
                              >
                                ${invoice.total.toLocaleString()}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
