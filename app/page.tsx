"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Users, Zap, Shield, ChevronLeft, ChevronRight } from "lucide-react"

const featuredProfiles = [
  {
    id: 1,
    name: "Sarah Chen",
    location: "San Francisco, CA",
    avatar: "/images/avatars/sarah-chen.jpg",
    skillsOffered: ["React", "TypeScript", "Node.js"],
    skillsWanted: ["Python", "Machine Learning"],
    rating: 4.9,
    swaps: 12,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    location: "New York, NY",
    avatar: "/images/avatars/marcus-johnson.jpg",
    skillsOffered: ["Python", "Data Science", "SQL"],
    skillsWanted: ["React", "Frontend"],
    rating: 4.8,
    swaps: 8,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    location: "Austin, TX",
    avatar: "/images/avatars/elena-rodriguez.jpg",
    skillsOffered: ["UI/UX Design", "Figma", "Prototyping"],
    skillsWanted: ["Vue.js", "CSS"],
    rating: 5.0,
    swaps: 15,
  },
  {
    id: 4,
    name: "David Kim",
    location: "Seattle, WA",
    avatar: "/images/avatars/david-kim.jpg",
    skillsOffered: ["Go", "Docker", "Kubernetes"],
    skillsWanted: ["React Native", "Mobile"],
    rating: 4.7,
    swaps: 6,
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProfiles.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProfiles.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProfiles.length) % featuredProfiles.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
<div className=" flex flex-col gap-10 mx-auto">

      <section className="  bg-gradient-to-br from-primary/10 via-background to-secondary/10 ">
        <div className=" mt-[100px] flex justify-center items-center  max-w-7xl mx-auto">
          <div className="flex justify-center items-start">
            <div className="space-y-8 animate-fade-in text-left">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-left">
                  Exchange Skills, <span className="text-primary">Build Connections</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg text-left">
                  Connect with others to swap skills, learn together, and grow your expertise in a supportive community.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8">
                  <Link href="/browse">
                    Browse Skills
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent">
                  <Link href="/signup">Create Profile</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>1,200+ Active Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>500+ Skills Swapped</span>
                </div>
              </div>
            </div>

            <div className="relative flex justify-start">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <div className="relative">
                <Image
                  src="/images/hero-graphic.png"
                  alt="People collaborating and learning together"
                  width={600}
                  height={400}
                  className="rounded-3xl shadow-2xl"
                  priority
                />
                <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur border rounded-2xl p-6 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/images/avatars/john-doe.jpg" alt="John Doe" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Skills I Offer:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">React</Badge>
                          <Badge variant="secondary">TypeScript</Badge>
                          <Badge variant="secondary">Node.js</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Skills I Want:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Python</Badge>
                          <Badge variant="outline">Machine Learning</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="  max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose SkillSwap?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes skill exchange simple, safe, and rewarding for everyone involved.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Verified Community</h3>
                <p className="text-muted-foreground">
                  Connect with verified members who are serious about skill exchange and learning.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-muted-foreground">
                  Our algorithm finds the perfect skill matches based on your interests and availability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  Built-in rating system and secure messaging ensure safe and quality interactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Profiles Carousel */}
      <section className="py-24">
        <div className=" max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Featured Skill Swappers</h2>
            <p className="text-xl text-muted-foreground">Meet some of our amazing community members</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredProfiles.map((profile) => (
                  <div key={profile.id} className="w-full flex-shrink-0">
                    <Card className="mx-4 p-8">
                      <CardContent className="text-center space-y-6">
                        <Avatar className="h-24 w-24 mx-auto">
                          <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h3 className="text-2xl font-semibold">{profile.name}</h3>
                          <p className="text-muted-foreground">{profile.location}</p>
                          <div className="flex items-center justify-center space-x-4 mt-2 text-sm">
                            <span>⭐ {profile.rating}</span>
                            <span>•</span>
                            <span>{profile.swaps} swaps completed</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Skills Offered:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {profile.skillsOffered.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium mb-2">Skills Wanted:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {profile.skillsWanted.map((skill) => (
                                <Badge key={skill} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button asChild>
                          <Link href={`/profile/${profile.id}`}>View Profile</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex justify-center space-x-2 mt-8">
              {featuredProfiles.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-muted"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/skill-swap-illustration.png"
            alt="Skill swap illustration"
            fill
            className="object-cover"
          />
        </div>
        <div className=" text-center space-y-8 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Start Swapping Skills?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of learners who are already exchanging skills and building meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link href="/signup">Join Now - It's Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              <Link href="/browse">Browse Skills</Link>
            </Button>
          </div>
        </div>
      </section>
</div>
      {/* Hero Section */}

      <Footer />
    </div>
  )
}
