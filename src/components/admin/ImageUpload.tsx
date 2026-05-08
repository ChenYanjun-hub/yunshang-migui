'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const enFont = { fontFamily: 'var(--font-serif-en)' } as const;

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  pathPrefix?: string; // e.g. "archives" or "products"
  maxCount?: number;
  onMeta?: (meta: { width: number; height: number }) => void; // 第一张图的尺寸
};

export default function ImageUpload({
  value,
  onChange,
  bucket = 'public-assets',
  pathPrefix = 'misc',
  maxCount = 8,
  onMeta,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const supabase = createClient();
    const remaining = maxCount - value.length;
    const slice = Array.from(files).slice(0, remaining);

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of slice) {
        if (!file.type.startsWith('image/')) {
          setError(`已跳过非图片文件：${file.name}`);
          continue;
        }
        const ext = file.name.split('.').pop() || 'jpg';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const path = `${pathPrefix}/${safeName}`;
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) {
          setError(`上传失败：${upErr.message}`);
          continue;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      const next = [...value, ...uploaded];
      onChange(next);

      // 探测第一张图尺寸（首次上传时）
      if (uploaded[0] && onMeta) {
        const img = new Image();
        img.onload = () => onMeta({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = uploaded[0];
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(idx: number) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url, idx) => (
          <div
            key={url}
            className="relative w-24 h-24 border border-border-subtle bg-surface-2 group overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            {idx === 0 && (
              <span
                className="absolute top-1 left-1 px-1.5 py-0.5 bg-accent text-background text-[9px] tracking-[0.2em] uppercase"
                style={enFont}
              >
                Cover
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(idx, idx - 1)}
                disabled={idx === 0}
                className="w-7 h-7 bg-background/80 border border-border-subtle text-xs disabled:opacity-30"
                title="上移"
              >←</button>
              <button
                type="button"
                onClick={() => move(idx, idx + 1)}
                disabled={idx === value.length - 1}
                className="w-7 h-7 bg-background/80 border border-border-subtle text-xs disabled:opacity-30"
                title="下移"
              >→</button>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="w-7 h-7 bg-background/80 border border-red-500 text-red-500 text-xs"
                title="删除"
              >×</button>
            </div>
          </div>
        ))}

        {value.length < maxCount && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border border-dashed border-border-hard text-text-muted hover:border-accent hover:text-accent text-xs tracking-[0.2em] uppercase italic flex items-center justify-center disabled:opacity-50"
            style={enFont}
          >
            {uploading ? 'Uploading…' : '+ Add'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 border-l-2 border-red-500 pl-2 mb-2">{error}</p>
      )}
      <p className="text-xs text-text-muted">
        最多 {maxCount} 张；第一张为封面；可拖拽箭头调整顺序。
      </p>
    </div>
  );
}
