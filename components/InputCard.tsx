
import React from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface InputCardProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onDelete: (id: string) => void;
  formContent: React.ReactNode;
}

const InputCard = <T extends { id: string }>(
  { title, items, renderItem, onDelete, formContent }: InputCardProps<T>
) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="mb-6 pb-6 border-b border-gray-200">
        {formContent}
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm">{renderItem(item)}</div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                aria-label={`Delete ${item.id}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4">No {title.toLowerCase()} added yet.</p>
        )}
      </div>
    </div>
  );
};

export default InputCard;
