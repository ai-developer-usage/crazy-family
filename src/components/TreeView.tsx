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

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const clamp = (n: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, n));

interface Props {
  people: Person[];
  onSelect: (id: string) => void;
}

/** Interactive, zoomable family tree built on relatives-tree. */
export default function TreeView({ people, onSelect }: Props) {
  const nodes = useMemo(() => toTreeNodes(people), [people]);
  const byId = useMemo(() => indexById(people), [people]);
  const rootId = useMemo(() => defaultRootId(people), [people]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const didFit = useRef(false);

  // Measure the tree's natural (unscaled) size so we can size the scroll area
  // and compute a fit-to-screen zoom. transforms don't affect offset sizes.
  useEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    const measure = () =>
      setNatural({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes]);

  const fitToView = useCallback(() => {
    const c = scrollRef.current;
    if (!c || !natural.w || !natural.h) return;
    const pad = 32;
    const z = Math.min(
      (c.clientWidth - pad) / natural.w,
      (c.clientHeight - pad) / natural.h,
    );
    setZoom(clamp(Math.min(z, 1))); // never auto-enlarge past 100%
  }, [natural]);

  // Auto-fit the whole tree into view the first time it's measured.
  useEffect(() => {
    if (!didFit.current && natural.w > 0) {
      didFit.current = true;
      fitToView();
    }
  }, [natural, fitToView]);

  // Ctrl/⌘ + mouse wheel to zoom (needs a non-passive listener to preventDefault).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clamp(+(z - e.deltaY * 0.0015).toFixed(2)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  if (people.length === 0 || !rootId) return null;

  const pct = Math.round(zoom * 100);

  return (
    <div className="relative">
      {/* Zoom toolbar */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white/85 p-1 shadow-card ring-1 ring-grape/15 backdrop-blur dark:bg-slate-800/85 dark:ring-violet-400/20">
        <ZoomBtn
          label="−"
          title="Zoom out"
          onClick={() => setZoom((z) => clamp(+(z - 0.1).toFixed(2)))}
          disabled={zoom <= MIN_ZOOM}
        />
        <button
          onClick={() => setZoom(1)}
          title="Reset to 100%"
          className="min-w-[3.25rem] rounded-full px-2 py-1 text-sm font-bold text-slate-600 hover:bg-grape/10 dark:text-slate-300"
        >
          {pct}%
        </button>
        <ZoomBtn
          label="+"
          title="Zoom in"
          onClick={() => setZoom((z) => clamp(+(z + 0.1).toFixed(2)))}
          disabled={zoom >= MAX_ZOOM}
        />
        <button
          onClick={fitToView}
          title="Fit the whole family in view"
          className="rounded-full px-3 py-1 text-sm font-bold text-grape hover:bg-grape/10 dark:text-violet-300"
        >
          ⤢ Fit
        </button>
      </div>

      {/* Scroll / zoom viewport */}
      <div
        ref={scrollRef}
        className="h-[72vh] w-full overflow-auto rounded-3xl bg-white/40 p-4 ring-1 ring-white/60 dark:bg-slate-900/40 dark:ring-white/10"
      >
        <div style={{ width: natural.w * zoom, height: natural.h * zoom }} className="mx-auto">
          <div
            ref={treeRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              width: 'max-content',
            }}
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

function ZoomBtn({
  label,
  title,
  onClick,
  disabled,
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-slate-600 transition hover:bg-grape/10 disabled:opacity-40 dark:text-slate-300"
    >
      {label}
    </button>
  );
}
