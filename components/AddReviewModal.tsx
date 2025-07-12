"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebaseUser } from '@/hooks/useFirebaseUser'

interface AddReviewModalProps {
  isOpen: boolean
  onClose: () => void
  targetUserId: string
  targetUserName: string
  onReviewAdded: () => void
}

const availableSkills = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Java", "C++", "Go",
  "TypeScript", "JavaScript", "HTML/CSS", "PHP", "Ruby", "Swift", "Kotlin",
  "Machine Learning", "Data Science", "UI/UX Design", "Graphic Design",
  "Digital Marketing", "Content Writing", "Photography", "Video Editing"
]

export function AddReviewModal({ isOpen, onClose, targetUserId, targetUserName, onReviewAdded }: AddReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [skillTaught, setSkillTaught] = useState("none")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useFirebaseUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review.",
        variant: "destructive"
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please provide a comment for your review.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/user/${targetUserId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_id: user.email, // Send email to look up MongoDB profile
          reviewer_name: user.displayName || user.email,
          reviewer_avatar: user.photoURL || null,
          rating,
          comment: comment.trim(),
          skill_taught: skillTaught === "none" ? "" : skillTaught
        }),
      })

      if (response.ok) {
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback.",
        })
        onReviewAdded()
        onClose()
        setRating(5)
        setComment("")
        setSkillTaught("none")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to submit review.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Review {targetUserName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

                          <div className="space-y-2">
                <Label htmlFor="skill-taught">Skill Taught (Optional)</Label>
                <Select value={skillTaught} onValueChange={setSkillTaught}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific skill</SelectItem>
                    {availableSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this user..."
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 