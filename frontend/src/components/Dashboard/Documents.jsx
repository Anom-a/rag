import { useCallback, useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  ClipboardPaste,
  Check,
  File,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { uploadDocument, uploadFileDocument } from '../../services/api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';

const readUploads = () => {
  try {
    const raw = localStorage.getItem('nexus.uploads.v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUploads = (list) => {
  try {
    localStorage.setItem('nexus.uploads.v1', JSON.stringify(list.slice(0, 20)));
  } catch {
    /* ignore */
  }
};

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Documents() {
  const toast = useToast();
  const [uploads, setUploads] = useState(readUploads);
  const [text, setText] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const addLocal = (name, size) => {
    const next = [{ name, size, ts: Date.now() }, ...readUploads()];
    writeUploads(next);
    setUploads(next);
  };

  const submitPaste = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Paste some text first.');
      return;
    }
    setPasteLoading(true);
    try {
      const res = await uploadDocument(trimmed);
      addLocal('Pasted text', new Blob([trimmed]).size);
      setText('');
      toast.success(res.message || 'Document embedded into the knowledge base.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setPasteLoading(false);
    }
  };

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setDropLoading(true);
      try {
        const res = await uploadFileDocument(file);
        addLocal(file.name, file.size);
        toast.success(res.message || `${file.name} uploaded & embedded.`);
      } catch (err) {
        toast.error(err.message || 'Upload failed.');
      } finally {
        setDropLoading(false);
        setDragging(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
    else setDragging(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Upload zone */}
      <section className="grid animate-fade-up grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Paste text */}
        <div className="flex flex-col rounded-3xl border border-border bg-panel p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/[0.08] text-brand-600">
              <ClipboardPaste size={18} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink-900">Paste text</h3>
              <p className="text-[12px] text-ink-400">Add notes, snippets or full articles.</p>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste or type the document content here…"
            className="scroll-slim mt-4 w-full flex-1 resize-none rounded-2xl border border-border bg-panel-subtle p-4 text-[14px] leading-relaxed text-ink-900 placeholder:text-ink-400 outline-none transition-all focus:border-brand-500/60 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-ink-400">{text.trim().length.toLocaleString()} characters</span>
            <Button variant="primary" size="sm" loading={pasteLoading} onClick={submitPaste} icon={!pasteLoading ? Check : null}>
              Embed document
            </Button>
          </div>
        </div>

        {/* Drop file */}
        <div className="flex flex-col rounded-3xl border border-border bg-panel p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/[0.1] text-amber-600">
              <UploadCloud size={18} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink-900">Upload a file</h3>
              <p className="text-[12px] text-ink-400">.txt · .md · .pdf · .docx</p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`mt-4 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragging
                ? 'border-brand-500 bg-brand-500/[0.06]'
                : 'border-border-strong bg-panel-subtle hover:border-brand-500/50 hover:bg-brand-500/[0.04]'
            }`}
          >
            {dropLoading ? (
              <RefreshCw size={28} className="animate-spin text-brand-600" />
            ) : (
              <div className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${dragging ? 'bg-brand-500/20 text-brand-600' : 'bg-ink-900/[0.04] text-ink-400'}`}>
                <FileText size={24} />
              </div>
            )}
            <p className="mt-4 text-[14px] font-medium text-ink-900">
              {dropLoading ? 'Embedding…' : dragging ? 'Drop it to embed' : 'Drag & drop a file here'}
            </p>
            <p className="mt-1 text-[12px] text-ink-400">or click to browse</p>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.pdf,.docx"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </section>

      {/* Uploaded list */}
      <section className="animate-fade-up rounded-3xl border border-border bg-panel p-5 shadow-card sm:p-6" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-ink-900">Recently added</h3>
            <p className="text-[12px] text-ink-400">Tracked locally in this browser session.</p>
          </div>
          {uploads.length > 0 && (
            <button
              onClick={() => {
                writeUploads([]);
                setUploads([]);
                toast.info('Local upload history cleared.');
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-ink-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
            >
              <Trash2 size={14} /> Clear list
            </button>
          )}
        </div>

        {uploads.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-12 text-center">
            <File size={22} className="text-ink-400" />
            <p className="mt-3 text-[13px] text-ink-600">No documents added yet.</p>
            <p className="text-[12px] text-ink-400">Upload your first source above.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {uploads.map((u, i) => (
              <li
                key={`${u.name}-${i}`}
                className="flex animate-fade-up items-center gap-3 rounded-2xl border border-border bg-panel-subtle px-4 py-3 transition-colors hover:border-border-strong"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/[0.08] text-brand-600">
                  <File size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink-900">{u.name}</p>
                  <p className="text-[11px] text-ink-400">{fmtSize(u.size)} · {fmtTime(u.ts)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> embedded
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}