"use client"

import { useState, useEffect } from "react"
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
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import LoginPromptModal from '@/components/LoginPromptModal'
import { useToast } from '@/hooks/use-toast'

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
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useFirebaseUser()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/user/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      });
  }, []);

  const filteredUsers = users
    .filter((u) => u.email !== user?.email)
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.skills_offered || []).some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.skills_wanted || []).some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesOffered =
        skillOfferedFilter === "All Skills Offered" || (user.skills_offered || []).includes(skillOfferedFilter)
      const matchesWanted = skillWantedFilter === "All Skills Wanted" || (user.skills_wanted || []).includes(skillWantedFilter)
      const matchesAvailability = availabilityFilter === "All Availability" || user.availability === availabilityFilter

      return matchesSearch && matchesOffered && matchesWanted && matchesAvailability
    })

  const handleRequestSwap = (userToSwap: any) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    setSelectedUser(userToSwap)
    setIsModalOpen(true)
  }

  const handleSendSwapRequest = async (targetUser, myOfferedSkill, wantedSkill, message) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_email: user.email,
          to_user_email: targetUser.email,
          offered_skill: myOfferedSkill,
          wanted_skill: wantedSkill,
          message,
        }),
      });
      if (res.ok) {
        toast({ title: 'Swap request sent!', description: 'Your request has been sent.' });
        setIsModalOpen(false);
      } else {
        toast({ title: 'Error', description: 'Failed to send swap request.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send swap request.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className=" py-8">
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
                <Card key={user._id} className="hover:shadow-lg transition-shadow animate-fade-in">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.photo_url || "/placeholder.svg"} alt={user.name} className="object-cover" />
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
                          {(user.skills_offered || []).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Skills Wanted:</p>
                        <div className="flex flex-wrap gap-1">
                          {(user.skills_wanted || []).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>⭐ {user.rating || 0}</span>
                      <span>{user.completed_swaps || 0} swaps completed</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                        <Link href={`/profile/${user._id}`}>
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

      <SwapRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} targetUser={selectedUser} onSend={handleSendSwapRequest} />
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  )
}
