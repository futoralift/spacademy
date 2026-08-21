const faculty = [
  {
    name: "Dr. Sandeep Deshmukh",
    role: "Physics Mentor",
    education: "Ph.D. in Physics, IISc Bangalore",
    image: "/images/mentor_sandeep.png",
  },
  {
    name: "Dr. Dinesh Sharma",
    role: "Chemistry Mentor",
    education: "M.Tech Chemical Engineering, IIT Bombay",
    image: "/images/mentor_dinesh.png",
  },
  {
    name: "Prof. Sarah Taylor",
    role: "Verbal & English Mentor",
    education: "M.A. English Literature, Oxford University",
    image: "/images/mentor_sarah.png",
  },
  {
    name: "Prof. Anil Patil",
    role: "Mathematics Mentor",
    education: "M.Sc. Applied Mathematics, IIT Kharagpur",
    image: "/images/mentor_anil.png",
  }
];

export default function FacultySection() {
  return (
    <section id="faculty" className="py-20 bg-brand-bg/30 dark:bg-brand-dark/10 border-t border-border/50">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark dark:text-white mb-4">
            Meet Our Expert Mentors
          </h2>
          <p className="font-sans text-muted-foreground text-base md:text-lg">
            Learn from the best. Our faculty members are industry veterans and academic scholars with decades of combined experience.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {faculty.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-border/40 flex flex-col group text-left"
            >
              {/* Photo */}
              <div className="relative aspect-4/5 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top scale-100 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-brand-dark dark:text-white mb-1">
                  {member.name}
                </h3>
                <span className="font-sans text-xs font-bold text-brand-secondary uppercase tracking-widest mb-3 block">
                  {member.role}
                </span>
                <p className="font-sans text-xs text-muted-foreground leading-normal">
                  {member.education}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
