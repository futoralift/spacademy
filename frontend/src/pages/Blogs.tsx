import { usePublicBlogsQuery } from "@/api/academyHooks";
import { getFileUrl } from "@/api/http";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BlurFade } from "@/components/animation/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";

export default function BlogsPage() {
  const { data: blogData } = usePublicBlogsQuery({ limit: 12 });
  const blogs = blogData?.data || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="grow pb-20">
        <div className="container mx-auto px-4">
          {/* Header/Hero Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto text-center max-w-2xl">
              <BlurFade delay={0.1}>
                <div className="border p-1 px-3 w-fit rounded-full mx-auto mb-3 text-sm bg-muted/50">Blogs</div>
              </BlurFade>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <h1 className="text-4xl md:text-6xl font-black  leading-tight tracking-tight">Our</h1>
                <TextAnimate
                  className="text-primary italic text-4xl md:text-6xl font-black leading-tight tracking-tight"
                  animation="slideUp"
                  by="word"
                >
                  Blog
                </TextAnimate>
              </div>
              <BlurFade delay={0.2}>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  Insights, news, and academic advice from the experts at The Champions Academy.
                </p>
              </BlurFade>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {blogs.map((blog, index) => (
              <BlurFade delay={(index + 1) * 0.1}>
                <Card key={blog.id} className="p-0 flex flex-col h-full overflow-hidden border border-border/40 hover:shadow-2xl transition-all duration-300 bg-card group">
                  <div className="relative aspect-16/10 overflow-hidden">
                    <img
                      src={getFileUrl(blog.featuredImage || "/images/blog_thumb.png")}
                      alt={blog.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                        Latest
                      </span>
                    </div>
                  </div>
                  <CardHeader className="p-6 pb-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>The Champions Academy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft'}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pt-0">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto bg-transparent border-0">
                    <Link to={`/blog/${blog.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all underline-offset-4 hover:underline">
                      Read Full Story
                      <ArrowRight className="size-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </BlurFade>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground italic text-lg">No blog posts available yet. Stay tuned!</p>
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
