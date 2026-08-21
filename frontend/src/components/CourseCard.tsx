import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Star, Users, Beaker, ArrowRight } from "lucide-react";
import { getFileUrl } from "@/api/http";
import { formatCurrency } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  image?: string;
  mode?: string;
  duration?: string;
  rating?: string;
  reviews?: string;
  standards?: string[];
  students?: string;
  index?: number;
}

export default function CourseCard(course: CourseCardProps) {
  const index = course.index ?? 0;

  // Resolve properties to match the exact mockup items based on name/id/index
  let category = "Science";
  let subtitle = "Class 10 | Online";
  let rating = "4.8";
  let students = "2.5k+";
  let duration = "6 Months";
  let cardImage = "/images/course_science_hallway.png";
  let isScienceOrChemistry = true; // category icon type

  if (
    course.name.toLowerCase().includes("icse") || 
    course.name.toLowerCase().includes("cbse") || 
    course.id.includes("icse") || 
    course.id.includes("cbse") ||
    index % 3 === 1
  ) {
    category = "ICSE & CBSE";
    subtitle = "Class 8, 9, 10 | Online";
    rating = "4.8";
    students = "1.3k+";
    duration = "2 Months";
    cardImage = "/images/course_ink_smoke.png";
    isScienceOrChemistry = false;
  } else if (
    course.name.toLowerCase().includes("chemistry") || 
    course.id.includes("chemistry") ||
    index % 3 === 2
  ) {
    category = "Chemistry";
    subtitle = "Class 11 | Online";
    rating = "4.9";
    students = "500+";
    duration = "4 Months";
    cardImage = "/images/course_balloons.png";
    isScienceOrChemistry = true;
  }

  // Use the image from course if it exists and is custom
  const resolvedImage = course.image && !course.image.includes("course_thumb") && !course.image.includes("banner")
    ? (course.image.startsWith("/") ? course.image : getFileUrl(course.image))
    : cardImage;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-slate-100 dark:border-slate-800/80 flex flex-col h-full group text-left">
      {/* Image Section with Overlay Tag */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={resolvedImage}
          alt={course.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border border-white/25 px-4 py-1.5 rounded-full flex items-center gap-2 font-sans text-xs font-semibold z-10 shadow-sm">
          {isScienceOrChemistry ? (
            <Beaker className="size-3.5" />
          ) : (
            <Clock className="size-3.5" />
          )}
          <span>{category}</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-8 grow flex flex-col justify-between">
        <div>
          {/* Title & Subtitle */}
          <h3 className="font-serif text-2xl font-bold text-brand-dark dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors mb-1 line-clamp-1">
            {course.name}
          </h3>
          <p className="font-sans text-sm text-muted-foreground mb-6 font-medium">
            {subtitle}
          </p>

          {/* Metric Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mb-8">
            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-[#f0f4f9] dark:bg-slate-800 text-brand-primary dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <Star className="size-3.5 fill-[#1f3563] text-[#1f3563] dark:fill-slate-200 dark:text-slate-200" />
              <span>{rating}</span>
            </div>

            {/* Students */}
            <div className="flex items-center gap-1.5 bg-[#f0f4f9] dark:bg-slate-800 text-brand-primary dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <Users className="size-3.5 text-[#1f3563] dark:text-slate-200" />
              <span>{students}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5 bg-[#f0f4f9] dark:bg-slate-800 text-brand-primary dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="size-3.5 text-[#1f3563] dark:text-slate-200" />
              <span>{duration}</span>
            </div>
          </div>
        </div>

        {/* Footer (Price & CTA Button) */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <span className="font-sans text-xl font-bold text-[#0B2240] dark:text-white">
            {formatCurrency(course.amount, course.currency || "INR")}
          </span>

          <Link to={`/course/${course.id}`}>
            <Button className="cursor-pointer bg-[#1f3563] hover:bg-[#152547] text-white font-sans text-xs font-bold px-5 py-2.5 h-10 rounded-xl transition-all shadow-sm flex items-center gap-1">
              Enroll Now <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

