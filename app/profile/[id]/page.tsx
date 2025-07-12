"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SwapRequestModal } from "@/components/swap-request-modal"
import { MapPin, Clock, Star, Users, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock user data - in real app this would come from API based on ID
const mockUser = {
  id: 1,
  name: "Sarah Chen",
  location: "San Francisco, CA",
  avatar: "/images/avatars/sarah-chen.jpg",
  bio: "Full-stack developer with 5 years of experience in React, Node.js, and cloud technologies. I'm passionate about teaching and learning new skills. I love helping others get started with modern web development while expanding my own knowledge in data science and machine learning.",
  skillsOffered: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
  skillsWanted: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
  availability: "weekends",
  rating: 4.9,
  totalSwaps: 12,
  completedSwaps: 10,
  joinedDate: "2023-06-15",
  isPublic: true,
  reviews: [
    {
      id: 1,
      reviewer: "Marcus Johnson",
      reviewerAvatar: "/images/avatars/marcus-johnson.jpg",
      rating: 5,
      comment: "Sarah is an excellent teacher! She helped me understand React hooks in just a few sessions.",
      date: "2024-01-10",
      skillTaught: "React",
    },
    {
      id: 2,
      reviewer: "Elena Rodriguez",
      reviewerAvatar: "/images/avatars/elena-rodriguez.jpg",
      rating: 5,
      comment: "Very patient and knowledgeable. Great at explaining complex concepts simply.",
      date: "2024-01-05",
      skillTaught: "TypeScript",
    },
    {
      id: 3,
      reviewer: "David Kim",
      reviewerAvatar: "/images/avatars/david-kim.jpg",
      rating: 4,
      comment: "Good experience overall. Sarah knows her stuff and is very helpful.",
      date: "2023-12-20",
      skillTaught: "Node.js",
    },
  ],
}

// Mock current user skills for matching
const mySkills = ["Python", "Machine Learning", "JavaScript", "React"]

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Find matching skills
  const matchingSkills = mockUser.skillsWanted.filter((skill) => mySkills.includes(skill))
  const skillsICanLearn = mockUser.skillsOffered.filter((skill) => !mySkills.includes(skill))

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
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{mockUser.name}</h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{mockUser.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {mockUser.availability === "weekends"
                            ? "Weekends"
                            : mockUser.availability === "weeknights"
                              ? "Weeknights"
                              : "Flexible"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{mockUser.rating}</span>
                      <span className="text-muted-foreground">({mockUser.reviews.length} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{mockUser.completedSwaps} swaps completed</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground max-w-2xl">{mockUser.bio}</p>

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
                    {mockUser.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
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
                    {mockUser.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockUser.reviews.map((review, index) => (
                    <div key={review.id}>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewerAvatar || "/placeholder.svg"} alt={review.reviewer} />
                            <AvatarFallback>
                              {review.reviewer
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{review.reviewer}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {review.skillTaught}
                                </Badge>
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
                      {index < mockUser.reviews.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
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
                      {matchingSkills.map((skill) => (
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
                    <CardTitle>You Can Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillsICanLearn.map((skill) => (
                        <Badge key={skill} variant="outline">
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
                      {new Date(mockUser.joinedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total swaps</span>
                    <span className="text-sm font-medium">{mockUser.totalSwaps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed swaps</span>
                    <span className="text-sm font-medium">{mockUser.completedSwaps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Success rate</span>
                    <span className="text-sm font-medium">
                      {Math.round((mockUser.completedSwaps / mockUser.totalSwaps) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <SwapRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} targetUser={mockUser} />
    </div>
  )
}
