import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Eye, DollarSign, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BrandPromotion, InsertBrandPromotion } from "@shared/schema";

const brandPromotionSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandLogo: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  campaignBudget: z.number().min(0).optional(),
  campaignDuration: z.number().min(1).default(30),
  videoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  callToAction: z.string().default("Learn More"),
  priority: z.number().min(1).max(5).default(1),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(false),
});

type BrandPromotionFormData = z.infer<typeof brandPromotionSchema>;

export default function BrandPromotions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<BrandPromotion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery<BrandPromotion[]>({
    queryKey: ["/api/admin/brand-promotions"],
  });

  const form = useForm<BrandPromotionFormData>({
    resolver: zodResolver(brandPromotionSchema),
    defaultValues: {
      brandName: "",
      brandLogo: "",
      contactEmail: "",
      contactPhone: "",
      productName: "",
      productDescription: "",
      targetAudience: "Students",
      campaignBudget: 10000,
      campaignDuration: 30,
      videoUrl: "",
      websiteUrl: "",
      callToAction: "Learn More",
      priority: 1,
      isActive: true,
      isApproved: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BrandPromotionFormData) => {
      return await apiRequest("/api/admin/brand-promotions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brand-promotions"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Brand promotion created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brand promotion",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandPromotionFormData> }) => {
      return await apiRequest(`/api/admin/brand-promotions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brand-promotions"] });
      setDialogOpen(false);
      setEditingPromotion(null);
      form.reset();
      toast({
        title: "Success",
        description: "Brand promotion updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brand promotion",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/brand-promotions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brand-promotions"] });
      toast({
        title: "Success",
        description: "Brand promotion deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete brand promotion",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrandPromotionFormData) => {
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (promotion: BrandPromotion) => {
    setEditingPromotion(promotion);
    form.reset({
      brandName: promotion.brandName,
      brandLogo: promotion.brandLogo || "",
      contactEmail: promotion.contactEmail,
      contactPhone: promotion.contactPhone || "",
      productName: promotion.productName,
      productDescription: promotion.productDescription || "",
      targetAudience: promotion.targetAudience || "Students",
      campaignBudget: promotion.campaignBudget || 10000,
      campaignDuration: promotion.campaignDuration || 30,
      videoUrl: promotion.videoUrl || "",
      websiteUrl: promotion.websiteUrl || "",
      callToAction: promotion.callToAction || "Learn More",
      priority: promotion.priority || 1,
      isActive: promotion.isActive ?? true,
      isApproved: promotion.isApproved ?? false,
    });
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading brand promotions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Brand Promotions</h1>
          <p className="text-muted-foreground mt-2">
            Manage custom brand video advertisements and partnerships
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPromotion(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Edit Brand Promotion" : "Create New Brand Promotion"}
              </DialogTitle>
              <DialogDescription>
                Add brand promotion details to create custom video advertisements
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Samsung, Coca Cola" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Galaxy S24, Diet Coke" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="brand@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the product or service being promoted..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandLogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotional Video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Students">Students</SelectItem>
                            <SelectItem value="Professionals">Professionals</SelectItem>
                            <SelectItem value="Teachers">Teachers</SelectItem>
                            <SelectItem value="All">All Users</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="campaignBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Budget (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="campaignDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://brand-website.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="callToAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call to Action</FormLabel>
                        <FormControl>
                          <Input placeholder="Learn More" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1-5)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Low</SelectItem>
                            <SelectItem value="2">2 - Normal</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Enable this promotion to show in campaigns
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isApproved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Approved</FormLabel>
                          <FormDescription>
                            Approve this promotion for public display
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPromotion ? "Update" : "Create"} Promotion
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Brand Promotions</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start earning from brand partnerships by adding your first promotion.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {promotion.brandLogo && (
                      <img 
                        src={promotion.brandLogo} 
                        alt={promotion.brandName}
                        className="w-12 h-12 object-contain rounded border"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{promotion.brandName}</CardTitle>
                      <CardDescription>{promotion.productName}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={promotion.isApproved ? "default" : "secondary"}>
                      {promotion.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant={promotion.isActive ? "default" : "outline"}>
                      {promotion.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">Priority {promotion.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">{formatCurrency(promotion.campaignBudget)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{promotion.campaignDuration} days</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <p className="font-medium">{promotion.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact:</span>
                    <p className="font-medium">{promotion.contactEmail}</p>
                  </div>
                </div>

                {promotion.productDescription && (
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm mt-1">{promotion.productDescription}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{(promotion.impressions || 0).toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{(promotion.clicks || 0).toLocaleString()} clicks</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="ml-1">
                      {(promotion.impressions || 0) > 0 
                        ? (((promotion.clicks || 0) / (promotion.impressions || 1)) * 100).toFixed(2) + '%'
                        : '0%'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CTA:</span>
                    <span className="ml-1">{promotion.callToAction}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(promotion)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteMutation.mutate(promotion.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}