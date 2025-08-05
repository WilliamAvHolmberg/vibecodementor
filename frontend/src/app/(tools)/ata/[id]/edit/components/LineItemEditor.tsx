'use client';

import { useState } from 'react';
import type { ATAWorkTypeDTO } from '@/api/models';

// Types for line item data
export interface LineItemData {
  type: ATAWorkTypeDTO;
  description: string;
  costEstimate: number;
  comment: string;
}

interface LineItemEditorProps {
  initialData?: Partial<LineItemData>;
  onUpdate: (data: LineItemData) => void;
  onRemove: () => void;
  isEven?: boolean;
  readOnly?: boolean;
}

// Work type selector component - dropdown version
function WorkTypeSelector({
  value,
  onChange,
  disabled = false
}: {
  value: ATAWorkTypeDTO;
  onChange: (type: ATAWorkTypeDTO) => void;
  disabled?: boolean;
}) {
  const types = [
    { value: 0 as ATAWorkTypeDTO, label: 'Ändring', emoji: '🔄' },
    { value: 1 as ATAWorkTypeDTO, label: 'Tillägg', emoji: '➕' },
    { value: 2 as ATAWorkTypeDTO, label: 'Avgående', emoji: '➖' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) as ATAWorkTypeDTO)}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border rounded-md transition-all duration-150 ${
        disabled 
          ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
          : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white'
      }`}
    >
      {types.map((type) => (
        <option key={type.value} value={type.value}>
          {type.emoji} {type.label}
        </option>
      ))}
    </select>
  );
}

// Simple debounce without React hooks - just plain JS
let debounceTimer: NodeJS.Timeout | null = null;
export default function LineItemEditor({
  initialData = {},
  onUpdate,
  onRemove,
  isEven = false,
  readOnly = false
}: LineItemEditorProps) {
  // Internal state
  const [type, setType] = useState<ATAWorkTypeDTO>(initialData.type ?? 0);
  const [description, setDescription] = useState(initialData.description ?? '');
  const [costEstimate, setCostEstimate] = useState(initialData.costEstimate ?? 0);
  const [comment, setComment] = useState(initialData.comment ?? '');


  const debouncedUpdate = (data: LineItemData) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      onUpdate(data);
    }, 500);
  };



  return (
    <tr className={`group hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 ${isEven ? 'bg-white' : 'bg-gray-50'
      }`}>

      {/* Column 1: Work Type */}
      <td className="py-3 px-3">
        <WorkTypeSelector
          value={type}
          onChange={(newType) => {
            setType(newType);
            setTimeout(() => debouncedUpdate({description, costEstimate, comment, type: newType}), 0); // Update parent with debounce
          }}
          disabled={readOnly}
        />
      </td>

      {/* Column 2: Description */}
      <td className="py-3 px-3">
        <input
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setTimeout(() => debouncedUpdate({description: e.target.value, costEstimate, comment, type}), 0); // Update parent with debounce
          }}
          placeholder="Describe the work to be done..."
          readOnly={readOnly}
          className={`w-full px-2 py-2 text-sm border-0 rounded-md transition-all duration-150 placeholder-gray-400 ${
            readOnly 
              ? 'bg-gray-50 text-gray-600 cursor-not-allowed' 
              : 'bg-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white'
          }`}
        />
      </td>

      {/* Column 3: Cost */}
      <td className="py-3 px-3">
        <div className="relative">
          <input
            type="number"
            value={costEstimate || ''}
            onChange={(e) => {
              setCostEstimate(parseFloat(e.target.value) || 0);
              setTimeout(() => debouncedUpdate({description, costEstimate: parseFloat(e.target.value) || 0, comment, type}), 0); // Update parent with debounce
            }}
            placeholder="0"
            readOnly={readOnly}
            className={`w-full px-2 py-2 pr-8 text-sm border-0 rounded-md transition-all duration-150 text-right ${
              readOnly 
                ? 'bg-gray-50 text-gray-600 cursor-not-allowed' 
                : 'bg-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white'
            }`}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
            SEK
          </div>
        </div>
      </td>

      {/* TEMP HIDDEN: Comment column until we know user requirements
      <td className="py-3 px-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional notes..."
          className="w-full px-2 py-2 text-sm bg-transparent border-0 focus:ring-1 focus:ring-gray-400 focus:bg-white rounded-md transition-all duration-150 placeholder-gray-400"
        />
      </td>
      */}

      {/* Column 4: Remove Button */}
      <td className="py-3 px-3 text-center">
        {!readOnly && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 p-1.5 rounded transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
            title="Remove line item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
} 