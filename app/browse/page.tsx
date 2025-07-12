"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, MapPin, Clock, Eye, MessageSquare } from "lucide-react"
import { SwapRequestModal } from "@/components/swap-request-modal"

const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    location: "San Francisco, CA",
    avatar: "/images/avatars/sarah-chen.jpg",
    skillsOffered: ["React", "TypeScript", "Node.js"],
    skillsWanted: ["Python", "Machine Learning"],
    availability: "weekends",
    rating: 4.9,
    swaps: 12,
    bio: "Full-stack developer with 5 years of experience. Love teaching React and learning ML.",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    location: "New York, NY",
    avatar: "/images/avatars/marcus-johnson.jpg",
    skillsOffered: ["Python", "Data Science", "SQL"],
    skillsWanted: ["React", "Frontend"],
    availability: "weeknights",
    rating: 4.8,
    swaps: 8,
    bio: "Data scientist passionate about sharing knowledge and learning web development.",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    location: "Austin, TX",
    avatar: "/images/avatars/elena-rodriguez.jpg",
    skillsOffered: ["UI/UX Design", "Figma", "Prototyping"],
    skillsWanted: ["Vue.js", "CSS"],
    availability: "flexible",
    rating: 5.0,
    swaps: 15,
    bio: "UX designer with a passion for creating beautiful and functional interfaces.",
  },
  {
    id: 4,
    name: "David Kim",
    location: "Seattle, WA",
    avatar: "/images/avatars/david-kim.jpg",
    skillsOffered: ["Go", "Docker", "Kubernetes"],
    skillsWanted: ["React Native", "Mobile"],
    availability: "weekends",
    rating: 4.7,
    swaps: 6,
    bio: "DevOps engineer interested in mobile development and cloud technologies.",
  },
  {
    id: 5,
    name: "Lisa Wang",
    location: "Los Angeles, CA",
    avatar: "/images/avatars/lisa-wang.jpg",
    skillsOffered: ["Photography", "Video Editing", "Adobe Creative"],
    skillsWanted: ["Web Development", "JavaScript"],
    availability: "weeknights",
    rating: 4.9,
    swaps: 10,
    bio: "Creative professional looking to transition into tech. Love visual storytelling.",
  },
  {
    id: 6,
    name: "Alex Thompson",
    location: "Chicago, IL",
    avatar: "/images/avatars/alex-thompson.jpg",
    skillsOffered: ["Java", "Spring Boot", "Microservices"],
    skillsWanted: ["React", "Modern Frontend"],
    availability: "flexible",
    rating: 4.6,
    swaps: 4,
    bio: "Backend developer with enterprise experience, eager to learn modern frontend.",
  },
]

const availableSkills = [
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Go",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Graphic Design",
  "Digital Marketing",
  "Content Writing",
  "Photography",
  "Video Editing",
]

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [skillOfferedFilter, setSkillOfferedFilter] = useState("All Skills Offered")
  const [skillWantedFilter, setSkillWantedFilter] = useState("All Skills Wanted")
  const [availabilityFilter, setAvailabilityFilter] = useState("All Availability")
  const [selectedUser, setSelectedUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsOffered.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.skillsWanted.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesOffered =
      skillOfferedFilter === "All Skills Offered" || user.skillsOffered.includes(skillOfferedFilter)
    const matchesWanted = skillWantedFilter === "All Skills Wanted" || user.skillsWanted.includes(skillWantedFilter)
    const matchesAvailability = availabilityFilter === "All Availability" || user.availability === availabilityFilter

    return matchesSearch && matchesOffered && matchesWanted && matchesAvailability
  })

  const handleRequestSwap = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Browse Skills</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing people ready to share their skills and learn from you
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={skillOfferedFilter} onValueChange={setSkillOfferedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Skills Offered" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Skills Offered">All Skills Offered</SelectItem>
                      {availableSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={skillWantedFilter} onValueChange={setSkillWantedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Skills Wanted" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Skills Wanted">All Skills Wanted</SelectItem>
                      {availableSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Availability">All Availability</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="weeknights">Weeknights</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow animate-fade-in">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {user.availability === "weekends"
                            ? "Weekends"
                            : user.availability === "weeknights"
                              ? "Weeknights"
                              : "Flexible"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Skills Offered:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsOffered.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Skills Wanted:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsWanted.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>⭐ {user.rating}</span>
                      <span>{user.swaps} swaps completed</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={`/profile/${user.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleRequestSwap(user)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Request Swap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <SwapRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} targetUser={selectedUser} />
    </div>
  )
}
