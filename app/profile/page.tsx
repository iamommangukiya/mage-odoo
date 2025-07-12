"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Camera, X, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebaseUser } from '@/hooks/useFirebaseUser'

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

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    availability: '',
    isPublic: true,
    skillsOffered: [],
    skillsWanted: [],
    avatar: '',
  })
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const { toast } = useToast()
  const { user } = useFirebaseUser();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setProfileData({
              name: data.name || '',
              email: data.email || '',
              location: data.location || '',
              bio: data.bio || '',
              availability: data.availability || '',
              isPublic: data.is_public !== undefined ? data.is_public : true,
              skillsOffered: data.skills_offered || [],
              skillsWanted: data.skills_wanted || [],
              avatar: data.photo_url || '',
            });
          }
        });
    }
  }, [user?.email]);

  // Save profile to backend
  const handleSave = async () => {
    setLoading(true);
    let photo_url = profileData.avatar;
    // If avatarFile is set, upload it
    if (avatarFile) {
      const formData = new FormData();
      formData.append('file', avatarFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        photo_url = data.secure_url;
      }
    }
    // Save profile
    await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        location: profileData.location,
        bio: profileData.bio,
        availability: profileData.availability,
        is_public: profileData.isPublic,
        skills_offered: profileData.skillsOffered,
        skills_wanted: profileData.skillsWanted,
        photo_url,
      }),
    });
    setProfileData(prev => ({ ...prev, avatar: photo_url }));
    setAvatarFile(null);
    setIsEditing(false);
    setLoading(false);
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved successfully.',
    });
  };

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      // Show preview
      setProfileData(prev => ({ ...prev, avatar: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const addSkill = (type: "offered" | "wanted", skill: string) => {
    if (!skill) return

    const field = type === "offered" ? "skillsOffered" : "skillsWanted"
    if (!profileData[field].includes(skill)) {
      setProfileData((prev) => ({
        ...prev,
        [field]: [...prev[field], skill],
      }))
    }

    if (type === "offered") {
      setNewSkillOffered("")
    } else {
      setNewSkillWanted("")
    }
  }

  const removeSkill = (type: "offered" | "wanted", skill: string) => {
    const field = type === "offered" ? "skillsOffered" : "skillsWanted"
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].filter((s) => s !== skill),
    }))
  }

  const updateField = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className=" py-8  flex justify-center items-center">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your SkillSwap profile and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                      <AvatarFallback className="text-2xl">JD</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 rounded-full cursor-pointer">
                        <Button size="icon" variant="secondary" asChild>
                          <span>
                            <Camera className="h-4 w-4" />
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.location}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge variant={profileData.isPublic ? "default" : "secondary"}>
                        {profileData.isPublic ? "Public Profile" : "Private Profile"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Skills Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsOffered.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Skills Wanted</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsWanted.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Availability</h3>
                    <Badge variant="outline">
                      {profileData.availability === "weekends"
                        ? "Weekends"
                        : profileData.availability === "weeknights"
                          ? "Weeknights"
                          : "Flexible"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and skill preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profileData.email} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      disabled={!isEditing}
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell others about yourself and your experience..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={profileData.availability}
                      onValueChange={(value) => updateField("availability", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="weeknights">Weeknights</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public-profile"
                      checked={profileData.isPublic}
                      onCheckedChange={(checked) => updateField("isPublic", checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="public-profile">Make profile public</Label>
                  </div>

                  <Separator />

                  {/* Skills Offered */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Skills I Offer</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsOffered.map((skill) => (
                        <div key={skill} className="flex items-center">
                          <Badge variant="secondary" className="pr-1">
                            {skill}
                            {isEditing && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeSkill("offered", skill)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Select value={newSkillOffered} onValueChange={setNewSkillOffered}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a skill to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSkills
                              .filter((skill) => !profileData.skillsOffered.includes(skill))
                              .map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                  {skill}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => addSkill("offered", newSkillOffered)} disabled={!newSkillOffered}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Skills Wanted */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Skills I Want to Learn</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skillsWanted.map((skill) => (
                        <div key={skill} className="flex items-center">
                          <Badge variant="outline" className="pr-1">
                            {skill}
                            {isEditing && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeSkill("wanted", skill)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Select value={newSkillWanted} onValueChange={setNewSkillWanted}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a skill to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSkills
                              .filter((skill) => !profileData.skillsWanted.includes(skill))
                              .map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                  {skill}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => addSkill("wanted", newSkillWanted)} disabled={!newSkillWanted}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <Separator />
                      <div className="pt-4">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Account deletion",
                              description: "This feature is not implemented in the demo.",
                            })
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
