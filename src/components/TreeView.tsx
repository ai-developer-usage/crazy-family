import { useEffect, useMemo, useState } from 'react';
import ReactFamilyTree from 'react-family-tree';
import type { Person } from '../types';
import { indexById, toTreeNodes, defaultRootId } from '../utils/relations';
import FamilyNode from './FamilyNode';

// The node cell is the layout unit: making it larger than the card inside
// (140px wide, see FamilyNode) spreads the tree out with generous gaps and
// lengthens the connector lines to match.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 240;

interface Props {
  people: Person[];
  onSelect: (id: string) => void;
}

/** Interactive, pan-able family tree built on relatives-tree. */
export default function TreeView({ people, onSelect }: Props) {
  const nodes = useMemo(() => toTreeNodes(people), [people]);
  const byId = useMemo(() => indexById(people), [people]);
  const [rootId, setRootId] = useState<string | undefined>(() =>
    defaultRootId(people),
  );

  // Keep the chosen root valid as people are added/removed.
  useEffect(() => {
    if (!rootId || !byId.has(rootId)) setRootId(defaultRootId(people));
  }, [people, rootId, byId]);

  if (people.length === 0 || !rootId) {
    return null;
  }

  return (
    <div className="w-full overflow-auto rounded-3xl bg-white/40 p-6 ring-1 ring-white/60 dark:bg-slate-900/40 dark:ring-white/10">
      <div className="mx-auto w-max">
        <ReactFamilyTree
          nodes={nodes}
          rootId={rootId}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          className="crazy-tree relative"
          renderNode={(node: {
            id: string;
            left: number;
            top: number;
            hasSubTree: boolean;
          }) => {
            const person = byId.get(node.id);
            if (!person) return null;
            return (
              <FamilyNode
                key={node.id}
                person={person}
                isRoot={node.id === rootId}
                hasSubTree={node.hasSubTree}
                onSelect={onSelect}
                onFocus={setRootId}
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
  );
}
