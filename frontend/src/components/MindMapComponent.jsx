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
    { id: 'e-root-def', source: 'root', target: 'def', animated: true, style: { stroke: '#2563EB', strokeWidth: 2.5 } },
    { id: 'e-root-concepts', source: 'root', target: 'concepts', animated: true, style: { stroke: '#2563EB', strokeWidth: 2.5 } },
    { id: 'e-root-apps', source: 'root', target: 'apps', animated: true, style: { stroke: '#2563EB', strokeWidth: 2.5 } },
    { id: 'e-concepts-math', source: 'concepts', target: 'math', animated: true, style: { stroke: '#38BDF8', strokeWidth: 2.5 } },
    { id: 'e-concepts-interview', source: 'concepts', target: 'interview', animated: true, style: { stroke: '#38BDF8', strokeWidth: 2.5 } }
  ];

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
              <span className={`font-poppins tracking-tight ${isRoot ? 'text-base font-black text-white' : 'text-xs font-bold text-[#1E293B]'}`}>
                {rawLabel.split('\n')[0]}
              </span>
              {rawLabel.split('\n').length > 1 && (
                <span className={`text-[11px] font-inter font-medium leading-tight max-w-[220px] ${isRoot ? 'text-blue-100' : 'text-[#64748B]'}`}>
                  {rawLabel.split('\n').slice(1).join(' ')}
                </span>
              )}
            </div>
          )
        },
        style: {
          background: isRoot
            ? 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)'
            : '#FFFFFF',
          color: isRoot ? '#FFFFFF' : '#1E293B',
          borderRadius: isRoot ? '20px' : '16px',
          padding: isRoot ? '14px 24px' : '12px 18px',
          border: isRoot ? '2px solid #2563EB' : '2px solid #E2E8F0',
          boxShadow: isRoot
            ? '0 10px 30px rgba(37, 99, 235, 0.35)'
            : '0 4px 20px rgba(37, 99, 235, 0.08)',
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
        style: { stroke: '#2563EB', strokeWidth: 2.5, ...(e.style || {}) }
      }));
    }
    return defaultEdges;
  }, [mindmapData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-[620px] glass-card rounded-3xl border border-[#E2E8F0] relative overflow-hidden shadow-soft bg-[#FFFFFF]"
    >
      <div className="absolute top-4 left-4 z-10 bg-[#FFFFFF]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E2E8F0] text-xs font-poppins font-bold text-[#1E293B] shadow-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping"></span>
        <span>Interactive Visual Concept Graph: {topic || 'Binary Search'}</span>
      </div>

      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#CBD5E1" gap={20} size={1} />
        <Controls className="bg-[#FFFFFF] text-[#1E293B] border-[#E2E8F0] rounded-xl shadow-sm" />
        <MiniMap nodeColor="#2563EB" maskColor="rgba(248, 251, 255, 0.7)" className="bg-[#FFFFFF] border-[#E2E8F0] rounded-2xl shadow-sm" />
      </ReactFlow>
    </motion.div>
  );
}
