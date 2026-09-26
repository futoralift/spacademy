import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, Clock, ArrowRight, CheckCircle } from "lucide-react";

const stats = [
    { icon: Users, label: "Students", value: "1,000+", color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: BookOpen, label: "Courses", value: "250+", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Award, label: "Faculty", value: "50+", color: "text-violet-600", bg: "bg-violet-50" },
    { icon: Clock, label: "Support", value: "24/7", color: "text-blue-600", bg: "bg-blue-50" },
];

const highlights = [
    "Expert faculty & mentors",
    "Live + recorded lectures",
    "Test series & assignments",
    "Personalized learning paths",
];

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="bg-white dark:bg-gray-950 overflow-hidden relative">
            {/* Subtle background grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }} />
            {/* Gradient blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16 pb-12 md:pt-24 md:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                    {/* ── Left: Content ── */}
                    <div className="lg:col-span-6 xl:col-span-7 text-left flex flex-col items-start">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/40 mb-6">
                            <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            The Champions Academy — Premier Coaching Institute
                        </div>

                        {/* Headline */}
                        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5">
                            Learn Smarter.<br />
                            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                                Achieve More.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-lg mb-6 leading-relaxed">
                            The Champions Academy provides expert faculty, comprehensive courses, and 24/7 support to help students excel in every discipline.
                        </p>

                        {/* Highlights */}
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-8">
                            {highlights.map((h) => (
                                <li key={h} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    <CheckCircle className="size-4 text-emerald-500 flex-shrink-0" />
                                    {h}
                                </li>
                            ))}
                        </ul>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate("/dashboard")}
                                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 h-12 text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all flex items-center gap-2"
                            >
                                Enter Dashboard
                                <ArrowRight className="size-4" />
                            </Button>
                            <Button
                                onClick={() => navigate("/course")}
                                variant="outline"
                                className="cursor-pointer font-bold px-7 h-12 text-sm border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center gap-2"
                            >
                                <BookOpen className="size-4" />
                                Browse Courses
                            </Button>
                        </div>
                    </div>

                    {/* ── Right: Image + floating card ── */}
                    <div className="lg:col-span-6 xl:col-span-5 relative flex justify-center items-center">
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/10 -rotate-2" />

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/20 rotate-1 hover:rotate-0 transition-transform duration-500 w-full max-w-md">
                            <img
                                src="/images/hero_student.png"
                                alt="Student Studying at The Champions Academy"
                                className="w-full h-auto object-cover object-top"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent" />
                        </div>

                        {/* Floating stat pill */}
                        <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 px-5 py-3 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {["🧑‍🎓","👩‍🎓","👨‍🎓"].map((e, i) => (
                                    <span key={i} className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm border-2 border-white">{e}</span>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">1,000+ Students</p>
                                <p className="text-[10px] text-gray-500">joined this year</p>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                            ✓ 250+ Courses
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-sm">
                <div className="container mx-auto px-4 md:px-6 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className={`p-2 rounded-lg ${stat.bg} dark:bg-opacity-20 ${stat.color}`}>
                                        <Icon className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
