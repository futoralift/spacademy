import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import { Button } from "@/components/ui/button.tsx";
import { useCreateEnquiryMutation, useSiteSettingsQuery } from "@/api/academyHooks.ts";
import type { EnquiryRequest } from "@/api/types.ts";

export default function ContactPage() {
  const { data: settings } = useSiteSettingsQuery();
  const createEnquiry = useCreateEnquiryMutation();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState<EnquiryRequest>({
    fullName: "",
    email: "",
    phone: "",
    title: "",
    message: ""
  });

  const contactDetails = [
    {
      label: "ADDRESS",
      value: settings?.address || "Maruti Apt Near Karishma Chowk, Kothrud, Pune",
      icon: <MapPin className="size-6 text-brand-primary" />
    },
    {
      label: "CALL US",
      value: settings?.phoneNumbers?.[0] || "+91 98818 07560",
      icon: <Phone className="size-6 text-brand-primary" />
    },
    {
      label: "TIMING",
      value: settings?.workingHours || "MON - FRI 9:00 - 3:00",
      icon: <Clock className="size-6 text-brand-primary" />
    },
    {
      label: "EMAIL US",
      value: settings?.email || "sfacademy@gmail.com",
      icon: <Mail className="size-6 text-brand-primary" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    try {
      await createEnquiry.mutateAsync(formData);
      toast.success("Enquiry sent successfully!");
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        title: "",
        message: ""
      });
      setAgreedToTerms(false);
    } catch {
      toast.error("Failed to send enquiry. Please try again later.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <main className="grow">
        {/* Wavy Header Section */}
        <section className="bg-[#ECEFF2] dark:bg-slate-900/40 rounded-b-[3.5rem] md:rounded-b-[6rem] py-16 px-4 mb-16 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="container mx-auto max-w-2xl relative z-10">
            <h1 className="font-serif text-brand-dark text-5xl md:text-6xl font-bold mb-4">
              Let's Contact
            </h1>
            <p className="font-sans text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              Have questions about our programs, admissions, or test series? Our team is here to help you every step of the way.
            </p>
          </div>
        </section>

        {/* Contact Content: Two Column Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              
              {/* Left Column: Vertical White Info Cards */}
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                {contactDetails.map((detail, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-6 md:p-7 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-center gap-6 text-left"
                  >
                    <div className="size-14 rounded-full bg-[#f0f4f9] flex items-center justify-center shrink-0">
                      {detail.icon}
                    </div>
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] font-bold text-slate-400 tracking-wider block">
                        {detail.label}
                      </span>
                      <p className="font-sans text-sm md:text-base font-bold text-brand-dark leading-snug">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Gold Contact Form Card */}
              <div className="lg:col-span-7">
                <div className="bg-brand-secondary rounded-[2.5rem] p-8 md:p-12 shadow-lg text-left relative overflow-hidden h-full flex flex-col justify-center">
                  <span className="font-sans text-[10px] font-bold text-white/85 tracking-widest uppercase mb-1 block">
                    CONTACT US
                  </span>
                  <h2 className="font-serif text-white text-3xl font-bold mb-8">
                    Get in Touch
                  </h2>

                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 text-white">
                      <div className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
                        <CheckCircle2 className="size-10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-serif">Message Sent!</h3>
                        <p className="font-sans text-white/90 text-sm max-w-md leading-relaxed">
                          Thank you for reaching out. Our team will contact you shortly on your email or phone.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSubmitted(false)}
                        className="h-11 rounded-xl px-8 border-white/50 text-white bg-transparent hover:bg-white hover:text-brand-secondary cursor-pointer"
                      >
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name Input */}
                        <div>
                          <label className="text-white/95 font-sans font-semibold text-xs mb-2 block">
                            Full Name*
                          </label>
                          <input 
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Name"
                            className="bg-brand-bg/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                            required
                          />
                        </div>

                        {/* Phone Input */}
                        <div>
                          <label className="text-white/95 font-sans font-semibold text-xs mb-2 block">
                            Phone Number*
                          </label>
                          <input 
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Phone"
                            className="bg-[#FAF7F2]/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                            required
                          />
                        </div>

                        {/* Email Input */}
                        <div>
                          <label className="text-white/95 font-sans font-semibold text-xs mb-2 block">
                            Email Address*
                          </label>
                          <input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="bg-[#FAF7F2]/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                            required
                          />
                        </div>

                        {/* Subject Input */}
                        <div>
                          <label className="text-white/95 font-sans font-semibold text-xs mb-2 block">
                            Subject*
                          </label>
                          <input 
                            type="text"
                            name="title"
                            value={formData.title ?? ""}
                            onChange={handleInputChange}
                            placeholder="Subject"
                            className="bg-[#FAF7F2]/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                            required
                          />
                        </div>
                      </div>

                      {/* Message Textarea */}
                      <div>
                        <label className="text-white/95 font-sans font-semibold text-xs mb-2 block">
                          Message*
                        </label>
                        <textarea 
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Message"
                          className="bg-[#FAF7F2]/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 rounded-xl px-4 py-3 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none w-full"
                          required
                        />
                      </div>

                      {/* Checkbox for terms */}
                      <div className="flex items-center gap-3 py-1">
                        <input 
                          type="checkbox"
                          id="terms"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="size-4 border-white/30 rounded accent-[#1f3563] cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-white/90 text-xs font-sans cursor-pointer">
                          I agree to the Terms and Conditions.
                        </label>
                      </div>

                      {/* Submit button */}
                      <button 
                        type="submit" 
                        disabled={createEnquiry.isPending}
                        className="border border-white/40 text-white font-sans text-sm font-bold py-3.5 px-6 rounded-xl hover:bg-white hover:text-[#c59d56] transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
                      >
                        {createEnquiry.isPending ? "Sending..." : "Send Message"}
                        <Send className="size-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Google Map Frame */}
            <div className="w-full h-[400px] rounded-[2rem] overflow-hidden shadow-md border border-slate-100 mt-20 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.376822830889!2d73.8188172!3d18.5118749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bfa0f4df210b%3A0xc3f510862029e855!2sKarishma%20Society%2C%20Kothrud%2C%20Pune%2C%20Maharashtra%20411038!5e0!3m2!1sen!2sin!4v1718617800000!5m2!1sen!2sin" 
                className="absolute inset-0 w-full h-full border-0 grayscale-[0.1] hover:grayscale-0 transition-all duration-700"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Academy Location Map"
              />
            </div>

          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
