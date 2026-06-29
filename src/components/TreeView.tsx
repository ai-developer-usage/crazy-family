import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFamilyTree from 'react-family-tree';
import type { Person } from '../types';
import { indexById, toTreeNodes, defaultRootId } from '../utils/relations';
import FamilyNode from './FamilyNode';

// The node cell is the layout unit: making it larger than the card inside
// (140px wide, see FamilyNode) spreads the tree out with generous gaps and
// lengthens the connector lines to match.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 240;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.5;
const clamp = (n: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, n));

interface Props {
  people: Person[];
  onSelect: (id: string) => void;
}

/**
 * Interactive family tree with pan + zoom driven by a single CSS transform that
 * we mutate synchronously inside the gesture handlers. Doing the maths
 * ourselves (instead of round-tripping through native scroll + React state)
 * keeps pinch/zoom anchored exactly on the focal point — your fingers on touch,
 * the cursor on desktop.
 */
export default function TreeView({ people, onSelect }: Props) {
  const nodes = useMemo(() => toTreeNodes(people), [people]);
  const byId = useMemo(() => indexById(people), [people]);
  const rootId = useMemo(() => defaultRootId(people), [people]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live transform state lives in refs so handlers read/write it synchronously.
  const scale = useRef(1);
  const tx = useRef(0);
  const ty = useRef(0);
  const natural = useRef({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  const applyTransform = useCallback(() => {
    const el = contentRef.current;
    if (el) {
      el.style.transform = `translate(${tx.current}px, ${ty.current}px) scale(${scale.current})`;
    }
  }, []);

  // Keep the tree centred when smaller than the viewport, and within bounds
  // (no dragging it fully off-screen) when larger.
  const clampPan = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const cw = natural.current.w * scale.current;
    const ch = natural.current.h * scale.current;
    tx.current =
      cw <= vw ? (vw - cw) / 2 : Math.min(0, Math.max(vw - cw, tx.current));
    ty.current =
      ch <= vh ? (vh - ch) / 2 : Math.min(0, Math.max(vh - ch, ty.current));
  }, []);

  // Zoom to `next`, keeping the content point under (fx, fy) fixed on screen.
  const zoomTo = useCallback(
    (next: number, fx: number, fy: number) => {
      const s = scale.current;
      const ns = clamp(next);
      if (ns === s) return;
      tx.current = fx - (fx - tx.current) * (ns / s);
      ty.current = fy - (fy - ty.current) * (ns / s);
      scale.current = ns;
      clampPan();
      applyTransform();
    },
    [applyTransform, clampPan],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      tx.current += dx;
      ty.current += dy;
      clampPan();
      applyTransform();
    },
    [applyTransform, clampPan],
  );

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    const n = natural.current;
    if (!vp || !n.w) return;
    const pad = 24;
    scale.current = clamp(
      Math.min((vp.clientWidth - pad) / n.w, (vp.clientHeight - pad) / n.h, 1),
    );
    clampPan();
    applyTransform();
  }, [applyTransform, clampPan]);

  // Measure natural (untransformed) size; fit once when first known.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      natural.current = { w: el.offsetWidth, h: el.offsetHeight };
      if (!ready && natural.current.w > 0) {
        fit();
        setReady(true);
      } else {
        clampPan();
        applyTransform();
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Gesture handlers (touch pinch/drag, mouse drag, wheel).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = () => vp.getBoundingClientRect();
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    let mode: 'none' | 'pan' | 'pinch' = 'none';
    let lastX = 0;
    let lastY = 0;
    let startDist = 0;
    let startScale = 1;
    let focalX = 0;
    let focalY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        mode = 'pan';
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      } else if (e.touches.length >= 2) {
        mode = 'pinch';
        startDist = dist(e.touches) || 1;
        startScale = scale.current;
        const r = rect();
        focalX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        focalY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (mode === 'pinch' && e.touches.length >= 2) {
        e.preventDefault();
        zoomTo(startScale * (dist(e.touches) / startDist), focalX, focalY);
      } else if (mode === 'pan' && e.touches.length === 1) {
        e.preventDefault();
        panBy(e.touches[0].clientX - lastX, e.touches[0].clientY - lastY);
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) mode = 'none';
      else if (e.touches.length === 1) {
        mode = 'pan';
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    };

    let dragging = false;
    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      panBy(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMouseUp = () => {
      dragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = rect();
      if (e.ctrlKey || e.metaKey) {
        zoomTo(
          scale.current * Math.exp(-e.deltaY * 0.0015),
          e.clientX - r.left,
          e.clientY - r.top,
        );
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    };

    vp.addEventListener('touchstart', onTouchStart, { passive: false });
    vp.addEventListener('touchmove', onTouchMove, { passive: false });
    vp.addEventListener('touchend', onTouchEnd);
    vp.addEventListener('touchcancel', onTouchEnd);
    vp.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      vp.removeEventListener('touchstart', onTouchStart);
      vp.removeEventListener('touchmove', onTouchMove);
      vp.removeEventListener('touchend', onTouchEnd);
      vp.removeEventListener('touchcancel', onTouchEnd);
      vp.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      vp.removeEventListener('wheel', onWheel);
    };
  }, [zoomTo, panBy]);

  if (people.length === 0 || !rootId) return null;

  return (
    <div className="relative">
      {/* Fit-to-view button */}
      <button
        onClick={fit}
        title="Fit the whole family in view"
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-3.5 py-2 text-sm font-bold text-grape shadow-card ring-1 ring-grape/15 backdrop-blur transition hover:bg-white dark:bg-slate-800/90 dark:text-violet-300 dark:ring-violet-400/20"
      >
        ⤢<span className="ml-1 hidden sm:inline">Fit</span>
      </button>

      {/* Mobile gesture hint */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/55 px-3 py-1 text-[11px] font-bold text-white sm:hidden">
        Pinch to zoom · drag to move
      </div>

      {/* Pan / zoom viewport */}
      <div
        ref={viewportRef}
        style={{ touchAction: 'none' }}
        className="relative h-[68vh] max-h-[760px] w-full cursor-grab select-none overflow-hidden rounded-3xl bg-white/40 ring-1 ring-white/60 active:cursor-grabbing dark:bg-slate-900/40 dark:ring-white/10"
      >
        <div
          ref={contentRef}
          style={{
            transformOrigin: '0 0',
            willChange: 'transform',
            width: 'max-content',
          }}
          className={`absolute left-0 top-0 transition-opacity duration-300 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ReactFamilyTree
            nodes={nodes}
            rootId={rootId}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            className="crazy-tree relative"
            renderNode={(node: { id: string; left: number; top: number }) => {
              const person = byId.get(node.id);
              if (!person) return null;
              return (
                <FamilyNode
                  key={node.id}
                  person={person}
                  isRoot={node.id === rootId}
                  onSelect={onSelect}
                  style={{
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    transform: `translate(${node.left * (NODE_WIDTH / 2)}px, ${
                      node.top * (NODE_HEIGHT / 2)
                    }px)`,
                  }}
                />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
