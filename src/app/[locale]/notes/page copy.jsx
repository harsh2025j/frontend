'use client'
/*
Next.js + Tailwind single-file React page component
Place this file in your Next.js project (app/page.jsx or pages/index.jsx).
Requires Tailwind CSS configured in the project.

Features:
- Canvas-based pen drawing (pointer events)
- Eraser tool (uses destination-out composite operation)
- Add / Delete pages
- Page-wise view (prev / next and thumbnails)
- Auto-save to localStorage (so pages persist)
- Export current page as PNG

Usage: drop into a Next.js page and run `npm run dev`.
*/

import React, { useRef, useState, useEffect } from "react";

export default function NotesApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const [tool, setTool] = useState("pen"); // 'pen' or 'eraser'
  const [penSize, setPenSize] = useState(3);
  const [pages, setPages] = useState([]); // stores data URLs
  const [current, setCurrent] = useState(0);

  // helpers for localStorage
  const STORAGE_KEY = "notes_pages_v1";

  useEffect(() => {
    // setup canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
      // after resizing, redraw current page if exists
      if (pages[current]) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = pages[current];
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [pages, current]);

  useEffect(() => {
    // load pages from localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setPages(parsed);
          setCurrent(0);
          return;
        }
      } catch (e) {
        console.warn("failed to parse pages from storage", e);
      }
    }
    // if no pages in storage, create one blank page
    setPages([null]);
    setCurrent(0);
  }, []);

  useEffect(() => {
    // whenever pages change, persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }, [pages]);

  function getCanvasCoords(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function pointerDown(e) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawingRef.current = true;
    const p = getCanvasCoords(e);
    lastPointRef.current = p;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function pointerMove(e) {
    const ctx = ctxRef.current;
    if (!ctx || !drawingRef.current) return;
    const p = getCanvasCoords(e);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)"; // color ignored in eraser mode
      ctx.lineWidth = penSize * 6; // eraser bigger
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#111827"; // tailwind gray-900
      ctx.lineWidth = penSize;
    }
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  }

  function pointerUp() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawingRef.current = false;
    ctx.closePath();
    saveCurrentPageToState();
  }

  function saveCurrentPageToState() {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // capture at CSS size to keep stable
    const dataUrl = canvas.toDataURL("image/png");
    setPages((prev) => {
      const copy = [...prev];
      copy[current] = dataUrl;
      return copy;
    });
  }

  function loadPageToCanvas(index) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const data = pages[index];
    if (data) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = data;
    }
  }

  useEffect(() => {
    // whenever current changes, load that page
    loadPageToCanvas(current);
  }, [current]);

  function addPage() {
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(current + 1, 0, null);
      return copy;
    });
    setCurrent((c) => c + 1);
    // small delay to ensure canvas redraw
    setTimeout(() => loadPageToCanvas(current + 1), 50);
  }

  function deletePage(index) {
    if (pages.length === 1) {
      // clear the single page
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, rect.width, rect.height);
      setPages([null]);
      setCurrent(0);
      return;
    }
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setCurrent((c) => Math.max(0, Math.min(c - 1, pages.length - 2)));
  }

  function clearPage() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    saveCurrentPageToState();
  }

  function exportPNG() {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-${current + 1}.png`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Simple Page‑wise Notes (Next.js + Tailwind)</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setTool("pen")}
              className={`px-3 py-1 rounded-md border ${tool === "pen" ? "bg-white shadow" : "bg-gray-100"}`}
            >
              Pen
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`px-3 py-1 rounded-md border ${tool === "eraser" ? "bg-white shadow" : "bg-gray-100"}`}
            >
              Eraser
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md border bg-gray-100">
              <label className="text-sm">Size</label>
              <input
                type="range"
                min={1}
                max={10}
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
              />
            </div>
            <button onClick={clearPage} className="px-3 py-1 rounded-md border bg-red-50 text-red-700">Clear</button>
            <button onClick={exportPNG} className="px-3 py-1 rounded-md border bg-green-50 text-green-700">Export PNG</button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <aside className="md:col-span-1 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} className="flex-1 py-2 rounded bg-gray-100">Prev</button>
                <button onClick={() => setCurrent((c) => Math.min(pages.length - 1, c + 1))} className="flex-1 py-2 rounded bg-gray-100">Next</button>
              </div>

              <div className="flex gap-2">
                <button onClick={addPage} className="flex-1 py-2 rounded bg-blue-600 text-white">Add Page</button>
                <button onClick={() => deletePage(current)} className="flex-1 py-2 rounded bg-red-600 text-white">Delete</button>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-medium mb-2">Pages</h3>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {pages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`w-full flex items-center gap-2 p-2 rounded border ${idx === current ? "ring-2 ring-blue-400" : "bg-gray-50"}`}
                    >
                      <div className="w-12 h-8 bg-white border flex items-center justify-center overflow-hidden">
                        {p ? (
                          // thumbnail
                          <img src={p} alt={`page-${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">blank</span>
                        )}
                      </div>
                      <div className="text-left text-sm">
                        <div>Page {idx + 1}</div>
                        <div className="text-xs text-gray-500">{p ? "saved" : "empty"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Saved automatically to <strong>localStorage</strong>. Use Export to download a page as PNG.
              </div>
            </div>
          </aside>

          <section className="md:col-span-3 bg-white rounded-lg shadow-sm p-3">
            <div className="border rounded-md overflow-hidden" style={{ height: "70vh" }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerLeave={pointerUp}
                style={{ background: "white", display: "block", touchAction: "none" }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
