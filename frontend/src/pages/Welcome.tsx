import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CourseSection from "@/components/landing/CourseSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ResourcesSection from "@/components/landing/ResourcesSection";
import BlogSection from "@/components/landing/BlogSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import HomeFooter from "@/components/landing/HomeFooter";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

export default function WelcomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. Header/Navbar */}
            <Navbar />
            <main className="grow">
                {/* 2. Dynamic poster */}

                {/* 3. Quick intro / Hero section */}
                <HeroSection />

                {/* 4. Courses */}
                <CourseSection />

                {/* 5. Features */}
                <FeaturesSection />

                {/* 6. Free Test series and resources */}
                <ResourcesSection />

                {/* 7. Testimonial */}
                <TestimonialSection />

                {/* 8. Blogs */}
                <BlogSection />
            </main>
            <WhatsAppButton />
            {/* 9. Footer */}
            <HomeFooter />
        </div>
    );
}