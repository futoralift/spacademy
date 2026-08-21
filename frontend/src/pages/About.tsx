import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Target,
  Users,
  ShieldCheck,
  BookOpenCheck,
  Lightbulb,
  Award
} from "lucide-react";

export default function AboutPage() {
  const storyPoints = [
    {
      title: "18+ Years of Excellence",
      desc: "Years of teaching experience with a passion for student success.",
      icon: <GraduationCap className="size-5 text-brand-secondary" />
    },
    {
      title: "Concept Clarity",
      desc: "Focus on understanding concepts, not memorizing answers.",
      icon: <BookOpen className="size-5 text-brand-secondary" />
    },
    {
      title: "Step by step Learning",
      desc: "Topic explained in a simple and structured manner.",
      icon: <TrendingUp className="size-5 text-brand-secondary" />
    },
    {
      title: "Guided Practice",
      desc: "Regular practice and assessments to build fundamentals.",
      icon: <Target className="size-5 text-brand-secondary" />
    }
  ];

  const pillars = [
    {
      title: "Integrity",
      desc: "We maintain the highest ethical standards in all our academic and professional practices.",
      icon: <ShieldCheck className="size-6 text-brand-primary" />,
      accentColor: "border-b-brand-primary",
      iconBg: "bg-brand-primary"
    },
    {
      title: "Innovation",
      desc: "Constantly evolving our teaching methods to stay ahead in a changing educational landscape.",
      icon: <Lightbulb className="size-6 text-brand-secondary" />,
      accentColor: "border-b-[#c59d56]",
      iconBg: "bg-amber-50"
    },
    {
      title: "Excellence",
      desc: "Striving for nothing less than perfection in our curriculum and student outcomes.",
      icon: <Award className="size-6 text-purple-600" />,
      accentColor: "border-b-purple-500",
      iconBg: "bg-purple-50"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="grow">
        {/* Section 1: The Story */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

              {/* Left Column: Text & Bullet Cards */}
              <div className="lg:col-span-7 text-left">
                <span className="text-brand-secondary text-xs font-bold tracking-widest mb-3 block uppercase font-sans">
                  The Story
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0B2240] mb-6 leading-tight">
                  A Tradition of Educational Excellence
                </h2>

                <p className="font-sans text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                  SF Academy is a student-focused educational institute committed to building strong conceptual foundations in Mathematics and Science.
                </p>
                <p className="font-sans text-muted-foreground text-sm md:text-base leading-relaxed mb-10">
                  Established in 2013, the academy has been guiding students with a clear philosophy that real learning happens when students truly understand concepts rather than memorizing answers.
                </p>

                {/* Point cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {storyPoints.map((pt, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-[#fbfbfa] border border-slate-100 hover:shadow-md transition-shadow duration-300">
                      <div className="size-10 rounded-full bg-[#f6f3eb] flex items-center justify-center shrink-0">
                        {pt.icon}
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#0B2240] mb-1">
                          {pt.title}
                        </h4>
                        <p className="font-sans text-muted-foreground text-xs leading-normal">
                          {pt.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Image with organic behind shapes */}
              <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                <div className="relative mx-auto max-w-sm lg:max-w-none">
                  {/* Dark navy semi-circle top-left */}
                  <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#0B2240] rounded-tl-full -z-10" />

                  {/* Yellow/Gold circle bottom-right */}
                  <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-[#c59d56] rounded-full opacity-90 -z-10" />

                  {/* Main Portrait Student Image */}
                  <img
                    src="/images/about_students.png"
                    alt="Students studying at table"
                    className="rounded-[2rem] shadow-2xl w-full aspect-[4/5] object-cover relative z-10 border border-slate-200"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Navy Metrics Bar */}
        <section className="bg-[#0B2240] text-white py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-center">

              {/* Stat 1 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left px-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="size-6 text-[#c59d56]" />
                  <span className="text-3xl font-bold font-sans">18+</span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide">
                  Years of Teaching Experience
                </p>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left px-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="size-6 text-brand-secondary" />
                  <span className="text-lg font-bold font-sans">Student Focused</span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide">
                  Individual Attention & Care
                </p>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left px-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpenCheck className="size-6 text-brand-secondary" />
                  <span className="text-lg font-bold font-sans">ICSE & CBSE Curriculum</span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide">
                  Specialized Guidance in Math & Science
                </p>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left px-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="size-6 text-brand-secondary" />
                  <span className="text-lg font-bold font-sans">Better Result</span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide">
                  Strong Fundamentals for Lifelong Success
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: Core Pillars */}
        <section className="py-24 bg-brand-bg dark:bg-slate-900/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-brand-secondary text-xs font-bold tracking-widest mb-3 block uppercase font-sans">
                Core Pillars
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                Values That Drive Us
              </h2>
              <p className="font-sans text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
                Our values are the foundation of everything we do. They guide our interactions with students, parents, and the community.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 border-b-4 ${pillar.accentColor} relative overflow-hidden text-left flex flex-col min-h-[250px]`}
                >
                  {/* Icon */}
                  <div className={`size-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-8 shadow-sm`}>
                    {pillar.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold text-brand-dark mb-4">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-6">
                    {pillar.desc}
                  </p>

                  {/* Dotted Grid Pattern at bottom-left */}
                  <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-1 opacity-10 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="size-1 rounded-full bg-brand-dark" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
