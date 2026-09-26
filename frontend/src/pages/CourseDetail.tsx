import { useParams, useNavigate } from "react-router-dom";
import {
  useCourseQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation
} from "@/api/academyHooks";
import { useCurrentUserQuery } from "@/api/authHooks";
import { useMyStudentInsightsQuery } from "@/api/userHooks";
import { getFileUrl } from "@/api/http";
import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle
} from "lucide-react";
import { BlurFade } from "@/components/animation/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { formatCurrency, parsePostgresList } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import HomeFooter from "@/components/landing/HomeFooter";
import { type StudentInsight } from "@/api/types";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, error } = useCourseQuery(id || "");
  const { data: user } = useCurrentUserQuery();
  const { data: studentInsights } = useMyStudentInsightsQuery(user?.id, {
    enabled: !!user && user.role === 'student'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderMutation = useCreateOrderMutation();
  const verifyPaymentMutation = useVerifyPaymentMutation();

  const isEnrolled = !!(
    studentInsights &&
    typeof studentInsights === 'object' &&
    'courses' in studentInsights &&
    (studentInsights as StudentInsight).courses?.some((c) => c[0] === id)
  );

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll in this course");
      navigate("/login");
      return;
    }

    if (user.role !== 'student') {
      toast.error("Only students can enroll in courses");
      return;
    }

    if (isEnrolled) {
      toast.info("You are already enrolled in this course");
      navigate(`/dashboard/student/courses/${id}`);
      return;
    }

    if (!course) return;

    setIsProcessing(true);

    try {
      // 1. Load Razorpay Script
      const res = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // 2. Create Order
      const order = await createOrderMutation.mutateAsync({ courseId: id! });

      // 3. Open Razorpay Checkout
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SfneqnAJbZH6d9", // Updated to match backend
        amount: order.amount,
        currency: order.currency,
        name: "The Champions Academy",
        description: `Enrollment for ${course.name}`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify Payment
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id!,
            });
            toast.success("Successfully enrolled!");
            navigate(`/dashboard/student/courses/${id}`);
          } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#3A46FF",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="grow">
        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Side: Details */}
              <div className="lg:col-span-2 space-y-16">
                <section className="aspect-video rounded-4xl flex items-center overflow-hidden">
                  <img
                    src={getFileUrl(course.image)}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </section>
                <BlurFade delay={0.2}>
                  <div className="container relative z-10 mx-auto px-4">
                    <BlurFade delay={0.1}>
                      <div className="max-w-3xl">
                        <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-primary/20 backdrop-blur-md">
                          {course.mode.toUpperCase()} MODE
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                          {course.name}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap gap-6 mb-8">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Clock className="size-5 text-primary" />
                            </div>
                            <span className="font-medium">Self-Paced & Live</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Sparkles className="size-5 text-primary" />
                            </div>
                            <span className="font-medium">Full Curriculum</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-2 rounded-full bg-primary/10">
                              <ShieldCheck className="size-5 text-primary" />
                            </div>
                            <span className="font-medium">Certified Training</span>
                          </div>
                        </div>
                      </div>
                    </BlurFade>
                  </div>
                </BlurFade>
                <BlurFade delay={0.3}>
                  <div>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                      <Zap className="size-8 text-yellow-500 fill-yellow-500" />
                      Course Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsePostgresList(course.highlights).map((highlight, index) => (
                        <div key={index} className="p-0 border-0 shadow-none group">
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="mt-1">
                              <CheckCircle className="size-6 text-green-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-lg font-medium">{highlight}</span>
                          </CardContent>
                        </div>
                      ))}
                    </div>
                  </div>
                </BlurFade>

                <BlurFade delay={0.4}>
                  <div>
                    <h2 className="text-3xl font-bold mb-8">Target Groups</h2>
                    <div className="flex flex-wrap gap-4">
                      {parsePostgresList(course.standards).map((std, index) => (
                        <div
                          key={index}
                          className="px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center gap-3 group hover:border-primary/30 transition-all"
                        >
                          <span className="text-lg font-semibold">{std}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </BlurFade>
              </div>

              {/* Right Side: Pricing Card */}
              <div className="lg:col-span-1">
                <BlurFade delay={0.5}>
                  <div className="sticky top-24">
                    <Card className="p-0 overflow-hidden border-primary/20 shadow-xl shadow-primary/10">
                      <CardContent className="p-8">
                        <div className="mb-6">
                          <div className="text-muted-foreground text-sm font-bold tracking-wider mb-2">Enrollment Fee</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black py-4">{formatCurrency(course.amount, course.currency)}</span>
                            <span className="text-muted-foreground">one-time</span>
                          </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <CreditCard className="size-5 text-primary" />
                            <span>Secure Payment Gateway</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <ShieldCheck className="size-5 text-primary" />
                            <span>Lifetime access to course recordings</span>
                          </div>
                        </div>
                        <ShimmerButton
                          onClick={handleEnroll}
                          className="shadow-2xl w-full"
                          shimmerSize="2px"
                          borderRadius={"20px"}
                          background="#3A46FF"
                          disabled={isProcessing}
                        >
                          <span className="text-center py-2 text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg dark:from-white dark:to-slate-900/10">
                            {isProcessing ? "Processing..." : (isEnrolled ? "Go to Dashboard" : "Enroll Now")}
                          </span>
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </ShimmerButton>
                        <p className="text-sm text-center text-muted-foreground mt-4 italic">
                          By enrolling, you agree to our terms and conditions.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="mt-8 p-6 rounded-2xl border shadow-lg">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Zap className="size-5 text-yellow-500" />
                        Have Questions?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get a free counseling session with our expert teachers.
                      </p>
                      <Button className="w-full">
                        Talk to Specialist
                      </Button>
                    </div>
                  </div>
                </BlurFade>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
