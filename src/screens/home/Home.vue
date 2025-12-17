<template>
  <div class="generator-root">
    <div class="sidebar">
      <h3>Grid settings</h3>
      <div class="row">
        <label>Cols</label>
        <input type="number" v-model.number="gridCols" min="3" />
      </div>
      <div class="row">
        <label>Rows</label>
        <input type="number" v-model.number="gridRows" min="3" />
      </div>
      <div class="row">
        <label>Grid size (px)</label>
        <input type="number" v-model.number="gridSize" min="8" />
      </div>

      <div class="controls">
        <button @click="clearAll">Clear all</button>
        <button @click="undoPoint" :disabled="currentPoints.length===0 && shapes.length===0">Undo point</button>
        <button @click="toggleDrawing" :class="{active: drawing}" >
          {{ drawing ? 'Finish Shape' : 'Start Shape' }}
        </button>
        <button @click="startAnimate" :disabled="shapes.length===0 || animating">Animate shapes</button>
        <button @click="stopAnimate" :disabled="!animating">Stop</button>
      </div>

      <div class="info">
        <div>Current points: {{ currentPoints.length }}</div>
        <div>Shapes: {{ shapes.length }}</div>
      </div>

      <small class="hint">Click on canvas intersections while in <b>Start Shape</b> mode to add points. Each point immediately draws a line from the previous point. Click <b>Finish Shape</b> to save the current polyline/shape. You can create multiple shapes and then press <b>Animate shapes</b>.</small>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" @pointerdown="onPointerDown" class="pointer-canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

type GPoint = { gx: number; gy: number; x: number; y: number }

// grid settings
const gridCols = ref(20)
const gridRows = ref(12)
const gridSize = ref(32)

const canvas = ref<HTMLCanvasElement | null>(null)
const ctxRef = ref<CanvasRenderingContext2D | null>(null)

const canvasWidth = computed(() => Math.max(100, gridCols.value * gridSize.value))
const canvasHeight = computed(() => Math.max(100, gridRows.value * gridSize.value))

// drawing data
const currentPoints = reactive<GPoint[]>([]) // points for the shape currently being drawn
const shapes = reactive<GPoint[][]>([]) // stored shapes (each shape is an array of points)

// drawing mode flag
const drawing = ref(false)

// animation state
let raf: number | null = null
const animating = ref(false)
const animationState = reactive({ shapeIndex: 0, edgeIndex: 0, edgeT: 0, edgeDuration: 200 })

function getCtx() {
  if (!ctxRef.value && canvas.value) ctxRef.value = canvas.value.getContext('2d')
  return ctxRef.value
}

function snapToGrid(px: number, py: number): GPoint {
  const gx = Math.round(px / gridSize.value)
  const gy = Math.round(py / gridSize.value)
  const clampedGx = Math.max(0, Math.min(gridCols.value, gx))
  const clampedGy = Math.max(0, Math.min(gridRows.value, gy))
  return {
    gx: clampedGx,
    gy: clampedGy,
    x: clampedGx * gridSize.value,
    y: clampedGy * gridSize.value
  }
}

function onPointerDown(e: PointerEvent) {
  if (!drawing.value) return // only accept clicks while in drawing mode
  const rect = canvas.value!.getBoundingClientRect()
  const px = e.clientX - rect.left
  const py = e.clientY - rect.top
  const p = snapToGrid(px, py)

  // avoid duplicate consecutive points
  const last = currentPoints[currentPoints.length - 1]
  if (last && last.gx === p.gx && last.gy === p.gy) return

  currentPoints.push(p)
  // draw incremental (line from previous -> new)
  drawOnce()
}

function undoPoint() {
  if (currentPoints.length > 0) {
    currentPoints.pop()
  } else if (shapes.length > 0) {
    shapes.pop()
  }
  drawOnce()
}

function clearAll() {
  currentPoints.splice(0, currentPoints.length)
  shapes.splice(0, shapes.length)
  stopAnimate()
  drawOnce()
}

function toggleDrawing() {
  if (!drawing.value) {
    // start new shape
    drawing.value = true
    currentPoints.splice(0, currentPoints.length)
    stopAnimate()
    drawOnce()
  } else {
    // finish shape
    finishShape()
  }
}

function finishShape() {
  drawing.value = false
  // require at least 2 points to form a line
  if (currentPoints.length >= 2) {
    shapes.push(currentPoints.map((p) => ({ ...p })))
  }
  currentPoints.splice(0, currentPoints.length)
  drawOnce()
}

// ----------------- DRAWING -----------------
function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  ctx.save()
  ctx.strokeStyle = 'rgba(200,200,200,0.08)'
  ctx.lineWidth = 1

  // vertical
  for (let i = 0; i <= gridCols.value; i++) {
    const x = i * gridSize.value
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, canvasHeight.value)
    ctx.stroke()
  }

  // horizontal
  for (let j = 0; j <= gridRows.value; j++) {
    const y = j * gridSize.value
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(canvasWidth.value, y + 0.5)
    ctx.stroke()
  }

  ctx.restore()
}

function drawStoredShapes(ctx: CanvasRenderingContext2D, partial = false) {
  // Draw finished shapes. If animating and partial === true, use animationState
  if (!partial || !animating.value) {
    shapes.forEach((s, idx) => {
      ctx.save()
      ctx.strokeStyle = shapeColor(idx)
      ctx.lineWidth = Math.max(2, gridSize.value * 0.08)
      ctx.beginPath()
      for (let i = 0; i < s.length; i++) {
        const p = s[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      ctx.restore()
    })
    return
  }

  // Partial animated drawing
  for (let idx = 0; idx < shapes.length; idx++) {
    const s = shapes[idx]
    ctx.save()
    ctx.strokeStyle = shapeColor(idx)
    ctx.lineWidth = Math.max(2, gridSize.value * 0.08)
    ctx.beginPath()

    if (idx < animationState.shapeIndex) {
      // fully drawn
      for (let i = 0; i < s.length; i++) {
        const p = s[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    } else if (idx === animationState.shapeIndex) {
      // draw completed edges first
      const edgesToDraw = animationState.edgeIndex
      for (let i = 0; i < edgesToDraw; i++) {
        const a = s[i]
        const b = s[i + 1]
        if (!b) continue
        if (i === 0) ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }

      // draw current edge partially
      const a = s[animationState.edgeIndex]
      const b = s[(animationState.edgeIndex + 1) % s.length]
      if (a && b) {
        const t = animationState.edgeT
        const cx = a.x + (b.x - a.x) * t
        const cy = a.y + (b.y - a.y) * t
        if (edgesToDraw === 0) ctx.moveTo(a.x, a.y)
        ctx.lineTo(cx, cy)
      }
      ctx.stroke()
    } else {
      // not started yet: optionally draw faint preview
      ctx.globalAlpha = 0.12
      for (let i = 0; i < s.length; i++) {
        const p = s[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    ctx.restore()
  }
}

function drawCurrentPoints(ctx: CanvasRenderingContext2D) {
  if (currentPoints.length === 0) return
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, gridSize.value * 0.06)
  ctx.beginPath()
  for (let i = 0; i < currentPoints.length; i++) {
    const p = currentPoints[i]
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.stroke()

  // draw points
  for (const p of currentPoints) {
    ctx.beginPath()
    ctx.fillStyle = '#ffffff'
    ctx.arc(p.x, p.y, Math.max(3, gridSize.value * 0.12), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawOnce() {
  const ctx = getCtx()
  if (!ctx) return
  drawGrid(ctx)
  drawStoredShapes(ctx, animating.value)
  drawCurrentPoints(ctx)
}

watch([gridCols, gridRows, gridSize], () => {
  const cvs = canvas.value
  if (!cvs) return
  cvs.width = canvasWidth.value
  cvs.height = canvasHeight.value
  drawOnce()
})

onMounted(() => {
  const cvs = canvas.value!
  ctxRef.value = cvs.getContext('2d')
  cvs.width = canvasWidth.value
  cvs.height = canvasHeight.value
  drawOnce()
})

onBeforeUnmount(() => {
  stopAnimate()
})

// ---------------- ANIMATION ----------------
function startAnimateLoop() {
  if (animating.value) return
  if (shapes.length === 0) return
  animating.value = true
  animationState.shapeIndex = 0
  animationState.edgeIndex = 0
  animationState.edgeT = 0
  raf = requestAnimationFrame(step)
}

function stopAnimate() {
  animating.value = false
  if (raf) cancelAnimationFrame(raf)
  raf = null
  drawOnce()
}

function startAnimate() {
  startAnimateLoop()
}

function step() {
  const ctx = getCtx()
  if (!ctx) return
  if (!animating.value) return

  const sIdx = animationState.shapeIndex
  if (sIdx >= shapes.length) {
    // finished all shapes
    animating.value = false
    drawOnce()
    return
  }

  const shape = shapes[sIdx]
  if (!shape || shape.length < 2) {
    // skip empty or single-point shapes
    animationState.shapeIndex += 1
    animationState.edgeIndex = 0
    animationState.edgeT = 0
    raf = requestAnimationFrame(step)
    return
  }

  const a = shape[animationState.edgeIndex]
  const b = shape[(animationState.edgeIndex + 1) % shape.length]

  // advance edge progress
  animationState.edgeT += 1 / (animationState.edgeDuration / 16)
  if (animationState.edgeT >= 1) {
    animationState.edgeT = 0
    animationState.edgeIndex += 1
    if (animationState.edgeIndex >= shape.length - 1) {
      // if shape is open polyline (not closed), we stop at last point
      // treat shape as finished
      animationState.shapeIndex += 1
      animationState.edgeIndex = 0
    }
  }

  // redraw partial
  drawGrid(ctx)
  drawStoredShapes(ctx, true)
  // also draw currentPoints as faded (should be empty during animation normally)
  drawCurrentPoints(ctx)

  raf = requestAnimationFrame(step)
}

// helper color
function shapeColor(i: number) {
  const palette = ['#00ffd5', '#ffb86b', '#9be8ff', '#ffd1f0', '#d4ff9b']
  return palette[i % palette.length]
}
</script>

<style scoped>
.generator-root {
  display: flex;
  gap: 16px;
  color: #557c75;
  font-family: Inter, system-ui, sans-serif;
}
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.5);
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.row input { width: 90px }
.controls {
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-top:10px;
}
.controls button { padding:8px; border-radius:8px; cursor:pointer; border:none }
.controls button.active { background: linear-gradient(90deg,#00ffd5,#00b3ff); color:#001 }
.canvas-wrap {
  background: #05060a;
  border-radius: 10px;
  padding: 8px;
}
canvas { display:block; background: linear-gradient(180deg,#04111a,#010308); border-radius:8px }
.info { margin-top:12px; font-size:13px }
.hint { display:block; margin-top:10px; color: #9fd; font-size:12px }
.pointer-canvas { cursor: crosshair }
</style>
