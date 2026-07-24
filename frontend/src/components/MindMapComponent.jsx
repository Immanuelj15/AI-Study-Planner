import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function MindMapComponent({ mindmapData, topic }) {
  const defaultNodes = [
    {
      id: 'root',
      data: { label: `🎯 ${topic || 'Binary Search'}` },
      position: { x: 380, y: 30 }
    },
    {
      id: 'def',
      data: { label: '📖 Core Definition\nDivide & conquer search on sorted array' },
      position: { x: 80, y: 170 }
    },
    {
      id: 'concepts',
      data: { label: '💡 Key Invariants\nRequires sorted array & middle pointer logic' },
      position: { x: 380, y: 170 }
    },
    {
      id: 'apps',
      data: { label: '🚀 Applications\nDatabase indexing, B+ Trees & OS page lookup' },
      position: { x: 680, y: 170 }
    },
    {
      id: 'math',
      data: { label: '⚡ Time & Space Complexity\nTime: O(log N) | Space: O(1) Iterative' },
      position: { x: 220, y: 310 }
    },
    {
      id: 'interview',
      data: { label: '💼 Coding Interview Tip\nGuard against overflow: mid = low + (high-low)/2' },
      position: { x: 540, y: 310 }
    }
  ];

  const defaultEdges = [
    { id: 'e-root-def', source: 'root', target: 'def', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2.5 } },
    { id: 'e-root-concepts', source: 'root', target: 'concepts', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2.5 } },
    { id: 'e-root-apps', source: 'root', target: 'apps', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2.5 } },
    { id: 'e-concepts-math', source: 'concepts', target: 'math', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 2.5 } },
    { id: 'e-concepts-interview', source: 'concepts', target: 'interview', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 2.5 } }
  ];

  // Map & sanitize nodes to guarantee crystal clear text contrast & rich visuals
  const nodes = useMemo(() => {
    const rawNodes = (mindmapData && mindmapData.nodes && mindmapData.nodes.length > 0)
      ? mindmapData.nodes
      : defaultNodes;

    return rawNodes.map((node, idx) => {
      const isRoot = node.id === '1' || node.id === 'root' || idx === 0;
      const rawLabel = typeof node.data?.label === 'string' ? node.data.label : (topic || 'Concept Node');

      return {
        ...node,
        data: {
          ...node.data,
          label: (
            <div className="flex flex-col items-center justify-center text-center p-1 space-y-1">
              <span className={`font-poppins tracking-tight ${isRoot ? 'text-base font-black text-white' : 'text-xs font-bold text-[#F8FAFC]'}`}>
                {rawLabel.split('\n')[0]}
              </span>
              {rawLabel.split('\n').length > 1 && (
                <span className="text-[11px] font-inter text-[#94A3B8] font-medium leading-tight max-w-[220px]">
                  {rawLabel.split('\n').slice(1).join(' ')}
                </span>
              )}
            </div>
          )
        },
        style: {
          background: isRoot
            ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
            : '#1E293B',
          color: '#F8FAFC',
          borderRadius: isRoot ? '20px' : '16px',
          padding: isRoot ? '14px 24px' : '12px 18px',
          border: isRoot ? '2px solid #00E5FF' : '2px solid #334155',
          boxShadow: isRoot
            ? '0 0 25px rgba(0, 229, 255, 0.4), 0 10px 30px rgba(37, 99, 235, 0.5)'
            : '0 8px 24px rgba(0, 0, 0, 0.45)',
          maxWidth: isRoot ? '320px' : '260px',
          cursor: 'pointer',
          ...(node.style || {})
        }
      };
    });
  }, [mindmapData, topic]);

  const edges = useMemo(() => {
    if (mindmapData && mindmapData.edges && mindmapData.edges.length > 0) {
      return mindmapData.edges.map((e) => ({
        ...e,
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2.5, ...(e.style || {}) }
      }));
    }
    return defaultEdges;
  }, [mindmapData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-[620px] glass-card rounded-3xl border border-[#334155] relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-4 left-4 z-10 bg-[#1E293B]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#334155] text-xs font-poppins font-bold text-[#F8FAFC] shadow-lg flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping"></span>
        <span>Interactive Visual Concept Graph: {topic || 'Binary Search'}</span>
      </div>

      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-[#1E293B] text-[#F8FAFC] border-[#334155] rounded-xl shadow-lg" />
        <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" className="bg-[#1E293B] border-[#334155] rounded-2xl shadow-xl" />
      </ReactFlow>
    </motion.div>
  );
}
