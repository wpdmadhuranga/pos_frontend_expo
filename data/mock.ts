// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUser = {
  name: "Alex Rivera",
  role: "Manager",
  initials: "AR",
  shop: "SwiftServe Auto",
};

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export const mockStats = {
  todayRevenue: 4280,
  weekRevenue: 18650,
  totalDue: 660,
  overdueCount: 3,
};

export const revenueData = [
  { day: "Mon", amount: 3200 },
  { day: "Tue", amount: 2800 },
  { day: "Wed", amount: 4100 },
  { day: "Thu", amount: 3600 },
  { day: "Fri", amount: 5200 },
  { day: "Sat", amount: 4800 },
  { day: "Sun", amount: 4280 },
];

// ─── Payment dues ─────────────────────────────────────────────────────────────
export interface PaymentDue {
  id: string;
  customer: string;
  vehicle: string;
  amount: number;
  daysOverdue: number;
  dueDate: string;
  phone: string;
  services: string[];
}

export const mockPaymentDue: PaymentDue[] = [
  {
    id: "INV-2024-1835",
    customer: "Tyler Brooks",
    vehicle: "2018 Ford F-150",
    amount: 165,
    daysOverdue: 0,
    dueDate: "Today",
    phone: "+1 555-0394",
    services: ["Battery Replace"],
  },
  {
    id: "INV-2024-1830",
    customer: "Sarah Mitchell",
    vehicle: "2017 Chevy Malibu",
    amount: 95,
    daysOverdue: 3,
    dueDate: "Jul 22",
    phone: "+1 555-0671",
    services: ["Diagnostic Scan", "Battery Check"],
  },
  {
    id: "INV-2024-1825",
    customer: "Omar Al-Hassan",
    vehicle: "2023 Hyundai Tucson",
    amount: 280,
    daysOverdue: 7,
    dueDate: "Jul 18",
    phone: "+1 555-0782",
    services: ["Brake Pad Replace"],
  },
  {
    id: "INV-2024-1820",
    customer: "Marcus Johnson",
    vehicle: "2019 Honda Civic",
    amount: 120,
    daysOverdue: 14,
    dueDate: "Jul 11",
    phone: "+1 555-0142",
    services: ["AC Recharge"],
  },
];

// ─── Job orders ───────────────────────────────────────────────────────────────
export type JobStatus =
  | "in-progress"
  | "waiting-parts"
  | "completed"
  | "cancelled";

export interface Job {
  id: string;
  customer: string;
  vehicle: string;
  plate: string;
  service: string;
  status: JobStatus;
  tech: string;
  eta: string;
  total: number;
  created: string;
}

export const mockJobs: Job[] = [
  {
    id: "JO-2841",
    customer: "Marcus Johnson",
    vehicle: "2019 Honda Civic",
    plate: "XYZ-4821",
    service: "Oil Change + Filter",
    status: "in-progress",
    tech: "Sam K.",
    eta: "30 min",
    total: 85,
    created: "09:14 AM",
  },
  {
    id: "JO-2840",
    customer: "Priya Sharma",
    vehicle: "2021 Toyota Camry",
    plate: "ABC-7743",
    service: "Brake Inspection",
    status: "waiting-parts",
    tech: "Diego M.",
    eta: "2 hrs",
    total: 220,
    created: "08:52 AM",
  },
  {
    id: "JO-2838",
    customer: "Linda Castro",
    vehicle: "2020 Nissan Altima",
    plate: "MNP-9931",
    service: "AC Service + Recharge",
    status: "completed",
    tech: "Sam K.",
    eta: "—",
    total: 185,
    created: "07:45 AM",
  },
  {
    id: "JO-2837",
    customer: "James Wu",
    vehicle: "2022 BMW 3 Series",
    plate: "QRS-4455",
    service: "Full Service Package",
    status: "completed",
    tech: "Diego M.",
    eta: "—",
    total: 450,
    created: "07:00 AM",
  },
  {
    id: "JO-2836",
    customer: "Sarah Mitchell",
    vehicle: "2017 Chevy Malibu",
    plate: "TUV-7834",
    service: "Diagnostic Scan",
    status: "cancelled",
    tech: "Rachel P.",
    eta: "—",
    total: 75,
    created: "06:45 AM",
  },
  {
    id: "JO-2835",
    customer: "Omar Al-Hassan",
    vehicle: "2023 Hyundai Tucson",
    plate: "VWX-1122",
    service: "Battery Replace",
    status: "waiting-parts",
    tech: "—",
    eta: "—",
    total: 165,
    created: "Yesterday",
  },
];

// ─── POS: Services ────────────────────────────────────────────────────────────
export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: string;
  configurable?: "oil" | "filter";
}

export const mockServices: ServiceItem[] = [
  {
    id: 1,
    name: "Oil Change",
    category: "Maintenance",
    price: 45,
    duration: "30 min",
    configurable: "oil",
  },
  {
    id: 2,
    name: "Oil + Filter",
    category: "Maintenance",
    price: 65,
    duration: "45 min",
    configurable: "oil",
  },
  {
    id: 3,
    name: "Tire Rotation",
    category: "Tires",
    price: 35,
    duration: "30 min",
  },
  {
    id: 4,
    name: "Wheel Balance",
    category: "Tires",
    price: 40,
    duration: "45 min",
  },
  {
    id: 5,
    name: "Brake Pad Replace",
    category: "Brakes",
    price: 180,
    duration: "1.5 hrs",
  },
  {
    id: 6,
    name: "Brake Inspection",
    category: "Brakes",
    price: 25,
    duration: "20 min",
  },
  { id: 7, name: "AC Service", category: "AC", price: 120, duration: "1 hr" },
  { id: 8, name: "AC Recharge", category: "AC", price: 85, duration: "30 min" },
  {
    id: 9,
    name: "Battery Check",
    category: "Electrical",
    price: 15,
    duration: "15 min",
  },
  {
    id: 10,
    name: "Battery Replace",
    category: "Electrical",
    price: 150,
    duration: "30 min",
  },
  {
    id: 11,
    name: "Diagnostic Scan",
    category: "Diagnostic",
    price: 75,
    duration: "1 hr",
  },
  {
    id: 12,
    name: "Full Service Pkg",
    category: "Package",
    price: 450,
    duration: "4 hrs",
  },
  {
    id: 13,
    name: "Coolant Flush",
    category: "Maintenance",
    price: 95,
    duration: "45 min",
  },
  {
    id: 14,
    name: "Transmission Svc",
    category: "Maintenance",
    price: 220,
    duration: "2 hrs",
  },
];

// ─── POS: Oil brands ──────────────────────────────────────────────────────────
export interface OilBrand {
  id: string;
  name: string;
  tier: "premium" | "mid" | "budget";
  pricePerL: number;
}

export const OIL_BRANDS: OilBrand[] = [
  {
    id: "mobil1",
    name: "Mobil 1 Full Synthetic",
    tier: "premium",
    pricePerL: 18,
  },
  {
    id: "castrol-edge",
    name: "Castrol EDGE Synthetic",
    tier: "premium",
    pricePerL: 16,
  },
  { id: "shell-helix", name: "Shell Helix Ultra", tier: "mid", pricePerL: 14 },
  { id: "pennzoil", name: "Pennzoil Platinum", tier: "mid", pricePerL: 13 },
  { id: "valvoline", name: "Valvoline Advanced", tier: "mid", pricePerL: 12 },
  { id: "total", name: "Total Quartz 9000", tier: "mid", pricePerL: 11 },
  {
    id: "castrol-gtx",
    name: "Castrol GTX Conventional",
    tier: "budget",
    pricePerL: 9,
  },
  { id: "havoline", name: "Havoline Motor Oil", tier: "budget", pricePerL: 8 },
  {
    id: "lubricant",
    name: "Lubricant Pro Series",
    tier: "budget",
    pricePerL: 8,
  },
];

export const OIL_VISCOSITIES = [
  "5W-20",
  "5W-30",
  "0W-20",
  "10W-40",
  "15W-40",
  "0W-40",
];
export const OIL_QUANTITIES = [3, 4, 5, 6];

// ─── POS: Oil filter models ───────────────────────────────────────────────────
export interface FilterModel {
  id: string;
  model: string;
  brand: string;
  price: number;
  compatible: string;
}

export const FILTER_MODELS: FilterModel[] = [
  {
    id: "fram-ph16",
    model: "PH16",
    brand: "FRAM",
    price: 8.5,
    compatible: "Honda, Toyota, Nissan",
  },
  {
    id: "fram-ph3614",
    model: "PH3614",
    brand: "FRAM",
    price: 9.0,
    compatible: "GM trucks, Ford",
  },
  {
    id: "bosch-3300",
    model: "3300 Premium",
    brand: "Bosch",
    price: 12.0,
    compatible: "BMW, Mercedes, VW",
  },
  {
    id: "bosch-3323",
    model: "3323 Distance+",
    brand: "Bosch",
    price: 14.5,
    compatible: "European vehicles",
  },
  {
    id: "wix-51515",
    model: "51515",
    brand: "WIX",
    price: 9.75,
    compatible: "Ford, GM, Dodge trucks",
  },
  {
    id: "wix-57356",
    model: "57356",
    brand: "WIX",
    price: 10.5,
    compatible: "Toyota, Lexus, Subaru",
  },
  {
    id: "mann-816",
    model: "HU 816 x",
    brand: "Mann",
    price: 14.0,
    compatible: "BMW, Audi, VW, Porsche",
  },
  {
    id: "mann-712",
    model: "HU 712/8 x",
    brand: "Mann",
    price: 12.5,
    compatible: "Mercedes-Benz",
  },
  {
    id: "purolator-l14459",
    model: "L14459",
    brand: "Purolator",
    price: 7.5,
    compatible: "Domestic vehicles",
  },
  {
    id: "purolator-pl25288",
    model: "PL25288",
    brand: "Purolator",
    price: 9.25,
    compatible: "Asian imports",
  },
  {
    id: "kn-hp1017",
    model: "HP-1017",
    brand: "K&N",
    price: 16.5,
    compatible: "Performance / universal",
  },
  {
    id: "acdelco-pf48",
    model: "PF48E",
    brand: "ACDelco",
    price: 11.0,
    compatible: "GM, Chevy, Cadillac",
  },
  {
    id: "toyota-yzza4",
    model: "04152-YZZA4",
    brand: "Toyota OEM",
    price: 13.5,
    compatible: "Toyota / Lexus OEM",
  },
  {
    id: "honda-oem",
    model: "15400-PLM-A02",
    brand: "Honda OEM",
    price: 12.0,
    compatible: "Honda / Acura OEM",
  },
];

// ─── Parts inventory ──────────────────────────────────────────────────────────
export interface Part {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  configurable?: "oil" | "filter";
}

export const mockParts: Part[] = [
  {
    id: 1,
    name: "Engine Oil (per litre)",
    sku: "EO-MULTI",
    price: 12,
    stock: 48,
    minStock: 20,
    category: "Fluids",
    configurable: "oil",
  },
  {
    id: 2,
    name: "Oil Filter",
    sku: "OF-MULTI",
    price: 10,
    stock: 32,
    minStock: 15,
    category: "Filters",
    configurable: "filter",
  },
  {
    id: 3,
    name: "Air Filter Standard",
    sku: "AF-STD-01",
    price: 18,
    stock: 6,
    minStock: 10,
    category: "Filters",
  },
  {
    id: 4,
    name: "Brake Pads Front",
    sku: "BP-FRT-01",
    price: 65,
    stock: 14,
    minStock: 8,
    category: "Brakes",
  },
  {
    id: 5,
    name: "Brake Pads Rear",
    sku: "BP-RER-01",
    price: 55,
    stock: 3,
    minStock: 8,
    category: "Brakes",
  },
  {
    id: 6,
    name: "AC Refrigerant R134a",
    sku: "AC-R134-01",
    price: 35,
    stock: 2,
    minStock: 5,
    category: "AC",
  },
  {
    id: 7,
    name: "Spark Plugs Set/4",
    sku: "SP-SET4-01",
    price: 42,
    stock: 20,
    minStock: 10,
    category: "Ignition",
  },
  {
    id: 8,
    name: "Transmission Fluid 1L",
    sku: "TF-ATF-1L",
    price: 22,
    stock: 18,
    minStock: 10,
    category: "Fluids",
  },
  {
    id: 9,
    name: "Coolant/Antifreeze 1L",
    sku: "CA-GRN-1L",
    price: 15,
    stock: 25,
    minStock: 12,
    category: "Fluids",
  },
  {
    id: 10,
    name: 'Wiper Blade 24"',
    sku: "WB-24IN-01",
    price: 28,
    stock: 12,
    minStock: 8,
    category: "Exterior",
  },
  {
    id: 11,
    name: "Car Battery 12V 65Ah",
    sku: "CB-12V-65AH",
    price: 120,
    stock: 7,
    minStock: 4,
    category: "Electrical",
  },
  {
    id: 12,
    name: "Cabin Air Filter",
    sku: "CAF-UNV-01",
    price: 25,
    stock: 9,
    minStock: 10,
    category: "Filters",
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicles: string[];
  visits: number;
  lastVisit: string;
  totalSpent: number;
}

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Marcus Johnson",
    phone: "+1 555-0142",
    email: "marcus.j@email.com",
    vehicles: ["2019 Honda Civic (XYZ-4821)"],
    visits: 8,
    lastVisit: "Today",
    totalSpent: 680,
  },
  {
    id: 2,
    name: "Priya Sharma",
    phone: "+1 555-0287",
    email: "priya.s@email.com",
    vehicles: ["2021 Toyota Camry (ABC-7743)"],
    visits: 3,
    lastVisit: "Today",
    totalSpent: 430,
  },
  {
    id: 3,
    name: "Tyler Brooks",
    phone: "+1 555-0394",
    email: "tyler.b@email.com",
    vehicles: ["2018 Ford F-150 (LKJ-2210)", "2020 Toyota RAV4 (DEF-5512)"],
    visits: 12,
    lastVisit: "Today",
    totalSpent: 1840,
  },
  {
    id: 4,
    name: "Linda Castro",
    phone: "+1 555-0451",
    email: "linda.c@email.com",
    vehicles: ["2020 Nissan Altima (MNP-9931)"],
    visits: 5,
    lastVisit: "Today",
    totalSpent: 740,
  },
  {
    id: 5,
    name: "James Wu",
    phone: "+1 555-0563",
    email: "james.w@email.com",
    vehicles: ["2022 BMW 3 Series (QRS-4455)"],
    visits: 6,
    lastVisit: "Today",
    totalSpent: 2150,
  },
  {
    id: 6,
    name: "Sarah Mitchell",
    phone: "+1 555-0671",
    email: "sarah.m@email.com",
    vehicles: ["2017 Chevrolet Malibu (TUV-7834)"],
    visits: 4,
    lastVisit: "3 days ago",
    totalSpent: 520,
  },
  {
    id: 7,
    name: "Omar Al-Hassan",
    phone: "+1 555-0782",
    email: "omar.h@email.com",
    vehicles: ["2023 Hyundai Tucson (VWX-1122)"],
    visits: 2,
    lastVisit: "Yesterday",
    totalSpent: 280,
  },
];

// ─── Service history ──────────────────────────────────────────────────────────
export interface HistoryItem {
  id: string;
  date: string;
  customer: string;
  vehicle: string;
  services: string[];
  parts: string[];
  total: number;
  payMethod: "Card" | "Cash" | "Transfer";
  tech: string;
}

export const mockHistory: HistoryItem[] = [
  {
    id: "INV-2024-1842",
    date: "Today, 11:32 AM",
    customer: "Linda Castro",
    vehicle: "2020 Nissan Altima",
    services: ["AC Service", "AC Recharge"],
    parts: ["AC Refrigerant R134a x2"],
    total: 220,
    payMethod: "Card",
    tech: "Sam K.",
  },
  {
    id: "INV-2024-1841",
    date: "Today, 10:15 AM",
    customer: "James Wu",
    vehicle: "2022 BMW 3 Series",
    services: ["Full Service Package"],
    parts: ["Mobil 1 5W-30 x5L", "Mann HU 816 x"],
    total: 495,
    payMethod: "Card",
    tech: "Diego M.",
  },
  {
    id: "INV-2024-1840",
    date: "Yesterday, 4:45 PM",
    customer: "Sarah Mitchell",
    vehicle: "2017 Chevy Malibu",
    services: ["Brake Pad Replace"],
    parts: ["Brake Pads Front x1", "Brake Pads Rear x1"],
    total: 320,
    payMethod: "Cash",
    tech: "Rachel P.",
  },
  {
    id: "INV-2024-1839",
    date: "Yesterday, 2:20 PM",
    customer: "Tyler Brooks",
    vehicle: "2018 Ford F-150",
    services: ["Diagnostic Scan", "Battery Check"],
    parts: [],
    total: 90,
    payMethod: "Card",
    tech: "Omar H.",
  },
  {
    id: "INV-2024-1838",
    date: "Yesterday, 11:00 AM",
    customer: "Marcus Johnson",
    vehicle: "2019 Honda Civic",
    services: ["Oil Change + Filter"],
    parts: ["Castrol EDGE 5W-30 x4L", "FRAM PH16"],
    total: 130,
    payMethod: "Cash",
    tech: "Sam K.",
  },
  {
    id: "INV-2024-1837",
    date: "Jul 22, 3:30 PM",
    customer: "Priya Sharma",
    vehicle: "2021 Toyota Camry",
    services: ["Wheel Balance", "Tire Rotation"],
    parts: [],
    total: 75,
    payMethod: "Card",
    tech: "Diego M.",
  },
];
