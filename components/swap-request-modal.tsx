"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const mySkills = ["React", "TypeScript", "Node.js", "JavaScript"] // Mock current user skills

interface SwapRequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    name: string
    avatar: string
    skillsOffered: string[]
    skillsWanted: string[]
  } | null
}

export function SwapRequestModal({ isOpen, onClose, targetUser }: SwapRequestModalProps) {
  const [myOfferedSkill, setMyOfferedSkill] = useState("")
  const [wantedSkill, setWantedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!myOfferedSkill || !wantedSkill || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before sending your request.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Request sent!",
        description: `Your swap request has been sent to ${targetUser?.name}.`,
      })

      // Reset form
      setMyOfferedSkill("")
      setWantedSkill("")
      setMessage("")
      onClose()
    }, 1000)
  }

  if (!targetUser) return null

  // Find skills that match between what I offer and what they want
  const matchingSkillsICanOffer = mySkills.filter((skill) => targetUser.skillsWanted.includes(skill))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Swap Request</DialogTitle>
          <DialogDescription>Send a skill swap request to {targetUser.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target User Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={targetUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {targetUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{targetUser.name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {targetUser.skillsOffered.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="my-skill">Skill I'm Offering</Label>
              <Select value={myOfferedSkill} onValueChange={setMyOfferedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill you can teach" />
                </SelectTrigger>
                <SelectContent>
                  {matchingSkillsICanOffer.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Perfect Matches</div>
                      {matchingSkillsICanOffer.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill} ⭐
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                        Other Skills
                      </div>
                    </>
                  )}
                  {mySkills
                    .filter((skill) => !matchingSkillsICanOffer.includes(skill))
                    .map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wanted-skill">Skill I Want to Learn</Label>
              <Select value={wantedSkill} onValueChange={setWantedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill you want to learn" />
                </SelectTrigger>
                <SelectContent>
                  {targetUser.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd like to swap skills..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
