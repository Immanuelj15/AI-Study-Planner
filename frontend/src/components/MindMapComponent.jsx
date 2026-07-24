import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function MindMapComponent({ mindmapData, topic }) {
  const defaultNodes = [
    {
      id: 'root',
      data: { label: `🎯 ${topic || 'Study Topic'}` },
      position: { x: 350, y: 40 },
      style: { background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', color: '#ffffff', fontWeight: 'bold', borderRadius: '16px', padding: '14px 24px', fontSize: '15px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }
    },
    {
      id: 'def',
      data: { label: '📖 Definition & Core Rules' },
      position: { x: 100, y: 170 },
      style: { background: '#1E293B', color: '#06B6D4', border: '1px solid #06B6D4', borderRadius: '12px', padding: '12px', fontSize: '13px' }
    },
    {
      id: 'concepts',
      data: { label: '💡 Key Concepts & Invariants' },
      position: { x: 350, y: 170 },
      style: { background: '#1E293B', color: '#8B5CF6', border: '1px solid #8B5CF6', borderRadius: '12px', padding: '12px', fontSize: '13px' }
    },
    {
      id: 'apps',
      data: { label: '🚀 Practical Applications' },
      position: { x: 600, y: 170 },
      style: { background: '#1E293B', color: '#10B981', border: '1px solid #10B981', borderRadius: '12px', padding: '12px', fontSize: '13px' }
    },
    {
      id: 'math',
      data: { label: '⚡ Time & Space Complexity' },
      position: { x: 220, y: 290 },
      style: { background: '#1E293B', color: '#F59E0B', border: '1px solid #F59E0B', borderRadius: '12px', padding: '12px', fontSize: '13px' }
    },
    {
      id: 'interview',
      data: { label: '💼 Coding Interview Q&A' },
      position: { x: 480, y: 290 },
      style: { background: '#1E293B', color: '#EC4899', border: '1px solid #EC4899', borderRadius: '12px', padding: '12px', fontSize: '13px' }
    }
  ];

  const defaultEdges = [
    { id: 'e-root-def', source: 'root', target: 'def', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
    { id: 'e-root-concepts', source: 'root', target: 'concepts', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
    { id: 'e-root-apps', source: 'root', target: 'apps', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
    { id: 'e-concepts-math', source: 'concepts', target: 'math', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 2 } },
    { id: 'e-concepts-interview', source: 'concepts', target: 'interview', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 2 } }
  ];

  const nodes = useMemo(() => {
    if (mindmapData && mindmapData.nodes && mindmapData.nodes.length > 0) {
      return mindmapData.nodes;
    }
    return defaultNodes;
  }, [mindmapData, topic]);

  const edges = useMemo(() => {
    if (mindmapData && mindmapData.edges && mindmapData.edges.length > 0) {
      return mindmapData.edges;
    }
    return defaultEdges;
  }, [mindmapData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-[580px] glass-card rounded-3xl border border-[#334155] relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-4 left-4 z-10 bg-[#1E293B]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#334155] text-xs font-poppins font-bold text-[#F8FAFC] shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping"></span>
        <span>React Flow Animated Mind Map: {topic || 'Interactive Graph'}</span>
      </div>

      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#334155" gap={18} size={1} />
        <Controls className="bg-[#1E293B] text-[#F8FAFC] border-[#334155] rounded-xl shadow-lg" />
        <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" className="bg-[#1E293B] border-[#334155] rounded-2xl shadow-xl" />
      </ReactFlow>
    </motion.div>
  );
}
