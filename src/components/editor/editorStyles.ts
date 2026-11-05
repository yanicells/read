/** Scoped styles for the rich editor's ProseMirror content; mirrors the reader's prose look. */
export const EDITOR_CSS = `
.read-editor { min-height: 60vh; line-height: 1.65; overflow-wrap: anywhere; caret-color: var(--accent); }
.read-editor > * + * { margin-top: 0.75em; }
.read-editor h1, .read-editor h2, .read-editor h3,
.read-editor h4, .read-editor h5, .read-editor h6 { font-weight: 700; line-height: 1.25; margin-top: 1.4em; }
.read-editor > :first-child { margin-top: 0; }
.read-editor h1 { font-size: 2em; }
.read-editor h2 { font-size: 1.55em; }
.read-editor h3 { font-size: 1.3em; }
.read-editor h4, .read-editor h5, .read-editor h6 { font-size: 1.1em; }
.read-editor ul, .read-editor ol { padding-left: 1.5em; }
.read-editor ul { list-style: disc; }
.read-editor ul ul { list-style: circle; }
.read-editor ol { list-style: decimal; }
.read-editor li + li, .read-editor li > ul, .read-editor li > ol { margin-top: 0.3em; }
.read-editor li::marker { color: var(--sub); }
.read-editor a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.read-editor strong { font-weight: 700; color: color-mix(in srgb, var(--accent) 70%, var(--text)); }
.read-editor code { font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); border-radius: 0.3rem; padding: 0.12em 0.4em; }
.read-editor pre { background: var(--surface); border-radius: 0.5rem; padding: 1em 1.2em; overflow-x: auto; font-size: 0.82em; line-height: 1.6; }
.read-editor pre code { background: none; padding: 0; font-size: inherit; }
.read-editor blockquote { padding-left: 1.1em; border-left: 2px solid var(--line); color: var(--sub); }
.read-editor hr { border: 0; border-top: 1px solid var(--line); margin: 1.2em 0; }
.read-editor table { border-collapse: collapse; font-size: 0.88em; width: 100%; }
.read-editor th, .read-editor td { border-bottom: 1px solid var(--line); padding: 0.35em 1.2em 0.35em 0; text-align: left; vertical-align: top; }
.read-editor th { font-weight: 700; }
.read-editor td > p, .read-editor th > p { margin: 0; }
.read-editor .selectedCell { background: var(--accent-soft); }
.read-editor p.is-editor-empty:first-child::before {
  content: attr(data-placeholder); color: var(--sub); float: left; height: 0; pointer-events: none;
}
`
