import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

export default function AdSetupGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Ad Monetization Setup Guide</h1>
        <p className="text-gray-600">Complete guide to implementing AdSense, Adsterra, and promotional ads</p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>✅ Quick Start - Instant Revenue</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">1. Adsterra (2-10 min approval)</h3>
              <p className="text-sm text-gray-600 mb-2">Start earning immediately</p>
              <Badge variant="secondary">$1-4 CPM</Badge>
              <Button size="sm" className="w-full mt-2" asChild>
                <a href="https://adsterra.com" target="_blank" rel="noopener noreferrer">
                  Sign Up <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">2. Media.net (2-3 days)</h3>
              <p className="text-sm text-gray-600 mb-2">Yahoo/Bing network</p>
              <Badge variant="secondary">$2-8 CPM</Badge>
              <Button size="sm" className="w-full mt-2" asChild>
                <a href="https://media.net" target="_blank" rel="noopener noreferrer">
                  Apply <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600">3. AdSense (1-2 weeks)</h3>
              <p className="text-sm text-gray-600 mb-2">Premium earnings</p>
              <Badge variant="secondary">$3-12 CPM</Badge>
              <Button size="sm" className="w-full mt-2" asChild>
                <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer">
                  Apply <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Current Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Video Pause Overlay Ads</span>
              </div>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Pre-roll Video Ads</span>
              </div>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Banner & Native Ads</span>
              </div>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Between-Videos Ads</span>
              </div>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Ad Network Integration</span>
              </div>
              <Badge variant="outline" className="text-blue-600">Ready for Setup</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>Revenue Projections (Educational Content)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">10K Monthly Views</h3>
              <div className="space-y-1 text-sm">
                <div>Adsterra: $10-40/month</div>
                <div>Media.net: $20-80/month</div>
                <div>AdSense: $30-120/month</div>
              </div>
              <div className="font-bold text-green-600 mt-2">Total: $60-240/month</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">50K Monthly Views</h3>
              <div className="space-y-1 text-sm">
                <div>Adsterra: $50-200/month</div>
                <div>Media.net: $100-400/month</div>
                <div>AdSense: $150-600/month</div>
              </div>
              <div className="font-bold text-blue-600 mt-2">Total: $300-1,200/month</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">100K Monthly Views</h3>
              <div className="space-y-1 text-sm">
                <div>Adsterra: $100-400/month</div>
                <div>Media.net: $200-800/month</div>
                <div>AdSense: $300-1,200/month</div>
              </div>
              <div className="font-bold text-purple-600 mt-2">Total: $600-2,400/month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 AdSense Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Create AdSense account at adsense.google.com</li>
              <li>Add your website domain</li>
              <li>Wait for approval (1-2 weeks)</li>
              <li>Get ad unit codes from dashboard</li>
              <li>Replace placeholder codes in ad system</li>
            </ol>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Educational content gets 2-3x higher CPM rates!</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Adsterra Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Sign up at adsterra.com</li>
              <li>Get instant approval (2-10 minutes)</li>
              <li>Create ad units in dashboard</li>
              <li>Copy VAST tags and banner codes</li>
              <li>Update ad configurations</li>
            </ol>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Start earning within hours!</strong> Instant approval process.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>💻 Code Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">AdSense Banner Code:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
     data-ad-slot="YOUR_AD_SLOT"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Adsterra VAST Video Tag:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`https://www.videosprofitnetwork.com/watch.xml?key=YOUR_KEY&w=640&h=360&cb=[CACHE_BUSTER]&url=[PAGE_URL]`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Replace all placeholder codes (YOUR_KEY, YOUR_PUBLISHER_ID, etc.) with actual values from your ad network accounts. The system is fully configured and ready - you just need to add your credentials!
        </AlertDescription>
      </Alert>
    </div>
  );
}