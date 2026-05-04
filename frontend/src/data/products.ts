export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
};

// Real product photography sourced from Unsplash (royalty-free).
export const products: Product[] = [
  { id: "p1",  name: "Aurora Wireless Headphones", price: 189, description: "Studio-grade noise-cancelling headphones with 40h battery life and plush memory-foam cushions.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80&auto=format&fit=crop", stock: 12, category: "Audio" },
  { id: "p2",  name: "Nimbus Smart Watch", price: 249, description: "Track your day with a sleek titanium body, AMOLED display, and 7-day battery.", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80&auto=format&fit=crop", stock: 8,  category: "Wearables" },
  { id: "p3",  name: "Lumen Desk Lamp", price: 79, description: "Warm-to-cool tunable LED with wireless charging base and minimalist matte finish.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80&auto=format&fit=crop", stock: 25, category: "Home" },
  { id: "p4",  name: "Trail Daypack 22L", price: 119, description: "Weatherproof recycled-nylon daypack with padded laptop sleeve and ergonomic straps.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80&auto=format&fit=crop", stock: 18, category: "Bags" },
  { id: "p5",  name: "Ceramic Pour-Over Set", price: 64, description: "Hand-thrown ceramic dripper with bamboo lid and 600ml borosilicate carafe.", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop", stock: 30, category: "Kitchen" },
  { id: "p6",  name: "Echo Bluetooth Speaker", price: 129, description: "360° sound, IP67 waterproof, and 18 hours of music in a pocketable form factor.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80&auto=format&fit=crop", stock: 15, category: "Audio" },
  { id: "p7",  name: "Linen Throw Blanket", price: 89, description: "Stonewashed European linen throw — soft, breathable, and beautifully draped.", image: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=900&q=80&auto=format&fit=crop", stock: 22, category: "Home" },
  { id: "p8",  name: "Field Notebook Set", price: 24, description: "Trio of softcover dot-grid notebooks with thread-bound spines and FSC paper.", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=80&auto=format&fit=crop", stock: 50, category: "Stationery" },
  { id: "p9",  name: "Pro Mechanical Keyboard", price: 159, description: "Hot-swappable 75% layout, PBT keycaps, and gasket-mounted typing feel.", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=80&auto=format&fit=crop", stock: 14, category: "Electronics" },
  { id: "p10", name: "Leather Card Wallet", price: 49, description: "Full-grain Italian leather, RFID-blocking, slim profile for everyday carry.", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=80&auto=format&fit=crop", stock: 40, category: "Accessories" },
  { id: "p11", name: "Polarized Sunglasses", price: 99, description: "Lightweight acetate frames with UV400 polarized lenses for all-day clarity.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&q=80&auto=format&fit=crop", stock: 28, category: "Accessories" },
  { id: "p12", name: "Minimal Sneakers", price: 139, description: "Premium leather low-tops on a cushioned cup-sole, made for the city.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop", stock: 20, category: "Footwear" },
  { id: "p13", name: "DSLR Camera Pro", price: 1299, description: "24MP full-frame mirrorless camera with 4K video and dual card slots.", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop", stock: 6,  category: "Electronics" },
  { id: "p14", name: "Active Running Shoes", price: 119, description: "Carbon-plate running shoes with responsive foam for race-day energy return.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop", stock: 18, category: "Footwear" },
  { id: "p15", name: "Hydro Insulated Bottle", price: 39, description: "Vacuum-insulated stainless steel bottle keeps drinks cold 24h, hot 12h.", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80&auto=format&fit=crop", stock: 60, category: "Kitchen" },
  { id: "p16", name: "Yoga Mat Premium", price: 69, description: "6mm natural rubber mat with superior grip and alignment markers.", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=900&q=80&auto=format&fit=crop", stock: 35, category: "Fitness" },
  { id: "p17", name: "Adjustable Dumbbell", price: 299, description: "Quick-select 5-50lb adjustable dumbbell — replaces 15 weights.", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80&auto=format&fit=crop", stock: 10, category: "Fitness" },
  { id: "p18", name: "Smart LED Bulb 4-Pack", price: 49, description: "16M color tunable smart bulbs, voice-controlled, no hub required.", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=900&q=80&auto=format&fit=crop", stock: 45, category: "Home" },
  { id: "p19", name: "Espresso Machine", price: 449, description: "15-bar pump espresso machine with milk steam wand and PID temp control.", image: "https://images.unsplash.com/photo-1572286258217-215cf8e9d99e?w=900&q=80&auto=format&fit=crop", stock: 9,  category: "Kitchen" },
  { id: "p20", name: "Travel Backpack 35L", price: 179, description: "Carry-on sized travel pack with clamshell opening and laptop compartment.", image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=900&q=80&auto=format&fit=crop", stock: 16, category: "Bags" },
  { id: "p21", name: "Wireless Charging Pad", price: 35, description: "15W fast-charge pad with anti-slip silicone surface and LED status ring.", image: "https://images.unsplash.com/photo-1591290619762-c47db8d3f3a4?w=900&q=80&auto=format&fit=crop", stock: 70, category: "Electronics" },
  { id: "p22", name: "Aroma Diffuser", price: 55, description: "Ultrasonic essential-oil diffuser with mood lighting and 8h runtime.", image: "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?w=900&q=80&auto=format&fit=crop", stock: 30, category: "Home" },
  { id: "p23", name: "Fountain Pen", price: 79, description: "Brass-bodied fountain pen with iridium nib for an effortless glide.", image: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=900&q=80&auto=format&fit=crop", stock: 24, category: "Stationery" },
  { id: "p24", name: "Gaming Mouse RGB", price: 89, description: "26K DPI optical sensor, 8 programmable buttons, ultra-light shell.", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900&q=80&auto=format&fit=crop", stock: 32, category: "Electronics" },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
