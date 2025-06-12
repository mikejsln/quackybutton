"use client";
import { useState } from "react";
import RecipeCard from "./RecipeCard";

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2 sm:px-0">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        {children}
      </div>
    </div>
  );
}

export default function RecipeExtractor() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [extractedRecipes, setExtractedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editRecipe, setEditRecipe] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedImages(Array.from(e.target.files));
    }
  };

  const handleExtractRecipe = async () => {
    if (uploadedImages.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    uploadedImages.forEach((file) => {
      formData.append("images", file);
    });
    const res = await fetch("/api/extract-recipe", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPendingRecipe(data);
    setModalOpen(true);
    setEditMode(false);
    setEditRecipe(null);
    setLoading(false);
  };

  const handleAccept = () => {
    setExtractedRecipes((prev) => [pendingRecipe, ...prev]);
    setModalOpen(false);
    setPendingRecipe(null);
    setEditMode(false);
    setEditRecipe(null);
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditRecipe({ ...pendingRecipe });
  };

  const handleEditChange = (field: string, value: string) => {
    setEditRecipe((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditListChange = (field: string, idx: number, value: string) => {
    setEditRecipe((prev: any) => {
      const updated = [...(prev[field] || [])];
      updated[idx] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleSaveEdit = () => {
    setExtractedRecipes((prev) => [editRecipe, ...prev]);
    setModalOpen(false);
    setPendingRecipe(null);
    setEditMode(false);
    setEditRecipe(null);
  };

  return (
    <div className="mb-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full max-w-lg mx-auto">
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="flex-1 text-sm" />
        <button
          onClick={handleExtractRecipe}
          disabled={loading || uploadedImages.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto text-base disabled:opacity-60"
        >
          {loading ? "Extracting..." : "Extract Recipe"}
        </button>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {pendingRecipe && !editMode && (
          <div>
            <h2 className="text-xl font-bold mb-2">Extracted Recipe</h2>
            <RecipeCard {...pendingRecipe} />
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button onClick={handleEdit} className="px-4 py-2 bg-yellow-500 text-white rounded w-full sm:w-auto">Edit</button>
              <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto">Accept</button>
            </div>
          </div>
        )}
        {editMode && editRecipe && (
          <div>
            <h2 className="text-xl font-bold mb-2">Edit Recipe</h2>
            <div className="mb-2">
              <label className="block font-semibold">Title</label>
              <input className="w-full border rounded p-1 text-base" value={editRecipe.title || ''} onChange={e => handleEditChange('title', e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Description</label>
              <textarea className="w-full border rounded p-1 text-base" value={editRecipe.description || ''} onChange={e => handleEditChange('description', e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Ingredients</label>
              {(editRecipe.ingredients || []).map((item: string, idx: number) => (
                <input key={idx} className="w-full border rounded p-1 mb-1 text-base" value={item} onChange={e => handleEditListChange('ingredients', idx, e.target.value)} />
              ))}
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Instructions</label>
              {(editRecipe.instructions || []).map((item: string, idx: number) => (
                <textarea key={idx} className="w-full border rounded p-1 mb-1 text-base" value={item} onChange={e => handleEditListChange('instructions', idx, e.target.value)} />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto">Save</button>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
      <div className="mt-6 space-y-6">
        {extractedRecipes.map((recipe, idx) => (
          <RecipeCard key={idx} {...recipe} />
        ))}
      </div>
    </div>
  );
} 