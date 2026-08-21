import { useParams } from "react-router-dom";
import { usePublicBlogQuery, useSiteSettingsQuery } from "@/api/academyHooks";
import { getFileUrl } from "@/api/http";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BlockRenderer from "@/components/blog/BlockRenderer";

export default function BlogDetailPage() {
  const { id } = useParams();
  const { data: blog, isLoading, isError } = usePublicBlogQuery(id || "");
  const { data: settings } = useSiteSettingsQuery();

  const handleShare = async () => {
    if (!blog) return;
    const shareData = {
      title: blog.title,
      text: blog.excerpt || "",
      url: window.location.href,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error sharing:", err);
        toast.error("Failed to share");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="grow pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-10 w-48 mb-12 rounded-lg" />
            <Skeleton className="h-14 w-full mb-8 rounded-xl" />
            <div className="flex gap-4 mb-12">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-md mt-2" />
              <Skeleton className="h-6 w-32 rounded-md mt-2" />
            </div>
            <Skeleton className="aspect-video w-full mb-12 rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-1/2 rounded-md" />
            </div>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="grow flex items-center justify-center pt-24 pb-20">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Post Not <span className="text-primary italic">Found</span></h1>
            <p className="text-muted-foreground text-lg mb-8">The blog post you are looking for might have been removed or moved.</p>
            <Link to="/blog">
              <Button size="lg" className="rounded-full px-8">
                <ArrowLeft className="mr-2 size-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="grow pt-10 pb-20">
        <article className="container mx-auto px-4 max-w-4xl animate-in fade-in duration-700">
          <div className="mb-8">
            <Link to="/blog" className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all group mb-12 text-lg">
              <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog Feed
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight">{blog.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-border/40 mb-12">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-6 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">SF Academy</span>
                    <span className="text-sm text-muted-foreground italic">Admin</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-border/40 hidden sm:block" />

                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <Calendar className="size-5" />
                  <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Draft'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleShare}
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full hover:bg-primary/5 hover:text-primary transition-colors h-12 w-12"
                >
                  <Share2 className="size-5" />
                </Button>
                <div className="flex items-center gap-2">
                  {settings?.facebook && (
                    <Link to={settings.facebook} target="_blank">
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-blue-500/5 hover:text-blue-500 transition-colors h-12 w-12">
                        <FaFacebookF className="size-5" />
                      </Button>
                    </Link>
                  )}
                  {settings?.twitter && (
                    <Link to={settings.twitter} target="_blank">
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-sky-400/5 hover:text-sky-400 transition-colors h-12 w-12">
                        <FaXTwitter className="size-5" />
                      </Button>
                    </Link>
                  )}
                  {settings?.instagram && (
                    <Link to={settings.instagram} target="_blank">
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-pink-500/5 hover:text-pink-500 transition-colors h-12 w-12">
                        <FaLinkedinIn className="size-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-video w-full mb-14 overflow-hidden rounded-4xl shadow-xl">
            <img
              src={getFileUrl(blog.featuredImage || "/images/blog_thumb.png")}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="prose prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-8 prose-li:text-muted-foreground prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:italic selection:bg-primary/30">
            <BlockRenderer content={blog.content} />
          </div>

          <div className="mt-20 pt-12 border-t border-border/40">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-3 flex-wrap">
                {blog.categories?.map((cat) => (
                  <span 
                    key={cat.id} 
                    className="px-5 py-2 bg-muted rounded-full text-sm font-bold border border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-default"
                  >
                    {cat.name}
                  </span>
                ))}
                {(!blog.categories || blog.categories.length === 0) && (
                  <span className="px-5 py-2 bg-muted rounded-full text-sm font-bold border border-border/40 cursor-default">Uncategorized</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-bold italic text-muted-foreground">Share this article:</span>
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="rounded-full px-6 flex gap-2"
                >
                  <Share2 className="size-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <HomeFooter />
    </div>
  );
}
