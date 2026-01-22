import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { GitCommit, Trash2, Plus, GripVertical } from 'lucide-react';
import Button from '../../ui/Button';

const TimelineComponent = ({ node, updateAttributes, deleteNode, editor }) => {
    const { points } = node.attrs;
    const isEditable = editor.isEditable;
    const [hoveredPointId, setHoveredPointId] = useState(null);

    // Admin Handlers
    const addPoint = () => {
        const newPoint = {
            id: Date.now(),
            title: 'New Step',
            description: 'Description here',
            date: `Step ${points.length + 1}`
        };
        updateAttributes({ points: [...points, newPoint] });
    };

    const updatePoint = (index, field, value) => {
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], [field]: value };
        updateAttributes({ points: newPoints });
    };

    const removePoint = (index) => {
        const newPoints = points.filter((_, i) => i !== index);
        updateAttributes({ points: newPoints });
    };

    if (isEditable) {
        return (
            <NodeViewWrapper className="my-6">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <GitCommit className="w-4 h-4" />
                            Timeline Slider
                        </span>
                        <Button size="sm" variant="destructive" className="h-6 w-6 p-0" onClick={deleteNode}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {points.map((point, index) => (
                            <div key={point.id} className="flex gap-2 items-start border p-2 rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <div className="grid grid-cols-12 gap-2 flex-1">
                                    <div className="col-span-3">
                                        <input
                                            className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-800"
                                            value={point.date}
                                            onChange={(e) => updatePoint(index, 'date', e.target.value)}
                                            placeholder="Label (e.g., Step 1)"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-800 font-medium"
                                            value={point.title}
                                            onChange={(e) => updatePoint(index, 'title', e.target.value)}
                                            placeholder="Title"
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <input
                                            className="w-full text-xs p-1 border rounded bg-white dark:bg-gray-800"
                                            value={point.description}
                                            onChange={(e) => updatePoint(index, 'description', e.target.value)}
                                            placeholder="Hover description"
                                        />
                                    </div>
                                </div>
                                <button onClick={() => removePoint(index)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button onClick={addPoint} size="sm" variant="outline" className="mt-3 w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Timeline Point
                    </Button>
                </div>
            </NodeViewWrapper>
        );
    }

    // Student View
    return (
        <NodeViewWrapper className="my-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex justify-start min-w-max">
                <div className="relative py-40 px-20">
                     {/* Dynamic Line Layer */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 rounded-full" />
                    
                    <div className="relative flex gap-20 items-center z-10">
                        {points.map((point, index) => {
                            const isOdd = index % 2 !== 0;
                            return (
                                <div 
                                    key={point.id} 
                                    className="relative group flex flex-col items-center"
                                    onMouseEnter={() => setHoveredPointId(point.id)}
                                    onMouseLeave={() => setHoveredPointId(null)}
                                >
                                    {/* Point Marker */}
                                    <div className={`w-6 h-6 rounded-full border-4 transition-all duration-300 z-20 cursor-pointer ${hoveredPointId === point.id ? 'bg-blue-600 border-blue-200 scale-125 shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/30' : 'bg-white dark:bg-gray-900 border-blue-500 dark:border-blue-400'}`} />
                                    
                                    {/* Date Label (Alternating) */}
                                    <div className={`absolute ${isOdd ? 'top-8' : '-top-8'} text-xs font-bold whitespace-nowrap transition-colors ${hoveredPointId === point.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {point.date}
                                    </div>

                                    {/* Popover Info Card */}
                                    <div 
                                        className={`absolute w-48 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 z-30 
                                        ${isOdd 
                                            ? 'bottom-10 origin-bottom' 
                                            : 'top-10 origin-top'
                                        }
                                        ${hoveredPointId === point.id 
                                            ? 'opacity-100 scale-100 translate-y-0 visible' 
                                            : `opacity-0 scale-95 invisible ${isOdd ? 'translate-y-2' : '-translate-y-2'}`
                                        }`}
                                    >
                                        {/* Triangle Arrow */}
                                        <div 
                                            className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-gray-100 dark:border-gray-700
                                            ${isOdd 
                                                ? '-bottom-2 border-b border-r' 
                                                : '-top-2 border-t border-l'
                                            }`} 
                                        />
                                        
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 relative">{point.title}</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed relative">{point.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export default TimelineComponent;
