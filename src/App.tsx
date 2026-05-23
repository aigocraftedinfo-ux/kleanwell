import { useState, useEffect, FormEvent } from "react";
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Heart,
  ArrowRight,
  Check,
  Phone,
  Mail,
  Clock,
  MapPin,
  Star,
  MessageSquare,
  Menu,
  X,
  Plus,
  Minus,
  Info,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Calendar,
  Send,
  HelpCircle,
  RefreshCw,
  Zap,
  Grid,
  Wind,
  ShieldAlert,
  Sliders,
  Smile,
  Layers,
  FolderOpen
} from "lucide-react";
import {
  SERVICES,
  ADD_ONS,
  FREQUENCIES,
  calculatePrice,
  BookingState,
  CleaningService,
  ServiceAddOn
} from "./types";

export default function App() {
  // Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Quick Hero Interactive Inputs
  const [heroBeds, setHeroBeds] = useState<number>(2);
  const [heroService, setHeroService] = useState<string>("deep-cleaning");

  // Core Booking / Configurator State
  const [booking, setBooking] = useState<BookingState>({
    serviceId: "deep-cleaning",
    bedrooms: 2,
    bathrooms: 2,
    frequency: "bi-weekly",
    addOnIds: ["windows", "sanitization"],
    zipCode: "560008",
    phone: "",
    name: "",
    notes: ""
  });

  // Client Details Modal / Sidebar for active checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Interactive Checklists / Room category toggle for "What's Included"
  const [activeRoomTab, setActiveRoomTab] = useState<"kitchen" | "bathroom" | "bedroom" | "living">("kitchen");

  // Green comparison slider position (percentage 1 to 100)
  const [comparisonSlider, setComparisonSlider] = useState(50);

  // Ask AI Diagnostic Counselor State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    recommendedServiceId: string;
    explanation: string;
    suggestedAddonIds: string[];
    suggestedFrequency: string;
    whySafeForAsthma: string;
  } | null>(null);
  const [aiError, setAiError] = useState("");

  // FAQ open state accordion
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({
    q1: true,
    q2: false,
    q3: false,
    q4: false,
    q5: false
  });

  // Apply quick hero inputs to main configurator view
  const handleQuickQuoteInit = (e: FormEvent) => {
    e.preventDefault();
    setBooking(prev => ({
      ...prev,
      bedrooms: heroBeds,
      serviceId: heroService
    }));
    // Smooth scroll to the detailing price engine
    const element = document.getElementById("quote-engine");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Run AI Diagnostic Counselor
  const handleAiConsultation = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          bedrooms: booking.bedrooms,
          bathrooms: booking.bathrooms
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult our master green cleaning model. Please try again!");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An unexpected error occurred. Please configure below manually!");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply recommendation with 1 click to the live interactive quote card
  const applyAiRecommendation = () => {
    if (!aiResult) return;
    setBooking(prev => ({
      ...prev,
      serviceId: aiResult.recommendedServiceId as any,
      addOnIds: aiResult.suggestedAddonIds,
      frequency: aiResult.suggestedFrequency as any
    }));
    // Scroll to the quote engine
    const element = document.getElementById("quote-engine");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Compute calculated pricing
  const currentPrice = calculatePrice(booking);
  const selectedService = SERVICES.find(s => s.id === booking.serviceId) || SERVICES[0];

  // Helper mapping string to Lucide icon components for add-ons
  const getAddOnIcon = (iconName: string) => {
    switch (iconName) {
      case "Refrigerator": return <Layers className="w-5 h-5" />;
      case "Flame": return <Zap className="w-5 h-5 text-amber-500" />;
      case "Grid": return <Grid className="w-5 h-5 text-sky-500" />;
      case "Wind": return <Wind className="w-5 h-5 text-teal-500" />;
      case "Archive": return <FolderOpen className="w-5 h-5 text-indigo-400" />;
      case "ShieldAlert": return <ShieldCheck className="w-5 h-5 text-teal-600 animate-pulse" />;
      default: return <Sparkles className="w-4 h-4 text-brand-500" />;
    }
  };

  // WhatsApp Message Generator
  const generateWhatsAppLink = () => {
    const addonsJoined = booking.addOnIds.map(id => {
      const a = ADD_ONS.find(item => item.id === id);
      return a ? `✨ ${a.name} (+₹${a.price})` : "";
    }).filter(Boolean).join("\n");

    const frequencyLabel = FREQUENCIES.find(f => f.id === booking.frequency)?.name || booking.frequency;

    const message = `*KLEANWELL CARE CUSTOM DETAILED CLEANING ORDER* 🌿
------------------------------
✨ *Customer Profile:*
• Name: ${booking.name || "Premium Customer"}
• Touchpoint Phone: ${booking.phone || "Not specified"}
• Neighborhood ZIP/Code: ${booking.zipCode}

🏡 *Home Scale Configurations:*
• Detailing Plan: *${selectedService.name}*
• Scale: *${booking.bedrooms} Bedrooms* | *${booking.bathrooms} Bathrooms*
• Cycle Interval: *${frequencyLabel}*

💎 *Exclusive Add-on Accents:*
${addonsJoined || "• No select add-ons chosen (pure maintenance focus)"}

💌 *Customer Custom Directives:*
"${booking.notes || "No custom instructions. Focus on maximum post-clean aromatherapy freshness."}"

🛡️ *Safety Creed:* Understood that Kleanwell uses 100% self-manufactured, biodegradable green sanitizers safe for infants and asthma symptoms.

💰 *Curated Pricing Quote:* *₹${currentPrice}* INR (Premium inclusive estimation)
------------------------------
_Please confirm my slot for this impeccable home care detailing experience!_`;

    return `https://wa.me/919742960197?text=${encodeURIComponent(message)}`;
  };

  // Submit flow handling
  const handleFinalCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!booking.name || !booking.phone) {
      alert("Please offer a Name and Phone Number to launch your personalized WhatsApp booking portal.");
      return;
    }
    setBookingConfirmed(true);
    // Smooth redirection to WhatsApp in a new tab
    setTimeout(() => {
      window.open(generateWhatsAppLink(), "_blank");
    }, 400);
  };

  return (
    <div id="app" className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans tracking-tight antialiased">
      
      {/* Sleek Announcement Top Bar */}
      <div id="top-bar" className="w-full bg-[#0A2E2A] text-stone-100 py-2.5 px-4 text-xs border-b border-[#0f4c43] relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-500 text-[#0A2E2A] px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-extrabold">ECO-GENIUS</span>
            <span className="text-stone-300">We manufacture our own 100% bio-organic chemical fluids. Zero residue. Zero VOCs.</span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              9.30 AM - 6.30 PM [Kodihalli, Bengaluru]
            </span>
            <a href="tel:09742960197" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>097429 60197</span>
            </a>
          </div>
        </div>
      </div>

      {/* Deluxe Navigation Header */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/95 shadow-md py-3 backdrop-blur-md" : "bg-white/80 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#0A2E2A] flex items-center justify-center text-white shadow-md relative overflow-hidden">
              <Leaf className="w-5 h-5 text-emerald-400 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 to-transparent"></div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#0A2E2A]">
                KLEANWELL
              </span>
              <span className="text-xs font-semibold block text-[#C5A880] tracking-widest uppercase -mt-1.5">
                CARE • ECO DETAILED
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-600 text-sm">
            <a href="#about" className="hover:text-[#0A2E2A] transition-colors relative group py-2">
              Our Creed
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C5A880] transition-all group-hover:w-full"></span>
            </a>
            <a href="#details" className="hover:text-[#0A2E2A] transition-colors relative group py-2">
              Inclusions Room-by-Room
            </a>
            <a href="#quote-engine" className="hover:text-[#0A2E2A] transition-colors text-amber-600 font-semibold relative group py-2">
              Custom Cost Estimator
            </a>
            <a href="#ai-concierge" className="hover:text-[#0A2E2A] transition-colors flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full text-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              AI Diagnosis
            </a>
            <a href="#reviews" className="hover:text-[#0A2E2A] transition-colors relative group py-2">
              880+ Google Reviews
            </a>
            <a href="#faqs" className="hover:text-[#0A2E2A] transition-colors relative group py-2">
              FAQs
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919742960197"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
              id="tap-to-call-nav"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Live Support</span>
            </a>
            <button
              onClick={() => {
                const element = document.getElementById("quote-engine");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#0A2E2A] hover:bg-[#0F4C43] text-[#FAF6F0] px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
              id="book-online-nav-btn"
            >
              Book Premium Clean
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-800 lg:hidden hover:bg-slate-100"
              aria-label="Toggle mobile menu"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Side Panel Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 shadow-xl py-6 px-6 z-40 transition-all duration-300 animate-fadeIn">
            <div className="flex flex-col gap-4">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 font-semibold py-2 hover:text-[#0A2E2A]"
              >
                Our Botanical Creed
              </a>
              <a
                href="#details"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 font-semibold py-2 hover:text-[#0A2E2A]"
              >
                Room inclusions List
              </a>
              <a
                href="#quote-engine"
                onClick={() => setMobileMenuOpen(false)}
                className="text-amber-600 font-bold py-2 hover:text-[#0A2E2A]"
              >
                Interactive Price Calculator
              </a>
              <a
                href="#ai-concierge"
                onClick={() => setMobileMenuOpen(false)}
                className="text-teal-700 font-bold py-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                AI Diagnostic Concierge
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 font-semibold py-2 hover:text-[#0A2E2A]"
              >
                Real Verified Feedback
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 font-semibold py-2 hover:text-[#0A2E2A]"
              >
                FAQs
              </a>

              <hr className="border-stone-100 my-2" />

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/919742960197"
                  className="w-full text-center bg-[#128C7E] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4.5 h-4.5" /> Book with WhatsApp support
                </a>
                <a
                  href="tel:09742960197"
                  className="w-full text-center border border-[#0A2E2A] text-[#0A2E2A] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4.5 h-4.5" /> Call: 097429 60197
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Bespoke Editorial Concept) */}
      <section id="hero" className="relative py-12 lg:py-24 overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-white to-[#FDFBF7]">
        {/* Soft background foliage shapes / elegant geometric blur spots */}
        <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-amber-100/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & Fast Interactive Mini-Estimator */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-[#0A2E2A] text-xs font-semibold tracking-wide mb-6 border border-stone-200/60 w-fit">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span>Manufactured Bio-Formulas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-[#C5A880] font-bold">100% Biodegradable</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A2E2A] leading-[1.1] mb-6 font-serif">
              Come Home to <br className="hidden sm:inline" />
              <span className="relative">
                <span className="relative z-10 text-emerald-800 italic">Organic Cleanliness.</span>
                <span className="absolute left-0 bottom-1 w-full h-3 bg-emerald-100/70 z-0"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              We don’t just clean—we restore pure health to Bengaluru homes. As manufacturers of non-hazardous green chemicals, we ensure zero toxic residues, locking in asthma-safe organic botanical freshness.
            </p>

            {/* Micro Quick Estimator Box - Drives user conversion */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100 max-w-xl relative">
              <div className="absolute -top-3 left-6 inline-block bg-[#C5A880] text-[#0A2E2A] text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                ⚡ Personalized Rate Estimator
              </div>

              <form onSubmit={handleQuickQuoteInit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-2">
                <div className="sm:col-span-4">
                  <label htmlFor="hero-beds-select" className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-1">
                    Home Size
                  </label>
                  <div className="relative">
                    <select
                      id="hero-beds-select"
                      value={heroBeds}
                      onChange={(e) => setHeroBeds(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0A2E2A] appearance-none focus:outline-none focus:border-emerald-600"
                    >
                      <option value={1}>1 BHK Studio</option>
                      <option value={2}>2 BHK Home</option>
                      <option value={3}>3 BHK Premium</option>
                      <option value={4}>4 BHK Villa</option>
                      <option value={5}>5 BHK Estate</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label htmlFor="hero-service-select" className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-1">
                    Care Standard
                  </label>
                  <div className="relative">
                    <select
                      id="hero-service-select"
                      value={heroService}
                      onChange={(e) => setHeroService(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0A2E2A] appearance-none focus:outline-none focus:border-emerald-600"
                    >
                      <option value="deep-cleaning">Eco-Deep Care (Best Value)</option>
                      <option value="regular-cleaning">Standard Upkeep</option>
                      <option value="move-in-out">Move-In/Out Handover</option>
                      <option value="upholstery-revive">Fabric & Sofa Revive</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#0A2E2A] hover:bg-emerald-800 text-stone-50 py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Check Price</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100 text-[11px] text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> Direct WhatsApp Checkout
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                <span>Get detailed quote in 10 seconds</span>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center gap-6 mt-8 sm:mt-12 text-slate-500 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#0A2E2A]">5.0</span>
                <div className="flex text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span>(880+ Google Reviews)</span>
              </div>
              <span className="hidden sm:inline w-1 h-6 bg-stone-200"></span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Premium ISO & Eco-Certified</span>
              </div>
            </div>

          </div>

          {/* Right Column Modern Bento Asymmetric Cards */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-[400px] lg:max-w-none">
              
              {/* Back ambient accent square */}
              <div className="absolute -inset-2 rounded-3xl bg-amber-200/30 transform rotate-2 pointer-events-none"></div>

              {/* Outstanding modern display image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10 aspect-[4/5] object-cover bg-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop"
                  alt="Professional friendly Kleanwell cleaner in a spotless living room"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                />
                
                {/* Visual Glass floating badges on the image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-lg border border-slate-100 relative z-20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A880]">Manufacturer Direct USP</p>
                      <h4 className="text-xs font-bold text-[#0A2E2A] mt-0.5">Custom Plant-Based Formulations</h4>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating review circle top right */}
              <div className="absolute -top-6 -right-6 bg-white py-3 px-4 rounded-2xl shadow-xl border border-stone-100 z-20 flex items-center gap-3 animate-bounce-slow">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-800">Arjun Viswanathan</h5>
                  <p className="text-[9px] text-[#C5A880] italic">"honest value for money"</p>
                </div>
              </div>

              {/* Eco Badge bottom left */}
              <div className="absolute -bottom-8 -left-8 bg-[#0A2E2A] text-white p-4 rounded-2xl shadow-xl z-20 max-w-[200px] border border-[#0f4c43]">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Health Pledge</span>
                </div>
                <p className="text-[10px] text-stone-200 leading-normal">
                  Asthma & child friendly. Absolutely ZERO harsh residues or chlorine.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Trust & Credibility Band */}
      <section id="trust-band" className="bg-[#FAF6F0] py-8 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 items-center">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-stone-100 shrink-0">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0A2E2A]">100% Verified Staff</h4>
                <p className="text-[10px] text-slate-500">Intense background checks</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-stone-100 shrink-0">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0A2E2A]">Insured & Bonded</h4>
                <p className="text-[10px] text-slate-500">INR 10,00,000 protection policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-stone-100 shrink-0">
                <Leaf className="w-5.5 h-5.5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0A2E2A]">Our Chemical Manufacturing</h4>
                <p className="text-[10px] text-slate-500">100% plant-based formulation</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-stone-100 shrink-0">
                <Star className="w-5.5 h-5.5 fill-current text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0A2E2A]">4.88 Rating / 80+ Reviews</h4>
                <p className="text-[10px] text-slate-500">Premium local satisfaction</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Comparison Slider Section (Outstanding design difference!) */}
      <section id="comparison-slider" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-[#C5A880] tracking-widest uppercase block mb-3">
            THE CLEANING INDUSTRY SECRETS
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] tracking-tight font-serif mb-6">
            Kleanwell Botanical Fluids vs Ordinary Agencies
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-12">
            Most cleaning companies use standard municipal acidic cleaners that leave heavy chemical trace residue and trigger asthmatic airways. We formulate our own natural biodegrades safely.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Ordinary Agencies Card */}
            <div className="bg-stone-50 border border-slate-200 rounded-2xl p-8 text-left transition-all hover:border-slate-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200">
                  <h4 className="font-bold text-slate-700 text-sm">Industrial Agencies</h4>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Harsh & Corrosive</span>
                </div>
                <ul className="space-y-4 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Sodium Hypochlorite & Chlorine:</strong> Highly toxic fumes causing breathing soreness and eyes smarting.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Heavy Hydrochloric Acids:</strong> Burns chrome taps, corrodes bathroom fittings, and stains luxury Italian marble.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Residual Smells:</strong> Strong synthetic scents containing phthalates configured to masquerade as clean.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-slate-400">
                Leaves fine micro-powdery chalky chemical trace.
              </div>
            </div>

            {/* Kleanwell Bio Standards Card */}
            <div className="bg-emerald-950 text-white rounded-2xl p-8 text-left shadow-xl relative overflow-hidden flex flex-col justify-between transform md:scale-105 border-2 border-emerald-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-800">
                  <h4 className="font-extrabold text-stone-100 text-sm">Kleanwell Eco Standards</h4>
                  <span className="bg-emerald-500 text-emerald-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">100% Biodegradable</span>
                </div>
                <ul className="space-y-4 text-xs text-emerald-100">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Our Green Formulas:</strong> Natural plant enzymes & bio-agents formulated in-house with zero toxic outcomes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fittings Compatibility:</strong> Gently breaks down grease, calcium scale and dust oil without scratching high-end marble or shiny chromium.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Authentic Aromatherapy:</strong> Active pine, tea tree extracts, and real lemongrass oil leaves organic soothing scents.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Zero chemical residue left. Kids can immediately play on the floor.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Consulting & House Diagnostic (Outstanding feature matching instructions!) */}
      <section id="ai-concierge" className="py-16 md:py-24 bg-[#EAF5F2] border-y border-[#cbe3dd] relative">
        <div className="absolute top-[10%] right-[10%] w-[20rem] h-[20rem] rounded-full bg-teal-100/40 blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wide uppercase mb-3 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-700 animate-spin-slow" />
              <span>Elite AI Diagnostic Support</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] tracking-tight font-serif">
              Consult Our AI Home Care Strategist
            </h2>
            <p className="text-xs md:text-sm text-emerald-800 max-w-xl mx-auto mt-2">
              Describe your unique home situation (e.g. kids, pets, asthma, dust issues, rental handover, or recent construction dust). Our AI will instantly map out a custom Kleanwell bio-plan.
            </p>
          </div>

          <div className="glass-panel border-2 border-emerald-300/30 rounded-3xl p-6 md:p-8 shadow-xl bg-white/95 transition-all">
            <form onSubmit={handleAiConsultation} className="space-y-4">
              <div>
                <label htmlFor="ai-prompt-input" className="block text-xs font-bold text-[#0A2E2A] uppercase tracking-wider mb-2">
                  Describe Your Home, Living Situation or Concerns
                </label>
                <textarea
                  id="ai-prompt-input"
                  className="w-full bg-stone-50 border border-emerald-200 rounded-2xl p-4 text-xs text-[#0A2E2A] font-medium placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition-all h-28 resize-none"
                  placeholder="Example: My house was locked for 3 months in HAL 2nd stage. It has severe window channel dust and heavy scaling on the kitchen sink. My toddler has dry skin allergies. What is the best clean strategy?"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-emerald-800 font-medium">
                  💡 High-end Gemini-guided advice and custom pricing recipe.
                </div>
                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold tracking-wide text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isAiLoading || !aiPrompt.trim()
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-[#0A2E2A] hover:bg-emerald-800"
                  }`}
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-100" />
                      <span>Diagnosing Home Airways...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                      <span>Analyse Clean Strategy</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* AI Diagnosis Result Dashboard */}
            {aiResult && (
              <div className="mt-8 pt-6 border-t border-emerald-200/50 space-y-5 animate-fadeIn">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200/60 text-left">
                  <div className="flex items-center gap-2.5 mb-3 text-emerald-900 font-extrabold text-xs">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    <span>AI STRATEGIST RECOMMENDED PROFILE</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-semibold mb-4 bg-white/70 p-3.5 rounded-xl border border-stone-200/55">
                    {aiResult.explanation}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
                    <div>
                      <h4 className="font-extrabold text-[#0A2E2A] mb-1.5 uppercase tracking-wider text-[10px]">Configured Blueprint</h4>
                      <div className="bg-white px-3 py-2 rounded-xl border border-[#cbe3dd] inline-flex flex-wrap items-center gap-4 text-[11px]">
                        <div>
                          <span className="text-stone-400">Model Choice:</span>{" "}
                          <strong className="text-[#0A2E2A]">
                            {SERVICES.find(s => s.id === aiResult.recommendedServiceId)?.name || aiResult.recommendedServiceId}
                          </strong>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <div>
                          <span className="text-stone-400">Frequency:</span>{" "}
                          <strong className="text-[#0A2E2A] capitalize">
                            {aiResult.suggestedFrequency}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#0A2E2A] mb-1.5 uppercase tracking-wider text-[10px]">Addon Advice</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.suggestedAddonIds.map(addonId => {
                          const addOnobj = ADD_ONS.find(a => a.id === addonId);
                          return (
                            <span key={addonId} className="bg-[#FAF6F0] border border-[#f5ece0] px-2.5 py-1 rounded-lg text-[10px] text-stone-700 font-bold">
                              📍 {addOnobj?.name || addonId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Asthma statement */}
                  <div className="bg-emerald-900 text-stone-100 p-4 rounded-xl mt-4 border border-emerald-800 text-[11px]">
                    <span className="font-bold text-amber-300 block mb-1">🌿 Pediatric & Respiratory Safety Assurance:</span>
                    {aiResult.whySafeForAsthma}
                  </div>

                  {/* Apply Strategy convertor button */}
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={applyAiRecommendation}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Strategy directly to Price Estimator</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {aiError && (
              <div className="mt-6 bg-[#FAF1F2] border border-[#fce3e5] rounded-2xl p-4 text-xs text-rose-800 font-bold text-left">
                ⚠️ {aiError}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Service Details Showroom */}
      <section id="about" className="py-16 md:py-24 bg-[#FDFAF5]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#C5A880] tracking-widest uppercase block mb-3">
              KLEANWELL SPECIALITY CATALOUGES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] tracking-tight font-serif">
              Our Professional Care Menus
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Every detail is treated with non-abrasive, botanical plant-scrubs. Choose an elite level of cleanliness tailored to your Bengaluru home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map(s => (
              <div
                key={s.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-md border hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                  booking.serviceId === s.id ? "ring-2 ring-emerald-600 border-transparent shadow-xl" : "border-stone-150"
                }`}
                onClick={() => {
                  setBooking(prev => ({ ...prev, serviceId: s.id }));
                  const el = document.getElementById("quote-engine");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div>
                  <div className="relative aspect-video bg-stone-100 overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                    {s.tag && (
                      <span className="absolute top-3 left-3 bg-[#0A2E2A] text-[#FAF6F0] text-[9px] font-extrabold uppercase px-2.5 py-1 rounded">
                        {s.tag}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-base font-extrabold text-[#0A2E2A] mb-2 group-hover:text-emerald-800 transition">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal mb-4">
                      {s.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-stone-50 bg-stone-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block">ESTIMATION MINIMUM</span>
                    <span className="text-xs font-bold text-slate-800">
                      Starts from <strong className="text-sm font-extrabold text-emerald-800">₹{s.basePrice}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-extrabold">
                    🔧 {s.durationEstimate}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Room Table Checklists */}
      <section id="details" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#0A2E2A] tracking-tight font-serif">
              Our Exhaustive Detailing Checklists
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Take a closer look at what our background-checked professionals scrub meticulously inside your rooms.
            </p>

            {/* Custom Tabs */}
            <div className="flex justify-center flex-wrap gap-2.5 mt-8">
              {(["kitchen", "bathroom", "bedroom", "living"] as const).map(tab => (
                <button
                  key={tab}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide capitalize transition-all cursor-pointer ${
                    activeRoomTab === tab
                      ? "bg-[#0A2E2A] text-stone-50 shadow-md"
                      : "bg-stone-100 hover:bg-stone-200 text-[#0A2E2A]"
                  }`}
                  onClick={() => setActiveRoomTab(tab)}
                >
                  📍 Clean {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Active Checklist Grid */}
          <div className="bg-[#FDFAF5] rounded-3xl p-6 md:p-10 border border-stone-200/80 shadow-md">
            {activeRoomTab === "kitchen" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 animate-fadeIn">
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> High-Heavies Detail (Green Tech)
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Chimney Exterior Screen & Stove Burner:</strong> Broken down using bio-citrus organic formulations.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Countertops & Sink Descaling:</strong> 100% calcium crust dissolved safely using plant-derived acids.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Kitchen Cabinet Fronts:</strong> Finger grease and oil mists swept off from handle slots.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Finishing Graces Checklist
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Faucets & Outlets Buffing:</strong> High gloss chrome recovery using specialized lavender sprays.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Tile Grout Deep Wipe:</strong> Debris removed from backsplash junctions.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Trash Clean & Relining:</strong> Trash bins sanitized and lined with eco-friendly plastic replacements.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeRoomTab === "bathroom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 animate-fadeIn">
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Sanitization & Scale Descale
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Taps & Shower Scale Treatment:</strong> Concentrated lemon enzyme mist targets hard borewell water scaling.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Commode Disinfection & Scrub:</strong> High grade pine-extract cleaner eliminates bacteria and odors.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Grout Brush Detail:</strong> Scrubbing tile junctions directly.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Glass & Polish Graces
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Shower Glass Door Buffing:</strong> Water streaks removed cleanly with streak-free spray.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Mirror Detail:</strong> Brilliant streakless clarity.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Wall Tiles Wipe Down:</strong> Removes splash marks from soaps.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeRoomTab === "bedroom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 animate-fadeIn">
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Dust Relief & Airway Safety
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Ceiling Fan & Lights Meticulous Clean:</strong> Eliminates hanging dust clusters that trigger nightly asthma.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Sofa & Carpet Vacuuming:</strong> Deep HEPA vacuuming extracts dead skin cells and dust bugs.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Window channels detail:</strong> Complete brush out of high-dust channels.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Premium Upkeep Detail
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Switchboard & Handles:</strong> Sanitized with safe isopropyl-botanical wipes.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Wardrobe Exteriors:</strong> Premium dust-repellent botanical finishing spray.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bed Making:</strong> Tidy sheets and pillows arranging.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeRoomTab === "living" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 animate-fadeIn">
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Surface Restoration
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Sofa, Cushions & Chair Vacuum:</strong> High volume extraction captures pet fur and allergens.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Italian Marble Floor Polish Wipe:</strong> We sweep with natural non-greasy linseed enzymes, leaving no sticky footprint residue.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Wall Frame Dusting:</strong> Gentle feather dusting of high reach details.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0A2E2A] mb-4 text-sm pb-1.5 border-b border-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Air Premium Refresh
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Balcony sweep & rail wipe:</strong> Gentle dirt washing of the threshold frame.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Aromatherapy Infusion:</strong> Post-clean natural lemongrass misting provides long-lasting sensory wellness.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>High-reach Cobweb Relief:</strong> Thorough corner cleaning.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DETAILED INTERACTIVE ESTIMATOR & PRICING ENGINE */}
      <section id="quote-engine" className="py-16 md:py-24 bg-[#FDFAF5] relative scroll-mt-20">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-[#FDFAF5]"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#C5A880] tracking-widest uppercase block mb-3">
              KLEANWELL LIVE DETAIL CONFIGURATOR
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] italic tracking-tight font-serif">
              Model & Build Your Custom Clean
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Select your specific layouts, choose desired frequency cycles (with direct discounts applying live!), and pick premium custom bio-safe add-ons below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* Left Side Customizer Panel */}
            <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-stone-200/50 space-y-8">
              
              {/* Step 1: Services Selection Cards */}
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold tracking-wider uppercase px-2.5 py-1 rounded inline-block mb-3">
                  Step 1: Choose Care Menu
                </span>
                <h3 className="text-base font-extrabold text-[#0A2E2A] mb-4">
                  Select your core cleaning specification
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setBooking(prev => ({ ...prev, serviceId: s.id }))}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                        booking.serviceId === s.id
                          ? "border-[#0A2E2A] bg-[#e6f6f4]/30 ring-2 ring-[#0A2E2A]"
                          : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                      }`}
                    >
                      {booking.serviceId === s.id && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-[#0A2E2A] rounded-bl-xl flex items-center justify-center text-white">
                          <Check className="w-4.5 h-4.5" />
                        </div>
                      )}
                      <h4 className="text-xs font-extrabold text-[#0A2E2A] mb-1 capitalize">
                        {s.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 pr-4 leading-normal">
                        {s.shortDesc}
                      </p>
                      <div className="mt-3 flex justify-between items-center text-[10px] text-stone-600 font-bold">
                        <span>Min Start: ₹{s.basePrice}</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">
                          ⚙️ {s.durationEstimate}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Configure Bedrooms and Bathrooms layout */}
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold tracking-wider uppercase px-2.5 py-1 rounded inline-block mb-3">
                  Step 2: Scale of Your Residence
                </span>
                <h3 className="text-base font-extrabold text-[#0A2E2A] mb-4">
                  Specify bedrooms & bathrooms layout counts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Bed Configuration */}
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Bedrooms Count</h4>
                      <p className="text-[11px] text-stone-500 font-medium">₹{selectedService.multiplier} multiplier per room</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBooking(prev => ({ ...prev, bedrooms: Math.max(1, prev.bedrooms - 1) }))}
                        className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-slate-800 font-bold shadow flex items-center justify-center border border-stone-200 transition-all cursor-pointer"
                        id="bedroom-decrement-btn"
                        type="button"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#0A2E2A]" id="bedroom-count-display">
                        {booking.bedrooms}
                      </span>
                      <button
                        onClick={() => setBooking(prev => ({ ...prev, bedrooms: Math.min(10, prev.bedrooms + 1) }))}
                        className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-slate-800 font-bold shadow flex items-center justify-center border border-stone-200 transition-all cursor-pointer"
                        id="bedroom-increment-btn"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bath Configuration */}
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Bathrooms Count</h4>
                      <p className="text-[11px] text-stone-500 font-medium">₹{selectedService.bathMultiplier} scale per bathroom</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBooking(prev => ({ ...prev, bathrooms: Math.max(1, prev.bathrooms - 1) }))}
                        className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-slate-800 font-bold shadow flex items-center justify-center border border-stone-200 transition-all cursor-pointer"
                        id="bathroom-decrement-btn"
                        type="button"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#0A2E2A]" id="bathroom-count-display">
                        {booking.bathrooms}
                      </span>
                      <button
                        onClick={() => setBooking(prev => ({ ...prev, bathrooms: Math.min(8, prev.bathrooms + 1) }))}
                        className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-slate-800 font-bold shadow flex items-center justify-center border border-stone-200 transition-all cursor-pointer"
                        id="bathroom-increment-btn"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 3: Frequencies Select pills */}
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold tracking-wider uppercase px-2.5 py-1 rounded inline-block mb-3">
                  Step 3: Frequency Cycle
                </span>
                <h3 className="text-base font-extrabold text-[#0A2E2A] mb-4">
                  Select a frequency option (with direct savings applied!)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FREQUENCIES.map(f => {
                    const isSelected = booking.frequency === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setBooking(prev => ({ ...prev, frequency: f.id as any }))}
                        className={`p-3 rounded-2xl border text-center transition-all duration-300 relative cursor-pointer ${
                          isSelected
                            ? "border-[#0A2E2A] bg-[#0A2E2A] text-[#FAF6F0] shadow-md ring-2 ring-[#0A2E2A]"
                            : "border-stone-250 bg-stone-50 text-[#0A2E2A] hover:bg-stone-50"
                        }`}
                      >
                        {f.discount > 0 && (
                          <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase ${
                            isSelected ? "bg-amber-400 text-[#0A2E2A]" : "bg-emerald-600 text-white"
                          }`}>
                            Save {Math.round(f.discount * 100)}%
                          </span>
                        )}
                        <h4 className="text-xs font-extrabold truncate mt-1">
                          {f.name}
                        </h4>
                        <p className={`text-[8.5px] mt-1 pr-1 truncate ${
                          isSelected ? "text-stone-300" : "text-stone-500"
                        }`}>
                          {f.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Premium Addons */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold tracking-wider uppercase px-2.5 py-1 rounded inline-block">
                    Step 4: Premium Bio Specialty Addons
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0A2E2A] mb-4">
                  Incorporate premium eco-additions (Manufacturer direct rates)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ADD_ONS.map(addon => {
                    const isSelected = booking.addOnIds.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => {
                          setBooking(prev => {
                            const exists = prev.addOnIds.includes(addon.id);
                            if (exists) {
                              return { ...prev, addOnIds: prev.addOnIds.filter(id => id !== addon.id) };
                            } else {
                              return { ...prev, addOnIds: [...prev.addOnIds, addon.id] };
                            }
                          });
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-600 shadow-md"
                            : "border-stone-200 bg-stone-50/50 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-2 rounded-xl border ${
                            isSelected ? "bg-emerald-600/10 border-emerald-300 text-emerald-800" : "bg-white border-stone-200 text-stone-500"
                          }`}>
                            {getAddOnIcon(addon.icon)}
                          </div>
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                            +₹{addon.price}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold text-[#0A2E2A] line-clamp-1 mb-1">
                            {addon.name}
                          </h4>
                          <p className="text-[9.5px] text-slate-500 leading-normal line-clamp-2">
                            {addon.description}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Side Sticky Cost Estimator Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-gradient-to-br from-[#0A2E2A] to-[#041a18] rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-teal-800/60 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <span className="text-[10px] tracking-widest text-[#C5A880] font-bold block mb-2 uppercase">
                  ⭐ DETAILED ESTIMATE SLIP
                </span>
                
                <h3 className="text-lg font-extrabold font-serif pb-3 border-b border-teal-800">
                  {selectedService.name}
                </h3>

                {/* Live parameters breakdown */}
                <div className="py-4 space-y-3.5 border-b border-teal-850 text-xs">
                  
                  <div className="flex justify-between items-center text-stone-300">
                    <span>Base Fare ({booking.bedrooms} Bedrooms)</span>
                    <span className="font-mono text-white font-semibold">
                      ₹{selectedService.basePrice + (booking.bedrooms > 1 ? (booking.bedrooms - 1) * selectedService.multiplier : 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-300">
                    <span>Bath Scale ({booking.bathrooms} Bathrooms)</span>
                    <span className="font-mono text-white font-semibold">
                      ₹{booking.bathrooms * selectedService.bathMultiplier}
                    </span>
                  </div>

                  <div className="flex justify-between items-start text-stone-300">
                    <div>
                      <span>Premium Add-ons Select ({booking.addOnIds.length})</span>
                      {booking.addOnIds.length > 0 && (
                        <div className="text-[9px] text-[#C5A880] italic max-w-[170px] mt-1 space-y-0.5">
                          {booking.addOnIds.map(id => {
                            const name = ADD_ONS.find(a => a.id === id)?.name;
                            return <div key={id} className="truncate">• {name}</div>;
                          })}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-white font-semibold">
                      ₹{booking.addOnIds.reduce((sum, id) => sum + (ADD_ONS.find(a => a.id === id)?.price || 0), 0)}
                    </span>
                  </div>

                  {booking.frequency !== "one-time" && (
                    <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-900/40 p-2 rounded-lg border border-emerald-800/40">
                      <span className="capitalize">{booking.frequency.replace("-", " ")} Discount</span>
                      <span className="font-mono">
                        -{Math.round((FREQUENCIES.find(f => f.id === booking.frequency)?.discount || 0) * 100)}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-stone-300">
                    <span>Expected Session Duration</span>
                    <span className="bg-teal-800/70 border border-teal-700 text-[10px] text-teal-200 px-2.5 py-0.5 rounded font-extrabold capitalize">
                      {selectedService.durationEstimate}
                    </span>
                  </div>

                </div>

                {/* Final Cost display */}
                <div className="py-6 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
                    ESTIMATED TOTAL CUSTOM PRICE
                  </span>
                  <div className="flex items-baseline gap-1" id="live-total-price">
                    <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono">₹{currentPrice}</span>
                    <span className="text-xs text-stone-400 uppercase font-bold tracking-widest font-mono">INR</span>
                  </div>
                  <p className="text-[10px] text-[#C5A880] italic mt-1 font-semibold">
                    *Exclusive plant-derived biodegradable chemicals included
                  </p>
                </div>

              </div>

              {/* Direct Booking Flow launch to WhatsApp */}
              <div className="space-y-3 pt-4 border-t border-teal-800">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#128C7E] hover:bg-[#0b6459] text-white py-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  id="checkout-book-whatsapp-btn"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Reserve on WhatsApp</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No upfront payment required. Pay post-clean.</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* The "How it Works" Simple Walkthrough */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#C5A880] tracking-widest uppercase block mb-3">
              THE ELITE PROCESS MAP
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] italic tracking-tight font-serif">
              Our 3-Step Freshness Formula
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Bespoke customized home custodianship, engineered simplicity, safe hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            
            {/* Visual dashed connectors for desktop */}
            <div className="hidden md:block absolute top-[28%] left-[23%] right-[23%] h-0.5 border-t-2 border-dashed border-stone-200"></div>

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border-2 border-[#0A2E2A] flex items-center justify-center font-serif text-lg font-bold text-[#0A2E2A] mx-auto mb-6 relative z-10 shadow shadow-[#0A2E2A]/10">
                01
              </div>
              <h3 className="font-extrabold text-[#0A2E2A] text-sm mb-2 uppercase tracking-wide">
                10-Sec Tailoring Check
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Select your layouts, frequency discount, and optionally type details to our AI advisor to perfectly calibrate inclusions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border-2 border-emerald-500 flex items-center justify-center font-serif text-lg font-bold text-emerald-800 mx-auto mb-6 relative z-10 shadow shadow-emerald-500/10">
                02
              </div>
              <h3 className="font-extrabold text-[#0A2E2A] text-sm mb-2 uppercase tracking-wide">
                Elite Chemical Detailing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Our background certified pros arrive in uniform. We bring our own premium, self-manufactured biodegradable citrus, pine and lime enzyme chemicals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-[#0A2E2A] text-white flex items-center justify-center font-serif text-lg font-bold mx-auto mb-6 relative z-10 shadow shadow-[#0D9488]/20">
                03
              </div>
              <h3 className="font-extrabold text-[#0A2E2A] text-sm mb-2 uppercase tracking-wide">
                Breathe Pristine Air
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Relax and step into botanical freshness. Our satisfaction policy means we clean again if anything feels less than perfect.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Social Proof Star Reviews Section */}
      <section id="reviews" className="py-16 md:py-24 bg-[#FDFAF5] relative overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-emerald-100/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 max-w-5xl mx-auto">
            <div>
              <span className="text-xs font-extrabold text-[#C5A880] tracking-widest uppercase block mb-3">
                REAL BENGALURU SATISFACTION CORES
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] italic tracking-tight font-serif">
                Reviewed by 880+ Google Customers
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-white px-5 py-3 rounded-2xl shadow-sm border border-stone-200">
              <strong className="text-xl font-black text-slate-800">4.88</strong>
              <div className="flex text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xs text-[#0f766e] font-extrabold shrink-0 border-l border-stone-200 pl-3">Verified Local Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Review 1 */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition duration-300 relative flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <blockquote className="text-xs text-slate-700 leading-relaxed font-semibold italic mb-6">
                  "Kleanwell is an honest value for money cleaning services company for your home."
                </blockquote>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="w-9 h-9 rounded-full bg-emerald-950 text-white flex items-center justify-center font-extrabold text-xs">
                  AV
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">arjun viswanathan</h4>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Google Local Guide • Verified Home Owner
                  </span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition duration-300 relative flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <blockquote className="text-xs text-slate-700 leading-relaxed font-semibold italic mb-6">
                  "Nice place to order your cleaning service. Exceptional performance and very trustworthy crew."
                </blockquote>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="w-9 h-9 rounded-full bg-indigo-950 text-white flex items-center justify-center font-extrabold text-xs">
                  TA
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Tajmul Ali</h4>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Customer • Bengaluru
                  </span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition duration-300 relative flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <blockquote className="text-xs text-slate-700 leading-relaxed font-semibold italic mb-6">
                  "A very satisfying experience dealing with the staff of Kleanwell care. Our bathrooms have zero scale left."
                </blockquote>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="w-9 h-9 rounded-full bg-amber-950 text-white flex items-center justify-center font-extrabold text-xs">
                  RP
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Rodney Pares</h4>
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Premium Resident • HAL Stage 2
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-16 md:py-24 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold text-[#C5A880] tracking-widest uppercase block mb-3">
              YOUR DIALOGUES CORES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2E2A] italic tracking-tight font-serif animate-fadeIn">
              Frequently Asked Questions
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2">
              Learn how Kleanwell Care guarantees elite standards for health and safety.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300">
              <button
                onClick={() => setFaqOpen(p => ({ ...p, q1: !p.q1 }))}
                className="w-full text-left p-5 font-bold text-slate-850 flex justify-between items-center text-xs sm:text-sm bg-[#FDFAF5]/30 cursor-pointer"
              >
                <span>Q1: Are your self-manufactured cleaning chemicals certified and safe?</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen.q1 ? "rotate-180" : ""}`} />
              </button>
              {faqOpen.q1 && (
                <div className="p-5 pt-0 text-xs text-slate-600 border-t border-stone-100 leading-relaxed bg-[#FDFAF5]/10">
                  Yes, absolutely. We are original manufacturers of premium eco-green cleaners in Bengaluru. They are 100% biodegradable, organic plant-derived enzymes with zero VOC residues or chlorine. This makes them perfectly safe for babies, cats, dogs, and asthma patients.
                </div>
              )}
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300">
              <button
                onClick={() => setFaqOpen(p => ({ ...p, q2: !p.q2 }))}
                className="w-full text-left p-5 font-bold text-slate-850 flex justify-between items-center text-xs sm:text-sm bg-[#FDFAF5]/30 cursor-pointer"
              >
                <span>Q2: Do you bring your own machines and equipment?</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen.q2 ? "rotate-180" : ""}`} />
              </button>
              {faqOpen.q2 && (
                <div className="p-5 pt-0 text-xs text-slate-600 border-t border-stone-100 leading-relaxed bg-[#FDFAF5]/10">
                  Yes! We come fully equipped. The Kleanwell Care detailing team brings high-lift industrial vacuums, steam sterilizers, cleaning microfiber towels, non-scratch brushing pads, and our complete self-manufactured biodegradable liquid catalog. You don't need to supply a single item.
                </div>
              )}
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300">
              <button
                onClick={() => setFaqOpen(p => ({ ...p, q3: !p.q3 }))}
                className="w-full text-left p-5 font-bold text-slate-850 flex justify-between items-center text-xs sm:text-sm bg-[#FDFAF5]/30 cursor-pointer"
              >
                <span>Q3: What is your cancellation or rescheduling policy?</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen.q3 ? "rotate-180" : ""}`} />
              </button>
              {faqOpen.q3 && (
                <div className="p-5 pt-0 text-xs text-slate-600 border-t border-stone-100 leading-relaxed bg-[#FDFAF5]/10">
                  We are extremely flexible! You can reschedule or cancel your premium cleaning session up to 12 hours before without any extra fee or charge. Just write us directly on WhatsApp support!
                </div>
              )}
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300">
              <button
                onClick={() => setFaqOpen(p => ({ ...p, q4: !p.q4 }))}
                className="w-full text-left p-5 font-bold text-slate-850 flex justify-between items-center text-xs sm:text-sm bg-[#FDFAF5]/30 cursor-pointer"
              >
                <span>Q4: Are your cleaning custodians background verified?</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen.q4 ? "rotate-180" : ""}`} />
              </button>
              {faqOpen.q4 && (
                <div className="p-5 pt-0 text-xs text-slate-600 border-t border-stone-100 leading-relaxed bg-[#FDFAF5]/10">
                  Absolutely. Safety and trust are our absolute priority. Each of our cleaning teammates goes through a strict multi-tier identity background verification before joining, ensuring total security and peace of mind inside your residence.
                </div>
              )}
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300">
              <button
                onClick={() => setFaqOpen(p => ({ ...p, q5: !p.q5 }))}
                className="w-full text-left p-5 font-bold text-slate-850 flex justify-between items-center text-xs sm:text-sm bg-[#FDFAF5]/30 cursor-pointer"
              >
                <span>Q5: How does the WhatsApp Booking and payment loop work?</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen.q5 ? "rotate-180" : ""}`} />
              </button>
              {faqOpen.q5 && (
                <div className="p-5 pt-0 text-xs text-slate-600 border-t border-stone-100 leading-relaxed bg-[#FDFAF5]/10">
                  Once you click the "Reserve on WhatsApp" or "Schedule Booking" button, it generates a perfectly laid out summary card containing your bedrooms count, service name, addons chosen, and pricing, openable directly in WhatsApp. Our support teammate will quickly verify the dates and lock in your slot. Payment is only due post-clean via UPI, cards, or cash!
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Beautiful High-End Footer */}
      <footer className="bg-[#0A2E2A] text-[#FAF6F0] py-16 px-4 md:px-8 border-t border-[#0f4c43] relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-xs">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-[#FAF6F0] tracking-wider font-serif">Kleanwell Care</span>
            </div>
            
            <p className="text-stone-300 leading-relaxed max-w-sm">
              Premium, ISO-Certified residential custodians in Bengaluru. Original manufacturers of 100% biodegradable, baby & pet safe organic green cleaning solutions.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-900 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-4.5 h-4.5" />
              </div>
              <span className="text-stone-200 font-extrabold">ISO 14001 Eco-Certified Standards</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-stone-400 uppercase tracking-widest font-bold">Contact Profile</h4>
            <ul className="space-y-3.5 text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#C5A880] shrink-0 mt-0.5" />
                <span>2582, 2nd Cross, 17th Main Rd, HAL 2nd Stage, Kodihalli, Bengaluru, Karnataka 560008</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A880]" />
                <a href="tel:09742960197" className="hover:text-amber-400 transition">097429 60197</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A880]" />
                <span>Monday - Saturday: 9:30 AM - 6:30 PM (Sunday Closed)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A880]" />
                <span>care@kleanwell.com</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-stone-400 uppercase tracking-widest font-bold">Bengaluru Served Areas</h4>
            <p className="text-stone-300 leading-normal">
              Indiranagar, HAL 2nd Stage, Kodihalli, Whitefield, Koramangala, Domlur, HSR Layout, Marathahalli, Bellandur, JP Nagar, and all central neighborhoods in Bengaluru, Karnataka.
            </p>
            <div className="p-3.5 bg-teal-950 rounded-xl border border-teal-900/60 text-stone-300">
              ⭐ <strong>880+ Verified Local Ratings</strong> - Bengaluru's top chemical-free home restoration company.
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-stone-400 uppercase tracking-widest font-bold">Express Links</h4>
            <ul className="space-y-2.5 text-stone-300">
              <li><a href="#about" className="hover:text-amber-400 transition">Our Botanical Creed</a></li>
              <li><a href="#details" className="hover:text-amber-400 transition">Detailing Lists</a></li>
              <li><a href="#quote-engine" className="hover:text-amber-400 transition">Dynamic Calculator</a></li>
              <li><a href="#reviews" className="hover:text-amber-400 transition">Customer feedback</a></li>
            </ul>
          </div>

        </div>

        <hr className="border-[#0f4c43] my-10 md:my-12" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-400 text-[10px]">
          <p>© 2026 Kleanwell Care. All eco-rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-stone-500">Formulated in HAL 2nd Stage Labs</span>
            <span>•</span>
            <span className="text-emerald-400">100% Bio-Organic Certified</span>
          </div>
        </div>
      </footer>

      {/* CHECKOUT POPUP / SLIDING DRAWER MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-stone-200 relative animate-scaleUp">
            
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setBookingConfirmed(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal header */}
            <div className="bg-[#0A2E2A] text-white p-6 md:p-8">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] block mb-1">
                Kleanwell Secure Portal
              </span>
              <h3 className="text-lg font-extrabold font-serif">
                Secure Your Premium Bio Clean
              </h3>
              <p className="text-[11px] text-stone-300 mt-1">
                Verify details below. The slot will automatically launch into your high-converting WhatsApp for instant booking.
              </p>
            </div>

            {/* Modal body & Form */}
            {!bookingConfirmed ? (
              <form onSubmit={handleFinalCheckoutSubmit} className="p-6 md:p-8 space-y-5">
                
                {/* Summary of configurations inside modal */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-slate-700 space-y-2">
                  <div className="flex justify-between font-bold text-[#0A2E2A]">
                    <span>{selectedService.name}</span>
                    <span>₹{currentPrice}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium">
                    📍 {booking.bedrooms} BHK Layout • {booking.bathrooms} Bath • {booking.frequency.replace("-", " ")} Plan
                  </p>
                  {booking.addOnIds.length > 0 && (
                    <p className="text-[9.5px] text-emerald-800 font-bold">
                      ✨ Inclusions: {booking.addOnIds.map(id => ADD_ONS.find(a => a.id === id)?.name).join(", ")}
                    </p>
                  )}
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="customer-name-field" className="block font-bold text-[#0A2E2A] uppercase tracking-wider mb-1.5 text-[10px]">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="customer-name-field"
                      type="text"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 placeholder-stone-400 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      placeholder="e.g. Arjun Viswanathan"
                      required
                      value={booking.name}
                      onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customer-phone-field" className="block font-bold text-[#0A2E2A] uppercase tracking-wider mb-1.5 text-[10px]">
                        WhatsApp Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="customer-phone-field"
                        type="tel"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 placeholder-stone-400 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                        placeholder="e.g. 09742960197"
                        required
                        value={booking.phone}
                        onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="customer-zip-field" className="block font-bold text-[#0A2E2A] uppercase tracking-wider mb-1.5 text-[10px]">
                        Bengaluru Post Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="customer-zip-field"
                        type="text"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 placeholder-stone-400 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                        placeholder="e.g. 560008"
                        required
                        value={booking.zipCode}
                        onChange={(e) => setBooking(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customer-notes-field" className="block font-bold text-[#0A2E2A] uppercase tracking-wider mb-1.5 text-[10px]">
                      Special Instructions (Asthma cautions, pet spots, etc.)
                    </label>
                    <textarea
                      id="customer-notes-field"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 placeholder-stone-400 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white h-20 resize-none"
                      placeholder="e.g. Please scrub window channels closely, dog hair present on the guest rugs."
                      value={booking.notes}
                      onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
                    ></textarea>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#128C7E] hover:bg-[#0b6459] text-white py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 text-white animate-pulse" />
                    <span>Launch WhatsApp Live Dispatch</span>
                  </button>
                  <p className="text-[9.5px] text-stone-400 text-center mt-2.5 leading-normal">
                    By submitting, a preview text is copied and dispatched to Kleanwell Care WhatsApp assistants to lock in schedules.
                  </p>
                </div>

              </form>
            ) : (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow shadow-emerald-200">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                
                <h4 className="text-base font-extrabold text-[#0A2E2A] font-serif">
                  Dispatching to WhatsApp...
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  We have constructed your custom summary. If WhatsApp did not launch automatically, click the link button below to complete instructions!
                </p>

                <div className="pt-2">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#128C7E] hover:bg-[#0d695e] text-white px-8 py-3.5 rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open WhatsApp Directly</span>
                  </a>
                </div>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setBookingConfirmed(false);
                  }}
                  className="block text-[11px] text-[#0A2E2A] font-bold underline mx-auto pt-2 hover:text-emerald-800 cursor-pointer"
                >
                  Return to Customize Options
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
