import { useState } from "react";
import { useCoursesQuery } from "@/api/academyHooks";
import CourseCard from "@/components/CourseCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";

const defaultCourses = [
  {
    id: "science-masterclass-1",
    name: "Science Masterclass",
    amount: 5000,
    currency: "INR",
    image: "/images/course_science_hallway.png"
  },
  {
    id: "icse-cbse-coaching-1",
    name: "ICSE & CBSE Coaching",
    amount: 99,
    currency: "INR",
    image: "/images/course_ink_smoke.png"
  },
  {
    id: "chemistry-class-1",
    name: "Chemistry Class",
    amount: 1000,
    currency: "INR",
    image: "/images/course_balloons.png"
  },
  {
    id: "science-masterclass-2",
    name: "Science Masterclass",
    amount: 5000,
    currency: "INR",
    image: "/images/course_science_hallway.png"
  },
  {
    id: "icse-cbse-coaching-2",
    name: "ICSE & CBSE Coaching",
    amount: 99,
    currency: "INR",
    image: "/images/course_ink_smoke.png"
  },
  {
    id: "chemistry-class-2",
    name: "Chemistry Class",
    amount: 1000,
    currency: "INR",
    image: "/images/course_balloons.png"
  }
];

const tabs = ["All", "Science", "ICSE", "CBSE"];

export default function CoursePage() {
  const { data: courses, isLoading, isError } = useCoursesQuery();
  const [activeTab, setActiveTab] = useState("All");

  const baseCourses = courses && courses.length > 0 ? courses : defaultCourses;

  // Decorate backend data so it maps to the correct number of items (at least 6 for visual match)
  const displayCourses = baseCourses.length < 6 
    ? [...baseCourses, ...defaultCourses.slice(baseCourses.length, 6)].map((c, idx) => ({ ...c, idx }))
    : baseCourses.map((c, idx) => ({ ...c, idx }));

  const filteredCourses = displayCourses.filter(course => {
    if (activeTab === "All") return true;
    const nameLower = course.name.toLowerCase();
    if (activeTab === "Science") {
      return nameLower.includes("science") || nameLower.includes("chemistry");
    }
    if (activeTab === "ICSE") {
      return nameLower.includes("icse") || nameLower.includes("coaching");
    }
    if (activeTab === "CBSE") {
      return nameLower.includes("cbse") || nameLower.includes("coaching");
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="grow py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Page Header (Courses Title + Right Tabs Filter) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8 mb-16 gap-6">
            <h1 className="font-serif text-[#0B2240] text-5xl md:text-6xl font-bold text-left">
              Courses
            </h1>

            {/* Tabs Filter */}
            <div className="flex flex-wrap items-center gap-1 bg-[#f0f4f9]/40 p-1.5 rounded-xl border border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#1f3563] text-white shadow-sm"
                      : "text-muted-foreground hover:text-[#0B2240] hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-8 grow flex flex-col">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <Skeleton className="h-8 w-full rounded-xl mb-4" />
                    <div className="mt-auto pt-6 border-t border-border flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-10 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-2xl font-bold text-red-500 mb-2 font-serif">Oops! Something went wrong</h3>
                <p className="text-muted-foreground font-sans">We couldn't load the courses. Please try again later.</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  id={course.id}
                  name={course.name}
                  amount={course.amount}
                  currency={course.currency || "INR"}
                  image={course.image}
                  index={course.idx}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-2xl font-bold mb-2 font-serif">No Courses Found</h3>
                <p className="text-muted-foreground font-sans">No matches found for your selection. Check back later!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
