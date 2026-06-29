import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactFamilyTree from 'react-family-tree';
import type { Person } from '../types';
import { indexById, toTreeNodes, defaultRootId } from '../utils/relations';
import FamilyNode from './FamilyNode';

// The node cell is the layout unit: making it larger than the card inside
// (140px wide, see FamilyNode) spreads the tree out with generous gaps and
// lengthens the connector lines to match.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 240;

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2;
const clamp = (n: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, n));

interface Props {
  people: Person[];
  onSelect: (id: string) => void;
}

/** Interactive, zoomable family tree — wheel/buttons on desktop, pinch on touch. */
export default function TreeView({ people, onSelect }: Props) {
  const nodes = useMemo(() => toTreeNodes(people), [people]);
  const byId = useMemo(() => indexById(people), [people]);
  const rootId = useMemo(() => defaultRootId(people), [people]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const pendingScroll = useRef<{ x: number; y: number } | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const didFit = useRef(false);

  // Measure the tree's natural (unscaled) size; transforms don't affect it.
  useEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    const measure = () => setNatural({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes]);

  // Set zoom while keeping a focal point (in viewport coords) fixed on screen.
  const applyZoom = useCallback(
    (next: number, focalX?: number, focalY?: number) => {
      const c = scrollRef.current;
      const z = clamp(+next.toFixed(3));
      if (c && natural.w) {
        const fx = focalX ?? c.clientWidth / 2;
        const fy = focalY ?? c.clientHeight / 2;
        const old = zoomRef.current || 1;
        const contentX = (c.scrollLeft + fx) / old;
        const contentY = (c.scrollTop + fy) / old;
        pendingScroll.current = { x: contentX * z - fx, y: contentY * z - fy };
      }
      zoomRef.current = z;
      setZoom(z);
    },
    [natural],
  );

  // Apply the focal-corrected scroll after the resized layout commits.
  useLayoutEffect(() => {
    const c = scrollRef.current;
    const p = pendingScroll.current;
    if (c && p) {
      c.scrollLeft = p.x;
      c.scrollTop = p.y;
      pendingScroll.current = null;
    }
  }, [zoom]);

  const fitToView = useCallback(() => {
    const c = scrollRef.current;
    if (!c || !natural.w || !natural.h) return;
    const pad = 24;
    const z = Math.min(
      (c.clientWidth - pad) / natural.w,
      (c.clientHeight - pad) / natural.h,
    );
    const next = clamp(Math.min(z, 1)); // never auto-enlarge past 100%
    zoomRef.current = next;
    pendingScroll.current = null;
    setZoom(next);
  }, [natural]);

  // Auto-fit the whole tree into view the first time it's measured.
  useEffect(() => {
    if (!didFit.current && natural.w > 0) {
      didFit.current = true;
      fitToView();
    }
  }, [natural, fitToView]);

  // Ctrl/⌘ + wheel to zoom toward the cursor (desktop).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      applyZoom(zoomRef.current - e.deltaY * 0.0015, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  // Two-finger pinch to zoom toward the pinch midpoint (touch). One finger
  // still pans via native scrolling (touch-action: pan-x pan-y below).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let startDist = 0;
    let startZoom = 1;
    let fx = 0;
    let fy = 0;
    let pinching = false;
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      pinching = true;
      startDist = dist(e.touches) || 1;
      startZoom = zoomRef.current;
      const r = el.getBoundingClientRect();
      fx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
      fy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
    };
    const onMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length !== 2) return;
      e.preventDefault();
      applyZoom(startZoom * (dist(e.touches) / startDist), fx, fy);
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinching = false;
    };
    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [applyZoom]);

  if (people.length === 0 || !rootId) return null;

  return (
    <div className="relative">
      {/* Fit-to-view button */}
      <button
        onClick={fitToView}
        title="Fit the whole family in view"
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-3.5 py-2 text-sm font-bold text-grape shadow-card ring-1 ring-grape/15 backdrop-blur transition hover:bg-white dark:bg-slate-800/90 dark:text-violet-300 dark:ring-violet-400/20"
      >
        ⤢<span className="ml-1 hidden sm:inline">Fit</span>
      </button>

      {/* Mobile gesture hint */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/55 px-3 py-1 text-[11px] font-bold text-white sm:hidden">
        Pinch to zoom · drag to move
      </div>

      {/* Scroll / zoom viewport */}
      <div
        ref={scrollRef}
        style={{ touchAction: 'pan-x pan-y' }}
        className="h-[68vh] max-h-[760px] w-full overflow-auto overscroll-contain rounded-3xl bg-white/40 p-3 ring-1 ring-white/60 dark:bg-slate-900/40 dark:ring-white/10 sm:p-4"
      >
        <div style={{ width: natural.w * zoom, height: natural.h * zoom }} className="mx-auto">
          <div
            ref={treeRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', width: 'max-content' }}
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
    </div>
  );
}
