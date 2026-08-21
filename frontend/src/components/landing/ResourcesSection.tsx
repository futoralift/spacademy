import { BookOpen, Download, Play, ShieldCheck } from "lucide-react";

export default function ResourcesSection() {
  return (
    <section id="resources" className="py-20 bg-brand-bg/50 dark:bg-brand-dark/10 relative overflow-hidden border-t border-border/50">
      
      {/* Decorative floating shapes */}
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-brand-secondary/5 blur-2xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-brand-primary/5 blur-2xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Heading and Illustration */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark dark:text-white mb-6 leading-tight">
              Boost Preparation with <br />
              <span className="text-brand-primary dark:text-brand-secondary italic">Free Resources</span>
            </h2>
            <p className="font-sans text-base text-muted-foreground mb-8 max-w-lg leading-relaxed">
              We provide our students with the best environment and resources to excel in their academic journey. Empower your preparation with study materials, practice tests, and interactive content.
            </p>
            
            {/* Flat Illustration */}
            <div className="max-w-md w-full mx-auto lg:mx-0 overflow-hidden mt-2">
              <img
                src="/images/resources_reading.png"
                alt="Student reading under a lamp"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-border/60 hover:shadow-xl transition-all text-left flex flex-col items-start group">
              <div className="mb-6 rounded-2xl bg-[#EFF3F9] dark:bg-blue-950 p-4 text-[#132A53] dark:text-blue-400 group-hover:scale-105 transition-transform">
                <BookOpen className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold text-brand-dark dark:text-white mb-3">Free Mock Tests</h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Our mock tests cover full-length subject papers designed to prepare you for actual exam standards.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-border/60 hover:shadow-xl transition-all text-left flex flex-col items-start group">
              <div className="mb-6 rounded-2xl bg-[#FDF1F2] dark:bg-rose-950 p-4 text-[#E1251B] dark:text-rose-400 group-hover:scale-105 transition-transform">
                <Download className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold text-brand-dark dark:text-white mb-3">PDF Materials</h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Download high-quality question papers, model answers, and formula notes for offline study.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-border/60 hover:shadow-xl transition-all text-left flex flex-col items-start group">
              <div className="mb-6 rounded-2xl bg-[#EAF5F0] dark:bg-green-950 p-4 text-[#10B981] dark:text-green-400 group-hover:scale-105 transition-transform">
                <Play className="size-6 fill-current" />
              </div>
              <h3 className="font-sans text-lg font-bold text-brand-dark dark:text-white mb-3">Video Lectures</h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Access selective free video conceptual lectures and problem solving step-by-step videos.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-border/60 hover:shadow-xl transition-all text-left flex flex-col items-start group">
              <div className="mb-6 rounded-2xl bg-[#FBF0FC] dark:bg-purple-950 p-4 text-[#8B5CF6] dark:text-purple-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold text-brand-dark dark:text-white mb-3">All India Rank</h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Track your level with national ranks computed in real-time based on test scores and comparisons.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
