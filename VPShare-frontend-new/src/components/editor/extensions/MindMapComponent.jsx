import { useCallback, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    Controls,
    Background,
    ReactFlowProvider,
    BaseEdge,
    getBezierPath,
    MarkerType,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Network, Trash2, Plus, Edit2, X, ChevronDown, ChevronRight, ArrowDown, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '../../ui/Button';

// --- Custom Node ---
const CustomMindMapNode = ({ data, isConnectable }) => {
    const { 
        label, isRoot, onAddChild, onRemoveNode, onEditLabel, id, 
        hasChildren, collapsed, onToggleCollapse, isEditable, onMoveToBottom 
    } = data;
    
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(label);

    const handleSave = () => {
        if (!isEditable) return;
        onEditLabel(id, editLabel);
        setIsEditing(false);
    };

    return (
        <div className={`
            relative group flex flex-col items-center justify-center text-center
            ${isRoot 
                ? 'w-40 h-24 bg-blue-600 border-blue-600 text-white font-bold text-lg shadow-xl' 
                : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 min-w-[140px] px-4 py-3 text-sm shadow-md'
            }
            border-2 rounded-2xl transition-all hover:shadow-lg
        `}>
            {/* Input Handles */}
            {!isRoot && (
                <Handle
                    type="target"
                    position={Position.Top}
                    style={{ background: '#555' }}
                    isConnectable={isConnectable}
                />
            )}

            {isEditing ? (
                 <input
                     autoFocus
                     className="bg-transparent border-b border-white/50 text-center w-full focus:outline-none text-gray-900 dark:text-white"
                     style={{ color: isRoot ? 'white' : 'inherit' }}
                     value={editLabel}
                     onChange={(e) => setEditLabel(e.target.value)}
                     onBlur={handleSave}
                     onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                     onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <div 
                    onDoubleClick={() => isEditable && setIsEditing(true)} 
                    className="cursor-text"
                >
                    {label}
                </div>
            )}
            
            {/* Collapse Toggle */}
            {hasChildren && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(id); }}
                    className="absolute -bottom-3 bg-white dark:bg-gray-700 rounded-full p-0.5 border border-gray-200 dark:border-gray-600 shadow-sm hover:scale-110 transition-transform z-50 cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>
            )}

            {/* Actions (visible on hover) - ONLY FOR ADMIN */}
            {isEditable && (
                <div className="nodrag absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex gap-1 z-50 pointer-events-auto">
                    <button type="button" title="Edit" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:text-blue-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" title="Add Child" onClick={(e) => { e.stopPropagation(); onAddChild(id); }} className="p-1.5 hover:text-green-600 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"><Plus className="w-4 h-4" /></button>
                    {!isRoot && (
                         <>
                            <button type="button" title="Move to Bottom" onClick={(e) => { e.stopPropagation(); onMoveToBottom(id); }} className="p-1.5 hover:text-purple-600 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" title="Delete" onClick={(e) => { e.stopPropagation(); onRemoveNode(id); }} className="p-1.5 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
                         </>
                    )}
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', opacity: collapsed ? 0 : 1 }}
                isConnectable={isConnectable}
            />
        </div>
    );
};

const nodeTypes = {
    custom: CustomMindMapNode,
};

// --- Utils ---
const flattenTree = (node, parentId = null, nodes = [], edges = [], callbacks, collapsedIds = new Set()) => {
    if (!node) return { nodes, edges };

    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    nodes.push({
        id: node.id,
        type: 'custom',
        data: { 
            label: node.label, 
            isRoot: !parentId, 
            id: node.id,
            hasChildren,
            collapsed: isCollapsed,
            ...callbacks
        },
        position: { x: 0, y: 0 },
    });

    if (parentId) {
        edges.push({
            id: `e${parentId}-${node.id}`,
            source: parentId,
            target: node.id,
            type: 'default', 
            animated: true,
            style: { stroke: '#2563eb', strokeWidth: 2 },
            markerEnd: {
                 type: MarkerType.ArrowClosed,
                 color: '#eff2f7',
            },
        });
    }

    if (node.children && !isCollapsed) {
        node.children.forEach(child => flattenTree(child, node.id, nodes, edges, callbacks, collapsedIds));
    }
    
    return { nodes, edges };
};

// --- Layouting ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges) => {
    dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom

    nodes.forEach((node) => {
        // Adjust width/height based on content if needed, fixed for now
        dagreGraph.setNode(node.id, { width: 180, height: 100 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - 90, // center offset (width/2)
            y: nodeWithPosition.y - 50, // center offset (height/2)
        };
    });

    return { nodes, edges };
};

const getGraphExtent = (nodes) => {
    if (nodes.length === 0) return undefined;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
        const x = node.position.x;
        const y = node.position.y;
        // Approx width/height from dagre setup
        const w = 180;
        const h = 100;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });

    const padding = 200; // Allow some panning space
    return [
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding]
    ];
};

const collectAllParentIds = (node, ids = new Set()) => {
    if (!node) return ids;
    if (node.children && node.children.length > 0) {
        ids.add(node.id);
        node.children.forEach(child => collectAllParentIds(child, ids));
    }
    return ids;
};

const AutoFitView = ({ collapsedIds }) => {
    const { fitView } = useReactFlow();
    useEffect(() => {
        // Debounce slightly to allow layout to settle
        const timer = setTimeout(() => {
            fitView({ duration: 800 }); // Slower for smoothness
        }, 50);
        return () => clearTimeout(timer);
    }, [collapsedIds, fitView]);
    return null;
};

// --- Component ---
const MindMapComponent = ({ node, updateAttributes, deleteNode, editor }) => {
    const { rootNode } = node.attrs;
    const isEditable = editor.isEditable; // Only true for Admin/Author

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [translateExtent, setTranslateExtent] = useState(undefined);
    
    // Track collapsed nodes locally (for viewer interaction)
    const [collapsedIds, setCollapsedIds] = useState(() => {
        // Collect all IDs that have children to collapse them initially in viewer mode
        if (!isEditable && rootNode) {
             return collectAllParentIds(rootNode);
        }
        return new Set();
    });

    // --- Actions ---
    const updateLabel = (id, newLabel) => {
        if (!rootNode) return;
        const updateRecursive = (n) => {
            if (!n) return n;
            if (n.id === id) return { ...n, label: newLabel };
            if (n.children && n.children.length) return { ...n, children: n.children.map(updateRecursive) };
            return n;
        };
        updateAttributes({ rootNode: updateRecursive(rootNode) });
    };

    const addChild = (parentId) => {
        if (!rootNode) return;
        const newChild = { id: Date.now().toString(), label: 'New Idea', children: [] };
        
        // Auto-expand parent when adding child
        setCollapsedIds(prev => {
            const next = new Set(prev);
            next.delete(parentId);
            return next;
        });

        const addRecursive = (n) => {
            if (!n) return n;
            if (n.id === parentId) return { ...n, children: [...(n.children || []), newChild] };
            if (n.children && n.children.length) return { ...n, children: n.children.map(addRecursive) };
            return n;
        };
        updateAttributes({ rootNode: addRecursive(rootNode) });
    };

    const removeNode = (nodeId) => {
        if (!rootNode) return;
        const removeRecursive = (n) => {
            if (!n) return n;
            if (!n.children) return n;
            return {
                ...n,
                children: n.children.filter(c => c.id !== nodeId).map(removeRecursive)
            };
        };
        updateAttributes({ rootNode: removeRecursive(rootNode) });
    };
    
    const moveToBottom = (nodeId) => {
        if (!rootNode) return;
        // Function to find parent and move the specific child to end of array
        const moveRecursive = (n) => {
            if (!n) return n;
            if (n.children && n.children.find(c => c.id === nodeId)) {
                // Found parent
                const childToMove = n.children.find(c => c.id === nodeId);
                const otherChildren = n.children.filter(c => c.id !== nodeId);
                return {
                    ...n,
                    children: [...otherChildren, childToMove]
                };
            }
            if (n.children) {
                 return { ...n, children: n.children.map(moveRecursive) };
            }
            return n;
        };
        updateAttributes({ rootNode: moveRecursive(rootNode) });
    };

    const toggleCollapse = (id) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        setCollapsedIds(new Set());
    };

    const collapseAll = () => {
        if (rootNode) {
            setCollapsedIds(collectAllParentIds(rootNode));
        }
    };

    const isAllCollapsed = rootNode ? collapsedIds.size === collectAllParentIds(rootNode).size : false;

    // --- Callback Object ---
    const callbacks = useMemo(() => ({
        onAddChild: addChild,
        onRemoveNode: removeNode,
        onEditLabel: updateLabel,
        onToggleCollapse: toggleCollapse,
        onMoveToBottom: moveToBottom,
        isEditable // Pass this down to control visibility of specific actions
    }), [rootNode, isEditable]);

    // --- Build Graph ---
    useLayoutEffect(() => {
        // Flatten logic
        const { nodes: flatNodes, edges: flatEdges } = flattenTree(rootNode, null, [], [], callbacks, collapsedIds);
        
        // Layout logic
        const layouted = getLayoutedElements(flatNodes, flatEdges);
        
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
        setTranslateExtent(getGraphExtent(layouted.nodes));
    }, [rootNode, collapsedIds, callbacks]); // Re-run when data or collapse state changes

    return (
        <NodeViewWrapper className="my-8">
            <style>
                {`
                    .react-flow__controls {
                        background: white !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 8px !important;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                        overflow: hidden;
                    }
                    .dark .react-flow__controls {
                        background: #1f2937 !important;
                        border-color: #374151 !important;
                    }
                    .react-flow__controls-button {
                        background: white !important;
                        border: none !important;
                        border-bottom: 1px solid #e5e7eb !important;
                        color: #374151 !important;
                        width: 28px !important;
                        height: 28px !important;
                    }
                    .dark .react-flow__controls-button {
                        background: #1f2937 !important;
                        border-bottom-color: #374151 !important;
                        color: #d1d5db !important;
                    }
                    .react-flow__controls-button:hover {
                        background: #f3f4f6 !important;
                    }
                    .dark .react-flow__controls-button:hover {
                        background: #374151 !important;
                    }
                    .react-flow__controls-button:last-child {
                        border-bottom: none !important;
                    }
                    .react-flow__controls-button svg {
                        fill: currentColor !important;
                    }
                `}
            </style>
            <div className={`relative h-[600px] w-full border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 ${isEditable ? 'hover:border-blue-300' : ''}`}>
                 {isEditable && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="flex gap-2">
                             <span className="text-xs uppercase font-bold text-gray-400 flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                                <Network className="w-4 h-4" /> Mind Map
                            </span>
                             <Button size="sm" variant="destructive" onClick={deleteNode} className="h-7 w-7 p-0">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                 )}

                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        zoomOnScroll={true}
                        zoomOnDoubleClick={true}
                        zoomOnPinch={true}
                        panOnScroll={true}
                        panOnDrag={true}
                        nodesDraggable={false}
                        proOptions={{ hideAttribution: true }}
                        translateExtent={translateExtent}
                    >
                        {!isEditable && <AutoFitView collapsedIds={collapsedIds} />}
                        {isEditable && <Background color="#aaa" gap={16} />}
                        <Controls 
                            showInteractive={false}
                            className="!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-md"
                            style={{
                                button: {
                                    backgroundColor: 'white',
                                    borderColor: '#e5e7eb',
                                }
                            }}
                        />
                    </ReactFlow>
                    
                    {/* User controls panel - positioned inside the map */}
                    {!isEditable && (
                        <div className="absolute bottom-4 left-12 z-10 flex gap-2">
                            <button
                                onClick={isAllCollapsed ? expandAll : collapseAll}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {isAllCollapsed ? (
                                    <><Maximize2 className="w-4 h-4" /> Expand All</>
                                ) : (
                                    <><Minimize2 className="w-4 h-4" /> Collapse All</>
                                )}
                            </button>
                        </div>
                    )}
                </ReactFlowProvider>
            </div>
        </NodeViewWrapper>
    );
};

export default MindMapComponent;
