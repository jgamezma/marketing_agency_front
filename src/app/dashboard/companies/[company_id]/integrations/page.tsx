"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getCloudinaryStatus,
  connectCloudinary,
  disconnectCloudinary,
  type CloudinaryStatusResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cloud, Loader2, Trash2, CheckCircle2 } from "lucide-react";

export default function IntegrationsPage() {
  const params = useParams<{ company_id: string }>();
  const companyId = params.company_id;

  const [status, setStatus] = useState<CloudinaryStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Connect form state
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Disconnect state
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getCloudinaryStatus(companyId);
      setStatus(res);
    } catch {
      // Integration not set up yet — treat as disconnected
      setStatus({ connected: false, cloud_name: null });
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    if (!cloudName.trim() || !apiKey.trim() || !apiSecret.trim()) return;
    setConnecting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await connectCloudinary(companyId, {
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      setSuccess(res.message || "Cloudinary credentials securely stored.");
      setCloudName("");
      setApiKey("");
      setApiSecret("");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Cloudinary");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await disconnectCloudinary(companyId);
      setSuccess(res.message || "Cloudinary credentials removed.");
      setConfirmOpen(false);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect Cloudinary");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="mr-2 size-5 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading integrations...</p>
      </div>
    );
  }

  const isConnected = status?.connected === true;
  const formValid = cloudName.trim() && apiKey.trim() && apiSecret.trim();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your company&apos;s capabilities.
        </p>
      </div>

      {/* Cloudinary integration card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Cloud className="size-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Cloudinary</CardTitle>
                <CardDescription>
                  Media asset management and delivery
                </CardDescription>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "outline"}>
              {isConnected ? "Connected" : "Not connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            /* Connected state */
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3">
                <CheckCircle2 className="size-4 text-green-600" />
                <p className="text-sm">
                  Connected to cloud: <span className="font-medium">{status.cloud_name}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                AI-generated media assets will be stored and served from your Cloudinary account.
                API credentials are securely stored and never exposed.
              </p>
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger
                  render={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 size-3.5" />
                      Disconnect
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Disconnect Cloudinary?</DialogTitle>
                    <DialogDescription>
                      This will remove your Cloudinary credentials. Media assets already
                      generated will remain in your Cloudinary account, but new assets
                      will use default platform storage.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmOpen(false)}
                      disabled={disconnecting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                    >
                      {disconnecting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 size-4" />
                      )}
                      {disconnecting ? "Removing..." : "Disconnect"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            /* Disconnected state — connection form */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Cloudinary account to manage your AI-generated media securely.
                Your credentials are encrypted and never exposed after submission.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cloud-name">Cloud Name</Label>
                  <Input
                    id="cloud-name"
                    placeholder="your_cloud_name"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    disabled={connecting}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    placeholder="123456789012345"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={connecting}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    disabled={connecting}
                    maxLength={512}
                  />
                </div>
              </div>
              <Button
                onClick={handleConnect}
                disabled={!formValid || connecting}
              >
                {connecting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Cloud className="mr-2 size-4" />
                )}
                {connecting ? "Connecting..." : "Connect Cloudinary"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}
    </div>
  );
}
