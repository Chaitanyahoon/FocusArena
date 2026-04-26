import * as signalR from '@microsoft/signalr'
import { API_ROOT } from '../config'
import { storage } from '../utils/storage'
import type { PrivateMessage } from '../types'

type MessageHandler = (message: any) => void
type PresenceHandler = (userId: number) => void

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private messageHandlers: MessageHandler[] = []
  private onlineHandlers: PresenceHandler[] = []
  private offlineHandlers: PresenceHandler[] = []

  async connect() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return

    const auth = await storage.getAuth()
    if (!auth?.token) return

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_ROOT}/gamehub`, {
        accessTokenFactory: () => auth.token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    // Wire up event handlers
    this.connection.on('ReceivePrivateMessage', (message: any) => {
      this.messageHandlers.forEach(handler => handler(message))
    })

    this.connection.on('ReceiveGuildMessage', (message: any) => {
      this.messageHandlers.forEach(handler => handler(message))
    })

    this.connection.on('UserCameOnline', (userId: number) => {
      this.onlineHandlers.forEach(handler => handler(userId))
    })

    this.connection.on('UserWentOffline', (userId: number) => {
      this.offlineHandlers.forEach(handler => handler(userId))
    })

    this.connection.on('ReceiveFriendRequest', (request: any) => {
      // Can be extended to trigger a notification
      console.log('[SignalR] Friend request received:', request)
    })

    this.connection.onreconnecting(() => {
      console.log('[SignalR] Reconnecting...')
    })

    this.connection.onreconnected(() => {
      console.log('[SignalR] Reconnected.')
    })

    try {
      await this.connection.start()
      console.log('[SignalR] Connected to GameHub.')
    } catch (err) {
      console.error('[SignalR] Connection failed:', err)
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      console.log('[SignalR] Disconnected.')
    }
  }

  async sendPrivateMessage(senderId: number, receiverId: number, content: string) {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to SignalR hub.')
    }
    await this.connection.invoke('SendPrivateMessage', senderId, receiverId, content)
  }

  async joinGuild(guildId: number) {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return
    await this.connection.invoke('JoinGuildGroup', guildId)
  }

  async sendGuildMessage(guildId: number, userId: number, userName: string, message: string, avatarUrl?: string) {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return
    await this.connection.invoke('SendMessageToGuild', guildId, userId, userName, message, avatarUrl || null)
  }

  async getOnlineUsers(): Promise<number[]> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return []
    return await this.connection.invoke('GetOnlineUsers')
  }

  // --- Event Subscription ---
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  onUserOnline(handler: PresenceHandler) {
    this.onlineHandlers.push(handler)
    return () => {
      this.onlineHandlers = this.onlineHandlers.filter(h => h !== handler)
    }
  }

  onUserOffline(handler: PresenceHandler) {
    this.offlineHandlers.push(handler)
    return () => {
      this.offlineHandlers = this.offlineHandlers.filter(h => h !== handler)
    }
  }

  get isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

export const signalRService = new SignalRService()
