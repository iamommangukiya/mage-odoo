"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { useSocket } from "@/hooks/useSocket"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"

interface Message {
  id: string
  swap_id: string
  from_user_id: string
  to_user_id: string
  message: string
  created_at: Date
  sender?: {
    name: string
    email: string
    avatar: string
  }
}

interface ChatUser {
  id: string
  name: string
  email: string
  avatar: string
  skillOffered: string
  skillWanted: string
}

interface ActiveSwap {
  swapId: string
  user: ChatUser
  swap: {
    offered_skill: string
    wanted_skill: string
    created_at: Date
  }
  lastMessage?: Message
  unreadCount: number
  meetingLink?: string
}

export default function ChatPage() {
  const { user } = useFirebaseUser()
  const socket = useSocket()
  const [activeSwaps, setActiveSwaps] = useState<ActiveSwap[]>([])
  const [selectedSwap, setSelectedSwap] = useState<ActiveSwap | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoadingSwaps, setIsLoadingSwaps] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch accepted swap users on component mount
  useEffect(() => {
    if (user?.email) {
      fetchAcceptedSwapUsers()
    }
  }, [user])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Listen for new messages
    socket.on('new-message', (messageData: Message) => {
      if (selectedSwap && messageData.swap_id === selectedSwap.swapId) {
        setMessages(prev => [...prev, messageData])
        
        // Update last message in sidebar
        setActiveSwaps(prev =>
          prev.map(swap =>
            swap.swapId === selectedSwap.swapId
              ? { ...swap, lastMessage: messageData }
              : swap
          )
        )
      } else {
        // New message for another chat: increment unreadCount
        setActiveSwaps(prev =>
          prev.map(swap =>
            swap.swapId === messageData.swap_id
              ? { ...swap, unreadCount: (swap.unreadCount || 0) + 1, lastMessage: messageData }
              : swap
          )
        )
      }
    })

    // Listen for chat join confirmation
    socket.on('joined-chat', (data: { success: boolean, swapId: string, error?: string }) => {
      if (data.success) {
        console.log(`Successfully joined chat for swap ${data.swapId}`)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join chat",
          variant: "destructive"
        })
      }
    })

    // Listen for message errors
    socket.on('message-error', (data: { error: string }) => {
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive"
      })
    })

    return () => {
      socket.off('new-message')
      socket.off('joined-chat')
      socket.off('message-error')
    }
  }, [socket, selectedSwap, toast])

  const fetchAcceptedSwapUsers = async () => {
    try {
      setIsLoadingSwaps(true)
      const response = await fetch(`/api/swap/accepted-users?email=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch accepted swap users')
      }

      const data = await response.json()
      
      // Transform the data to match our ActiveSwap interface
      const transformedSwaps: ActiveSwap[] = data.map((item: any) => ({
        swapId: item.swapId,
        user: item.user,
        swap: item.swap,
        lastMessage: undefined, // Will be populated when messages are loaded
        unreadCount: 0, // Will be calculated based on unread messages
        meetingLink: undefined
      }))

      setActiveSwaps(transformedSwaps)
      
      // Select the first swap if available
      if (transformedSwaps.length > 0 && !selectedSwap) {
        setSelectedSwap(transformedSwaps[0])
      }
    } catch (error) {
      console.error('Error fetching accepted swap users:', error)
      toast({
        title: "Error",
        description: "Failed to load chat users",
        variant: "destructive"
      })
    } finally {
      setIsLoadingSwaps(false)
    }
  }

  const fetchMessages = async (swapId: string) => {
    try {
      const response = await fetch(`/api/chat/${swapId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messages = await response.json()
      setMessages(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    }
  }

  const handleSwapSelection = async (swap: ActiveSwap) => {
    setSelectedSwap(swap)
    setIsMobileSidebarOpen(false)
    // Mark as read
    setActiveSwaps(prev =>
      prev.map(s =>
        s.swapId === swap.swapId ? { ...s, unreadCount: 0 } : s
      )
    )
    // Join the chat room via socket
    if (socket && user?.email) {
      socket.emit('join-chat', {
        swapId: swap.swapId,
        userEmail: user.email
      })
    }
    // Fetch messages for this swap
    await fetchMessages(swap.swapId)
    // Focus the input after selecting a swap
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSwap || !socket || !user?.email) return

    setIsLoading(true)

    // Send message via socket
    socket.emit('send-message', {
      swapId: selectedSwap.swapId,
      message: newMessage.trim(),
      userEmail: user.email
    })

    setNewMessage("")
    setIsLoading(false)
    
    // Keep focus on input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Memoized onChange handler to prevent re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return new Date(date).toLocaleDateString()
  }

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
        prev.map((swap) => (swap.swapId === selectedSwap.swapId ? { ...swap, meetingLink: link } : swap)),
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
          {isLoadingSwaps ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : activeSwaps.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active swaps yet</p>
              <p className="text-sm">Accept a swap request to start chatting</p>
            </div>
          ) : (
            activeSwaps.map((swap) => (
              <Card
                key={swap.swapId}
                className={`mb-2 cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedSwap?.swapId === swap.swapId ? "bg-accent border-primary" : ""
                }`}
                onClick={() => handleSwapSelection(swap)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={swap.user.avatar} alt={swap.user.name} />
                      <AvatarFallback>{swap.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{swap.user.name}</h3>
                        {swap.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(swap.lastMessage.created_at)}
                          </span>
                        )}
                        {/* Green dot for unread messages */}
                        {swap.unreadCount > 0 && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: 'green',
                              marginLeft: 8,
                            }}
                            title="New message"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {swap.user.skillOffered} → {swap.user.skillWanted}
                        </Badge>
                      </div>
                      
                      {swap.lastMessage && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {swap.lastMessage.message}
                        </p>
                      )}
                      
                      {swap.unreadCount > 0 && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          {swap.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const ChatWindow = () => (
    <div className="flex-1 flex flex-col h-full">
      {selectedSwap ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedSwap.user.avatar} alt={selectedSwap.user.name} />
                <AvatarFallback>{selectedSwap.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">{selectedSwap.user.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedSwap.user.skillOffered} → {selectedSwap.user.skillWanted}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedSwap.meetingLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedSwap.meetingLink, '_blank')}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Join Meeting
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://zoom.us', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Share Link
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                // WhatsApp-like alignment: my messages right, received left
                const isOwnMessage = message.from_user_id === user?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex w-full mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] break-words
                        ${isOwnMessage ? 'bg-green-500 text-white rounded-2xl rounded-br-sm ml-auto' : 'bg-muted text-black rounded-2xl rounded-bl-sm mr-auto'}
                        px-4 py-2 shadow-sm`
                      }
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {isOwnMessage && getMessageStatusIcon("read")}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                key={`input-${selectedSwap.swapId}`}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select a chat</h3>
            <p>Choose a swap partner to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] bg-card rounded-lg border shadow-sm">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden p-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-4 w-4 mr-2" />
              Active Swaps
            </Button>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-r">
            <ChatSidebar />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <ChatSidebar />
            </SheetContent>
          </Sheet>

          {/* Chat Window */}
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      </div>

      {/* Meeting Link Modal */}
      <MeetingLinkModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleMeetingLinkSave}
        currentLink={selectedSwap?.meetingLink}
      />
    </div>
  )
}
