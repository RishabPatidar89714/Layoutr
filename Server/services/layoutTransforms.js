/**
 * Resize the artboard and recompute all child absolute coordinates from normalized values.
 * This is the most reliable way to handle aspect ratio changes.
 */
export function resizeArtboard(layout, newWidth, newHeight) {
  const updated = JSON.parse(JSON.stringify(layout)) // deep clone, never mutate input
  const rootId = updated.rootNodes[0]
  const artboard = updated.nodes[rootId]

  artboard.width = newWidth
  artboard.height = newHeight

  for (const childId of artboard.children) {
    const node = updated.nodes[childId]
    if (!node) continue

    // Recompute absolute values from normalized
    node.x = node.nx * newWidth
    node.y = node.ny * newHeight
    node.width = node.nw * newWidth
    node.height = node.nh * newHeight

    // Scale font size for text nodes
    if (node.type === 'text' && node.fontSizeRatio) {
      node.style.visual.fontSize = Math.round(node.fontSizeRatio * newWidth)
    }
  }

  return updated
}

/**
 * Move a node to a semantic position.
 * position: 'top' | 'bottom' | 'center' | 'left' | 'right'
 */
export function moveNode(layout, nodeId, position) {
  const updated = JSON.parse(JSON.stringify(layout))
  const rootId = updated.rootNodes[0]
  const artboard = updated.nodes[rootId]
  const node = updated.nodes[nodeId]

  if (!node) throw new Error(`Node ${nodeId} not found`)

  const W = artboard.width
  const H = artboard.height

  switch (position) {
    case 'top':
      node.ny = 0.03
      node.y = node.ny * H
      break
    case 'bottom':
      node.ny = 0.90
      node.y = node.ny * H
      break
    case 'center':
      node.nx = 0.5 - node.nw / 2
      node.x = node.nx * W
      node.ny = 0.5 - node.nh / 2
      node.y = node.ny * H
      break
    case 'left':
      node.nx = 0.02
      node.x = node.nx * W
      break
    case 'right':
      node.nx = 0.98 - node.nw
      node.x = node.nx * W
      break
    case 'center-x':
      node.nx = 0.5 - node.nw / 2
      node.x = node.nx * W
      break
    case 'higher':
      node.ny = Math.max(0, node.ny - 0.07)
      node.y = node.ny * H
      break
    case 'lower':
      node.ny = Math.min(0.95, node.ny + 0.07)
      node.y = node.ny * H
      break
  }

  return updated
}

/**
 * Scale a node's size by a factor. Optionally also scale font size.
 */
export function scaleNode(layout, nodeId, scaleFactor) {
  const updated = JSON.parse(JSON.stringify(layout))
  const rootId = updated.rootNodes[0]
  const artboard = updated.nodes[rootId]
  const node = updated.nodes[nodeId]

  if (!node) throw new Error(`Node ${nodeId} not found`)

  const W = artboard.width
  const H = artboard.height

  node.nw = Math.min(1.0, node.nw * scaleFactor)
  node.nh = Math.min(1.0, node.nh * scaleFactor)
  node.width = node.nw * W
  node.height = node.nh * H

  if (node.type === 'text' && node.style?.visual?.fontSize) {
    node.style.visual.fontSize = Math.round(node.style.visual.fontSize * scaleFactor)
    node.fontSizeRatio = node.style.visual.fontSize / W
  }

  return updated
}

/**
 * Get the artboard (root) node from a layout.
 */
export function getArtboard(layout) {
  const rootId = layout.rootNodes[0]
  return layout.nodes[rootId]
}
