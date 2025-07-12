"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, X, Clock, ArrowRight, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import LoginPromptModal from '@/components/LoginPromptModal'

export default function DashboardPage() {
  const [swaps, setSwaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { toast } = useToast()
  const { user } = useFirebaseUser()

  // Fetch swaps when user changes
  useEffect(() => {
    if (user?.email) {
      fetchSwaps()
    } else if (!user) {
      setLoading(false)
    }
  }, [user?.email])

  const fetchSwaps = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/swap/user/${encodeURIComponent(user!.email)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch swaps')
      }

      const data = await response.json()
      setSwaps(data)
    } catch (error) {
      console.error('Error fetching swaps:', error)
      toast({
        title: "Error",
        description: "Failed to load your swaps. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (swapId: string) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    try {
      const response = await fetch(`/api/swap/${swapId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          user_email: user.email
        }),
      })

      if (response.ok) {
        toast({
          title: "Request accepted!",
          description: "You can now start your skill swap session.",
        })
        // Refresh swaps
        fetchSwaps()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to accept request.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRejectRequest = async (swapId: string) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    try {
      const response = await fetch(`/api/swap/${swapId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          user_email: user.email
        }),
      })

      if (response.ok) {
        toast({
          title: "Request rejected",
          description: "The request has been declined.",
        })
        // Refresh swaps
        fetchSwaps()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to reject request.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      })
    }
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

  // Filter swaps based on type and status
  const sentRequests = swaps.filter(swap => swap.type === 'sent')
  const receivedRequests = swaps.filter(swap => swap.type === 'received')

  const filteredSentRequests =
    statusFilter === "all" ? sentRequests : sentRequests.filter((req) => req.status === statusFilter)

  const filteredReceivedRequests =
    statusFilter === "all" ? receivedRequests : receivedRequests.filter((req) => req.status === statusFilter)

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Login Required</h2>
            <p className="text-muted-foreground">Please log in to view your dashboard.</p>
            <Button onClick={() => setShowLoginPrompt(true)}>
              Login
            </Button>
          </div>
        </div>
        <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="p-5 w-full">
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
                  {swaps.filter((req) => req.status === "accepted").length}
                </div>
                <p className="text-xs text-muted-foreground">Active Swaps</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {swaps.filter((req) => req.status === "pending").length}
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
                            <AvatarImage 
                              src={request.fromUser?.avatar || "/placeholder-user.jpg"} 
                              alt={request.fromUser?.name || "User"}
                            />
                            <AvatarFallback>
                              {request.fromUser?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{request.fromUser?.name || "Unknown User"}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sent {new Date(request.created_at).toLocaleDateString()}
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
                            <AvatarImage 
                              src={request.targetUser?.avatar || "/placeholder-user.jpg"} 
                              alt={request.targetUser?.name || "User"}
                            />
                            <AvatarFallback>
                              {request.targetUser?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{request.targetUser?.name || "Unknown User"}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sent {new Date(request.created_at).toLocaleDateString()}
                                  {request.updated_at && request.updated_at !== request.created_at && (
                                    <span> • Updated {new Date(request.updated_at).toLocaleDateString()}</span>
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
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  )
}
