import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ChevronLeft,
  Save,
  MoreVertical,
  Trash2,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Highlighter,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Palette,
} from 'lucide-react';

export default function Dashboard({ notebook, notes, onBack, onSaveNote, onDeleteNote }) {
  const [currentNote, setCurrentNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse border border-gray-700 w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-700 bg-gray-800 px-4 py-2 font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-700 px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6',
      },
    },
  });

  useEffect(() => {
    if (notes && notes.length > 0 && !currentNote) {
      setCurrentNote(notes[0]);
      setNoteTitle(notes[0].title);
      editor?.commands.setContent(notes[0].content);
    }
  }, [notes]);

  const handleSave = () => {
    if (!editor) return;
    
    setIsSaving(true);
    const content = editor.getHTML();
    const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;
    const characterCount = editor.getText().length;

    const noteData = {
      id: currentNote?.id || `note_${Date.now()}`,
      notebookId: notebook.id,
      title: noteTitle || 'Untitled Note',
      content,
      wordCount,
      characterCount,
      createdAt: currentNote?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    onSaveNote(noteData);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleNewNote = () => {
    setCurrentNote(null);
    setNoteTitle('');
    editor?.commands.setContent('');
  };

  const handleSelectNote = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    editor?.commands.setContent(note.content);
  };

  const handleDelete = () => {
    if (currentNote && window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(currentNote.id);
      handleNewNote();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#4B0082',
  ];

  const highlightColors = [
    '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500',
    '#FF69B4', '#90EE90', '#FFB6C1', '#DDA0DD', '#F0E68C',
  ];

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 flex h-screen">
      {/* Notes List Sidebar */}
      <div className="w-64 border-r border-[rgba(255,255,255,0.1)] bg-[#0A0A0A] flex flex-col">
        <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to Notebooks</span>
          </button>
          <h2 className="text-white font-semibold text-lg mb-2">{notebook.name}</h2>
          <button
            onClick={handleNewNote}
            className="w-full bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all"
          >
            New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleSelectNote(note)}
              className={`p-3 rounded-2xl cursor-pointer transition-all ${
                currentNote?.id === note.id
                  ? 'bg-[#1C1C1E] border border-[rgba(255,255,255,0.2)]'
                  : 'hover:bg-[#1C1C1E] border border-transparent'
              }`}
            >
              <h3 className="text-white font-medium text-sm mb-1 truncate">{note.title}</h3>
              <p className="text-gray-400 text-xs">
                {new Date(note.lastModified).toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-xs mt-1">{note.wordCount} words</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-8">
              No notes yet
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
        {/* Toolbar - Multi-row for rich features */}
        <div className="border-b border-[rgba(255,255,255,0.1)] p-3 bg-[#0A0A0A]">
          {/* Row 1: Text Formatting */}
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg transition-all text-xs font-medium ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg transition-all text-xs ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-lg transition-all text-xs ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
            >
              <Heading3 className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bold')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('italic')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('underline')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('strike')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            {/* Text Color */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                }}
                className="p-2 rounded-lg hover:bg-[#1C1C1E] text-gray-400 transition-all"
                title="Text Color"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 bg-[#1C1C1E] rounded-lg p-3 border border-[rgba(255,255,255,0.1)] shadow-lg z-50">
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded border-2 border-gray-600 hover:border-white transition-all"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setShowColorPicker(false);
                    }}
                    className="mt-2 w-full text-xs text-gray-400 hover:text-white"
                  >
                    Clear Color
                  </button>
                </div>
              )}
            </div>
            
            {/* Highlight Color */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                }}
                className={`p-2 rounded-lg transition-all ${
                  editor.isActive('highlight')
                    ? 'bg-white text-black'
                    : 'hover:bg-[#1C1C1E] text-gray-400'
                }`}
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              {showHighlightPicker && (
                <div className="absolute top-full mt-2 left-0 bg-[#1C1C1E] rounded-lg p-3 border border-[rgba(255,255,255,0.1)] shadow-lg z-50">
                  <div className="grid grid-cols-5 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          editor.chain().focus().toggleHighlight({ color }).run();
                          setShowHighlightPicker(false);
                        }}
                        className="w-6 h-6 rounded border-2 border-gray-600 hover:border-white transition-all"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPicker(false);
                    }}
                    className="mt-2 w-full text-xs text-gray-400 hover:text-white"
                  >
                    Clear Highlight
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Lists, Alignment, Tables */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bulletList')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('orderedList')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('taskList')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Task List"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive({ textAlign: 'left' })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive({ textAlign: 'center' })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive({ textAlign: 'right' })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive({ textAlign: 'justify' })
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('blockquote')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('code')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            <button
              onClick={setLink}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('link')
                  ? 'bg-white text-black'
                  : 'hover:bg-[#1C1C1E] text-gray-400'
              }`}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addTable}
              className="p-2 rounded-lg hover:bg-[#1C1C1E] text-gray-400 transition-all"
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-2" />
            
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded-lg hover:bg-[#1C1C1E] text-gray-400 disabled:opacity-30 transition-all"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded-lg hover:bg-[#1C1C1E] text-gray-400 disabled:opacity-30 transition-all"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Controls - Show when cursor is in table */}
        {editor.isActive('table') && (
          <div className="border-b border-[rgba(255,255,255,0.1)] px-4 py-2 bg-[#0A0A0A] flex items-center gap-2">
            <span className="text-gray-400 text-xs mr-2">Table:</span>
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              + Column Left
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              + Column Right
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              - Column
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              + Row Above
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              + Row Below
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-3 py-1 text-xs rounded bg-[#1C1C1E] text-gray-400 hover:text-white transition-all"
            >
              - Row
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Delete Table
            </button>
          </div>
        )}

        {/* Title Input */}
        <div className="px-8 pt-6 pb-4">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full bg-transparent text-white text-3xl font-bold focus:outline-none placeholder-gray-700"
          />
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {/* Footer with Save */}
        <div className="border-t border-[rgba(255,255,255,0.1)] px-8 py-4 flex items-center justify-between bg-[#0A0A0A]">
          <div className="text-gray-400 text-sm">
            {editor.storage.characterCount?.characters() || 0} characters · {' '}
            {editor.storage.characterCount?.words() || 0} words
          </div>
          <div className="flex items-center gap-2">
            {currentNote && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full hover:scale-105 transition-all font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
