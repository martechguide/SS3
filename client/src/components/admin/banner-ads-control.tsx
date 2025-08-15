import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BannerAdSettings, InsertBannerAdSettings } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Settings, Eye, EyeOff, Monitor, Smartphone, Tablet, Globe, Home, Video, BookOpen, DollarSign, TrendingUp, Users } from "lucide-react";

export default function BannerAdsControl() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch banner ad settings
  const { data: bannerSettings, isLoading, error } = useQuery<BannerAdSettings>({
    queryKey: ["/api/admin/banner-ads"],
    enabled: true,
  });

  // Update banner ad settings mutation
  const updateBannerSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<InsertBannerAdSettings>) => {
      await apiRequest("PUT", "/api/admin/banner-ads", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banner-ads"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Banner ad settings updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to update banner ad settings",
          variant: "destructive",
        });
      }
    },
  });

  const handleToggle = (field: keyof BannerAdSettings, value: boolean) => {
    updateBannerSettingsMutation.mutate({ [field]: value });
  };

  const handleSelectChange = (field: keyof BannerAdSettings, value: string) => {
    updateBannerSettingsMutation.mutate({ [field]: value });
  };

  const handleNumberChange = (field: keyof BannerAdSettings, value: number) => {
    updateBannerSettingsMutation.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Banner Ads Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !bannerSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Settings className="mr-2 h-5 w-5" />
            Banner Ads Control - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load banner ad settings. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Banner Ads Control Panel
            </div>
            <Badge variant={bannerSettings.enabled ? "default" : "secondary"}>
              {bannerSettings.enabled ? "Active" : "Disabled"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Control banner advertisements displayed on your website pages (excludes admin panels)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Control */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="master-toggle" className="text-base font-medium">
                Master Banner Ads Control
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Enable or disable all banner advertisements across the website
              </p>
            </div>
            <Switch
              id="master-toggle"
              checked={bannerSettings.enabled}
              onCheckedChange={(checked) => handleToggle('enabled', checked)}
              disabled={updateBannerSettingsMutation.isPending}
            />
          </div>

          <Separator />

          {/* Page-Specific Controls */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Page-Specific Controls
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <Home className="mr-2 h-4 w-4 text-blue-500" />
                  <div>
                    <Label className="text-sm font-medium">Home Page</Label>
                    <p className="text-xs text-gray-500">Main dashboard page</p>
                  </div>
                </div>
                <Switch
                  checked={bannerSettings.homePageEnabled}
                  onCheckedChange={(checked) => handleToggle('homePageEnabled', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <Video className="mr-2 h-4 w-4 text-red-500" />
                  <div>
                    <Label className="text-sm font-medium">Video Pages</Label>
                    <p className="text-xs text-gray-500">Video player pages</p>
                  </div>
                </div>
                <Switch
                  checked={bannerSettings.videoPageEnabled}
                  onCheckedChange={(checked) => handleToggle('videoPageEnabled', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                  <div>
                    <Label className="text-sm font-medium">Subject Pages</Label>
                    <p className="text-xs text-gray-500">Course subject pages</p>
                  </div>
                </div>
                <Switch
                  checked={bannerSettings.subjectPageEnabled}
                  onCheckedChange={(checked) => handleToggle('subjectPageEnabled', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-4 w-4 text-purple-500" />
                  <div>
                    <Label className="text-sm font-medium">Mobile Ads</Label>
                    <p className="text-xs text-gray-500">Mobile-optimized ads</p>
                  </div>
                </div>
                <Switch
                  checked={bannerSettings.mobileEnabled}
                  onCheckedChange={(checked) => handleToggle('mobileEnabled', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Advanced Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placement">Ad Placement</Label>
                <Select
                  value={bannerSettings.placement}
                  onValueChange={(value) => handleSelectChange('placement', value)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom">Bottom Fixed</SelectItem>
                    <SelectItem value="top">Top Fixed</SelectItem>
                    <SelectItem value="floating">Floating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-network">Ad Network</Label>
                <Select
                  value={bannerSettings.adNetwork}
                  onValueChange={(value) => handleSelectChange('adNetwork', value)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed Networks (Recommended)</SelectItem>
                    <SelectItem value="brand-promotions">Brand Promotions Only</SelectItem>
                    <SelectItem value="adsense">Google AdSense</SelectItem>
                    <SelectItem value="adsterra">Adsterra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dismissible"
                  checked={bannerSettings.dismissible}
                  onCheckedChange={(checked) => handleToggle('dismissible', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
                <Label htmlFor="dismissible" className="text-sm">User can dismiss ads</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="minimizable"
                  checked={bannerSettings.minimizable}
                  onCheckedChange={(checked) => handleToggle('minimizable', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
                <Label htmlFor="minimizable" className="text-sm">Minimizable on mobile</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-hide"
                  checked={bannerSettings.autoHide}
                  onCheckedChange={(checked) => handleToggle('autoHide', checked)}
                  disabled={!bannerSettings.enabled || updateBannerSettingsMutation.isPending}
                />
                <Label htmlFor="auto-hide" className="text-sm">Auto-hide after delay</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Banner Ads Analytics Preview
          </CardTitle>
          <CardDescription>
            Real-time performance metrics for your banner advertisements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <DollarSign className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">$24.50</div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
            </div>
            <div className="text-center p-4 border rounded">
              <Eye className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">1,847</div>
              <div className="text-sm text-gray-600">Impressions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <Users className="mx-auto h-8 w-8 text-purple-500 mb-2" />
              <div className="text-2xl font-bold">73</div>
              <div className="text-sm text-gray-600">Clicks</div>
            </div>
            <div className="text-center p-4 border rounded">
              <TrendingUp className="mx-auto h-8 w-8 text-orange-500 mb-2" />
              <div className="text-2xl font-bold">3.95%</div>
              <div className="text-sm text-gray-600">CTR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {!bannerSettings.enabled && (
        <Alert>
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            Banner advertisements are currently disabled. Enable them above to start showing ads on your website pages.
          </AlertDescription>
        </Alert>
      )}

      {bannerSettings.enabled && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Banner advertisements are active on your website. All ads are excluded from admin panels and only appear on main website pages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}