import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Plus, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const InfoHotspotComponent = ({ node, updateAttributes, editor }) => {
    const { infoText } = node.attrs;
    const isEditable = editor.isEditable;
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempText, setTempText] = useState(infoText);
    const popoverRef = useRef(null);
    const triggerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popoverRef.current && 
                !popoverRef.current.contains(event.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                 if (isEditing) {
                    updateAttributes({ infoText: tempText });
                    setIsEditing(false);
                }
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, isEditing, tempText, updateAttributes]);

    const handleIconClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(!isOpen);
        if (isEditable && !isOpen) {
            setIsEditing(true);
            setTempText(infoText);
        }
    };

    return (
        <NodeViewWrapper as="span" className="inline-block relative align-middle mx-1">
            <span
                ref={triggerRef}
                onClick={handleIconClick}
                className={`
                    inline-flex items-center justify-center w-5 h-5 rounded-full text-white cursor-pointer transition-transform hover:scale-110 active:scale-95
                    ${isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-500'}
                `}
                title={isEditable ? "Click to edit info" : "Click for more info"}
            >
                <Plus className="w-3 h-3 stroke-[3]" />
            </span>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        ref={popoverRef}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 max-w-[90vw] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[100] p-4 origin-bottom"
                        onClick={(e) => e.stopPropagation()} 
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                    >
                        {isEditable ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Edit Info</label>
                                <textarea
                                    autoFocus
                                    className="w-full text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={tempText}
                                    onChange={(e) => setTempText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button 
                                        className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                                        onClick={() => {
                                            updateAttributes({ infoText: tempText });
                                            setIsEditing(false);
                                            setIsOpen(false);
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Student View
                            <div>
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                        {infoText}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NodeViewWrapper>
    );
};

export default InfoHotspotComponent;
