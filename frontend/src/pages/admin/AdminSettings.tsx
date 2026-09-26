import * as React from "react";
import AdminSidebar from "@/pages/admin/Sidebar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettingsQuery, useUpdateSiteSettingsMutation } from "@/api/academyHooks";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Phone, Mail, MapPin, Clock, Share2, Building2 } from "lucide-react";
import type { SiteSettingsUpdateRequest } from "@/api/types";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayoutProvider from "../DashboardLayoutProvider";

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useSiteSettingsQuery();
  const updateSettings = useUpdateSiteSettingsMutation();

  const [formData, setFormData] = React.useState<SiteSettingsUpdateRequest>({
    academyName: "",
    tagline: "",
    contactDetails: "",
    phoneNumbers: [""],
    email: "",
    address: "",
    workingHours: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    latitude: 0,
    longitude: 0,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        academyName: settings.academyName || "",
        tagline: settings.tagline || "",
        contactDetails: settings.contactDetails || "",
        phoneNumbers: settings.phoneNumbers?.length ? settings.phoneNumbers : [""],
        email: settings.email || "",
        address: settings.address || "",
        workingHours: settings.workingHours || "",
        instagram: settings.instagram || "",
        facebook: settings.facebook || "",
        twitter: settings.twitter || "",
        youtube: settings.youtube || "",
        latitude: settings.latitude || 0,
        longitude: settings.longitude || 0,
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index] = value;
    setFormData((prev) => ({ ...prev, phoneNumbers: newPhoneNumbers }));
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({ ...prev, phoneNumbers: [...prev.phoneNumbers, ""] }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length === 1) {
      setFormData((prev) => ({ ...prev, phoneNumbers: [""] }));
      return;
    }
    const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, phoneNumbers: newPhoneNumbers }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty phone numbers
    const filteredPhoneNumbers = formData.phoneNumbers.filter(p => p.trim() !== "");

    updateSettings.mutate({
      ...formData,
      phoneNumbers: filteredPhoneNumbers.length ? filteredPhoneNumbers : [""],
    }, {
      onSuccess: () => {
        toast.success("Settings updated successfully");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update settings");
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayoutProvider
        pageTitle="Site Settings"
        bodyTitle="Site Settings"
        description="Manage your academy details, contact information, and social links."
        sidebar={<AdminSidebar />}
      >
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayoutProvider>
    );
  }

  return (
    <DashboardLayoutProvider
      pageTitle="Site Settings"
      bodyTitle="Site Settings"
      description="Manage your academy details, contact information, and social links."
      sidebar={<AdminSidebar />}
    >
      <div className="w-full">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="operating">Operating</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>General Information</CardTitle>
                  </div>
                  <CardDescription>Primary details about your academy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="academyName">Academy Name</Label>
                    <Input
                      id="academyName"
                      name="academyName"
                      value={formData.academyName}
                      onChange={handleInputChange}
                      placeholder="e.g. The Champions Academy"
                      required
                      aria-label="academy Name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      placeholder="e.g. Excellence in Education"
                      required
                      aria-label="tagline"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="grid gap-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        placeholder="18.5204"
                        aria-label="latitude"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        placeholder="73.8567"
                        aria-label="longitude"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle>Contact Details</CardTitle>
                  </div>
                  <CardDescription>How students and parents can reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Public Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="info@academy.com"
                        required
                        className="pl-10"
                        aria-label="email"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Phone Numbers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPhoneNumber}
                        className="h-8 gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.phoneNumbers.map((phone, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={phone}
                              onChange={(e) => handlePhoneChange(index, e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className="pl-10"
                              aria-label="phone"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePhoneNumber(index)}
                            className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label="remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Complete academy address"
                        required
                        className="pl-10"
                        aria-label="address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Operating Settings */}
            <TabsContent value="operating">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Operating Hours</CardTitle>
                  </div>
                  <CardDescription>Specify when the academy is open for visits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="workingHours"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleInputChange}
                        placeholder="e.g. Mon-Sat: 9 AM - 6 PM"
                        required
                        className="pl-10"
                        aria-label="workingHours"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Links */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    <CardTitle>Social Media Links</CardTitle>
                  </div>
                  <CardDescription>Connect with students on social platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={formData.instagram || ""}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/academy"
                        className="pl-8"
                        aria-label="instagram"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground mr-1">f</span>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={formData.facebook || ""}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/academy"
                        className="pl-8"
                        aria-label="facebook"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">𝕏</span>
                      <Input
                        id="twitter"
                        name="twitter"
                        value={formData.twitter || ""}
                        onChange={handleInputChange}
                        placeholder="https://x.com/academy"
                        className="pl-8"
                        aria-label="twitter"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="youtube">YouTube URL</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">▶</span>
                      <Input
                        id="youtube"
                        name="youtube"
                        value={formData.youtube || ""}
                        onChange={handleInputChange}
                        placeholder="https://youtube.com/@academy"
                        className="pl-8"
                        aria-label="youtube"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={updateSettings.isPending}
                className="gap-2"
              >
                {updateSettings.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </DashboardLayoutProvider>
  );
}
