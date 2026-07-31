import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Minimize2, Sparkles, BookOpen, Layers, X, Info, Search, CheckCircle2 } from 'lucide-react';
import MindMapNodePanel from './MindMapNodePanel';

export default function MindMapComponent({ mindmapData, topic, onAskAITutor }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultNodes = [
    {
      id: 'root',
      data: { label: `🎯 ${topic || 'Binary Search'}` },
      position: { x: 380, y: 30 }
    },
    {
      id: 'def',
      data: { label: '📖 Core Definition\nDivide & conquer search algorithm operating on sorted arrays.' },
      position: { x: 80, y: 170 }
    },
    {
      id: 'concepts',
      data: { label: '💡 Key Invariants\nRequires sorted array & calculated middle pointer logic.' },
      position: { x: 380, y: 170 }
    },
    {
      id: 'apps',
      data: { label: '🚀 Real-World Applications\nDatabase indexing, B+ Trees, OS memory page lookup.' },
      position: { x: 680, y: 170 }
    },
    {
      id: 'math',
      data: { label: '⚡ Time & Space Complexity\nTime: O(log N) | Space: O(1) Iterative' },
      position: { x: 220, y: 310 }
    },
    {
      id: 'interview',
      data: { label: '💼 Exam & Interview Tip\nGuard against overflow: mid = low + (high-low)/2' },
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
      const lines = rawLabel.split('\n');
      const headerText = lines[0];
      const bodyText = lines.slice(1).join(' ');

      const isMatchingSearch = searchQuery.trim() && 
        (headerText.toLowerCase().includes(searchQuery.toLowerCase()) || 
         bodyText.toLowerCase().includes(searchQuery.toLowerCase()));

      // Color coding themes for sub-nodes
      let nodeBg = '#FFFFFF';
      let nodeBorder = '2px solid #E2E8F0';

      if (isRoot) {
        nodeBg = 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)';
        nodeBorder = '2px solid #1E3A8A';
      } else if (idx % 4 === 1) {
        nodeBg = '#F0FDF4';
        nodeBorder = '2px solid #86EFAC';
      } else if (idx % 4 === 2) {
        nodeBg = '#EFF6FF';
        nodeBorder = '2px solid #BFDBFE';
      } else if (idx % 4 === 3) {
        nodeBg = '#FEF3C7';
        nodeBorder = '2px solid #FDE68A';
      } else {
        nodeBg = '#F5F3FF';
        nodeBorder = '2px solid #DDD6FE';
      }

      if (isMatchingSearch) {
        nodeBorder = '3px solid #2563EB';
        nodeBg = '#EFF6FF';
      }

      return {
        ...node,
        data: {
          ...node.data,
          rawHeader: headerText,
          rawBody: bodyText,
          label: (
            <div className="flex flex-col items-center justify-center text-center p-1 space-y-1">
              <span className={`font-poppins tracking-tight ${isRoot ? 'text-base font-black text-white' : 'text-xs font-bold text-[#1E293B]'}`}>
                {headerText}
              </span>
              {bodyText && (
                <span className={`text-[11px] font-inter font-medium leading-relaxed max-w-[220px] ${isRoot ? 'text-blue-100' : 'text-[#64748B]'}`}>
                  {bodyText}
                </span>
              )}
            </div>
          )
        },
        style: {
          background: nodeBg,
          color: isRoot ? '#FFFFFF' : '#1E293B',
          borderRadius: isRoot ? '22px' : '18px',
          padding: isRoot ? '14px 24px' : '12px 18px',
          border: nodeBorder,
          boxShadow: isRoot
            ? '0 10px 30px rgba(30, 58, 138, 0.35)'
            : isMatchingSearch
            ? '0 0 20px rgba(37, 99, 235, 0.4)'
            : '0 4px 20px rgba(37, 99, 235, 0.08)',
          maxWidth: isRoot ? '320px' : '260px',
          cursor: 'pointer',
          ...(node.style || {})
        }
      };
    });
  }, [mindmapData, topic, searchQuery]);

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

  const handleNodeClick = (event, node) => {
    setSelectedNode({
      header: node.data?.rawHeader || 'Concept Node',
      body: node.data?.rawBody || 'Explore concepts and study relationships.'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full glass-card rounded-3xl border border-[#E2E8F0] relative overflow-hidden shadow-soft bg-[#FFFFFF] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px]'
      }`}
    >
      {/* Top Learning Hub Progress Header */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-xl">
        <div className="bg-[#FFFFFF]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E2E8F0] text-xs font-poppins font-bold text-[#1E293B] shadow-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping"></span>
          <span>Hub: {topic || 'Binary Search'}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[11px] font-inter font-bold text-[#2563EB] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>{nodes.length} Nodes • 80% Concept Mastery</span>
        </div>

        {/* Node Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search mind map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5 pl-8 pr-3 text-xs rounded-2xl bg-white border border-[#E2E8F0] text-[#1E293B] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Action Controls Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-[#FFFFFF]/95 hover:bg-[#EFF6FF] text-[#2563EB] border border-[#E2E8F0] shadow-xs flex items-center gap-1.5 text-xs font-inter font-bold backdrop-blur-md"
          title={isFullscreen ? "Exit Full Screen" : "Full Screen Mode"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
        </motion.button>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#CBD5E1" gap={20} size={1} />
        <Controls className="bg-[#FFFFFF] text-[#1E293B] border-[#E2E8F0] rounded-2xl shadow-xs" />
        <MiniMap nodeColor="#2563EB" maskColor="rgba(248, 251, 255, 0.7)" className="bg-[#FFFFFF] border-[#E2E8F0] rounded-2xl shadow-xs hidden sm:block" />
      </ReactFlow>

      {/* Interactive Sliding Learning Side Panel */}
      {selectedNode && (
        <MindMapNodePanel
          nodeData={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAskAI={onAskAITutor}
        />
      )}
    </motion.div>
  );
}
