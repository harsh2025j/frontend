'use client'

/*
Next.js + Tailwind single-file React page component (v4 modern)
Features:
- File / Notebook system with folders
- Sidebar + file explorer
- Pen, highlighter, marker, eraser, shapes (line, rect, circle), text
- Pen color, size, BG color
- Export as PNG
- Fullscreen
- Focus / Distraction-free writing mode
- Dark / Light theme toggle
- Modern UI, responsive, shadowed buttons, animations
- Data saved in localStorage
*/

import React, { useRef, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function NotesApp() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawingRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })

  const STORAGE_KEY = 'notes_app_v4'

  // Workspace state
  const [workspace, setWorkspace] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {}
    return {
      folders: [
        {
          id: uuidv4(),
          name: 'My Notes',
          files: [{ id: uuidv4(), name: 'Notebook 1', pages: [null], currentPage: 0 }],
        },
      ],
      ui: { selectedFolderId: null, selectedFileId: null },
    }
  })

  useEffect(() => {
    setWorkspace((ws) => {
      if (!ws.ui.selectedFolderId) {
        const f = ws.folders[0]
        return { ...ws, ui: { selectedFolderId: f.id, selectedFileId: f.files[0].id } }
      }
      return ws
    })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  }, [workspace])

  // Tools
  const [tool, setTool] = useState('pen')
  const [penSize, setPenSize] = useState(3)
  const [color, setColor] = useState('#111827')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showSidebar, setShowSidebar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Helpers
  function findSelectedFile() {
    const f = workspace.folders.find((x) => x.id === workspace.ui.selectedFolderId)
    if (!f) return null
    const file = f.files.find((x) => x.id === workspace.ui.selectedFileId)
    return { folder: f, file }
  }

  // Canvas setup & resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx
      loadCurrentPageToCanvas()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [workspace.ui.selectedFileId, workspace.ui.selectedFolderId, bgColor])

  useEffect(() => {
    loadCurrentPageToCanvas()
  }, [workspace.ui.selectedFileId, workspace.ui.selectedFolderId, workspace])

  function getCanvasRect() {
    const canvas = canvasRef.current
    return canvas.getBoundingClientRect()
  }

  function getCoords(e) {
    const rect = getCanvasRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  // Pointer events
  function pointerDown(e) {
    const ctx = ctxRef.current
    if (!ctx) return
    drawingRef.current = true
    const p = getCoords(e)
    startRef.current = p
    if (tool === 'text') {
      const txt = prompt('Enter text')
      if (txt) {
        ctx.fillStyle = color
        ctx.font = `${Math.max(14, penSize * 4)}px sans-serif`
        ctx.fillText(txt, p.x, p.y)
        saveCurrentCanvasToState()
      }
      drawingRef.current = false
      return
    }
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  function pointerMove(e) {
    const ctx = ctxRef.current
    if (!ctx || !drawingRef.current) return
    const p = getCoords(e)
    if (tool === 'pen' || tool === 'highlighter' || tool === 'marker') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = penSize * (tool === 'highlighter' ? 6 : tool === 'marker' ? 4 : 1)
      ctx.globalAlpha = tool === 'highlighter' ? 0.35 : 1
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = penSize * 6
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    } else {
      // Shapes preview
      loadCurrentPageToCanvas(() => {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = penSize
        const s = startRef.current
        if (tool === 'line') {
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        } else if (tool === 'rect') {
          ctx.strokeRect(s.x, s.y, p.x - s.x, p.y - s.y)
        } else if (tool === 'circle') {
          const r = Math.hypot(p.x - s.x, p.y - s.y)
          ctx.beginPath()
          ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
    }
  }

  function pointerUp(e) {
    const ctx = ctxRef.current
    if (!ctx) return
    if (!drawingRef.current) return
    drawingRef.current = false
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.closePath()
    saveCurrentCanvasToState()
  }

  function saveCurrentCanvasToState() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      if (!folder) return newWs
      const file = folder.files.find((fi) => fi.id === newWs.ui.selectedFileId)
      if (!file) return newWs
      const copyPages = [...file.pages]
      copyPages[file.currentPage] = dataUrl
      file.pages = copyPages
      return newWs
    })
  }

  function loadCurrentPageToCanvas(callback) {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, rect.width, rect.height)
    const sel = findSelectedFile()
    if (!sel || !sel.file) return
    const page = sel.file.pages[sel.file.currentPage]
    if (page) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        if (callback) callback()
      }
      img.src = page
    } else if (callback) callback()
  }

  // File/Folder actions
  function addFolder() {
    const name = prompt('Folder name') || 'New Folder'
    setWorkspace((ws) => ({ ...ws, folders: [...ws.folders, { id: uuidv4(), name, files: [] }] }))
  }
  function addFile() {
    const name = prompt('File / Notebook name') || 'Notebook'
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      if (!folder) return newWs
      folder.files.push({ id: uuidv4(), name, pages: [null], currentPage: 0 })
      newWs.ui.selectedFileId = folder.files[folder.files.length - 1].id
      return newWs
    })
  }
  function addPage() {
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      if (!folder) return newWs
      const file = folder.files.find((fi) => fi.id === newWs.ui.selectedFileId)
      if (!file) return newWs
      file.pages.splice(file.currentPage + 1, 0, null)
      file.currentPage += 1
      return newWs
    })
    setTimeout(() => loadCurrentPageToCanvas(), 50)
  }
  function deletePage() {
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      if (!folder) return newWs
      const file = folder.files.find((fi) => fi.id === newWs.ui.selectedFileId)
      if (!file) return newWs
      if (file.pages.length === 1) {
        file.pages = [null]
        file.currentPage = 0
      } else {
        file.pages.splice(file.currentPage, 1)
        file.currentPage = Math.max(0, file.currentPage - 1)
      }
      return newWs
    })
    setTimeout(() => loadCurrentPageToCanvas(), 50)
  }
  function prevPage() {
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      const file = folder.files.find((fi) => fi.id === newWs.ui.selectedFileId)
      file.currentPage = Math.max(0, file.currentPage - 1)
      return newWs
    })
    setTimeout(() => loadCurrentPageToCanvas(), 50)
  }
  function nextPage() {
    setWorkspace((ws) => {
      const newWs = { ...ws }
      const folder = newWs.folders.find((f) => f.id === newWs.ui.selectedFolderId)
      const file = folder.files.find((fi) => fi.id === newWs.ui.selectedFileId)
      file.currentPage = Math.min(file.pages.length - 1, file.currentPage + 1)
      return newWs
    })
    setTimeout(() => loadCurrentPageToCanvas(), 50)
  }

  function selectFile(folderId, fileId) {
    setWorkspace((ws) => ({ ...ws, ui: { selectedFolderId: folderId, selectedFileId: fileId } }))
  }

  function exportPNG() {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `page.png`
    a.click()
  }

  function toggleFullscreen() {
    const el = document.documentElement
    if (!document.fullscreenElement) {
      el.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const sel = findSelectedFile()
  const file = sel ? sel.file : null

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col transition-colors`}>
      {/* Top Bar */}
      {!focusMode && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar((s) => !s)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"> {showSidebar ? 'Hide' : 'Show'} Explorer </button>
            <h1 className="text-lg font-semibold">InkNotes — Modern Notebook</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addFolder} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 shadow hover:shadow-md transition">New Folder</button>
            <button onClick={addFile} className="px-3 py-1 rounded bg-blue-600 text-white shadow hover:shadow-md transition">New File</button>
            <button onClick={toggleFullscreen} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 shadow hover:shadow-md transition">{isFullscreen ? 'Exit Full' : 'Full Screen'}</button>
            <button onClick={() => setFocusMode((f) => !f)} className="px-3 py-1 rounded bg-purple-600 text-white shadow hover:shadow-md transition">{focusMode ? 'Show UI' : 'Focus Mode'}</button>
            <button onClick={() => setDarkMode((d) => !d)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 shadow hover:shadow-md transition">{darkMode ? 'Light' : 'Dark'}</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!focusMode && showSidebar && (
          <aside className="bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-3 w-72 transition-all overflow-y-auto">
            <div className="space-y-3">
              {workspace.folders.map((folder) => (
                <div key={folder.id}>
                  <div className="text-sm font-medium">{folder.name}</div>
                  <div className="space-y-1 pl-2 mt-1">
                    {folder.files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => selectFile(folder.id, f.id)}
                        className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${workspace.ui.selectedFileId === f.id ? 'bg-blue-50 dark:bg-blue-900 ring-1 ring-blue-200 dark:ring-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} transition`}
                      >
                        <div>
                          <div className="text-sm">{f.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-400">Page {f.currentPage + 1}/{f.pages.length}</div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">{f.pages[f.currentPage] ? 'saved' : 'empty'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main area */}
        <main className={`flex-1 flex flex-col p-4 transition-all ${focusMode ? 'p-0' : ''}`}>
          {/* Tools */}
          {!focusMode && (
            <div className="flex flex-wrap gap-4 mb-3 items-center">
              <div className="bg-white dark:bg-gray-800 p-2 rounded shadow flex items-center gap-2 flex-wrap">
                {['pen','highlighter','marker','eraser','line','rect','circle','text'].map(t => (
                  <button key={t} onClick={() => setTool(t)} className={`px-3 py-1 rounded ${tool===t?'bg-gray-200 dark:bg-gray-700 shadow':'hover:bg-gray-100 dark:hover:bg-gray-700'} transition`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 p-2 rounded shadow flex items-center gap-2 flex-wrap">
                <label className="text-xs">Color</label>
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-8 h-8 p-0 border-0"/>
                <label className="text-xs">BG</label>
                <input type="color" value={bgColor} onChange={e=>{setBgColor(e.target.value); setTimeout(()=>loadCurrentPageToCanvas(),50)}} className="w-8 h-8 p-0 border-0"/>
                <label className="text-xs">Size</label>
                <input type="range" min={1} max={20} value={penSize} onChange={e=>setPenSize(Number(e.target.value))}/>
              </div>

              <div className="ml-auto flex items-center gap-2 flex-wrap">
                <button onClick={prevPage} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 shadow hover:shadow-md transition">Prev</button>
                <button onClick={nextPage} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 shadow hover:shadow-md transition">Next</button>
                <button onClick={addPage} className="px-3 py-1 rounded bg-blue-600 text-white shadow hover:shadow-md transition">Add Page</button>
                <button onClick={deletePage} className="px-3 py-1 rounded bg-red-50 text-red-600 shadow hover:shadow-md transition">Delete</button>
                <button onClick={exportPNG} className="px-3 py-1 rounded bg-green-50 text-green-700 shadow hover:shadow-md transition">Export</button>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className={`flex-1 border rounded bg-white dark:bg-gray-900 shadow-sm relative transition-all`} style={{height: focusMode?'100%':'75vh'}}>
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
              onPointerLeave={pointerUp}
              style={{ background: bgColor, display: 'block', touchAction: 'none' }}
            />
          </div>
        </main>
      </div>

      {!focusMode && <footer className="p-3 text-xs text-gray-500 dark:text-gray-400 text-center">Saved locally — all data stored in your browser's localStorage.</footer>}
    </div>
  )
}
