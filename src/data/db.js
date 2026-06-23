// ClicksGo – Pharmacy Quick Commerce Data Store

export const CLICKSGO_OTC_PRODUCTS = [
  {
    id: "panadol-tablets",
    name: "Panadol Tablets",
    subtext: "Strip of 10",
    brand: "Panadol",
    category: "Pain Relief",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "Pain Relief"
  },
  {
    id: "disprin-tablets",
    name: "Disprin 300mg Tablets",
    subtext: "Strip of 10",
    brand: "Disprin",
    category: "Pain Relief",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "Pain Relief"
  },
  {
    id: "strepsils-lozenges",
    name: "Strepsils Lozenges",
    subtext: "Honey & Lemon",
    brand: "Strepsils",
    category: "Cough & Cold",
    price: 24.00,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "Cough & Cold"
  },
  {
    id: "vitamin-c-500",
    name: "Vitamin C 500mg",
    subtext: "30 Tablets",
    brand: "Clicks",
    category: "Vitamins",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "Vitamins"
  },
  {
    id: "cetaphil-lotion",
    name: "Cetaphil Moisturising Lotion",
    subtext: "250ml",
    brand: "Cetaphil",
    category: "Skin Care",
    price: 245.00,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "Skin Care"
  },
  {
    id: "first-aid-kit",
    name: "First Aid Kit – Basic",
    subtext: "Compact Kit",
    brand: "Clicks",
    category: "First Aid",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200",
    inStock: true,
    tag: "First Aid"
  }
];

export const CLICKSGO_SCRIPT_PRODUCTS = [
  {
    id: "amoxicillin-500mg",
    name: "Amoxicillin 500mg Capsules",
    subtext: "Qty: 21",
    brand: "Generic",
    category: "Doctor's Script",
    price: 65.00,
    inStock: true,
    isScript: true
  }
];

export const INITIAL_PRODUCTS = [
  ...CLICKSGO_OTC_PRODUCTS,
  ...CLICKSGO_SCRIPT_PRODUCTS
];

export const CLICKSGO_PHARMACY = {
  id: "clicks-park-street",
  name: "Clicks Pharmacy",
  address: "21, Park Street,\nBengaluru, 560001",
  addressShort: "21, Park Street, Bengaluru",
  deliveryTime: "15 min delivery (2 hours)",
  deliveryFee: "Rxx",
  distance: "0.8 km away",
  coordinates: { lat: 12.97, lng: 77.59 }
};

export const INITIAL_STORES = [
  { id: "park-street", name: "Clicks Pharmacy – Park Street", address: "21, Park Street, Bengaluru, 560001", closes: "8pm", distance: "0.8 km" },
  { id: "mg-road", name: "Clicks Pharmacy – MG Road", address: "44, MG Road, Bengaluru, 560001", closes: "9pm", distance: "1.5 km" },
  { id: "koramangala", name: "Clicks Pharmacy – Koramangala", address: "12, 5th Block, Koramangala, Bengaluru", closes: "8pm", distance: "3.2 km" }
];

export const INITIAL_DEPENDENTS = [
  { id: "dep1", name: "A***a N******a", dob: "08/07/1985" },
  { id: "dep2", name: "S***a K***s", dob: "21/04/2021" },
  { id: "dep3", name: "S******a G***a", dob: "13/09/2022" }
];

export const INITIAL_USER = {
  name: "C****a",
  fullName: "C***a",
  avatar: "C",
  email: "adityatest36@gmail.com",
  phone: "+91**********",
  addresses: [
    { id: "home", type: "Home", label: "Home", line1: "21, Park Street,", line2: "Bengaluru, 560001", primary: true },
    { id: "work", type: "Work", label: "Work", line1: "MG Road, Block 2", line2: "Bengaluru, 560001", primary: false }
  ]
};

export const INITIAL_ORDERS = [
  {
    id: "CG12345678",
    date: "22 06 2026",
    store: "Clicks Pharmacy – Park Street",
    type: "ClicksGo",
    status: "Processing",
    estimatedDelivery: "Within 2 hours",
    total: 127.00,
    products: [
      { id: "panadol-tablets", name: "Panadol Tablets", subtext: "Strip of 10", price: 18.50, quantity: 1, inStock: true },
      { id: "disprin-tablets", name: "Disprin 300mg Tablets", subtext: "Strip of 10", price: 18.50, quantity: 2, inStock: true }
    ]
  }
];

export const loadState = () => {
  const user = localStorage.getItem("clicksgo_user");
  const cart = localStorage.getItem("clicksgo_cart");
  const orders = localStorage.getItem("clicksgo_orders");
  const scripts = localStorage.getItem("clicksgo_scripts");
  const notifications = localStorage.getItem("clicksgo_notifications");

  return {
    user: user ? JSON.parse(user) : INITIAL_USER,
    cart: cart ? JSON.parse(cart) : [],
    orders: orders ? JSON.parse(orders) : INITIAL_ORDERS,
    scripts: scripts ? JSON.parse(scripts) : [],
    notifications: notifications ? JSON.parse(notifications) : [
      { id: "n1", text: "Your ClicksGo order is being prepared – CG12345678", unread: true }
    ]
  };
};

export const saveState = (state) => {
  localStorage.setItem("clicksgo_user", JSON.stringify(state.user));
  localStorage.setItem("clicksgo_cart", JSON.stringify(state.cart));
  localStorage.setItem("clicksgo_orders", JSON.stringify(state.orders));
  localStorage.setItem("clicksgo_scripts", JSON.stringify(state.scripts));
  localStorage.setItem("clicksgo_notifications", JSON.stringify(state.notifications));
};
