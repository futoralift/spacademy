import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTestimonialsQuery } from "@/api/academyHooks";
import { getFileUrl } from "@/api/http";

const staticTestimonials = [
  {
    studentName: "Abhishek Kadam",
    courseName: "NEET 2023 - Score 685",
    content: "The conceptual clarity I got at The Champions Academy was unparalleled. The faculty really takes the time to ensure every student understands the core principles before moving to advanced problems.",
    avatar: "/images/faculty1.png",
  },
  {
    studentName: "Pravakar Mohanty",
    courseName: "NEET-UG AIR 45",
    content: "Whenever I study, I get to the depth to clear my conceptual foundation. The faculty really takes the time to clarify every student's doubt and teach the core concepts before moving to advanced problems.",
    avatar: "/images/faculty2.png",
  },
];

export default function TestimonialSection() {
  const { data } = useTestimonialsQuery({ limit: 10 });
  const liveTestimonials = data?.data.filter(t => t.isActive) || [];

  const displayTestimonials = liveTestimonials.length > 0
    ? liveTestimonials.map(t => ({
      studentName: t.studentName,
      courseName: t.courseName || "General Student",
      content: t.content,
      avatar: getFileUrl(t.avatar || "")
    }))
    : staticTestimonials;

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayTestimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === displayTestimonials.length - 1 ? 0 : prev + 1));
  };

  const current = displayTestimonials[currentIndex];

  if (!current) return null;

  return (
    <section id="testimonials" className="py-20 bg-brand-bg dark:bg-brand-dark/5 overflow-hidden relative border-t border-border/50">
      <div className="container mx-auto px-4 md:px-8">

        {/* Testimonial Box */}
        <div className="relative w-full mx-auto bg-brand-dark rounded-[2rem] p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-center items-center">

          {/* Top-Right Accent (Slate Inner, Yellow Outer) */}
          <svg className="absolute top-0 right-0 size-24 pointer-events-none" viewBox="0 0 100 100" fill="none">
            <line x1="60" y1="0" x2="100" y2="40" stroke="#475569" strokeWidth="4" />
            <line x1="75" y1="0" x2="100" y2="25" stroke="#F1C40F" strokeWidth="4" />
          </svg>

          {/* Bottom-Left Accent (Slate Inner, Yellow Outer) */}
          <svg className="absolute bottom-0 left-0 size-24 pointer-events-none" viewBox="0 0 100 100" fill="none">
            <line x1="0" y1="60" x2="40" y2="100" stroke="#475569" strokeWidth="4" />
            <line x1="0" y1="75" x2="25" y2="100" stroke="#F1C40F" strokeWidth="4" />
          </svg>

          {/* Quote Icon */}
          <div className="text-9xl text-[#F1C40F] font-serif leading-none">
            “
          </div>

          {/* Review Text */}
          <p className="font-serif text-xl sm:text-2xl md:text-3xl leading-relaxed italic max-w-3xl text-slate-100 mb-10 relative z-10 select-none">
            ""{current.content}""
          </p>

          {/* Student Profile Info */}
          <div className="flex flex-col items-center mt-auto relative z-10">
            <Avatar className="size-16 border-2 border-slate-700/50 mb-4">
              <AvatarImage
                src={current.avatar}
                alt={current.studentName}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-700 text-white">{current.studentName[0]}</AvatarFallback>
            </Avatar>
            <h4 className="font-sans font-bold text-lg text-[#F1C40F] tracking-wide select-none">
              {current.studentName}
            </h4>
            <p className="font-sans text-xs text-slate-400 uppercase tracking-widest mt-2 select-none">
              {current.courseName}
            </p>
          </div>

          {/* Thin Arrow Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white transition-all select-none hidden sm:block"
          >
            <svg className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white transition-all select-none hidden sm:block"
          >
            <svg className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Small screen navigation dots */}
        <div className="flex justify-center gap-2 mt-6 sm:hidden">
          {displayTestimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? "bg-brand-primary w-6" : "bg-muted-foreground/30"
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
