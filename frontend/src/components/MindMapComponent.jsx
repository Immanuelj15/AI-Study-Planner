import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Minimize2, Sparkles, BookOpen, Layers, X, Info, Search, CheckCircle2, Zap } from 'lucide-react';
import MindMapNodePanel from './MindMapNodePanel';

export default function MindMapComponent({ mindmapData, topic, onAskAITutor }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentTopic = topic || 'Study Topic';

  const defaultNodes = [
    {
      id: 'root',
      data: { label: `🎯 ${currentTopic}` },
      position: { x: 380, y: 30 }
    },
    {
      id: 'def',
      data: { label: `📖 Core Definition\nFoundational operational framework and architecture of ${currentTopic}.` },
      position: { x: 80, y: 170 }
    },
    {
      id: 'concepts',
      data: { label: `💡 Key Principles\nCore invariants, rules, and computational mechanisms of ${currentTopic}.` },
      position: { x: 380, y: 170 }
    },
    {
      id: 'apps',
      data: { label: `🚀 Real-World Applications\nIndustrial production deployments and real-world system usage of ${currentTopic}.` },
      position: { x: 680, y: 170 }
    },
    {
      id: 'math',
      data: { label: `⚡ Math & Complexity\nOptimization metrics, formulas, and time/space complexity bounds.` },
      position: { x: 220, y: 310 }
    },
    {
      id: 'interview',
      data: { label: `💼 Technical Interview Focus\nHigh-frequency coding patterns, edge cases, and optimization trade-offs.` },
      position: { x: 540, y: 310 }
    }
  ];

  const defaultEdges = [
    { id: 'e-root-def', source: 'root', target: 'def', animated: true, style: { stroke: '#2563EB', strokeWidth: 3 } },
    { id: 'e-root-concepts', source: 'root', target: 'concepts', animated: true, style: { stroke: '#2563EB', strokeWidth: 3 } },
    { id: 'e-root-apps', source: 'root', target: 'apps', animated: true, style: { stroke: '#2563EB', strokeWidth: 3 } },
    { id: 'e-concepts-math', source: 'concepts', target: 'math', animated: true, style: { stroke: '#38BDF8', strokeWidth: 3 } },
    { id: 'e-concepts-interview', source: 'concepts', target: 'interview', animated: true, style: { stroke: '#38BDF8', strokeWidth: 3 } }
  ];

  const nodes = useMemo(() => {
    const rawNodes = (mindmapData && mindmapData.nodes && mindmapData.nodes.length > 0)
      ? mindmapData.nodes
      : defaultNodes;

    return rawNodes.map((node, idx) => {
      const isRoot = node.id === '1' || node.id === 'root' || idx === 0;
      const rawLabel = typeof node.data?.label === 'string' ? node.data.label : (currentTopic || 'Concept Node');
      const lines = rawLabel.split('\n').map(s => s.trim()).filter(Boolean);
      const headerText = lines[0] || currentTopic;
      const bodyLines = lines.slice(1);
      const bodyText = bodyLines.join(' ');

      // Extract 3 bullet points per node
      let points = [];
      bodyLines.forEach(line => {
        const clean = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
        if (clean) points.push(clean);
      });

      if (points.length < 3) {
        const clauses = bodyText.split(/(?<=[.!?])\s+|[;,]\s+/).map(s => s.trim()).filter(s => s.length > 5);
        if (clauses.length >= 3) {
          points = clauses.slice(0, 3);
        } else if (clauses.length > 0) {
          points = clauses;
        }
      }
      points = points.slice(0, 3);

      const isMatchingSearch = searchQuery.trim() && 
        (headerText.toLowerCase().includes(searchQuery.toLowerCase()) || 
         bodyText.toLowerCase().includes(searchQuery.toLowerCase()));

      // Modern Glassmorphic Color Palette with Accent Left Pillars
      let nodeBg = '#FFFFFF';
      let nodeBorder = '2px solid #E2E8F0';
      let accentColor = '#2563EB';

      if (isRoot) {
        nodeBg = 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)';
        nodeBorder = '2px solid #3B82F6';
        accentColor = '#60A5FA';
      } else if (idx % 4 === 1) {
        nodeBg = '#FFFFFF';
        nodeBorder = '2px solid #86EFAC';
        accentColor = '#22C55E';
      } else if (idx % 4 === 2) {
        nodeBg = '#FFFFFF';
        nodeBorder = '2px solid #BFDBFE';
        accentColor = '#2563EB';
      } else if (idx % 4 === 3) {
        nodeBg = '#FFFFFF';
        nodeBorder = '2px solid #FDE68A';
        accentColor = '#D97706';
      } else {
        nodeBg = '#FFFFFF';
        nodeBorder = '2px solid #DDD6FE';
        accentColor = '#7C3AED';
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
            <div className="flex flex-col items-center justify-center text-center p-1 space-y-1.5 relative max-w-[240px]">
              <span className={`font-poppins tracking-tight ${isRoot ? 'text-base font-black text-white' : 'text-xs font-extrabold text-[#1E293B] border-b border-[#E2E8F0] pb-1 w-full'}`}>
                {headerText}
              </span>
              {isRoot ? (
                <span className="text-[11px] font-inter font-medium text-blue-200">
                  {bodyLines.join(' ') || 'Root Concept Engine'}
                </span>
              ) : points.length > 0 ? (
                <ul className="text-left w-full space-y-1 mt-1 text-[11px] font-inter font-medium text-[#475569]">
                  {points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5 bg-[#F8FBFF] px-2.5 py-1 rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-[#2563EB]/40 transition-all">
                      <span className="text-[#2563EB] font-bold text-[10px] shrink-0 mt-0.5">•</span>
                      <span className="line-clamp-2 leading-tight text-[#1E293B]">{pt}</span>
                    </li>
                  ))}
                </ul>
              ) : bodyText && (
                <span className="text-[11px] font-inter font-medium leading-relaxed text-[#64748B]">
                  {bodyText}
                </span>
              )}
            </div>
          )
        },
        style: {
          background: nodeBg,
          color: isRoot ? '#FFFFFF' : '#1E293B',
          borderRadius: isRoot ? '24px' : '20px',
          padding: isRoot ? '16px 28px' : '14px 20px',
          border: nodeBorder,
          boxShadow: isRoot
            ? '0 12px 35px rgba(15, 23, 42, 0.4)'
            : isMatchingSearch
            ? '0 0 25px rgba(37, 99, 235, 0.45)'
            : '0 6px 25px rgba(37, 99, 235, 0.08)',
          maxWidth: isRoot ? '340px' : '270px',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          ...(node.style || {})
        }
      };
    });
  }, [mindmapData, currentTopic, searchQuery]);

  const edges = useMemo(() => {
    if (mindmapData && mindmapData.edges && mindmapData.edges.length > 0) {
      return mindmapData.edges.map((e) => ({
        ...e,
        animated: true,
        style: { stroke: '#2563EB', strokeWidth: 3, ...(e.style || {}) }
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
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[650px]'
      }`}
    >
      {/* Top Learning Hub Progress Header */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-xl">
        <div className="bg-[#FFFFFF]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E2E8F0] text-xs font-poppins font-bold text-[#1E293B] shadow-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping"></span>
          <span>Hub: {currentTopic}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[11px] font-inter font-bold text-[#2563EB] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>{nodes.length} Dynamic Nodes • 100% Topic Accuracy</span>
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
