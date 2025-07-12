"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, X, Clock, ArrowRight, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockSentRequests = [
  {
    id: 1,
    targetUser: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    mySkill: "React",
    wantedSkill: "Python",
    message: "Hi Sarah! I'd love to learn Python from you while teaching React...",
    status: "pending",
    dateSent: "2024-01-15",
    dateUpdated: "2024-01-15",
  },
  {
    id: 2,
    targetUser: {
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    mySkill: "TypeScript",
    wantedSkill: "Data Science",
    message: "Hello Marcus! I'm interested in learning data science...",
    status: "accepted",
    dateSent: "2024-01-12",
    dateUpdated: "2024-01-14",
  },
  {
    id: 3,
    targetUser: {
      name: "Elena Rodriguez",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    mySkill: "Node.js",
    wantedSkill: "UI/UX Design",
    message: "Hi Elena! I'm a backend developer looking to improve my design skills...",
    status: "rejected",
    dateSent: "2024-01-10",
    dateUpdated: "2024-01-11",
  },
]

const mockReceivedRequests = [
  {
    id: 4,
    fromUser: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    theirSkill: "Go",
    wantedSkill: "React",
    message:
      "Hi! I'm a Go developer interested in learning React. I have 3 years of experience with Go and would love to share my knowledge...",
    status: "pending",
    dateSent: "2024-01-16",
    dateUpdated: "2024-01-16",
  },
  {
    id: 5,
    fromUser: {
      name: "Lisa Wang",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    theirSkill: "Photography",
    wantedSkill: "JavaScript",
    message: "Hello! I'm a professional photographer looking to transition into web development...",
    status: "pending",
    dateSent: "2024-01-14",
    dateUpdated: "2024-01-14",
  },
  {
    id: 6,
    fromUser: {
      name: "Alex Thompson",
      avatar: "/placeholder.svg?height=48&width=48",
    },
    theirSkill: "Java",
    wantedSkill: "React",
    message: "Hi there! I'm a Java developer with enterprise experience...",
    status: "accepted",
    dateSent: "2024-01-08",
    dateUpdated: "2024-01-09",
  },
]

export default function DashboardPage() {
  const [sentRequests, setSentRequests] = useState(mockSentRequests)
  const [receivedRequests, setReceivedRequests] = useState(mockReceivedRequests)
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const handleAcceptRequest = (requestId: number) => {
    setReceivedRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: "accepted", dateUpdated: new Date().toISOString().split("T")[0] }
          : req,
      ),
    )
    toast({
      title: "Request accepted!",
      description: "You can now start your skill swap session.",
    })
  }

  const handleRejectRequest = (requestId: number) => {
    setReceivedRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: "rejected", dateUpdated: new Date().toISOString().split("T")[0] }
          : req,
      ),
    )
    toast({
      title: "Request rejected",
      description: "The request has been declined.",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-600">
            <Check className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSentRequests =
    statusFilter === "all" ? sentRequests : sentRequests.filter((req) => req.status === statusFilter)

  const filteredReceivedRequests =
    statusFilter === "all" ? receivedRequests : receivedRequests.filter((req) => req.status === statusFilter)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your skill swap requests and connections</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{sentRequests.length}</div>
                <p className="text-xs text-muted-foreground">Requests Sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{receivedRequests.length}</div>
                <p className="text-xs text-muted-foreground">Requests Received</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {[...sentRequests, ...receivedRequests].filter((req) => req.status === "accepted").length}
                </div>
                <p className="text-xs text-muted-foreground">Active Swaps</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {[...sentRequests, ...receivedRequests].filter((req) => req.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="received" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">Received Requests</TabsTrigger>
              <TabsTrigger value="sent">Sent Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              <div className="space-y-4">
                {filteredReceivedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No requests found</h3>
                        <p className="text-muted-foreground">
                          {statusFilter === "all"
                            ? "You haven't received any swap requests yet."
                            : `No ${statusFilter} requests found.`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredReceivedRequests.map((request) => (
                    <Card key={request.id} className="animate-fade-in">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.fromUser.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {request.fromUser.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{request.fromUser.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sent {new Date(request.dateSent).toLocaleDateString()}
                                </p>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{request.theirSkill}</Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">{request.wantedSkill}</Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{request.message}</p>

                            {request.status === "pending" && (
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <div className="space-y-4">
                {filteredSentRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No requests found</h3>
                        <p className="text-muted-foreground">
                          {statusFilter === "all"
                            ? "You haven't sent any swap requests yet."
                            : `No ${statusFilter} requests found.`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSentRequests.map((request) => (
                    <Card key={request.id} className="animate-fade-in">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.targetUser.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {request.targetUser.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{request.targetUser.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sent {new Date(request.dateSent).toLocaleDateString()}
                                  {request.dateUpdated !== request.dateSent && (
                                    <span> • Updated {new Date(request.dateUpdated).toLocaleDateString()}</span>
                                  )}
                                </p>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{request.mySkill}</Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">{request.wantedSkill}</Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{request.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
