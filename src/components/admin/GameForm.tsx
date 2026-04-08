'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreConfig {
  address: string;
  type: string;
  length: number;
  multiplier?: number;
  baseOffset?: string;
  endianness?: string;
}

interface PalNtscConfig {
  address: string;
  baseOffset?: string;
  numStandards?: number;
}

interface GameFormData {
  title: string;
  platform: string;
  genre: string;
  description: string;
  url: string;
  imageUrl: string;
  romPath: string;
  youtubeUrl: string;
  published: boolean;
  difficultyConfig: {
    address: string;
    baseOffset: string;
    numLevels: number;
    levelNames?: string;
  };
  palNtscConfig: PalNtscConfig;
  scoreConfig: ScoreConfig;
  [key: string]: string | number | boolean | ScoreConfig | { address: string; baseOffset: string; numLevels: number; } | PalNtscConfig;
}

interface GameFormProps {
    initialData?: Partial<GameFormData>;
    isEdit?: boolean;
}

export default function GameForm({ initialData = {}, isEdit = false }: GameFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    platform: 'C64 LC-Games',
    genre: '',
    description: '',
    url: '',
    imageUrl: '',
    romPath: '',
    youtubeUrl: '',
    published: initialData.published ?? true,
    scoreConfig: {
      address: '',
      type: 'byte',
      length: 1,
      multiplier: 1,
      baseOffset: '',
      endianness: 'big'
    },
    ...initialData,
    difficultyConfig: {
      address: initialData.difficultyConfig?.address || '',
      baseOffset: initialData.difficultyConfig?.baseOffset || '',
      numLevels: initialData.difficultyConfig?.numLevels || 1,
      levelNames: Array.isArray(initialData.difficultyConfig?.levelNames) 
        ? initialData.difficultyConfig.levelNames.join(', ') 
        : (initialData.difficultyConfig?.levelNames || '')
    },
    palNtscConfig: {
      address: initialData.palNtscConfig?.address || '',
      baseOffset: initialData.palNtscConfig?.baseOffset || '',
      numStandards: initialData.palNtscConfig?.numStandards || 2
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

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
    } else if (name.startsWith('difficultyConfig.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        difficultyConfig: {
          ...prev.difficultyConfig,
          [field]: field === 'numLevels' ? parseInt(value) || 1 : value
        }
      }));
    } else if (name.startsWith('palNtscConfig.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        palNtscConfig: {
          ...prev.palNtscConfig,
          [field]: field === 'numStandards' ? parseInt(value) || 2 : value
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
        ? `/api/admin/games/${initialData.slug || slugify(formData.title)}`
        : '/api/admin/games';
      
      const method = isEdit ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        difficultyConfig: formData.difficultyConfig?.address 
          ? {
              ...formData.difficultyConfig,
              levelNames: formData.difficultyConfig.levelNames
                ? (typeof formData.difficultyConfig.levelNames === 'string'
                    ? (formData.difficultyConfig.levelNames as string).split(',').map((s: string) => s.trim()).filter(Boolean)
                    : formData.difficultyConfig.levelNames)
                : []
            }
          : null,
        palNtscConfig: formData.palNtscConfig?.address
          ? {
              ...formData.palNtscConfig
            }
          : null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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
            <option value="C64 LC-Games">C64 LC-Games</option>
            <option value="C64 Arcade">C64 Arcade</option>
            <option value="Amiga">Amiga</option>
            <option value="PC">PC</option>
            <option value="NES">NES</option>
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
        <label htmlFor="published" className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="nes-checkbox"
          />
          <span>Published (visible to public)</span>
        </label>
      </div>

      <div className="nes-field">
        <label htmlFor="romPath">ROM Path (e.g. /roms/game.d64)</label>
        <div className="flex gap-2">
            <input type="text" id="romPath" name="romPath" className="nes-input" value={formData.romPath} onChange={handleChange} />
            <input 
                type="file" 
                accept=".d64,.t64,.prg,.tap,.crt,.sid"
                className="hidden" 
                id="romUpload"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        setIsSubmitting(true);
                        const res = await fetch('/api/admin/upload-rom', {
                            method: 'POST',
                            body: formData
                        });
                        const data = await res.json();
                        
                        if (res.ok) {
                            setFormData(prev => ({ ...prev, romPath: data.path }));
                            setUploadStatus({ type: 'success', message: 'ROM Uploaded!' });
                        } else {
                            setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
                        }
                    } catch (err) {
                        console.error(err);
                        setUploadStatus({ type: 'error', message: 'Upload error' });
                    } finally {
                        setIsSubmitting(false);
                        // Reset input
                        e.target.value = '';
                    }
                }}
            />
            <label htmlFor="romUpload" className="nes-btn is-warning">
                Upload
            </label>
        </div>
        {uploadStatus.type === 'success' && (
          <p className="text-sm text-green-400 mt-1">{uploadStatus.message}</p>
        )}
        {uploadStatus.type === 'error' && (
          <p className="text-sm text-red-400 mt-1">{uploadStatus.message}</p>
        )}
      </div>

      <div className="nes-field">
        <label htmlFor="youtubeUrl">YouTube Video URL (for PC games)</label>
        <input type="url" id="youtubeUrl" name="youtubeUrl" className="nes-input" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
      </div>

      <div className="border p-4 rounded mb-4">
          <div className="nes-field">
            <label htmlFor="difficultyConfig.address">Difficulty Memory Address (Hex, e.g. 0x2299)</label>
            <input type="text" id="difficultyConfig.address" name="difficultyConfig.address" className="nes-input" value={formData.difficultyConfig?.address || ''} onChange={handleChange} placeholder="0x2299" />
          </div>

          <div className="nes-field">
            <label htmlFor="difficultyConfig.baseOffset">Base Offset (Hex, Optional)</label>
            <input type="text" id="difficultyConfig.baseOffset" name="difficultyConfig.baseOffset" className="nes-input" value={formData.difficultyConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
          </div>

          <div className="nes-field">
            <label htmlFor="difficultyConfig.numLevels">Number of Difficulty Levels</label>
            <input type="number" id="difficultyConfig.numLevels" name="difficultyConfig.numLevels" className="nes-input" value={formData.difficultyConfig?.numLevels || 1} onChange={handleChange} min={1} />
          </div>

          <div className="nes-field mt-4">
            <label htmlFor="difficultyConfig.levelNames">Difficulty Names (Comma Separated, optional)</label>
            <input type="text" id="difficultyConfig.levelNames" name="difficultyConfig.levelNames" className="nes-input" value={formData.difficultyConfig?.levelNames || ''} onChange={handleChange} placeholder="Easy, Medium, Hard, Extreme" />
            <span className="text-xs text-gray-500 mt-1 block">Leave empty to use defaults (Easy, Medium, Hard...)</span>
          </div>
      </div>

      <h3 className="mt-4 mb-2">PAL/NTSC Configuration</h3>
      <div className="border p-4 rounded mb-4">
          <div className="nes-field">
            <label htmlFor="palNtscConfig.address">PAL/NTSC Memory Address (Hex, e.g. 0x2xxx)</label>
            <input type="text" id="palNtscConfig.address" name="palNtscConfig.address" className="nes-input" value={formData.palNtscConfig?.address || ''} onChange={handleChange} placeholder="0x2xxx" />
            <span className="text-xs text-gray-500 mt-1 block">Memory address where PAL/NTSC value is stored (0=PAL, 1=NTSC)</span>
          </div>

          <div className="nes-field">
            <label htmlFor="palNtscConfig.baseOffset">Base Offset (Hex, Optional)</label>
            <input type="text" id="palNtscConfig.baseOffset" name="palNtscConfig.baseOffset" className="nes-input" value={formData.palNtscConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
          </div>

          <div className="nes-field">
            <label htmlFor="palNtscConfig.numStandards">Number of Standards</label>
            <input type="number" id="palNtscConfig.numStandards" name="palNtscConfig.numStandards" className="nes-input" value={formData.palNtscConfig?.numStandards || 2} onChange={handleChange} min={2} max={2} />
            <span className="text-xs text-gray-500 mt-1 block">Usually 2 (PAL and NTSC)</span>
          </div>
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

          <div className="nes-field">
            <label htmlFor="scoreConfig.baseOffset">Base Offset (Hex, Optional)</label>
            <input type="text" id="scoreConfig.baseOffset" name="scoreConfig.baseOffset" className="nes-input" value={formData.scoreConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
          </div>

          <div className="nes-field">
            <label htmlFor="scoreConfig.endianness">Endianness</label>
            <div className="nes-select">
                <select id="scoreConfig.endianness" name="scoreConfig.endianness" value={formData.scoreConfig?.endianness || 'big'} onChange={handleChange}>
                    <option value="big">Big Endian (Default)</option>
                    <option value="little">Little Endian</option>
                </select>
            </div>
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
