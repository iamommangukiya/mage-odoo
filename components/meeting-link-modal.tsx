"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, ExternalLink, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MeetingLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (link: string) => void
  currentLink?: string
}

const popularPlatforms = [
  { name: "Zoom", placeholder: "https://zoom.us/j/123456789", icon: "🎥" },
  { name: "Google Meet", placeholder: "https://meet.google.com/abc-defg-hij", icon: "📹" },
  { name: "Microsoft Teams", placeholder: "https://teams.microsoft.com/l/meetup-join/...", icon: "💼" },
  { name: "Discord", placeholder: "https://discord.gg/abcd1234", icon: "🎮" },
]

export function MeetingLinkModal({ isOpen, onClose, onSave, currentLink }: MeetingLinkModalProps) {
  const [meetingLink, setMeetingLink] = useState(currentLink || "")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!meetingLink.trim()) {
      toast({
        title: "Invalid link",
        description: "Please enter a valid meeting link.",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(meetingLink)
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onSave(meetingLink)
      setIsLoading(false)
      onClose()
    }, 500)
  }

  const handleCopyLink = async () => {
    if (currentLink) {
      try {
        await navigator.clipboard.writeText(currentLink)
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "Meeting link has been copied to clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast({
          title: "Copy failed",
          description: "Unable to copy link to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const handlePlatformSelect = (placeholder: string) => {
    setMeetingLink(placeholder)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5" />
            <span>Meeting Link</span>
          </DialogTitle>
          <DialogDescription>Share a meeting link to coordinate your skill swap session</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentLink && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Current Meeting Link</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentLink, "_blank")}
                  className="bg-transparent"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input value={currentLink} readOnly className="text-sm bg-background" />
                <Button variant="outline" size="icon" onClick={handleCopyLink} className="bg-transparent">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label htmlFor="meeting-link">{currentLink ? "Update Meeting Link" : "Add Meeting Link"}</Label>

            {/* Platform suggestions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Popular platforms:</p>
              <div className="grid grid-cols-2 gap-2">
                {popularPlatforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlatformSelect(platform.placeholder)}
                    className="justify-start text-left h-auto p-2 bg-transparent"
                  >
                    <span className="mr-2">{platform.icon}</span>
                    <span className="text-xs">{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Input
              id="meeting-link"
              placeholder="https://zoom.us/j/123456789"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Supported: Zoom, Google Meet, Teams, Discord, etc.</p>
              <p>• Your swap partner will be able to join directly from chat</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !meetingLink.trim()} className="flex-1">
              {isLoading ? "Saving..." : currentLink ? "Update Link" : "Save Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
