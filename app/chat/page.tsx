"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Navbar } from "@/components/navbar"
import { MeetingLinkModal } from "@/components/meeting-link-modal"
import { Send, Video, MessageSquare, Menu, ExternalLink, Check, CheckCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

interface ChatUser {
  id: string
  name: string
  avatar: string
  skillOffered: string
  skillWanted: string
  isOnline: boolean
}

interface ActiveSwap {
  id: string
  user: ChatUser
  lastMessage?: Message
  unreadCount: number
  meetingLink?: string
}

// Mock data for active swaps
const mockActiveSwaps: ActiveSwap[] = [
  {
    id: "swap-1",
    user: {
      id: "user-1",
      name: "Sarah Chen",
      avatar: "/images/avatars/sarah-chen.jpg",
      skillOffered: "Python",
      skillWanted: "React",
      isOnline: true,
    },
    lastMessage: {
      id: "msg-1",
      senderId: "user-1",
      content: "Great! When would be a good time for our first session?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: "read",
    },
    unreadCount: 2,
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: "swap-2",
    user: {
      id: "user-2",
      name: "Marcus Johnson",
      avatar: "/images/avatars/marcus-johnson.jpg",
      skillOffered: "Data Science",
      skillWanted: "TypeScript",
      isOnline: false,
    },
    lastMessage: {
      id: "msg-2",
      senderId: "current-user",
      content: "I'm excited to learn data science from you!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "delivered",
    },
    unreadCount: 0,
  },
  {
    id: "swap-3",
    user: {
      id: "user-3",
      name: "Elena Rodriguez",
      avatar: "/images/avatars/elena-rodriguez.jpg",
      skillOffered: "UI/UX Design",
      skillWanted: "Vue.js",
      isOnline: true,
    },
    lastMessage: {
      id: "msg-3",
      senderId: "user-3",
      content: "I've prepared some design exercises for our session",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: "read",
    },
    unreadCount: 1,
  },
]

// Mock messages for the selected chat
const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-1",
    content: "Hi! I'm excited to start our skill swap. I can teach you Python fundamentals and data structures.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "read",
  },
  {
    id: "msg-2",
    senderId: "current-user",
    content:
      "That sounds perfect! I'm looking forward to learning Python. In return, I can help you with React hooks and state management.",
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    status: "read",
  },
  {
    id: "msg-3",
    senderId: "user-1",
    content: "Excellent! I've been wanting to understand React hooks better. Should we schedule our first session?",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: "read",
  },
  {
    id: "msg-4",
    senderId: "current-user",
    content: "I'm free this weekend. What works best for you?",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "read",
  },
  {
    id: "msg-5",
    senderId: "user-1",
    content: "Great! When would be a good time for our first session?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: "read",
  },
]

export default function ChatPage() {
  const [activeSwaps, setActiveSwaps] = useState<ActiveSwap[]>(mockActiveSwaps)
  const [selectedSwap, setSelectedSwap] = useState<ActiveSwap | null>(mockActiveSwaps[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSwap) return

    setIsLoading(true)

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      content: newMessage.trim(),
      timestamp: new Date(),
      status: "sent",
    }

    // Add message to chat
    setMessages((prev) => [...prev, message])

    // Update last message in sidebar
    setActiveSwaps((prev) =>
      prev.map((swap) => (swap.id === selectedSwap.id ? { ...swap, lastMessage: message } : swap)),
    )

    setNewMessage("")

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getMessageStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />
    }
  }

  const handleMeetingLinkSave = (link: string) => {
    if (selectedSwap) {
      setActiveSwaps((prev) =>
        prev.map((swap) => (swap.id === selectedSwap.id ? { ...swap, meetingLink: link } : swap)),
      )
      setSelectedSwap((prev) => (prev ? { ...prev, meetingLink: link } : null))
      toast({
        title: "Meeting link saved!",
        description: "Your meeting link has been shared with your swap partner.",
      })
    }
  }

  const ChatSidebar = () => (
    <div className="w-full h-full flex flex-col bg-muted/30">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Active Swaps</h2>
        <p className="text-sm text-muted-foreground">Your accepted skill exchanges</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeSwaps.map((swap) => (
            <Card
              key={swap.id}
              className={`mb-2 cursor-pointer transition-colors hover:bg-accent/50 ${
                selectedSwap?.id === swap.id ? "bg-accent border-primary" : ""
              }`}
              onClick={() => {
                setSelectedSwap(swap)
                setIsMobileSidebarOpen(false)
                // Mark as read
                setActiveSwaps((prev) => prev.map((s) => (s.id === swap.id ? { ...s, unreadCount: 0 } : s)))
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={swap.user.avatar || "/placeholder.svg"} alt={swap.user.name} />
                      <AvatarFallback>
                        {swap.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {swap.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{swap.user.name}</h3>
                      {swap.unreadCount > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {swap.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 mb-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {swap.user.skillOffered}
                      </Badge>
                      <span className="text-xs text-muted-foreground">↔</span>
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {swap.user.skillWanted}
                      </Badge>
                    </div>

                    {swap.lastMessage && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {swap.lastMessage.senderId === "current-user" ? "You: " : ""}
                          {swap.lastMessage.content}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTime(swap.lastMessage.timestamp)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="h-[calc(100vh-4rem)] flex">
        {/* Desktop Sidebar */}
        <div className=" border-r">
          <ChatSidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <ChatSidebar />
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedSwap ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setIsMobileSidebarOpen(true)}
                    >
                      <Menu className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedSwap.user.avatar || "/placeholder.svg"}
                          alt={selectedSwap.user.name}
                        />
                        <AvatarFallback>
                          {selectedSwap.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedSwap.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold">{selectedSwap.user.name}</h2>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>
                          {selectedSwap.user.skillOffered} ↔ {selectedSwap.user.skillWanted}
                        </span>
                        {selectedSwap.user.isOnline && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Online</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedSwap.meetingLink ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedSwap.meetingLink, "_blank")}
                        className="bg-transparent"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Session
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMeetingModalOpen(true)}
                        className="bg-transparent"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Share Meeting Link
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === "current-user"
                    const showTimestamp =
                      index === 0 ||
                      messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 5 * 60 * 1000

                    return (
                      <div key={message.id} className="space-y-2">
                        {showTimestamp && (
                          <div className="flex justify-center">
                            <Badge variant="outline" className="text-xs bg-background">
                              {formatTime(message.timestamp)}
                            </Badge>
                          </div>
                        )}

                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isCurrentUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>

                            <div
                              className={`flex items-center space-x-1 mt-1 text-xs text-muted-foreground ${
                                isCurrentUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {isCurrentUser && getMessageStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4 bg-background">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="resize-none"
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // No chat selected state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a swap partner to start chatting</p>
                </div>
                <Button
                  variant="outline"
                  className="md:hidden bg-transparent"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  View Conversations
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MeetingLinkModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleMeetingLinkSave}
        currentLink={selectedSwap?.meetingLink}
      />
    </div>
  )
}
