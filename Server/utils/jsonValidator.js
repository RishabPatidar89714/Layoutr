/**
 * Validate that LLM-returned layout has the expected structure.
 * Throws descriptive errors so the API can return useful messages.
 */
export function validateLayout(layout) {
  if (!layout || typeof layout !== 'object') {
    throw new Error('Layout must be a non-null object')
  }
  if (!Array.isArray(layout.rootNodes) || layout.rootNodes.length === 0) {
    throw new Error('Layout must have a non-empty rootNodes array')
  }
  if (!layout.nodes || typeof layout.nodes !== 'object') {
    throw new Error('Layout must have a nodes object')
  }

  const rootId = layout.rootNodes[0]
  const artboard = layout.nodes[rootId]
  if (!artboard) {
    throw new Error(`Root node "${rootId}" is missing from nodes`)
  }
  if (!Array.isArray(artboard.children)) {
    throw new Error('Artboard must have a children array')
  }
  if (typeof artboard.width !== 'number' || typeof artboard.height !== 'number') {
    throw new Error('Artboard must have numeric width and height')
  }

  // Check each child is present and has required fields
  for (const childId of artboard.children) {
    const node = layout.nodes[childId]
    if (!node) {
      throw new Error(`Child node "${childId}" is listed but missing from nodes`)
    }
    const required = ['x', 'y', 'width', 'height', 'nx', 'ny', 'nw', 'nh', 'type']
    for (const field of required) {
      if (node[field] === undefined || node[field] === null) {
        throw new Error(`Node "${childId}" is missing required field: ${field}`)
      }
    }
  }

  return true
}

/**
 * Safely parse JSON from LLM output, stripping any markdown code fences.
 */
export function safeParseLLMJson(text) {
  let clean = text.trim()

  // Strip markdown code blocks
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  // Find the JSON object boundaries in case there's surrounding text
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1)
  }

  return JSON.parse(clean)
}
