import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { RotateCw, Trash2, Edit2 } from 'lucide-react';
import Button from '../../ui/Button';

const FlipCardComponent = ({ node, updateAttributes, deleteNode, editor }) => {
    const { cards } = node.attrs;
    const isEditable = editor.isEditable;
    const [flippedCards, setFlippedCards] = useState({});

    const toggleFlip = (id) => {
        setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Admin Handlers
    const addCard = () => {
        const newCard = {
            id: Date.now().toString(),
            frontText: 'New Concept',
            backText: 'Description'
        };
        updateAttributes({ cards: [...cards, newCard] });
    };

    const updateCard = (index, field, value) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        updateAttributes({ cards: newCards });
    };

    const removeCard = (index) => {
        const newCards = cards.filter((_, i) => i !== index);
        updateAttributes({ cards: newCards });
    };

    if (isEditable) {
        return (
            <NodeViewWrapper className="my-6">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <RotateCw className="w-4 h-4" />
                            Flip Card Grid
                        </span>
                        <div className="flex gap-1">
                            <Button size="sm" variant="destructive" className="h-6 w-6 p-0" onClick={deleteNode}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid gap-6">
                        {cards.map((card, index) => (
                            <div key={card.id} className="grid md:grid-cols-2 gap-4 p-4 border rounded bg-gray-50 dark:bg-gray-900 relative group">
                                <button 
                                    onClick={() => removeCard(index)} 
                                    className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="Remove Card"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Front Content (Heading)</label>
                                    <input
                                        type="text"
                                        value={card.frontText}
                                        onChange={(e) => updateCard(index, 'frontText', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
                                        placeholder="Concept Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Back Content (Detail)</label>
                                    <textarea
                                        value={card.backText}
                                        onChange={(e) => updateCard(index, 'backText', e.target.value)}
                                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
                                        rows={2}
                                        placeholder="Explanation..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button onClick={addCard} size="sm" variant="outline" className="mt-4 w-full border-dashed">
                        Add Flip Card
                    </Button>
                </div>
            </NodeViewWrapper>
        );
    }

    // Student View
    return (
        <NodeViewWrapper className="my-8">
            <div className="flex flex-wrap justify-center gap-6">
                {cards.map((card) => {
                    const isFlipped = flippedCards[card.id];
                    return (
                        <div 
                            key={card.id}
                            className="relative w-64 h-40 cursor-pointer perspective-1000 group"
                            onClick={() => toggleFlip(card.id)}
                        >
                            <div 
                                className="relative w-full h-full text-center transition-transform duration-700 transform-style-3d shadow-lg rounded-xl"
                                style={{ 
                                    transformStyle: 'preserve-3d', 
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                                }}
                            >
                                {/* Front */}
                                <div 
                                    className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-4"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <h3 className="font-bold text-lg mb-1 leading-tight">{card.frontText}</h3>
                                    <p className="text-[10px] text-blue-100 opacity-60 mt-2 flex items-center gap-1">
                                        <RotateCw className="w-3 h-3" /> Flip
                                    </p>
                                </div>
                                
                                {/* Back */}
                                <div 
                                    className="absolute w-full h-full backface-hidden flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-4 overflow-y-auto"
                                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                >
                                    <p className="text-sm font-medium leading-snug">{card.backText}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </NodeViewWrapper>
    );
};

export default FlipCardComponent;
