import { useState } from "react";
import { 
  Check, 
  Flame, 
  ArrowRight, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  BadgePercent,
  Globe,
  Database,
  Layers,
  Server,
  Cpu,
  Zap,
  HardDrive,
  Activity,
  CalendarCheck2,
  Building2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateEnquiryMutation, useSiteSettingsQuery } from "@/api/academyHooks";
import { cn } from "@/lib/utils";

interface PlanItem {
  id: string;
  name: string;
  badge?: string;
  badgeVariant?: "blue" | "primary" | "popular";
  price: string;
  period: string;
  discountText?: string;
  advanceBookingNote?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  ctaText: string;
  ctaVariant?: "primary" | "blue" | "outline";
}

const standardPlans: PlanItem[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    badge: "Flexible",
    badgeVariant: "primary",
    price: "₹2,000",
    period: "/ mo",
    description: "Month-to-month access to student portal, study notes & mentoring.",
    features: [
      "Student & Admin dashboard portal access",
      "Subject-wise digital notes & study PDFs",
      "Chapter-wise practice test series",
      "Weekly live doubt clearing sessions",
      "Cancel or renew anytime"
    ],
    ctaText: "Get Started Monthly",
    ctaVariant: "outline"
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    badge: "Most Popular • 50% Off",
    badgeVariant: "popular",
    price: "₹12,000",
    period: "/ yr",
    discountText: "Save ₹12,000 (₹1,000/mo)",
    description: "Complete annual package with study materials & priority mentoring.",
    features: [
      "Everything in Monthly Plan",
      "Full academic year curriculum coverage",
      "Full mock tests & past question papers",
      "1-on-1 personalized progress reports",
      "Priority doubt clearing & mentor access",
      "Certificate of program completion"
    ],
    highlight: true,
    ctaText: "Choose Yearly Plan",
    ctaVariant: "blue"
  },
  {
    id: "pre-booking",
    name: "Pre-booking Offer",
    badge: "🔥 Early Bird",
    badgeVariant: "blue",
    price: "₹10,000",
    period: "total",
    discountText: "Save extra ₹2,000 on annual plan",
    advanceBookingNote: "Advance booking charge: ₹5,000",
    description: "Reserve your seat in advance at guaranteed lowest price.",
    features: [
      "Guaranteed seat in upcoming batch",
      "Advance booking fee: ₹5,000 only",
      "Pay remainder on batch start",
      "Early-access notes & orientation kit",
      "Bonus revision masterclass access"
    ],
    ctaText: "Reserve Seat (₹5,000)",
    ctaVariant: "primary"
  }
];

const customBuildIncludes = [
  {
    icon: <Globe className="size-4 text-[#0284C7]" />,
    title: "Website & Web App",
    desc: "Complete branded website & LMS portal"
  },
  {
    icon: <Sparkles className="size-4 text-[#0284C7]" />,
    title: "Live & Recorded Lectures System",
    desc: "Dedicated video hosting & lecture streaming"
  },
  {
    icon: <Layers className="size-4 text-[#0284C7]" />,
    title: "Hosting (Enterprise-Level)",
    desc: "99.99% uptime cloud hosting"
  },
  {
    icon: <Database className="size-4 text-[#0284C7]" />,
    title: "Database Setup",
    desc: "Secure production DB with backups"
  },
  {
    icon: <Server className="size-4 text-[#0284C7]" />,
    title: "All Software Components",
    desc: "Turnkey learning & admin suite"
  },
  {
    icon: <Server className="size-4 text-[#0284C7]" />,
    title: "VPS with KVM Virtualization",
    desc: "Isolated kernel & dedicated resources"
  },
  {
    icon: <Cpu className="size-4 text-[#0284C7]" />,
    title: "2 vCPU Cores",
    desc: "High-frequency compute power"
  },
  {
    icon: <Zap className="size-4 text-[#0284C7]" />,
    title: "8 GB RAM",
    desc: "High-speed concurrent memory"
  },
  {
    icon: <HardDrive className="size-4 text-[#0284C7]" />,
    title: "100 GB NVMe Disk Space",
    desc: "Ultra-fast NVMe storage"
  },
  {
    icon: <Activity className="size-4 text-[#0284C7]" />,
    title: "8 TB Bandwidth",
    desc: "High-speed HD streaming transfer"
  }
];

const faqs = [
  {
    question: "How does the Pre-booking offer work?",
    answer: "Pay an advance booking charge of ₹5,000 now to lock in the special ₹10,000 annual package (saving ₹2,000). The remaining ₹5,000 is payable when your cohort starts."
  },
  {
    question: "What is included in the ₹55,000 Custom Build Package?",
    answer: "The package consists of: (1) Complete Portal & Website development at ₹40,000 one-time (which costs just ~₹667/month divided over 5 years / 60 months), and (2) Dedicated high-speed KVM VPS & enterprise cloud infrastructure at ₹15,000/year (~₹1,250/mo) with 2 vCPU cores, 8 GB RAM, 100 GB NVMe, and 8 TB bandwidth."
  },
  {
    question: "Can I upgrade from Monthly to Yearly later?",
    answer: "Yes, you can upgrade at any time and your remaining monthly balance is adjusted towards the annual subscription."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support UPI (GPay, PhonePe, Paytm), Net Banking, Debit/Credit Cards, and Direct Bank Transfer."
  }
];

export default function SubscriptionPage() {
  const { data: settings } = useSiteSettingsQuery();
  const createEnquiry = useCreateEnquiryMutation();

  const [selectedPlanForModal, setSelectedPlanForModal] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const academyPhone = settings?.phoneNumbers?.[0] || "+91 98818 07560";
  const sanitizedPhone = academyPhone.replace(/[^0-9]/g, "");

  const handleOpenPlanModal = (planName: string) => {
    setSelectedPlanForModal(planName);
    setFormData(prev => ({
      ...prev,
      message: `Hi, I am interested in the "${planName}". Please share enrollment and payment details.`
    }));
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }

    try {
      await createEnquiry.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        title: `Subscription Enquiry: ${selectedPlanForModal}`,
        message: formData.message
      });
      toast.success("Enquiry submitted! Our team will contact you shortly.");
      setIsSubmitted(true);
    } catch {
      toast.error("Failed to send enquiry. Please try again or reach us on WhatsApp.");
    }
  };

  const openWhatsApp = (planName?: string) => {
    const text = encodeURIComponent(
      `Hello SF Academy, I would like to inquire about the "${planName || "Subscription Plans"}". Please assist me.`
    );
    window.open(`https://wa.me/${sanitizedPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC]">
      <Navbar />

      <main className="grow py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl space-y-6">

          {/* Compact Pastel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D6E6F5] pb-4 gap-2 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-[#0284C7] text-[11px] font-bold uppercase tracking-wider font-sans">
                <span>📊 Subscription Plans</span>
              </div>
              <h1 className="font-serif text-[#16304D] text-3xl sm:text-4xl font-bold leading-tight">
                Subscription Plans
              </h1>
            </div>
            <p className="font-sans text-slate-500 text-xs max-w-sm sm:text-right">
              Choose from student subscriptions or dedicated custom infrastructure.
            </p>
          </div>

          {/* Section 1: Standard Plans */}
          <div>
            <div className="text-left mb-3 flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#0369A1] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans border border-[#BAE6FD]">
                🔹 Standard Plans
              </span>
            </div>

            {/* Compact 3 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {standardPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative text-left",
                    plan.highlight
                      ? "bg-gradient-to-b from-[#EBF5FC] to-[#DBEAFE] text-slate-800 shadow-md border-2 border-[#38BDF8]"
                      : "bg-white text-slate-800 shadow-sm border border-[#E2EEF8] hover:shadow-md hover:border-[#BAE6FD]"
                  )}
                >
                  {/* Badge & Limited Seat Indicator */}
                  <div className="flex items-center justify-between gap-1.5 mb-3">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        plan.badgeVariant === "popular"
                          ? "bg-[#0284C7] text-white font-extrabold shadow-xs"
                          : plan.badgeVariant === "blue"
                          ? "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {plan.badge}
                    </span>
                    {plan.id === "pre-booking" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Flame className="size-2.5 text-amber-500 fill-amber-500" />
                        Limited Seats
                      </span>
                    )}
                  </div>

                  {/* Plan Details */}
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-1 text-[#16304D]">
                      {plan.name}
                    </h3>
                    <p className="font-sans text-[11px] leading-relaxed mb-3 text-slate-600">
                      {plan.description}
                    </p>

                    {/* Price Block */}
                    <div className="mb-3 pb-3 border-b border-[#D8E8F5]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-sans text-3xl font-black tracking-tight text-[#0F2942]">
                          {plan.price}
                        </span>
                        <span className="font-sans text-xs font-medium text-slate-500">
                          {plan.period}
                        </span>
                      </div>

                      {/* Advance Booking Fee */}
                      {plan.advanceBookingNote && (
                        <div className="mt-1.5 flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-sans text-[11px] font-bold">
                          <CalendarCheck2 className="size-3.5 text-amber-600 shrink-0" />
                          <span>{plan.advanceBookingNote}</span>
                        </div>
                      )}

                      {plan.discountText && (
                        <div className="mt-1 text-[10px] font-semibold flex items-center gap-1 text-[#0284C7]">
                          <BadgePercent className="size-3 shrink-0" />
                          <span>{plan.discountText}</span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5 mb-5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] leading-snug">
                          <div className="size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#E0F2FE] text-[#0284C7]">
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                          <span className="text-slate-700">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      onClick={() => handleOpenPlanModal(plan.name)}
                      className={cn(
                        "w-full h-9 rounded-xl font-bold font-sans text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer",
                        plan.ctaVariant === "blue"
                          ? "bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-sm"
                          : plan.ctaVariant === "primary"
                          ? "bg-[#1E3A5F] text-white hover:bg-[#16304D]"
                          : "bg-white text-[#16304D] hover:bg-[#E0F2FE] border border-[#CBD5E1]"
                      )}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Custom Build Package (Pastel Blue Unified Card) */}
          <div>
            <div className="text-left mb-3 flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#0369A1] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans border border-[#BAE6FD]">
                🔹 Custom Build Package
              </span>
            </div>

            {/* Pastel Blue 1-Card Layout */}
            <div className="bg-gradient-to-br from-[#EAF4FC] via-[#DFEFFB] to-[#D5EAF8] text-slate-800 rounded-2xl p-5 sm:p-6 shadow-md border-2 border-[#7DD3FC] relative overflow-hidden text-left">
              {/* Top Row: Title, Specs & Price */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#BAE6FD]/80 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 text-[#0369A1] text-[10px] font-bold uppercase tracking-wider border border-[#BAE6FD] mb-1.5 shadow-2xs">
                    <Building2 className="size-3 text-[#0284C7]" />
                    <span>Dedicated Solution</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#16304D] mb-1">
                    Custom Build Package
                  </h2>
                  <p className="font-sans text-slate-600 text-xs max-w-xl">
                    Dedicated custom infrastructure, website, enterprise cloud hosting, and full software suite.
                  </p>

                  {/* Pricing Breakdown Chips */}
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-sans">
                    <div className="bg-white/90 border border-[#BAE6FD] px-2.5 py-1 rounded-lg text-slate-700 shadow-2xs">
                      <span className="font-bold text-[#0284C7]">🛠️ Portal + Website:</span> <span className="font-bold">₹40,000</span> (One-time) • <span className="font-bold text-emerald-700">₹667/mo</span> <span className="text-[10px] text-slate-500">(40k ÷ 5 yrs ÷ 12 mos)</span>
                    </div>
                    <div className="bg-white/90 border border-[#BAE6FD] px-2.5 py-1 rounded-lg text-slate-700 shadow-2xs">
                      <span className="font-bold text-[#0284C7]">⚡ Dedicated KVM VPS:</span> <span className="font-bold text-[#16304D]">₹15,000 / year</span>
                    </div>
                  </div>
                </div>

                {/* Compact Price Block */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-[#BAE6FD] text-center shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2 min-w-[170px] shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">
                      Total Package
                    </span>
                    <div className="font-sans text-2xl sm:text-3xl font-black text-[#16304D]">
                      ₹55,000
                    </div>
                    <span className="text-[10px] font-semibold text-[#0284C7] block">
                      ₹40k One-time + ₹15k/yr VPS
                    </span>
                  </div>
                  <Button
                    onClick={() => handleOpenPlanModal("Custom Build Package (₹55,000)")}
                    className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold font-sans text-xs h-8 px-4 rounded-lg shadow-xs cursor-pointer"
                  >
                    Enquire Now
                  </Button>
                </div>
              </div>

              {/* Inclusions Title */}
              <div className="pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1] mb-3">
                  <CheckCircle2 className="size-3.5 text-[#0284C7]" />
                  <span>Includes:</span>
                </div>

                {/* 3x3 Compact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {customBuildIncludes.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 hover:bg-white rounded-xl p-2.5 border border-[#CDE5F7] transition-all flex items-center gap-2.5 shadow-2xs"
                    >
                      <div className="size-7 rounded-lg bg-[#E0F2FE] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-xs text-[#16304D] leading-tight truncate">
                          {item.title}
                        </h4>
                        <p className="font-sans text-[10px] text-slate-600 leading-tight truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compact Footer Action inside Card */}
                <div className="mt-4 pt-3 border-t border-[#BAE6FD]/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <p className="text-[11px] text-slate-600 font-sans text-center sm:text-left">
                    ⚡ Turnkey deployment, custom domain setup, SSL certificate & technical handover included.
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => openWhatsApp("Custom Build Package (₹55,000)")}
                      variant="outline"
                      className="w-full sm:w-auto border-[#0284C7] text-[#0284C7] hover:bg-[#E0F2FE] font-bold text-xs h-8 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer bg-white"
                    >
                      <Send className="size-3" />
                      <span>WhatsApp</span>
                    </Button>
                    <Button
                      onClick={() => handleOpenPlanModal("Custom Build Package (₹55,000)")}
                      className="w-full sm:w-auto bg-[#16304D] hover:bg-[#0F2942] text-white font-bold text-xs h-8 px-3 rounded-lg cursor-pointer"
                    >
                      Get Custom Build
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Compact FAQ Section */}
          <div className="pt-3 border-t border-[#D6E6F5]">
            <div className="text-left mb-3">
              <span className="text-[#0284C7] text-[10px] font-bold tracking-widest uppercase font-sans mb-0.5 block">
                Got Questions?
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#16304D]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-left">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-3.5 border border-[#E2EEF8] shadow-2xs"
                >
                  <div className="flex items-start gap-2">
                    <div className="size-5 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="size-3" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-xs text-[#16304D] mb-1">
                        {faq.question}
                      </h3>
                      <p className="font-sans text-[11px] text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Plan Enquiry / Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-5 sm:p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="font-serif text-xl font-bold text-[#16304D]">
              Subscribe / Book Plan
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-slate-500">
              Selected: <strong className="text-[#0284C7]">{selectedPlanForModal}</strong>. Enter details below:
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#16304D]">
                Enquiry Received!
              </h3>
              <p className="font-sans text-xs text-slate-600 max-w-xs mx-auto">
                Thank you! Our coordinator will contact you shortly to complete the enrollment.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-6 h-9 rounded-xl text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleModalSubmit} className="space-y-3 pt-1 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">
                  Full Name*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98818 07560"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 font-sans">
                  Message
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]/40 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openWhatsApp(selectedPlanForModal || undefined)}
                  className="w-1/2 border-[#0284C7] text-[#0284C7] hover:bg-[#E0F2FE] font-bold text-xs h-9 rounded-lg flex items-center justify-center gap-1 cursor-pointer bg-white"
                >
                  <Send className="size-3" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  type="submit"
                  disabled={createEnquiry.isPending}
                  className="w-1/2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs h-9 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{createEnquiry.isPending ? "Submitting..." : "Submit Enquiry"}</span>
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <HomeFooter />
    </div>
  );
}
