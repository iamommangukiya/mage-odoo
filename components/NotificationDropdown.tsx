"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, MessageSquare, Star, Users, X } from "lucide-react"
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { useToast } from '@/hooks/use-toast'
import { useSocket } from '@/hooks/useSocket'

interface Notification {
  _id?: string
  id?: string // for real-time notifications
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'new_review' | 'message'
  title: string
  message: string
  is_read?: boolean
  created_at: string
  data?: {
    from_user_id?: {
      name: string
      photo_url: string
    }
    to_user_id?: {
      name: string
      photo_url: string
    }
  }
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useFirebaseUser()
  const { toast } = useToast()
  const socket = useSocket()

  useEffect(() => {
    if (user?.email) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [user?.email])

  // Real-time notification handler
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [
        {
          ...notification,
          is_read: false,
          _id: notification.id || notification._id || Math.random().toString(36).slice(2),
        },
        ...prev,
      ])
      setUnreadCount(prev => prev + 1)
    }
    socket.on('notification', handleNotification)
    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket])

  const fetchNotifications = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      // First get user ID from email
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
      if (!userResponse.ok) return
      
      const userData = await userResponse.json()
      
      // Then fetch notifications
      const response = await fetch(`/api/notifications?user_id=${userData._id}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!user?.email) return

    try {
      // First get user ID from email
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
      if (!userResponse.ok) return
      
      const userData = await userResponse.json()
      
      // Then fetch unread count
      const response = await fetch(`/api/notifications/unread-count?user_id=${userData._id}`)
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user?.email) return

    try {
      // First get user ID from email
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
      if (!userResponse.ok) return
      
      const userData = await userResponse.json()
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData._id })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.email) return

    try {
      // First get user ID from email
      const userResponse = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`)
      if (!userResponse.ok) return
      
      const userData = await userResponse.json()
      
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData._id })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast({
          title: "All notifications marked as read",
          description: "You're all caught up!",
        })
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'swap_request':
        return <Users className="h-4 w-4" />
      case 'swap_accepted':
        return <Check className="h-4 w-4" />
      case 'swap_rejected':
        return <X className="h-4 w-4" />
      case 'new_review':
        return <Star className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                onClick={() => markAsRead(notification._id!)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    {notification.data?.from_user_id && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={notification.data.from_user_id.photo_url || "/placeholder-user.jpg"} 
                            alt={notification.data.from_user_id.name}
                          />
                          <AvatarFallback className="text-xs">
                            {notification.data.from_user_id.name?.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {notification.data.from_user_id.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 