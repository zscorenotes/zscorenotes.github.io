'use client';

import React, { useState, useRef } from 'react';
import { GripVertical, Edit, Trash2, Plus } from 'lucide-react';

/**
 * Drag and Drop Sortable List Component
 * Provides reordering functionality for services and portfolio items
 */
export default function DragDropList({ 
  items = [], 
  onReorder, 
  onEdit, 
  onDelete, 
  onAdd,
  itemType = 'item',
  renderItem 
}) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.index === targetIndex) {
      return;
    }

    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedItem.index, 1);
    newItems.splice(targetIndex, 0, movedItem);

    // Update order property for each item
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    onReorder(reorderedItems);
    setDraggedItem(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const defaultRenderItem = (item, index) => (
    <div className="flex items-center justify-between p-3 bg-white rounded border">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
        <div>
          <h4 className="font-medium text-gray-900">{item.title || item.name}</h4>
          {item.description && (
            <p className="text-sm text-gray-600 truncate max-w-md">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(item, index)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit item"
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(item, index)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Sortable List */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No {itemType}s added yet</p>
          <p className="text-sm mt-2">Use the "Add New" button above to create your first {itemType}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              draggable
              onDragStart={(e) => handleDragStart(e, item, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group cursor-move transition-all duration-200 ${
                dragOverIndex === index ? 'scale-105 shadow-lg' : ''
              } ${
                draggedItem?.index === index ? 'opacity-50' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-100 rounded-l border-r border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-gray-400" />
              </div>

              {/* Item Content */}
              <div className="pl-8">
                {renderItem ? renderItem(item, index) : defaultRenderItem(item, index)}
              </div>

              {/* Drop Indicator */}
              {dragOverIndex === index && draggedItem?.index !== index && (
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded bg-blue-50/50 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drag Instructions */}
      {items.length > 1 && (
        <div className="text-xs text-gray-500 text-center mt-4 p-2 bg-gray-50 rounded">
          💡 Tip: Drag and drop items using the grip handle to reorder them
        </div>
      )}
    </div>
  );
}