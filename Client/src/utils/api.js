import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

export async function sendChatMessage({ message, layout, history }) {
  const { data } = await api.post('/chat', { message, layout, history })
  return data
}

export default api
