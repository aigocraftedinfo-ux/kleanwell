export interface CleaningService {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  basePrice: number; // in INR
  multiplier: number; // bedroom multiplier factor
  bathMultiplier: number; // bathroom multiplier factor
  whatsIncluded: string[];
  durationEstimate: string;
  tag?: string;
  image: string; // Unsplash image
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // lucide icon name
}

export interface BookingState {
  serviceId: string;
  bedrooms: number;
  bathrooms: number;
  frequency: "one-time" | "weekly" | "bi-weekly" | "monthly";
  addOnIds: string[];
  zipCode: string;
  phone: string;
  name: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export const FREQUENCIES = [
  { id: "one-time", name: "One-Time Clean", discount: 0, desc: "Standard rate" },
  { id: "weekly", name: "Weekly Plan", discount: 0.20, desc: "Save 20% - Ultimate fresh homes" },
  { id: "bi-weekly", name: "Bi-Weekly Plan", discount: 0.15, desc: "Save 15% - Most popular balance" },
  { id: "monthly", name: "Monthly Maintenance", discount: 0.10, desc: "Save 10% - Monthly reset" }
];

export const ADD_ONS: ServiceAddOn[] = [
  { id: "fridge", name: "Deep Inside Fridge", description: "Full empty, scrub, sanitize, and smell restoration", price: 499, icon: "Refrigerator" },
  { id: "oven", name: "Intense Oven & Chimney Degreasing", description: "Baking soda & orange oil heavy grease breakdown", price: 699, icon: "Flame" },
  { id: "windows", name: "Interior Windows & Glass Panes", description: "Streak-free polishing using our specialty bio-chemicals", price: 399, icon: "Grid" },
  { id: "balcony", name: "Balcony Jet Washing & Detailing", description: "Pressure jet wash of floor tiles and handrails", price: 599, icon: "Wind" },
  { id: "cabinets", name: "Deep Inside Kitchen Cabinets", description: "De-clutter, clean interior shelves, re-organize", price: 799, icon: "Archive" },
  { id: "sanitization", name: "Electrostatic Pathogen Shielding", description: "Anti-viral fogging of high-touch zones", price: 899, icon: "ShieldAlert" },
];

export const SERVICES: CleaningService[] = [
  {
    id: "deep-cleaning",
    name: "Premium Eco-Deep Cleaning",
    tag: "Highly Recommended",
    shortDesc: "Complete heavy-duty top-to-bottom sanitization using our signature 100% biodegradable green chemicals.",
    longDesc: "Our most exhaustive package. Ideal for seasonal refreshes, hosting preparations, or restoring a home's original shine. We detail tile grout, scrub chimney grills, descale shower taps, and sweep with natural pine extract.",
    basePrice: 2499,
    multiplier: 600,
    bathMultiplier: 400,
    durationEstimate: "5 - 7 Hours",
    whatsIncluded: [
      "Deep floor scrubbing with non-toxic pine-mint enzyme chemicals",
      "Stove burner & chimney exterior heavy grease scrub",
      "Bathroom descaling, tile cleaning & toilet deep disinfection",
      "Dusting/cleaning of ceiling fans, switchboards & tubular lights",
      "Vacuuming sofa, carpets, and dry dusting of wall art",
      "Window panes, glass panels, and window channel cleaning"
    ],
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "regular-cleaning",
    name: "Standard Maintenance Clean",
    tag: "Essential Care",
    shortDesc: "Routine sanitization, dust relief, and floor mopping to maintain weekly freshness and allergen control.",
    longDesc: "Perfect for active households that need regular upkeep. Using organic lavender and lime-based sanitizers, we restore sparkling clean surfaces in key living areas, kitchens, and bedrooms.",
    basePrice: 1299,
    multiplier: 350,
    bathMultiplier: 250,
    durationEstimate: "2.5 - 4 Hours",
    whatsIncluded: [
      "Organic sweeping & mopping with non-hazardous enzymes",
      "Countertops, cabinets, and dining table wipe down",
      "Sink scrubbing & kitchen dry dusting",
      "Basic bathroom floor wash & sink scrub",
      "Emptying of all trash containers & relining",
      "Bedroom dusting and quick bed arranging"
    ],
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "move-in-out",
    name: "Tenant Move-In / Out Reset",
    tag: "100% Deposit Back Guarantee",
    shortDesc: "Intense empty-home wash targeting every nook, hidden space, cabinet depth, and baseboard to secure your bond.",
    longDesc: "Designed to help tenants secure their security deposits or landlords prepare homes for premium listings. We clean inside empty cupboards, address high-reach cobwebs, tile details, and leave the property in impeccable show-ready shape.",
    basePrice: 3199,
    multiplier: 800,
    bathMultiplier: 500,
    durationEstimate: "6 - 8 Hours",
    whatsIncluded: [
      "Deep clean inside all empty kitchen drawers and wardrobes",
      "Intensified calcium scale removal from chrome fittings",
      "Extensive baseboards, doors, frames, and handle wiping",
      "High vacuuming of air ducts, spider web nests",
      "Balcony deep wash and glass doors buffing",
      "Scented sanitization of entire flooring with organic lemongrass oil"
    ],
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "upholstery-revive",
    name: "Sofa & Carpet Fabric Infusion",
    tag: "Allergen Restorer",
    shortDesc: "Eco-shampoo extraction of fabric fibers, removing deep skin oils, drink stains, and dust mites.",
    longDesc: "Your furniture absorbs dust, pet dander, and sweat. We inject specialized biodegradable upholstery shampoo, scrub gently with microfiber equipment, and use high-suction extractors to pull out hidden debris and allergens.",
    basePrice: 1599,
    multiplier: 400,
    bathMultiplier: 0,
    durationEstimate: "2 - 3 Hours",
    whatsIncluded: [
      "Dual-acting high-lift vacuuming extraction of allergens",
      "Gentle agitation of dirt with citrus bio-safe surfactants",
      "Localized food/drink stain treating",
      "Anti-bacterial steam application (high temperature sanitizing)",
      "Citrus enzyme encapsulation to lock in long-lasting freshness",
      "Pet odor neutralization & deep fiber fluffing"
    ],
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop"
  }
];

export function calculatePrice(state: BookingState): number {
  const service = SERVICES.find(s => s.id === state.serviceId) || SERVICES[0];
  let price = service.basePrice;
  
  // Calculate size factor
  if (state.bedrooms > 1) {
    price += (state.bedrooms - 1) * service.multiplier;
  }
  price += state.bathrooms * service.bathMultiplier;

  // Add-ons
  state.addOnIds.forEach(id => {
    const addon = ADD_ONS.find(a => a.id === id);
    if (addon) price += addon.price;
  });

  // Frequency discount
  const freq = FREQUENCIES.find(f => f.id === state.frequency);
  if (freq) {
    price = Math.round(price * (1 - freq.discount));
  }

  return price;
}
