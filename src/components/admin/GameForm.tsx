'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreConfig {
  address: string;
  type: string;
  length: number;
  multiplier?: number;
}

interface GameFormData {
  title: string;
  platform: string;
  genre: string;
  description: string;
  url: string;
  imageUrl: string;
  romPath: string;
  scoreConfig: ScoreConfig;
  [key: string]: any; // Allow dynamic access for generic handling if needed, but try to avoid
}

interface GameFormProps {
    initialData?: Partial<GameFormData>;
    isEdit?: boolean;
}

export default function GameForm({ initialData = {}, isEdit = false }: GameFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    platform: 'C64',
    genre: '',
    description: '',
    url: '',
    imageUrl: '',
    romPath: '',
    scoreConfig: {
      address: '',
      type: 'byte',
      length: 1,
      multiplier: 1
    },
    ...initialData
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('scoreConfig.')) {
      const field = name.split('.')[1] as keyof ScoreConfig;
      setFormData((prev) => ({
        ...prev,
        scoreConfig: {
          ...prev.scoreConfig,
          [field]: (field === 'length' || field === 'multiplier') ? parseInt(value) || 0 : value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEdit 
        ? `/api/admin/games/${slugify(initialData.title || '')}` 
        : '/api/admin/games';
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save game');
      }

      router.push('/admin/games');
      router.refresh(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="nes-container with-title is-rounded">
      <p className="title">{isEdit ? 'Edit Game' : 'New Game'}</p>
      
      {error && <div className="nes-text is-error mb-4">{error}</div>}

      <div className="nes-field">
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" className="nes-input" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="nes-field">
        <label htmlFor="platform">Platform</label>
        <div className="nes-select">
          <select required id="platform" name="platform" value={formData.platform} onChange={handleChange}>
            <option value="C64">C64</option>
            <option value="Amiga">Amiga</option>
            <option value="PC">PC</option>
          </select>
        </div>
      </div>

      <div className="nes-field">
        <label htmlFor="genre">Genre</label>
        <input type="text" id="genre" name="genre" className="nes-input" value={formData.genre} onChange={handleChange} />
      </div>

      <div className="nes-field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="nes-textarea" value={formData.description} onChange={handleChange} />
      </div>

      <div className="nes-field">
        <label htmlFor="url">Itch.io URL</label>
        <input type="url" id="url" name="url" className="nes-input" value={formData.url} onChange={handleChange} />
      </div>

      <div className="nes-field">
        <label htmlFor="imageUrl">Image URL</label>
        <input type="url" id="imageUrl" name="imageUrl" className="nes-input" value={formData.imageUrl} onChange={handleChange} />
      </div>
      
      <div className="nes-field">
        <label htmlFor="romPath">ROM Path (e.g. /roms/game.d64)</label>
        <input type="text" id="romPath" name="romPath" className="nes-input" value={formData.romPath} onChange={handleChange} />
      </div>

      <h3 className="mt-4 mb-2">Score Configuration</h3>
      <div className="border p-4 rounded mb-4">
          <div className="nes-field">
            <label htmlFor="scoreConfig.address">Memory Address (Hex, e.g. 0x0800)</label>
            <input type="text" id="scoreConfig.address" name="scoreConfig.address" className="nes-input" value={formData.scoreConfig?.address || ''} onChange={handleChange} placeholder="0x0000" />
          </div>
          
          <div className="nes-field">
            <label htmlFor="scoreConfig.type">Type</label>
            <div className="nes-select">
                <select id="scoreConfig.type" name="scoreConfig.type" value={formData.scoreConfig?.type || 'byte'} onChange={handleChange}>
                    <option value="byte">Byte</option>
                    <option value="int">Int (Little Endian)</option>
                    <option value="bcd">BCD</option>
                    <option value="string">String</option>
                </select>
            </div>
          </div>

          <div className="nes-field">
            <label htmlFor="scoreConfig.length">Length (Bytes)</label>
            <input type="number" id="scoreConfig.length" name="scoreConfig.length" className="nes-input" value={formData.scoreConfig?.length || 1} onChange={handleChange} />
          </div>

          <div className="nes-field">
            <label htmlFor="scoreConfig.multiplier">Multiplier (Optional, e.g. 10)</label>
            <input type="number" id="scoreConfig.multiplier" name="scoreConfig.multiplier" className="nes-input" value={formData.scoreConfig?.multiplier || ''} onChange={handleChange} placeholder="1" />
          </div>
      </div>

      <button type="submit" className={`nes-btn is-primary ${isSubmitting ? 'is-disabled' : ''}`} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Game'}
      </button>
    </form>
  );
}

// Helper needed for client-side slugify if we rely on it for the PUT URL
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
