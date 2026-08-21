import { useCoursesQuery } from "@/api/academyHooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";

const defaultCourses = [
  {
    id: "science-masterclass",
    name: "Science Masterclass",
    amount: 5000,
    currency: "INR",
    image: "/images/course_science_hallway.png"
  },
  {
    id: "icse-cbse-coaching",
    name: "ICSE & CBSE Coaching",
    amount: 99,
    currency: "INR",
    image: "/images/course_ink_smoke.png"
  },
  {
    id: "chemistry-class",
    name: "Chemistry Class",
    amount: 1000,
    currency: "INR",
    image: "/images/course_balloons.png"
  }
];

export default function CourseSection() {
  const { data: courses, isLoading, isError } = useCoursesQuery();

  const displayCourses = courses && courses.length > 0
    ? courses.slice(0, 3)
    : defaultCourses;

  if (isError) return null;

  return (
    <section id="courses" className="py-24 bg-brand-bg dark:bg-brand-dark/5">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark dark:text-white mb-4">
            Our Popular Courses
          </h2>
          <p className="font-sans text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Choose from a wide range of courses designed by experts to help you achieve your career goals.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-border/60 flex flex-col h-full">
                <Skeleton className="aspect-4/3 w-full" />
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
          ) : (
            displayCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.name}
                amount={course.amount}
                currency={course.currency || "INR"}
                image={course.image}
                index={index}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link to="/course">
            <Button variant="outline" className="cursor-pointer font-sans text-sm font-bold border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 h-12 transition-all rounded-xl">
              View All Courses
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
