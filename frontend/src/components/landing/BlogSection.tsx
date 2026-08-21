import { Link } from "react-router-dom";
import { usePublicBlogsQuery } from "@/api/academyHooks";
import { getFileUrl } from "@/api/http";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const defaultBlogs = [
  {
    id: "tips-study",
    title: "Tips for Study",
    publishedAt: "2024-01-15T00:00:00.000Z",
    featuredImage: "/images/blog_thumb.png",
    excerpt: "Discover the most effective study tips to improve your memory and concentration."
  },
  {
    id: "insight-study-plan",
    title: "Insight in Study Plan",
    publishedAt: "2024-01-10T00:00:00.000Z",
    featuredImage: "/images/banner1.png",
    excerpt: "Learn how to build a balanced study schedule that aligns with your exams."
  }
];

export default function BlogSection() {
  const { data: blogData, isLoading } = usePublicBlogsQuery({ limit: 2 });
  const blogs = blogData?.data && blogData.data.length > 0
    ? blogData.data.slice(0, 2)
    : defaultBlogs;

  return (
    <section id="blogs" className="py-20 bg-brand-bg dark:bg-brand-dark/5 border-t border-border/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Heading and CTA */}
          <div className="lg:col-span-4 text-left flex flex-col items-start">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark dark:text-white mb-4 leading-tight">
              Latest from <br />
              <span className="text-brand-primary dark:text-brand-secondary italic">Our Blog</span>
            </h2>
            <p className="font-sans text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              Stay updated with the latest educational news, exam tips, and success stories from our experts.
            </p>
            <Link to="/blog">
              <Button className="cursor-pointer font-sans text-sm font-bold bg-[#132A53] hover:bg-[#132A53]/95 text-white px-8 h-12 shadow-md transition-all">
                All Blogs
              </Button>
            </Link>
          </div>

          {/* Right Column: 2 Blog Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-border/60 shadow-sm flex flex-col h-full">
                  <Skeleton className="aspect-4/3 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-20 mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : (
              blogs.map((blog) => (
                <Link
                  to={`/blog/${blog.id}`}
                  key={blog.id}
                  className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-border/60 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full group text-left"
                >
                  {/* Blog Thumbnail */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={blog.featuredImage?.startsWith('/') ? blog.featuredImage : getFileUrl(blog.featuredImage || "")}
                      alt={blog.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Blog Body */}
                  <div className="p-6 md:p-8 flex flex-col grow">
                    <span className="font-sans text-xs text-brand-secondary font-bold mb-2 block">
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
