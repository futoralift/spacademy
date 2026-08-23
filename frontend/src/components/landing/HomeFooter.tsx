import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { useSiteSettingsQuery, useCoursesQuery } from "@/api/academyHooks";

const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", href: "/" },
      { name: "Courses", href: "/course" },
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Subscription Plans", href: "/subscription" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
];

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSiteSettingsQuery();
  const { data: coursesData } = useCoursesQuery();

  const courses = coursesData?.filter(c => c.isActive).slice(0, 4) || [];

  const allFooterLinks = [
    ...footerLinks,
    {
      title: "Our Courses",
      links: courses.length > 0
        ? courses.map(course => ({
          name: course.name,
          href: `/course/${course.id}`
        }))
        : [
          { name: "Science & Mathematics", href: "/course" },
          { name: "IELTS & TOEFL Coaching", href: "/course" },
          { name: "University Class", href: "/course" }
        ]
    }
  ];

  const address = settings?.address || "123, Education Plaza, Pune, Maharashtra - 411001";
  const phone = settings?.phoneNumbers?.[0] || "";
  const email = settings?.email || "contact@sfacademy.com";

  return (
    <footer className="bg-[#0B2240] text-slate-300 pt-20 pb-10 relative overflow-hidden text-left">

      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Logo & Description Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="SF Academy Logo" className="h-11 w-11 rounded-full object-cover shadow-lg" />
              <span className="font-sans font-bold text-base text-white tracking-wide">SF Academy</span>
            </Link>

            <p className="font-sans text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering the next generation of scholars with high-quality, concept-based education and personalized mentoring.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="p-2.5 rounded-full border border-slate-700/60 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all">
                <FaLinkedinIn className="size-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full border border-slate-700/60 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all">
                <FaYoutube className="size-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full border border-slate-700/60 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all">
                <FaXTwitter className="size-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full border border-slate-700/60 hover:bg-brand-primary hover:text-white hover:border-transparent transition-all">
                <FaFacebookF className="size-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 text-left">
            {allFooterLinks.map((section) => (
              <div key={section.title} className="flex flex-col gap-6">
                <h4 className="font-sans text-base font-bold text-white tracking-wider uppercase">{section.title}</h4>
                <nav className="flex flex-col gap-3.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="font-sans text-sm text-slate-400 hover:text-[#C79F75] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left">
            <h4 className="font-sans text-base font-bold text-white tracking-wider uppercase">Contact Info</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <Phone className="size-4 text-[#C79F75] shrink-0 mt-0.5" />
                <a href={`tel:${phone}`} className="hover:text-[#C79F75] transition-colors">{phone}</a>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <Mail className="size-4 text-[#C79F75] shrink-0 mt-0.5" />
                <a href={`mailto:${email}`} className="hover:text-[#C79F75] transition-colors">{email}</a>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400 leading-snug">
                <MapPin className="size-4 text-[#C79F75] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800/80 container mx-auto px-4 md:px-8 py-6 mt-8 flex justify-center items-center text-xs text-slate-500">
        <p>© {currentYear} SF Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
