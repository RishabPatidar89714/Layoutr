import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Sparkles, AlertCircle, Bot, RotateCcw, ChevronDown, Wand2 } from 'lucide-react'

/* ─── Prompt system ──────────────────────────────────────────────── */
const PROMPT_CATEGORIES = [
  {
    label: 'Resize',
    color: '#7c3aed',
    prompts: [
      'Convert to 9:16 story / reel format',
      'Convert to 16:9 landscape / YouTube',
      'Convert to 4:5 portrait',
      'Convert to 1:1 square',
    ],
  },
  {
    label: 'Move',
    color: '#0891b2',
    prompts: [
      'Move the headline to the top',
      'Move the product image lower',
      'Center the headline horizontally',
      'Move the offer badge to the right',
      'Move the subheadline higher',
    ],
  },
  {
    label: 'Scale',
    color: '#059669',
    prompts: [
      'Make the product image larger',
      'Make the headline smaller',
      'Make the offer badge bigger',
      'Make the product image smaller',
    ],
  },
  {
    label: 'Style',
    color: '#d97706',
    prompts: [
      'Make the headline font larger',
      'Increase the CTA text size',
      'Make the subheadline font bigger',
    ],
  },
]

function PromptChips({ onSelect, lastMessages }) {
  const [activeCategory, setActiveCategory] = useState(null)

  // Context-aware: suggest based on last AI response
  const contextChips = useCallback(() => {
    if (!lastMessages?.length) return []
    const last = lastMessages[lastMessages.length - 1]
    if (!last || last.role !== 'assistant') return []
    const txt = last.content.toLowerCase()
    if (txt.includes('9:16') || txt.includes('story') || txt.includes('resize') || txt.includes('artboard'))
      return ['Now move the headline to the top', 'Make the product image larger', 'Center the headline']
    if (txt.includes('headline') || txt.includes('title'))
      return ['Make it smaller', 'Center it horizontally', 'Move it higher']
    if (txt.includes('product') || txt.includes('image'))
      return ['Move it to the center', 'Make it smaller', 'Move it higher']
    if (txt.includes('badge') || txt.includes('circle') || txt.includes('offer'))
      return ['Move the badge higher', 'Make the badge bigger', 'Move the badge to the right']
    return []
  }, [lastMessages])

  const ctxChips = contextChips()

  return (
    <div style={{ padding: '12px 16px 8px', borderTop: '1px solid var(--border)' }}>
      {/* Context suggestions */}
      {ctxChips.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Wand2 size={11} style={{ color: 'var(--accent2)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Suggested next
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {ctxChips.map((chip, i) => (
              <button key={chip} onClick={() => onSelect(chip)}
                className="chip-enter"
                style={{
                  ...chipStyle,
                  animationDelay: `${i * 0.04}s`,
                  background: 'var(--accent2-light)',
                  borderColor: 'var(--accent2)',
                  color: 'var(--accent2)',
                  fontWeight: 500,
                }}>
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            ...tabStyle,
            background: activeCategory === null ? 'var(--bg-hover)' : 'transparent',
            color: activeCategory === null ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeCategory === null ? 600 : 400,
          }}>
          All
        </button>
        {PROMPT_CATEGORIES.map(cat => (
          <button key={cat.label}
            onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
            style={{
              ...tabStyle,
              background: activeCategory === cat.label ? cat.color + '18' : 'transparent',
              color: activeCategory === cat.label ? cat.color : 'var(--text-muted)',
              fontWeight: activeCategory === cat.label ? 600 : 400,
              borderColor: activeCategory === cat.label ? cat.color + '44' : 'transparent',
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {(activeCategory
          ? PROMPT_CATEGORIES.filter(c => c.label === activeCategory)
          : PROMPT_CATEGORIES
        ).flatMap((cat, ci) =>
          cat.prompts.map((p, pi) => (
            <button key={p} onClick={() => onSelect(p)}
              className="chip-enter"
              style={{
                ...chipStyle,
                animationDelay: `${(ci * 5 + pi) * 0.025}s`,
              }}>
              {p}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Messages ───────────────────────────────────────────────────── */
function Message({ msg }) {
  const isUser = msg.role === 'user'
  const isError = msg.isError

  return (
    <div className="msg-enter" style={{
      display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: isUser ? 'var(--accent)' : isError ? 'var(--accent2-light)' : 'var(--accent2-muted)',
        border: '1px solid ' + (isUser ? 'transparent' : isError ? 'var(--accent2)' : 'var(--border)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-fg)' }}>U</span>
          : isError
            ? <AlertCircle size={13} style={{ color: 'var(--accent2)' }} />
            : <Bot size={13} style={{ color: 'var(--accent2)' }} />
        }
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '10px 13px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          fontSize: 13.5, lineHeight: 1.55, fontWeight: 400,
          background: isUser ? 'var(--accent)' : isError ? 'var(--accent2-light)' : 'var(--bg-card)',
          color: isUser ? 'var(--accent-fg)' : isError ? 'var(--accent2)' : 'var(--text-primary)',
          border: isUser ? 'none' : `1px solid ${isError ? 'var(--accent2)' : 'var(--border)'}`,
          boxShadow: 'var(--shadow-sm)',
          wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>
        <span style={{
          fontSize: 10, color: 'var(--text-muted)',
          fontFamily: "'DM Mono', monospace",
          paddingLeft: isUser ? 0 : 2, paddingRight: isUser ? 2 : 0,
        }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="msg-enter" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'var(--accent2-muted)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bot size={13} style={{ color: 'var(--accent2)' }} />
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: '4px 14px 14px 14px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent2)',
            animation: `blink 1.2s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main ChatPanel ─────────────────────────────────────────────── */
export default function ChatPanel({ messages, loading, onSend, width, changes }) {
  const [input, setInput] = useState('')
  const [showChips, setShowChips] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const hasMessages = messages.length > 1

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = useCallback((text) => {
    const t = (text || input).trim()
    if (!t || loading) return
    onSend(t)
    setInput('')
    inputRef.current?.focus()
  }, [input, loading, onSend])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChipSelect = (chip) => {
    setInput(chip)
    inputRef.current?.focus()
  }

  // How many chars before we auto-grow?
  const rows = input.split('\n').length > 1 || input.length > 80 ? 3 : 2

  return (
    <div style={{
      width, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-secondary)',
      overflow: 'hidden',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 8,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={13} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Layout Agent
          </div>
          <div style={{ fontSize: 10.5, color: loading ? 'var(--accent2)' : 'var(--green)', lineHeight: 1 }}>
            {loading ? 'Thinking…' : 'Ready'}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && (
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid var(--border)', borderTopColor: 'var(--accent2)',
              animation: 'spin 0.65s linear infinite',
            }} />
          )}
          <button
            onClick={() => setShowChips(v => !v)}
            title={showChips ? 'Hide suggestions' : 'Show suggestions'}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid var(--border)',
              background: showChips ? 'var(--accent2-muted)' : 'var(--bg-secondary)',
              color: showChips ? 'var(--accent2)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Wand2 size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
      </div>

      {/* Prompt chips */}
      {showChips && (
        <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <PromptChips
            onSelect={handleChipSelect}
            lastMessages={messages}
          />
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'var(--bg)',
          border: '1.5px solid var(--border)',
          borderRadius: 12,
          padding: '8px 8px 8px 12px',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent2)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe a layout change…"
            disabled={loading}
            rows={rows}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13.5, lineHeight: 1.5,
              padding: 0,
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: (!loading && input.trim()) ? 'var(--accent2)' : 'var(--border)',
              border: 'none',
              color: (!loading && input.trim()) ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!loading && input.trim()) ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
              alignSelf: 'flex-end',
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

/* ─── Styles ────────────────────────────────────────────────────── */
const chipStyle = {
  padding: '5px 11px', borderRadius: 99,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text-secondary)',
  cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 12, lineHeight: 1.4,
  whiteSpace: 'nowrap',
  transition: 'background 0.12s, color 0.12s, border-color 0.12s',
}

const tabStyle = {
  padding: '3px 9px', borderRadius: 7,
  border: '1px solid transparent',
  cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 11.5, fontWeight: 500,
  transition: 'all 0.12s',
}
