import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function MindMapComponent({ mindmapData, topic }) {
  const defaultNodes = [
    { id: '1', data: { label: topic || 'Topic' }, position: { x: 300, y: 50 }, style: { background: '#6366f1', color: '#fff', fontWeight: 'bold', borderRadius: '12px', padding: '12px 20px' } },
    { id: '2', data: { label: 'Definition' }, position: { x: 100, y: 180 }, style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '10px' } },
    { id: '3', data: { label: 'Concepts' }, position: { x: 300, y: 180 }, style: { background: '#1e293b', color: '#a855f7', border: '1px solid #a855f7', borderRadius: '8px', padding: '10px' } },
    { id: '4', data: { label: 'Applications' }, position: { x: 500, y: 180 }, style: { background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '8px', padding: '10px' } }
  ];

  const defaultEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#6366f1' } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#6366f1' } }
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
    <div className="w-full h-[550px] glass-card rounded-2xl border border-slate-800 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
        Interactive Mind Map (React Flow)
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#334155" gap={16} size={1} />
        <Controls className="bg-slate-900 text-slate-200 border-slate-700" />
        <MiniMap nodeColor="#4f46e5" maskColor="rgba(15, 23, 42, 0.7)" className="bg-slate-900 border-slate-700 rounded-xl" />
      </ReactFlow>
    </div>
  );
}
