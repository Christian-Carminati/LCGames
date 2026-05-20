'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreConfig {
  address: string;
  type: 'byte' | 'int' | 'bcd' | 'string' | 'digits';
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

type TabId = 'general' | 'rom' | 'offsets';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: '♦' },
  { id: 'rom', label: 'ROM & Media', icon: '♠' },
  { id: 'offsets', label: 'Score & Config', icon: '★' },
];

export default function GameForm({ initialData = {}, isEdit = false }: GameFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('general');
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save game');
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
    <form onSubmit={handleSubmit} className="nes-container with-title is-rounded is-dark">
      <p className="title">{isEdit ? '▶ Edit Game' : '▶ New Game'}</p>
      
      {error && <div className="nes-text is-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* ── Retro Tab Bar ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nes-btn ${activeTab === tab.id ? 'is-primary' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              fontSize: '12px',
              flex: '1 1 auto',
              minWidth: '120px',
              opacity: activeTab === tab.id ? 1 : 0.6,
              transition: 'opacity 0.15s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Step Indicator ── */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '16px',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#92cc41'
      }}>
        STEP {TABS.findIndex(t => t.id === activeTab) + 1} / {TABS.length}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 1: General Info                         */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div className="nes-container is-dark is-rounded" style={{ padding: '16px' }}>
          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" className="nes-input is-dark" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="platform">Platform</label>
            <div className="nes-select is-dark">
              <select required id="platform" name="platform" value={formData.platform} onChange={handleChange}>
                <option value="C64 LC-Games">C64 LC-Games</option>
                <option value="C64 Arcade">C64 Arcade</option>
                <option value="Amiga">Amiga</option>
                <option value="PC">PC</option>
              </select>
            </div>
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="genre">Genre</label>
            <input type="text" id="genre" name="genre" className="nes-input is-dark" value={formData.genre} onChange={handleChange} />
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="nes-textarea is-dark" value={formData.description} onChange={handleChange} />
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="url">Itch.io URL</label>
            <input type="url" id="url" name="url" className="nes-input is-dark" value={formData.url} onChange={handleChange} />
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="imageUrl">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" className="nes-input is-dark" value={formData.imageUrl} onChange={handleChange} />
          </div>

          <div className="nes-field">
            <label htmlFor="published" className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="nes-checkbox is-dark"
              />
              <span>Published (visible to public)</span>
            </label>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="nes-btn is-success" onClick={() => setActiveTab('rom')}>
              ROM & Media ▶▶
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 2: ROM & Media                          */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'rom' && (
        <div className="nes-container is-dark is-rounded" style={{ padding: '16px' }}>
          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="romPath">ROM Path (e.g. /roms/game.d64)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" id="romPath" name="romPath" className="nes-input is-dark" value={formData.romPath} onChange={handleChange} />
                <input 
                    type="file" 
                    accept=".d64,.t64,.prg,.tap,.crt,.sid"
                    className="hidden" 
                    id="romUpload"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);

                        try {
                            setIsSubmitting(true);
                            const res = await fetch('/api/admin/upload-rom', {
                                method: 'POST',
                                body: uploadFormData
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
              <p className="nes-text is-success" style={{ fontSize: '10px', marginTop: '4px' }}>{uploadStatus.message}</p>
            )}
            {uploadStatus.type === 'error' && (
              <p className="nes-text is-error" style={{ fontSize: '10px', marginTop: '4px' }}>{uploadStatus.message}</p>
            )}
          </div>

          <div className="nes-field" style={{ marginBottom: '16px' }}>
            <label htmlFor="youtubeUrl">YouTube Video URL (for PC games)</label>
            <input type="url" id="youtubeUrl" name="youtubeUrl" className="nes-input is-dark" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <button type="button" className="nes-btn" onClick={() => setActiveTab('general')}>
              ◀◀ General
            </button>
            <button type="button" className="nes-btn is-success" onClick={() => setActiveTab('offsets')}>
              Score & Config ▶▶
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 3: Score & Config                       */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'offsets' && (
        <div className="nes-container is-dark is-rounded" style={{ padding: '16px' }}>
          
          {/* ── Difficulty Config ── */}
          <h3 style={{ 
            fontFamily: '"Press Start 2P", monospace', 
            fontSize: '12px', 
            color: '#f7d51d',
            marginBottom: '12px'
          }}>
            ♦ Difficulty Config
          </h3>
          <div className="nes-container is-rounded" style={{ padding: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)' }}>
            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="difficultyConfig.address">Difficulty Memory Address (Hex, e.g. 0x2299)</label>
              <input type="text" id="difficultyConfig.address" name="difficultyConfig.address" className="nes-input is-dark" value={formData.difficultyConfig?.address || ''} onChange={handleChange} placeholder="0x2299" />
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="difficultyConfig.baseOffset">Base Offset (Hex, Optional)</label>
              <input type="text" id="difficultyConfig.baseOffset" name="difficultyConfig.baseOffset" className="nes-input is-dark" value={formData.difficultyConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="difficultyConfig.numLevels">Number of Difficulty Levels</label>
              <input type="number" id="difficultyConfig.numLevels" name="difficultyConfig.numLevels" className="nes-input is-dark" value={formData.difficultyConfig?.numLevels || 1} onChange={handleChange} min={1} />
            </div>

            <div className="nes-field">
              <label htmlFor="difficultyConfig.levelNames">Difficulty Names (Comma Separated, optional)</label>
              <input type="text" id="difficultyConfig.levelNames" name="difficultyConfig.levelNames" className="nes-input is-dark" value={formData.difficultyConfig?.levelNames || ''} onChange={handleChange} placeholder="Easy, Medium, Hard, Extreme" />
              <span style={{ fontSize: '8px', color: '#888', marginTop: '4px', display: 'block' }}>Leave empty to use defaults (Easy, Medium, Hard...)</span>
            </div>
          </div>

          {/* ── PAL/NTSC Config ── */}
          <h3 style={{ 
            fontFamily: '"Press Start 2P", monospace', 
            fontSize: '12px', 
            color: '#209cee',
            marginBottom: '12px'
          }}>
            ♠ PAL/NTSC Config
          </h3>
          <div className="nes-container is-rounded" style={{ padding: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)' }}>
            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="palNtscConfig.address">PAL/NTSC Memory Address (Hex, e.g. 0x2xxx)</label>
              <input type="text" id="palNtscConfig.address" name="palNtscConfig.address" className="nes-input is-dark" value={formData.palNtscConfig?.address || ''} onChange={handleChange} placeholder="0x2xxx" />
              <span style={{ fontSize: '8px', color: '#888', marginTop: '4px', display: 'block' }}>Memory address where PAL/NTSC value is stored (0=PAL, 1=NTSC)</span>
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="palNtscConfig.baseOffset">Base Offset (Hex, Optional)</label>
              <input type="text" id="palNtscConfig.baseOffset" name="palNtscConfig.baseOffset" className="nes-input is-dark" value={formData.palNtscConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
            </div>

            <div className="nes-field">
              <label htmlFor="palNtscConfig.numStandards">Number of Standards</label>
              <input type="number" id="palNtscConfig.numStandards" name="palNtscConfig.numStandards" className="nes-input is-dark" value={formData.palNtscConfig?.numStandards || 2} onChange={handleChange} min={2} max={2} />
              <span style={{ fontSize: '8px', color: '#888', marginTop: '4px', display: 'block' }}>Usually 2 (PAL and NTSC)</span>
            </div>
          </div>

          {/* ── Score Config ── */}
          <h3 style={{ 
            fontFamily: '"Press Start 2P", monospace', 
            fontSize: '12px', 
            color: '#92cc41',
            marginBottom: '12px'
          }}>
            ★ Score Config
          </h3>
          <div className="nes-container is-rounded" style={{ padding: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)' }}>
            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="scoreConfig.address">Memory Address (Hex, e.g. 0x0800)</label>
              <input type="text" id="scoreConfig.address" name="scoreConfig.address" className="nes-input is-dark" value={formData.scoreConfig?.address || ''} onChange={handleChange} placeholder="0x0000" />
            </div>
            
            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="scoreConfig.type">Type</label>
              <div className="nes-select is-dark">
                  <select id="scoreConfig.type" name="scoreConfig.type" value={formData.scoreConfig?.type || 'byte'} onChange={handleChange}>
                      <option value="byte">Byte</option>
                      <option value="int">Int (Little Endian)</option>
                      <option value="bcd">BCD</option>
                      <option value="digits">Digits</option>
                      <option value="string">String</option>
                  </select>
              </div>
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="scoreConfig.length">Length (Bytes)</label>
              <input type="number" id="scoreConfig.length" name="scoreConfig.length" className="nes-input is-dark" value={formData.scoreConfig?.length || 1} onChange={handleChange} />
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="scoreConfig.multiplier">Multiplier (Optional, e.g. 10)</label>
              <input type="number" id="scoreConfig.multiplier" name="scoreConfig.multiplier" className="nes-input is-dark" value={formData.scoreConfig?.multiplier || ''} onChange={handleChange} placeholder="1" />
            </div>

            <div className="nes-field" style={{ marginBottom: '12px' }}>
              <label htmlFor="scoreConfig.baseOffset">Base Offset (Hex, Optional)</label>
              <input type="text" id="scoreConfig.baseOffset" name="scoreConfig.baseOffset" className="nes-input is-dark" value={formData.scoreConfig?.baseOffset || ''} onChange={handleChange} placeholder="0x0000" />
            </div>

            <div className="nes-field">
              <label htmlFor="scoreConfig.endianness">Endianness</label>
              <div className="nes-select is-dark">
                  <select id="scoreConfig.endianness" name="scoreConfig.endianness" value={formData.scoreConfig?.endianness || 'big'} onChange={handleChange}>
                      <option value="big">Big Endian (Default)</option>
                      <option value="little">Little Endian</option>
                  </select>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <button type="button" className="nes-btn" onClick={() => setActiveTab('rom')}>
              ◀◀ ROM & Media
            </button>
          </div>
        </div>
      )}

      {/* ── Submit Button (always visible) ── */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button type="submit" className={`nes-btn is-primary ${isSubmitting ? 'is-disabled' : ''}`} disabled={isSubmitting} style={{ minWidth: '200px' }}>
          {isSubmitting ? 'Saving...' : isEdit ? '✎ Save Changes' : '+ Save Game'}
        </button>
      </div>
    </form>
  );
}

// Helper needed for client-side slugify if we rely on it for the PUT URL
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
