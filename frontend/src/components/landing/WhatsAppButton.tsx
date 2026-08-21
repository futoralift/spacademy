"use client";

import { BsWhatsapp } from "react-icons/bs";
import { motion } from "motion/react";

import { useSiteSettingsQuery } from "@/api/academyHooks";

export default function WhatsAppButton() {
    const { data: settings } = useSiteSettingsQuery();
    const rawPhone = settings?.phoneNumbers?.[0] || "919881807560";
    const whatsappNumber = rawPhone.replace(/[^0-9]/g, "");

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-100"
        >
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex items-center justify-center md:size-14 size-12 rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-90 transition-all duration-300 group relative"
            >
                <BsWhatsapp className="relative z-10 md:size-7 size-5" />

                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:opacity-40"></div>

                {/* Tooltip */}
                <span className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Chat with us
                </span>
            </a>
        </motion.div>
    );
}
