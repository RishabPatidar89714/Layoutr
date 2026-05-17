import { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Grid3x3 } from 'lucide-react'

function NodeRenderer({ node }) {
  if (!node) return null

  const style = {
    position: 'absolute',
    left: node.x, top: node.y,
    width: node.width, height: node.height,
    pointerEvents: 'none',
  }

  if (node.type === 'image') {
    const url = node.data?.sourceUrl
    const br = node.style?.visual?.borderRadius ?? 0
    return (
      <div style={{ ...style, overflow: 'hidden', borderRadius: br }}>
        {url
          ? <img src={url} alt={node.name || ''} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: node.data?.fit || 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888' }}>{node.name}</div>
        }
      </div>
    )
  }

  if (node.type === 'text') {
    const v = node.style?.visual || {}
    const fill = v.fill?.type === 'solid' ? v.fill.value : 'transparent'
    const color = v.color?.type === 'solid' ? v.color.value : '#000'
    return (
      <div style={{
        ...style, background: fill, color,
        fontSize: v.fontSize ?? 16,
        fontFamily: v.fontFamily || 'Arial, sans-serif',
        fontWeight: v.fontWeight || 400,
        fontStyle: v.fontStyle || 'normal',
        lineHeight: 1.25, whiteSpace: 'pre-wrap',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden',
      }}>
        {node.data?.content}
      </div>
    )
  }

  if (node.type === 'shape') {
    const v = node.style?.visual || {}
    const fill = v.fill?.type === 'solid' ? v.fill.value : 'transparent'
    const stroke = v.stroke?.type === 'solid' ? v.stroke.value : 'transparent'
    const sw = v.strokeWidth || 0
    const isCircle = node.data?.shapeType === 'circle'
    return (
      <div style={{
        ...style, background: fill,
        border: sw ? `${sw}px solid ${stroke}` : 'none',
        borderRadius: isCircle ? '50%' : 4,
      }} />
    )
  }

  return null
}

function LayoutCanvas({ layout }) {
  const artboardId = layout?.rootNodes?.[0]
  const artboard = layout?.nodes?.[artboardId]
  if (!artboard) return null

  const children = (artboard.children || []).map(id => layout.nodes[id]).filter(Boolean)

  return (
    <div style={{
      position: 'relative',
      width: artboard.width, height: artboard.height,
      background: artboard.data?.backgroundColor || '#fff',
      overflow: 'hidden',
      boxShadow: '0 4px 60px rgba(0,0,0,0.22), 0 1px 8px rgba(0,0,0,0.10)',
      flexShrink: 0,
      borderRadius: 2,
    }}>
      {children.map(node => <NodeRenderer key={node.id} node={node} />)}
    </div>
  )
}

export default function Canvas({ layout }) {
  const [zoom, setZoom] = useState(0.35)
  const [showGrid, setShowGrid] = useState(false)
  const containerRef = useRef(null)

  const artboardId = layout?.rootNodes?.[0]
  const artboard = layout?.nodes?.[artboardId]
  const W = artboard?.width || 1080
  const H = artboard?.height || 1080

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    const pad = 72
    const fitZoom = Math.min((clientWidth - pad) / W, (clientHeight - pad) / H)
    setZoom(Math.max(0.08, Math.min(fitZoom, 1.5)))
  }, [W, H])

  useEffect(() => { fitToScreen() }, [W, H, fitToScreen])

  const onWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.06 : 0.06
    setZoom(z => Math.max(0.08, Math.min(2, z + delta)))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', minWidth: 0 }}>
      {/* Toolbar */}
      <div style={{
        height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: 14, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { icon: ZoomOut, action: () => setZoom(z => Math.max(0.08, z - 0.1)), title: 'Zoom out' },
            { icon: ZoomIn, action: () => setZoom(z => Math.min(2, z + 0.1)), title: 'Zoom in' },
            { icon: Maximize2, action: fitToScreen, title: 'Fit to screen' },
          ].map(({ icon: Icon, action, title }) => (
            <button key={title} onClick={action} title={title} style={toolBtnStyle}>
              <Icon size={13} />
            </button>
          ))}
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
          <button
            onClick={() => setShowGrid(g => !g)}
            title="Toggle grid"
            style={{ ...toolBtnStyle, background: showGrid ? 'var(--accent2-muted)' : 'transparent', color: showGrid ? 'var(--accent2)' : 'var(--text-secondary)' }}
          >
            <Grid3x3 size={13} />
          </button>
        </div>

        <div style={{ position: 'absolute', right: 14 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
            Ctrl+scroll to zoom
          </span>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        style={{
          flex: 1, overflow: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: showGrid
            ? `radial-gradient(circle, var(--border-strong) 1px, transparent 1px)`
            : `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
          backgroundSize: showGrid ? '24px 24px' : '32px 32px',
          padding: 40,
        }}
      >
        <div style={{
          transformOrigin: 'center center',
          transform: `scale(${zoom})`,
          transition: 'transform 0.1s ease',
        }}>
          <LayoutCanvas layout={layout} />
        </div>
      </div>
    </div>
  )
}

const toolBtnStyle = {
  width: 28, height: 28, borderRadius: 7,
  border: 'none', background: 'transparent',
  color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.12s, color 0.12s',
}
