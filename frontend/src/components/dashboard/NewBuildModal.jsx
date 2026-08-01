import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export const NewBuildModal = ({ isFirstBuild, creating, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onCreate(name, desc);
  };

  const submitLabel = isFirstBuild ? 'Create Free Build' : 'Create Build ($10)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} data-testid="close-new-build-modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">New Build</h3>
        <p className="text-gray-500 text-sm mb-6">{isFirstBuild ? 'Your first build is FREE!' : 'This build will cost $10.00'}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Build Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome App" required data-testid="new-build-name-input" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What are you building?" rows={3} data-testid="new-build-desc-input" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none" />
          </div>
          <button type="submit" disabled={creating} data-testid="create-build-submit-btn" className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full font-medium transition-colors">
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};
