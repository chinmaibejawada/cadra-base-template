import { useState } from 'react';
import { useNotes, useCreateNote, useDeleteNote } from '../../api/notes';
import type { NotableType } from '../../types/note';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function NoteList({ notableType, notableId }: { notableType: NotableType; notableId: number }) {
  const { data: notes, isLoading } = useNotes(notableType, notableId);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createNote.mutate(
      { notableType, notableId, content: content.trim() },
      { onSuccess: () => { setContent(''); setIsAdding(false); } }
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="text-xs font-medium text-prairie-600 hover:text-prairie-800">
          {isAdding ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-prairie-500 focus:outline-none"
            rows={3}
            placeholder="Write a note..."
          />
          <button
            type="submit"
            disabled={!content.trim() || createNote.isPending}
            className="mt-2 rounded-md bg-prairie-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-prairie-700 disabled:opacity-50"
          >
            {createNote.isPending ? 'Saving...' : 'Save Note'}
          </button>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : !notes || notes.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between">
                <div className="text-xs text-gray-500">
                  {note.author && <span className="font-medium text-gray-700">{note.author}</span>}
                  {note.author && ' · '}
                  {formatDate(note.createdAt)}
                  {note.isInternal && <span className="ml-2 text-amber-600">[Internal]</span>}
                </div>
                <button
                  onClick={() => deleteNote.mutate({ id: note.id, notableType, notableId })}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}