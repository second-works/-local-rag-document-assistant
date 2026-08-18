"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";
import type { PDFDocumentLoadingTask, PDFPageProxy, RenderTask } from "pdfjs-dist/types/src/display/api";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function distance(first: { x: number; y: number }, second: { x: number; y: number }) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function PdfPageViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<PDFPageProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [renderVersion, setRenderVersion] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(Math.floor(entry.contentRect.width)));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    pageRef.current = null;
    setLoading(true);
    setError("");
    setZoom(1);

    void fetch(fileUrl, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("PDFの取得に失敗しました。");
        const data = new Uint8Array(await response.arrayBuffer());
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
        const task = pdfjs.getDocument({ data, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true });
        loadingTask = task;
        const pdf = await task.promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        pageRef.current = page;
        setRenderVersion((version) => version + 1);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "PDFを表示できませんでした。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      pageRef.current = null;
      renderTaskRef.current?.cancel();
      if (loadingTask) void loadingTask.destroy();
    };
  }, [fileUrl]);

  useEffect(() => {
    const page = pageRef.current;
    const canvas = canvasRef.current;
    if (!page || !canvas || stageWidth <= 0) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(220, stageWidth - 32);
    const fitScale = Math.min(availableWidth / baseViewport.width, 1.35);
    const viewport = page.getViewport({ scale: fitScale * zoom });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const context = canvas.getContext("2d");
    if (!context) return;

    renderTaskRef.current?.cancel();
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    const renderTask = page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
    });
    renderTaskRef.current = renderTask;
    let active = true;
    void renderTask.promise.catch((reason: unknown) => {
      if (active && reason instanceof Error && reason.name !== "RenderingCancelledException") setError("PDFの描画に失敗しました。");
    });
    return () => {
      active = false;
      renderTask.cancel();
    };
  }, [renderVersion, stageWidth, zoom]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...pointersRef.current.values()];
    if (pointers.length === 1) {
      dragStartRef.current = { x: event.clientX, y: event.clientY, scrollLeft: event.currentTarget.scrollLeft, scrollTop: event.currentTarget.scrollTop };
    } else if (pointers.length === 2) {
      dragStartRef.current = null;
      pinchStartRef.current = { distance: distance(pointers[0], pointers[1]), zoom };
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pointers = [...pointersRef.current.values()];
    const pinchStart = pinchStartRef.current;
    if (pointers.length === 2 && pinchStart && pinchStart.distance > 0) {
      setZoom(clampZoom(pinchStart.zoom * (distance(pointers[0], pointers[1]) / pinchStart.distance)));
    } else if (pointers.length === 1 && dragStartRef.current) {
      const dragStart = dragStartRef.current;
      const canScroll = event.currentTarget.scrollWidth > event.currentTarget.clientWidth || event.currentTarget.scrollHeight > event.currentTarget.clientHeight;
      if (canScroll) {
        event.currentTarget.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x);
        event.currentTarget.scrollTop = dragStart.scrollTop - (event.clientY - dragStart.y);
      }
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchStartRef.current = null;
    if (pointersRef.current.size === 1) {
      const [remaining] = [...pointersRef.current.values()];
      dragStartRef.current = { x: remaining.x, y: remaining.y, scrollLeft: event.currentTarget.scrollLeft, scrollTop: event.currentTarget.scrollTop };
    } else {
      dragStartRef.current = null;
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom((value) => clampZoom(value - event.deltaY * 0.01));
  }

  return (
    <div className="pdf-viewer-shell">
      <div className="pdf-zoom-controls" aria-label="PDF拡大縮小">
        <button className="secondary" type="button" onClick={() => setZoom((value) => clampZoom(value - 0.25))} disabled={zoom <= MIN_ZOOM} aria-label="PDFを縮小">−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button className="secondary" type="button" onClick={() => setZoom((value) => clampZoom(value + 0.25))} disabled={zoom >= MAX_ZOOM} aria-label="PDFを拡大">＋</button>
        <button className="secondary pdf-fit-button" type="button" onClick={() => setZoom(1)}>フィット</button>
      </div>
      <div
        ref={stageRef}
        className="pdf-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
        aria-label={`${title} A4縦PDF。1本指で移動、2本指で拡大縮小できます。`}
      >
        {loading && <div className="viewer-empty">PDFを描画しています…</div>}
        {error && !loading && <div className="viewer-empty">{error}</div>}
        <div className="pdf-page" hidden={loading || Boolean(error)}>
          <canvas ref={canvasRef} aria-label={`${title} ${"PDFページ"}`} />
        </div>
      </div>
      <p className="pdf-gesture-hint">A4縦表示 ・ 1本指で移動 ・ 2本指でピンチ拡大縮小 ・ ボタンでも操作できます</p>
    </div>
  );
}
