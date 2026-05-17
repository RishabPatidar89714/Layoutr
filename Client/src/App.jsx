import { useState, useEffect, useRef, useCallback } from 'react'
import { useLayoutAgent } from './hooks/useLayoutAgent'
import Canvas from './components/Canvas'
import ChatPanel from './components/ChatPanel'
import TopBar from './components/TopBar'

const MIN_CHAT = 320
const MAX_CHAT = 680
const MIN_CANVAS = 300
const DEFAULT_CHAT = 420

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('layoutr-theme')
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const { layout, messages, loading, changes, sendMessage, resetLayout } = useLayoutAgent()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('layoutr-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = chatWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [chatWidth])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const delta = dragStartX.current - e.clientX
      const containerW = containerRef.current?.clientWidth || window.innerWidth
      const newChat = Math.max(MIN_CHAT, Math.min(MAX_CHAT, dragStartWidth.current + delta))
      const canvasW = containerW - newChat - 6
      if (canvasW >= MIN_CANVAS) setChatWidth(newChat)
    }
    const onUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      className={isDragging ? 'no-transition' : ''}>
      <TopBar
        theme={theme}
        toggleTheme={toggleTheme}
        onReset={resetLayout}
        layout={layout}
        changes={changes}
      />

      <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas — left, takes remaining space */}
        <Canvas layout={layout} />

        {/* Draggable divider */}
        <div
          className={`resize-handle${isDragging ? ' dragging' : ''}`}
          onMouseDown={onMouseDown}
          style={{ width: 6, background: 'var(--border)', flexShrink: 0 }}
        />

        {/* Chat — right, fixed width, resizable */}
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={sendMessage}
          width={chatWidth}
          changes={changes}
        />
      </div>
    </div>
  )
}
