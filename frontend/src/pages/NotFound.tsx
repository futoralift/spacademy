import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { BlurFade } from "@/components/animation/blur-fade";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="grow flex items-center justify-center py-20 px-4 mt-16 lg:mt-0">
        <div className="container max-w-4xl mx-auto text-center">
            
          <BlurFade delay={0.1}>
            <div className="relative inline-block mb-8">
              <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-muted/90 select-none">
                4 {"_"} 4
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-primary/10 p-4 md:p-8 rounded-full animate-bounce duration-1000">
                    <Search className="size-16 md:size-24 text-primary" strokeWidth={3} />
                 </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Oops! This page is <span className="text-primary italic">missing</span>
            </h2>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Looks like you've wandered into some unknown territory. The page you are looking for might have been moved, deleted, or never existed in the first place.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="cursor-pointer h-14 px-8 text-base font-bold rounded-2xl gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                <Link to="/">
                  <Home className="size-5" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="cursor-pointer h-14 px-8 text-base font-bold rounded-2xl gap-2 hover:bg-muted/50 transition-all" onClick={() => window.history.back()}>
                <button>
                  <ArrowLeft className="size-5" />
                  Go Back
                </button>
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={0.5}>
            <div className="mt-20 pt-10 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-8">
               <div className="text-left p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <h4 className="font-bold mb-2">Popular Links</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground font-medium">
                    <li><Link to="/course" className="hover:text-primary transition-colors">• Our Courses</Link></li>
                    <li><Link to="/blog" className="hover:text-primary transition-colors">• Latest Blogs</Link></li>
                    <li><Link to="/about" className="hover:text-primary transition-colors">• About Academy</Link></li>
                  </ul>
               </div>
               <div className="text-left p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <h4 className="font-bold mb-2">Need Help?</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground font-medium">
                    <li><Link to="/contact" className="hover:text-primary transition-colors">• Contact Support</Link></li>
                    {/* <li><button className="hover:text-primary transition-colors">• FAQs</button></li> */}
                  </ul>
               </div>
               <div className="text-left p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <h4 className="font-bold mb-2">Quick Access</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground font-medium">
                    <li><Link to="/login" className="hover:text-primary transition-colors">• Student Login</Link></li>
                    <li><Link to="/signup" className="hover:text-primary transition-colors">• Join Us</Link></li>
                  </ul>
               </div>
            </div>
          </BlurFade>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
