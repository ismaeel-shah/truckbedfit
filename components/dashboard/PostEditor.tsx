"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useRef, useState } from "react";
import { html as beautifyHtml } from "js-beautify";
import {
  Bold, Italic, Strikethrough, Code, Code2, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, X, Check,
  UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Palette, Table as TableIcon, Eye, FileCode, MonitorPlay,
  ClipboardCheck, Ruler,
} from "lucide-react";
import { SHORTCODE_TEMPLATES } from "@/lib/utils/shortcodes";

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const [imgPopover, setImgPopover]     = useState(false);
  const [linkPopover, setLinkPopover]   = useState(false);
  const [colorPopover, setColorPopover] = useState(false);
  const [codeView, setCodeView]         = useState(false);
  const [rawHtml, setRawHtml]           = useState("");
  const [imgUrl, setImgUrl]             = useState("");
  const [imgAlt, setImgAlt]             = useState("");
  const [linkUrl, setLinkUrl]           = useState("");
  const [imgSelected, setImgSelected]   = useState(false);
  const [editImgAlt, setEditImgAlt]     = useState("");
  const [htmlPreview, setHtmlPreview]   = useState(false);
  const imgInputRef  = useRef<HTMLInputElement>(null);
  const imgAltRef    = useRef<HTMLInputElement>(null);
  const editAltRef   = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedPos     = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image");
        setEditImgAlt(attrs.alt ?? "");
        setImgSelected(true);
        setTimeout(() => editAltRef.current?.focus(), 50);
      } else {
        setImgSelected(false);
      }
    },
  });

  if (!editor) return null;

  /* ── Code view toggle ──────────────────────────────── */
  const enterCodeView = () => {
    const formatted = beautifyHtml(editor.getHTML(), {
      indent_size: 2,
      wrap_line_length: 120,
      end_with_newline: true,
      preserve_newlines: false,
      max_preserve_newlines: 1,
      unformatted: ["code", "pre"],
    });
    setRawHtml(formatted);
    setCodeView(true);
    setImgPopover(false);
    setLinkPopover(false);
    setColorPopover(false);
  };

  const exitCodeView = () => {
    editor.commands.setContent(rawHtml);
    onChange(rawHtml);
    setCodeView(false);
  };

  /* ── Image popover ─────────────────────────────────── */
  const openImgPopover = () => {
    savedPos.current = { from: editor.state.selection.from, to: editor.state.selection.to };
    setImgUrl("");
    setImgAlt("");
    setImgPopover(true);
    setLinkPopover(false);
    setColorPopover(false);
    setTimeout(() => imgInputRef.current?.focus(), 50);
  };

  const insertImage = () => {
    if (!imgUrl) return;
    const pos = savedPos.current;
    let chain = editor.chain().focus();
    if (pos) chain = chain.setTextSelection(pos);
    chain.setImage({ src: imgUrl, alt: imgAlt }).run();
    setImgPopover(false);
    setImgUrl("");
    setImgAlt("");
  };

  /* ── Edit alt text of selected image ──────────────── */
  const applyImgAlt = () => {
    editor.chain().focus().updateAttributes("image", { alt: editImgAlt }).run();
  };

  /* ── Link popover ──────────────────────────────────── */
  const openLinkPopover = () => {
    savedPos.current = { from: editor.state.selection.from, to: editor.state.selection.to };
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkPopover(true);
    setImgPopover(false);
    setColorPopover(false);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  };

  const insertLink = () => {
    if (!linkUrl) { editor.chain().focus().unsetLink().run(); }
    else {
      const pos = savedPos.current;
      let chain = editor.chain().focus();
      if (pos) chain = chain.setTextSelection(pos);
      chain.setLink({ href: linkUrl }).run();
    }
    setLinkPopover(false);
    setLinkUrl("");
  };

  /* ── Table insert ──────────────────────────────────── */
  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  /* ── Shortcode insert (rendered as components on the site) ── */
  const insertShortcode = (code: string) =>
    editor.chain().focus().insertContent(`<p>${code}</p>`).run();

  /* ── Toolbar button ────────────────────────────────── */
  const ToolbarBtn = ({
    onClick, active, children, title,
  }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title?: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
        active ? "bg-slate-200 dark:bg-slate-600 text-accent" : "text-slate-600 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 self-stretch" />;

  /* ── URL Popover ───────────────────────────────────── */
  const UrlPopover = ({
    open, onClose, inputRef, value, onChange: onVal, onConfirm, placeholder,
  }: {
    open: boolean; onClose: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
    value: string; onChange: (v: string) => void;
    onConfirm: () => void; placeholder: string;
  }) => {
    if (!open) return null;
    return (
      <div className="absolute left-0 right-0 top-full mt-1 z-30 mx-2">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2">
          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => onVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onConfirm(); }
              if (e.key === "Escape") onClose();
            }}
            placeholder={placeholder}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onConfirm(); }}
            className="p-2 rounded-lg bg-accent text-primary hover:brightness-110 transition-all">
            <Check size={15} />
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onClose(); }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400">
            <X size={15} />
          </button>
        </div>
      </div>
    );
  };

  /* ── Color palette ─────────────────────────────────── */
  const colors = [
    "#1F2328", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6",
    "#ec4899", "#6b7280", "#000000", "#ffffff",
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl">

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="relative sticky top-0 z-20 rounded-t-xl">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-t-xl">

          {/* View toggle — always visible */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); if (codeView) exitCodeView(); else enterCodeView(); }}
            title={codeView ? "Visual view" : "HTML source"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              codeView
                ? "bg-accent text-primary"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-accent/20"
            }`}
          >
            {codeView ? <><Eye size={13} /> Visual</> : <><FileCode size={13} /> HTML</>}
          </button>

          {/* Toolbar buttons — hidden in code view */}
          {!codeView && (
            <>
              <Divider />

              {/* Text formatting */}
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
                <Bold size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
                <Italic size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
                <UnderlineIcon size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                <Strikethrough size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
                <Code size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
                <Code2 size={15} />
              </ToolbarBtn>

              <Divider />

              {/* Headings */}
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
                <Heading2 size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
                <Heading3 size={15} />
              </ToolbarBtn>

              <Divider />

              {/* Alignment */}
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
                <AlignLeft size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
                <AlignCenter size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
                <AlignRight size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
                <AlignJustify size={15} />
              </ToolbarBtn>

              <Divider />

              {/* Lists & blocks */}
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
                <List size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
                <ListOrdered size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
                <Quote size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                <Minus size={15} />
              </ToolbarBtn>

              <Divider />

              {/* Highlight */}
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} active={editor.isActive("highlight")} title="Highlight">
                <Highlighter size={15} />
              </ToolbarBtn>

              {/* Text color */}
              <div className="relative">
                <ToolbarBtn onClick={() => { setColorPopover(v => !v); setImgPopover(false); setLinkPopover(false); }} title="Text color">
                  <Palette size={15} />
                </ToolbarBtn>
                {colorPopover && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2">
                    <div className="grid grid-cols-6 gap-1">
                      {colors.map((c) => (
                        <button key={c} type="button"
                          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setColorPopover(false); }}
                          className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }} title={c}
                        />
                      ))}
                    </div>
                    <button type="button"
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setColorPopover(false); }}
                      className="mt-1.5 w-full text-xs text-slate-500 hover:text-accent transition-colors">
                      Reset color
                    </button>
                  </div>
                )}
              </div>

              <Divider />

              {/* Table, Link, Image */}
              <ToolbarBtn onClick={insertTable} title="Insert table">
                <TableIcon size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={openLinkPopover} active={editor.isActive("link")} title="Add link">
                <LinkIcon size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={openImgPopover} title="Insert image">
                <ImageIcon size={15} />
              </ToolbarBtn>

              <Divider />

              {/* Shortcodes — edit the placeholder values after inserting */}
              <ToolbarBtn onClick={() => insertShortcode(SHORTCODE_TEMPLATES.trustbox)} title="Insert “how we picked” box">
                <ClipboardCheck size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => insertShortcode(SHORTCODE_TEMPLATES.bedchart)} title="Insert bed size chart">
                <Ruler size={15} />
              </ToolbarBtn>

              <Divider />

              {/* History */}
              <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
                <Undo size={15} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
                <Redo size={15} />
              </ToolbarBtn>
            </>
          )}
        </div>

        {/* Image alt edit bar — shown when an image is selected in editor */}
        {imgSelected && !codeView && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-accent/5">
            <span className="text-xs font-semibold text-accent shrink-0 flex items-center gap-1.5">
              <ImageIcon size={12} /> Alt Text:
            </span>
            <input
              ref={editAltRef}
              type="text"
              value={editImgAlt}
              onChange={(e) => setEditImgAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); applyImgAlt(); }
              }}
              placeholder="Describe this image…"
              className="flex-1 text-sm px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyImgAlt(); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent text-primary text-xs font-semibold hover:brightness-110 transition-all shrink-0"
            >
              <Check size={12} /> Apply
            </button>
          </div>
        )}

        {/* Image popover — two fields: URL + Alt text */}
        {imgPopover && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 mx-2">
            <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3">
              <input
                ref={imgInputRef}
                type="url"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); insertImage(); }
                  if (e.key === "Escape") setImgPopover(false);
                }}
                placeholder="Image URL (required)"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex items-center gap-2">
                <input
                  ref={imgAltRef}
                  type="text"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); insertImage(); }
                    if (e.key === "Escape") setImgPopover(false);
                  }}
                  placeholder="Alt text (optional)"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); insertImage(); }}
                  className="p-2 rounded-lg bg-accent text-primary hover:brightness-110 transition-all">
                  <Check size={15} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); setImgPopover(false); }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400">
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link popover */}
        <UrlPopover open={linkPopover} onClose={() => setLinkPopover(false)}
          inputRef={linkInputRef} value={linkUrl} onChange={setLinkUrl}
          onConfirm={insertLink} placeholder="Paste link URL and press Enter…" />
      </div>

      {/* ── Editor / Code view area ───────────────────── */}
      {codeView ? (
        <div className="bg-[#1e1e2e] rounded-b-xl">
          {/* Code view header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-xs text-slate-400 font-mono">HTML Source</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHtmlPreview(v => !v)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  htmlPreview
                    ? "bg-accent text-primary"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                <MonitorPlay size={12} /> {htmlPreview ? "Hide Preview" : "Preview"}
              </button>
              <button
                type="button"
                onClick={exitCodeView}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent text-primary font-semibold hover:brightness-110 transition-all"
              >
                <Eye size={12} /> Switch to Visual
              </button>
            </div>
          </div>
          {htmlPreview ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none p-6 min-h-[460px] bg-white dark:bg-slate-900 rounded-b-xl overflow-auto"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          ) : (
            <textarea
              value={rawHtml}
              onChange={(e) => {
                setRawHtml(e.target.value);
                onChange(e.target.value);
              }}
              spellCheck={false}
              className="w-full min-h-[460px] p-4 font-mono text-sm bg-transparent text-[#cdd6f4] focus:outline-none resize-y leading-relaxed"
              placeholder="<p>HTML source code here…</p>"
            />
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-b-xl transition-shadow focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent/40">
          {/* .tiptap-editor must wrap .ProseMirror — globals.css gives the editable area its height, padding and no outline */}
          <EditorContent
            editor={editor}
            className="tiptap-editor prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading"
          />
        </div>
      )}
    </div>
  );
}
