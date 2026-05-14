let socket: WebSocket | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
let reconnectTimeout: NodeJS.Timeout | null = null
let isManualClose = false


export function connectWebSocket(
  roomCode: string,
  playerId: string,
  onMessage: (data: any) => void,
) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  isManualClose = false

  const apiUrl = import.meta.env.VITE_API_URL
  let wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  let wsHost = import.meta.env.VITE_WEBSOCKET_HOST

  if (!wsHost && apiUrl) {
    try {
      const parsed = new URL(apiUrl)
      wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
      wsHost = parsed.host
    } catch {
      wsHost = undefined
    }
  }

  if (!wsHost) {
    wsHost = window.location.host
  }
  const wsUrl = `${wsProtocol}//${wsHost}/api/v1/games/lottery/ws/${roomCode}/${playerId}`

  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log('WebSocket connected')
    reconnectAttempts = 0
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  socket.onclose = () => {
    console.log('WebSocket disconnected')
    onMessage({ type: 'disconnected' })
    if (!isManualClose) {
      attemptReconnect(roomCode, playerId, onMessage)
    }
  }
}

function attemptReconnect(roomCode: string, playerId: string, onMessage: (data: any) => void) {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000)
    console.log(`Attempting to reconnect in ${delay}ms...`)

    reconnectTimeout = setTimeout(() => {
      connectWebSocket(roomCode, playerId, onMessage)
    }, delay)
  } else {
    console.error('Max reconnection attempts reached')
  }
}

export function sendMessage(message: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  } else {
    console.warn('WebSocket is not connected')
  }
}

export function disconnectWebSocket() {
  isManualClose = true
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (socket) {
    socket.close()
    socket = null
  }
}
