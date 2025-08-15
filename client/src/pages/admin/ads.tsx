import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdSystem } from "@/hooks/use-ad-system";
import AdSetupGuide from "@/components/ads/ad-setup-guide";
import { Settings, DollarSign, Eye, MousePointer, TrendingUp } from "lucide-react";

export default function AdminAds() {
  const { configs, revenue, updateAdConfig, toggleAd } = useAdSystem();
  const [selectedAd, setSelectedAd] = useState<string | null>(null);

  const adsByType = {
    adsense: configs.filter(ad => ad.type === 'adsense'),
    adsterra: configs.filter(ad => ad.type === 'adsterra'),
    propellerads: configs.filter(ad => ad.type === 'propellerads'),
    promotional: configs.filter(ad => ad.type === 'promotional')
  };

  const handleUpdateAd = (adId: string, field: string, value: any) => {
    updateAdConfig(adId, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ad Management</h1>
          <p className="text-gray-600">Manage your monetization settings and ad configurations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            {configs.filter(ad => ad.enabled).length} Active
          </Badge>
          <Badge variant="secondary">
            ${revenue.monthly.toFixed(2)} Monthly
          </Badge>
        </div>
      </div>

      {/* Revenue Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Revenue</p>
                <p className="text-2xl font-bold">${revenue.daily.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${revenue.monthly.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Impressions</p>
                <p className="text-2xl font-bold">12.5K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">2.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configs">Ad Configurations</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
          {/* AdSense */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Google AdSense</span>
                <Badge variant="outline">Premium CPM</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adsByType.adsense.map(ad => (
                  <div key={ad.id} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={ad.enabled}
                          onCheckedChange={() => toggleAd(ad.id)}
                        />
                        <div>
                          <h4 className="font-medium">{ad.format.charAt(0).toUpperCase() + ad.format.slice(1)} Ad</h4>
                          <p className="text-sm text-gray-600">{ad.placement}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ad.enabled ? "default" : "secondary"}>
                          {ad.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {selectedAd === ad.id ? 'Close' : 'Edit Code'}
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAd === ad.id && (
                      <div className="ml-4 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500 space-y-4">
                        <h5 className="font-semibold text-blue-900">📝 Paste Your AdSense Code Here</h5>
                        <div className="space-y-3">
                          <Label htmlFor={`code-${ad.id}`} className="text-blue-800">
                            AdSense HTML Code (Replace ca-pub-XXXXXXXXXXXXXXXX with your Publisher ID)
                          </Label>
                          <Textarea
                            id={`code-${ad.id}`}
                            value={ad.code || ''}
                            onChange={(e) => handleUpdateAd(ad.id, 'code', e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                            placeholder="Paste your AdSense code here..."
                          />
                          <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded">
                            💡 <strong>How to get this code:</strong><br/>
                            1. Go to AdSense Dashboard → Ads → By ad unit<br/>
                            2. Create new {ad.format} ad unit<br/>
                            3. Copy the HTML code<br/>
                            4. Paste it above and click Save
                          </div>
                          <Button 
                            onClick={() => setSelectedAd(null)} 
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Save AdSense Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adsterra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Adsterra Network</span>
                <Badge variant="outline">Fast Approval</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adsByType.adsterra.map(ad => (
                  <div key={ad.id} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={ad.enabled}
                          onCheckedChange={() => toggleAd(ad.id)}
                        />
                        <div>
                          <h4 className="font-medium">{ad.format.charAt(0).toUpperCase() + ad.format.slice(1)} Ad</h4>
                          <p className="text-sm text-gray-600">{ad.placement}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ad.enabled ? "default" : "secondary"}>
                          {ad.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {selectedAd === ad.id ? 'Close' : 'Edit Code'}
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAd === ad.id && (
                      <div className="ml-4 p-6 bg-green-50 rounded-lg border-l-4 border-green-500 space-y-4">
                        <h5 className="font-semibold text-green-900">⚡ Paste Your Adsterra Code Here</h5>
                        <div className="space-y-3">
                          {ad.format === 'video' ? (
                            <>
                              <Label htmlFor={`vastTag-${ad.id}`} className="text-green-800">
                                Video VAST Tag URL (Replace YOUR_KEY with your actual key)
                              </Label>
                              <Input
                                id={`vastTag-${ad.id}`}
                                value={ad.vastTag || ''}
                                onChange={(e) => handleUpdateAd(ad.id, 'vastTag', e.target.value)}
                                className="font-mono text-sm"
                                placeholder="https://www.videosprofitnetwork.com/watch.xml?key=YOUR_KEY&w=640&h=360"
                              />
                            </>
                          ) : (
                            <>
                              <Label htmlFor={`code-${ad.id}`} className="text-green-800">
                                Adsterra {ad.format === 'popup' ? 'Popup' : 'Banner'} Code
                              </Label>
                              <Textarea
                                id={`code-${ad.id}`}
                                value={ad.code || ''}
                                onChange={(e) => handleUpdateAd(ad.id, 'code', e.target.value)}
                                rows={6}
                                className="font-mono text-sm"
                                placeholder="Paste your Adsterra code here..."
                              />
                            </>
                          )}
                          <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
                            🚀 <strong>Adsterra Setup (2-10 min approval!):</strong><br/>
                            1. Sign up at adsterra.com<br/>
                            2. Go to Websites → Ad Units<br/>
                            3. Create {ad.format} ad unit<br/>
                            4. Copy the {ad.format === 'video' ? 'VAST URL' : 'JavaScript code'}<br/>
                            5. Paste above and start earning!
                          </div>
                          <Button 
                            onClick={() => setSelectedAd(null)} 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save Adsterra Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PropellerAds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>PropellerAds Network</span>
                <Badge variant="outline">Video Ads</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adsByType.propellerads.map(ad => (
                  <div key={ad.id} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={ad.enabled}
                          onCheckedChange={() => toggleAd(ad.id)}
                        />
                        <div>
                          <h4 className="font-medium">{ad.format.charAt(0).toUpperCase() + ad.format.slice(1)} Ad</h4>
                          <p className="text-sm text-gray-600">{ad.placement}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ad.enabled ? "default" : "secondary"}>
                          {ad.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {selectedAd === ad.id ? 'Close' : 'Edit Code'}
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAd === ad.id && (
                      <div className="ml-4 p-6 bg-orange-50 rounded-lg border-l-4 border-orange-500 space-y-4">
                        <h5 className="font-semibold text-orange-900">🎬 PropellerAds Video Setup</h5>
                        <div className="space-y-3">
                          <Label htmlFor={`vastTag-${ad.id}`} className="text-orange-800">
                            PropellerAds VAST Tag URL (Replace YOUR_PROPELLER_KEY)
                          </Label>
                          <Input
                            id={`vastTag-${ad.id}`}
                            value={ad.vastTag || ''}
                            onChange={(e) => handleUpdateAd(ad.id, 'vastTag', e.target.value)}
                            className="font-mono text-sm"
                            placeholder="https://nep.propellerads.com/ag/tags?key=YOUR_PROPELLER_KEY&w=640&h=360"
                          />
                          <div className="text-sm text-orange-700 bg-orange-100 p-3 rounded">
                            🎬 <strong>PropellerAds Video Ads (Best for Educational Content!):</strong><br/>
                            1. Sign up at propellerads.com<br/>
                            2. Go to Websites → Add Website → Video Ads<br/>
                            3. Copy the VAST tag URL<br/>
                            4. High-quality video ads perfect for education<br/>
                            5. Better rates than many other networks!
                          </div>
                          <Button 
                            onClick={() => setSelectedAd(null)} 
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Save PropellerAds Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Promotional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>Promotional Ads</span>
                <Badge variant="outline">Internal</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adsByType.promotional.map(ad => (
                  <div key={ad.id} className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={ad.enabled}
                          onCheckedChange={() => toggleAd(ad.id)}
                        />
                        <div>
                          <h4 className="font-medium">{ad.title}</h4>
                          <p className="text-sm text-gray-600">{ad.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ad.enabled ? "default" : "secondary"}>
                          {ad.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {selectedAd === ad.id ? 'Close' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAd === ad.id && (
                      <div className="ml-4 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500 space-y-4">
                        <h5 className="font-semibold text-purple-900">📢 Edit Your Promotional Ad</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${ad.id}`} className="text-purple-800">Title</Label>
                            <Input
                              id={`title-${ad.id}`}
                              value={ad.title || ''}
                              onChange={(e) => handleUpdateAd(ad.id, 'title', e.target.value)}
                              placeholder="Your Course Title"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`clickUrl-${ad.id}`} className="text-purple-800">Click URL</Label>
                            <Input
                              id={`clickUrl-${ad.id}`}
                              value={ad.clickUrl || ''}
                              onChange={(e) => handleUpdateAd(ad.id, 'clickUrl', e.target.value)}
                              placeholder="https://your-course-link.com"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`description-${ad.id}`} className="text-purple-800">Description</Label>
                          <Textarea
                            id={`description-${ad.id}`}
                            value={ad.description || ''}
                            onChange={(e) => handleUpdateAd(ad.id, 'description', e.target.value)}
                            placeholder="Describe your course or product..."
                          />
                        </div>
                        <div>
                          <Label htmlFor={`imageUrl-${ad.id}`} className="text-purple-800">Image URL</Label>
                          <Input
                            id={`imageUrl-${ad.id}`}
                            value={ad.imageUrl || ''}
                            onChange={(e) => handleUpdateAd(ad.id, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/course-image.jpg"
                          />
                        </div>
                        <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded">
                          💡 <strong>Use promotional ads to:</strong><br/>
                          • Promote your premium courses<br/>
                          • Drive traffic to other platforms<br/>
                          • Showcase new content<br/>
                          • No external approval needed!
                        </div>
                        <Button 
                          onClick={() => setSelectedAd(null)} 
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Save Promotional Ad
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <AdSetupGuide />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Ad Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}