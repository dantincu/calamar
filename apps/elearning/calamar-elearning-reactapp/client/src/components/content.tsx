import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Link } from 'react-router';
import { formatSize, type NoteFile, type OutlineNode } from '../api';
import { Modal } from './ui';

export function Markdown({ text }: { text: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{ a: ({ href, children }) => <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{children}</a> }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** The table of contents of a course; `linkTo` makes each entry a link, `active` highlights one. */
export function Outline({ nodes, linkTo, active, numbered = true }: {
  nodes: OutlineNode[];
  linkTo?: (n: OutlineNode) => string;
  active?: string;
  numbered?: boolean;
}) {
  function render(list: OutlineNode[], prefix: string) {
    let chapter = 0;
    return (
      <ul>
        {list.map((n) => {
          const number = n.kind === 'chapter' && numbered ? `${prefix}${++chapter}.` : '';
          const label = (
            <>
              <span className={`kind ${n.kind}`} aria-hidden>{n.kind === 'chapter' ? '▸' : '•'}</span>
              {number && <span className="num">{number}</span>}
              <span>{n.title}</span>
            </>
          );
          return (
            <li key={n.path} className={`${n.kind}${active === n.path ? ' active' : ''}`}>
              {linkTo ? <Link to={linkTo(n)}>{label}</Link> : <span className="entry">{label}</span>}
              {n.children.length > 0 && render(n.children, number)}
            </li>
          );
        })}
      </ul>
    );
  }
  if (nodes.length === 0) return <p className="muted">No pages yet.</p>;
  return <nav className="outline">{render(nodes, '')}</nav>;
}

const TEXT_EXT = /\.(txt|md|js|jsx|ts|tsx|mjs|cjs|json|css|scss|html|htm|xml|svg|rs|toml|yaml|yml|cs|csproj|sln|py|java|kt|go|c|h|cpp|hpp|sh|ps1|bat|sql|ini|cfg|conf|lock|gitignore|env)$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp)$/i;

const LANG: Record<string, string> = { jsx: 'javascript', tsx: 'typescript', rs: 'rust', cs: 'csharp', toml: 'ini', yml: 'yaml', ps1: 'powershell', sh: 'bash', htm: 'html', svg: 'xml', csproj: 'xml' };

/** The files attached to a page: download, or preview text and images. */
export function FileList({ files, urlOf, onDelete }: { files: NoteFile[]; urlOf: (name: string) => string; onDelete?: (name: string) => void }) {
  const [preview, setPreview] = useState<{ name: string; text?: string; image?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function open(name: string) {
    setError(null);
    if (IMAGE_EXT.test(name)) return setPreview({ name, image: true });
    try {
      const res = await fetch(urlOf(name), { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`Could not load ${name}`);
      setPreview({ name, text: await res.text() });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (files.length === 0) return null;
  return (
    <div className="files">
      <h4>Files</h4>
      <ul>
        {files.map((f) => {
          const viewable = TEXT_EXT.test(f.name) || IMAGE_EXT.test(f.name) || !f.name.includes('.');
          return (
            <li key={f.name}>
              <span className="file-icon" aria-hidden>📄</span>
              {viewable ? <button className="link" onClick={() => open(f.name)}>{f.name}</button> : <span>{f.name}</span>}
              <span className="muted small">{formatSize(f.size)}</span>
              <a className="btn ghost small" href={urlOf(f.name)} download>Download</a>
              {onDelete && <button className="btn ghost small danger" onClick={() => onDelete(f.name)}>Delete</button>}
            </li>
          );
        })}
      </ul>
      {error && <div className="error">{error}</div>}
      {preview && (
        <Modal title={preview.name} onClose={() => setPreview(null)}>
          {preview.image
            ? <img src={urlOf(preview.name)} alt={preview.name} style={{ maxWidth: '100%' }} />
            : <Markdown text={'```' + (LANG[ext(preview.name)] ?? ext(preview.name)) + '\n' + (preview.text ?? '').replace(/```/g, '`​``') + '\n```'} />}
          <div className="modal-foot"><a className="btn" href={urlOf(preview.name)} download>Download</a></div>
        </Modal>
      )}
    </div>
  );
}

function ext(name: string) {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}
