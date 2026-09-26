import { BookOpen, Calendar, Users, Award } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="size-6 text-[#132A53]" />,
    title: "Personalized Attention",
    description: [
      "SSC Board, CBSE Board",
      "Maths & Science syllabus",
      "Dedicated doubt sessions"
    ],
    bgColor: "bg-[#EFF3F9] dark:bg-blue-950/20",
    iconBg: "bg-white dark:bg-blue-900/40",
  },
  {
    icon: <Calendar className="size-6 text-[#E1251B]" />,
    title: "Flexible Schedule",
    description: [
      "Online & offline options",
      "Recorded lecture access",
      "Flexible study hours"
    ],
    bgColor: "bg-[#FDF1F2] dark:bg-rose-950/20",
    iconBg: "bg-white dark:bg-rose-900/40",
  },
  {
    icon: <Users className="size-6 text-[#10B981]" />,
    title: "Expert Faculty",
    description: [
      "Experienced educators",
      "Weekly test sessions",
      "Parent-teacher meetings"
    ],
    bgColor: "bg-[#EAF5F0] dark:bg-green-950/20",
    iconBg: "bg-white dark:bg-green-900/40",
  },
  {
    icon: <Award className="size-6 text-[#8B5CF6]" />,
    title: "Proven Results",
    description: [
      "High success rate",
      "Complete curriculum",
      "Standardized study rhythm"
    ],
    bgColor: "bg-[#FBF0FC] dark:bg-purple-950/20",
    iconBg: "bg-white dark:bg-purple-900/40",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-brand-bg dark:bg-brand-dark/5 relative overflow-hidden text-foreground">
      
      {/* Decorative polygon background shapes */}
      <div className="absolute top-1/4 -left-12 w-24 h-24 bg-slate-300/20 rounded-lg transform rotate-45 pointer-events-none" />
      <div className="absolute bottom-12 right-20 w-32 h-32 bg-slate-300/10 rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-brand-secondary block mb-3">Why Choose Us</span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-dark dark:text-white">
            Exceptional Features of <br />
            <span className="text-brand-primary dark:text-brand-secondary italic">The Champions Academy</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col p-8 rounded-[2rem] border-none ${feature.bgColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group text-left`}
            >
              {/* Icon Container */}
              <div className={`mb-6 rounded-2xl ${feature.iconBg} p-4 w-fit shadow-sm`}>
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-sans text-xl font-bold text-brand-dark dark:text-white mb-4">
                {feature.title}
              </h3>
              
              {/* Bullet list */}
              <ul className="space-y-2 mt-2">
                {feature.description.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
                    <div className="size-1.5 bg-brand-primary/50 dark:bg-brand-secondary rounded-full shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
