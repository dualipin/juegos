import api from '@/services/api'

const baseUrl = 'v1/games/lottery'

export const roomServices = () => {
  const getAllRooms = async () => {
    try {
      const response = await api.get(`${baseUrl}/rooms`)
      if (response.status === 200) {
        return response.data
      } else {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error
    }
  }

  const createRoom = async (playerName: string) => {
    try {
      const response = await api.post<any>(`${baseUrl}/rooms`, { playerName })
      if (response.status === 201) {
        return response.data
      } else {
        throw new Error(`Failed to create room: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  const joinRoom = async (roomCode: string, playerName: string) => {
    try {
      const response = await api.post<any>(`${baseUrl}/rooms/join`, {
        roomCode,
        playerName,
      })
      if (response.status === 200) {
        return response.data
      } else {
        throw new Error(`Failed to join room: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  const getRoom = async (roomCode: string) => {
    try {
      const response = await api.get<any>(`${baseUrl}/rooms/${roomCode}`)
      if (response.status === 200) {
        return response.data
      } else {
        throw new Error(`Failed to get room: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error getting room:', error)
      throw error
    }
  }

  return {
    getAllRooms,
    createRoom,
    joinRoom,
    getRoom,
  }
}
