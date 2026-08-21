import { useSiteSettingsQuery } from "@/api/academyHooks";
import { ExternalLink } from "lucide-react";

export default function MapSection() {
    const { data: settings } = useSiteSettingsQuery();
    
    const address = settings?.address || "123, Academic Plaza, Education Lane, Pune, Maharashtra - 411001";
    const email = settings?.email || "contact@sfacademy.com";
    const phoneNumbers = settings?.phoneNumbers?.length ? settings.phoneNumbers : [];
    const latitude = settings?.latitude || 18.52489;
    const longitude = settings?.longitude || 73.789035;

    // Use simple embed URL format for coordinates
    const mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

    return (
        <section id="contact" className="py-20 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="w-full lg:w-1/2 text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Come Visit <span className="text-primary italic">Our Campus</span></h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Experience our state-of-the-art facilities and meet our expert faculty in person. We are located in the heart of the city, easily accessible by all major transport.
                        </p>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg mb-1">Our Address:</span>
                                <span className="text-muted-foreground">{address}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg mb-1">Email Us:</span>
                                <span className="text-muted-foreground">{email}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-lg mb-1">Call Us:</span>
                                {phoneNumbers.map((phone, idx) => (
                                    <span key={idx} className="text-muted-foreground">{phone}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 h-100 overflow-hidden hover:scale-[1.01] transition-all duration-100 rounded-xl relative group">
                        <iframe
                            title="SF Academy Location"
                            src={mapSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        <div className="absolute top-4 right-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-all font-bold text-sm text-primary flex items-center gap-2 border border-slate-200"
                            >
                                <ExternalLink className="size-4" />
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
