import { Sun, Moon, RotateCcw, Layers, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function TopBar({ theme, toggleTheme, onReset, layout, changes }) {
  const [showChanges, setShowChanges] = useState(false)
  const artboardId = layout?.rootNodes?.[0]
  const artboard = layout?.nodes?.[artboardId]
  const W = artboard?.width || 0
  const H = artboard?.height || 0
  const preset = artboard?.data?.preset || 'canvas'

  return (
    <header style={{
      height: 48,
      display: 'flex', alignItems: 'center',
      padding: '0 14px',
      gap: 12,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'var(--accent2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Layers size={13} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
          Layoutr
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Canvas info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
          textTransform: 'capitalize',
        }}>
          {preset.replace(/-/g, ' ')}
        </span>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontFamily: "'DM Mono', monospace",
          background: 'var(--bg-secondary)',
          padding: '2px 7px', borderRadius: 5,
          border: '1px solid var(--border)',
        }}>
          {W} × {H}
        </span>
      </div>

      {/* Changes dropdown */}
      {changes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowChanges(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 7,
              border: '1px solid var(--border)',
              background: showChanges ? 'var(--bg-secondary)' : 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
            }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--accent2)', color: 'white',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{changes.length}</span>
            changes
            <ChevronDown size={11} style={{ transform: showChanges ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {showChanges && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 6,
              width: 280, maxHeight: 320, overflowY: 'auto',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
            }} className="fade-in">
              {changes.map((c, i) => (
                <div key={c.id} style={{
                  padding: '10px 14px',
                  borderBottom: i < changes.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                      {c.instruction}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {c.items?.map((item, j) => (
                    <p key={j} style={{ fontSize: 11.5, color: 'var(--text-muted)', paddingLeft: 13, lineHeight: 1.5 }}>
                      {item}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 7,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          }}
        >
          <RotateCcw size={12} /> Reset
        </button>

        <button
          onClick={toggleTheme}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  )
}
