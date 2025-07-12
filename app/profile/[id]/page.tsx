"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SwapRequestModal } from "@/components/swap-request-modal"
import { AddReviewModal } from "@/components/AddReviewModal"
import { MapPin, Clock, Star, Users, MessageSquare, ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useFirebaseUser } from '@/hooks/useFirebaseUser'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useFirebaseUser()

  // Mock current user skills for matching - in real app this would come from current user's profile
  const mySkills = ["Python", "Machine Learning", "JavaScript", "React"]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found')
          } else {
            setError('Failed to load user profile')
          }
          return
        }

        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError('Failed to load user profile')
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserData()
    }
  }, [id])

  // Find matching skills
  const matchingSkills = userData?.skills_wanted?.filter((skill: string) => mySkills.includes(skill)) || []
  const skillsICanLearn = userData?.skills_offered?.filter((skill: string) => !mySkills.includes(skill)) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Profile Not Found</h2>
            <p className="text-muted-foreground">{error || 'Unable to load profile'}</p>
            <Button asChild>
              <Link href="/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className=" py-8 ">
        <div className="mx-auto p-5 space-y-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </Button>

          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={userData.photo_url || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-2xl">
                    {userData.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{userData.name}</h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{userData.location || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {userData.availability === "weekends"
                            ? "Weekends"
                            : userData.availability === "weeknights"
                              ? "Weeknights"
                              : userData.availability === "flexible"
                                ? "Flexible"
                                : "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{userData.rating || 0}</span>
                      <span className="text-muted-foreground">({userData.reviews?.length || 0} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{userData.completed_swaps || 0} swaps completed</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground max-w-2xl">{userData.bio || 'No bio available'}</p>

                  <Button size="lg" onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Swap Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Skills Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Offered */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills_offered?.length > 0 ? (
                      userData.skills_offered.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills offered yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Wanted */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Wanted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills_wanted?.length > 0 ? (
                      userData.skills_wanted.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-sm py-1 px-3">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills wanted yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reviews</CardTitle>
                    {currentUser && currentUser.uid !== id && (
                      <Button
                        size="sm"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Review</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.reviews?.length > 0 ? (
                    userData.reviews.map((review: any, index: number) => (
                      <div key={review._id || index}>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={review.reviewer_avatar && review.reviewer_avatar !== "null" ? review.reviewer_avatar : "/placeholder-user.jpg"} 
                                alt={review.reviewer_name || "Reviewer"} 
                              />
                              <AvatarFallback>
                                {review.reviewer_name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">{review.reviewer_name}</span>
                                  {review.skill_taught && (
                                    <Badge variant="secondary" className="text-xs">
                                      {review.skill_taught}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        {index < userData.reviews.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No reviews yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Matching */}
              {matchingSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Perfect Match! 🎯</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">You can offer skills they want:</p>
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill: string) => (
                        <Badge key={skill} className="bg-green-100 text-green-800 border-green-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills You Can Learn */}
              {skillsICanLearn.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">Skills You Can Learn 📚</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Skills they can teach you:</p>
                    <div className="flex flex-wrap gap-2">
                      {skillsICanLearn.map((skill: string) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800 border-blue-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <span className="text-sm font-medium">
                      {userData.joined_date ? new Date(userData.joined_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      }) : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total swaps</span>
                    <span className="text-sm font-medium">{userData.total_swaps || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed swaps</span>
                    <span className="text-sm font-medium">{userData.completed_swaps || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success rate</span>
                    <span className="text-sm font-medium">
                      {userData.total_swaps > 0 
                        ? Math.round((userData.completed_swaps / userData.total_swaps) * 100)
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <SwapRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} targetUser={userData} />
      <AddReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        targetUserId={id}
        targetUserName={userData?.name || 'User'}
        onReviewAdded={() => {
          // Refresh user data to show new review
          window.location.reload()
        }}
      />
    </div>
  )
}
