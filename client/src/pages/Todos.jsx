import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, Edit2, Check, X, GripVertical, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const PHASES = [
  { key: 'fire', label: 'À faire MAINTENANT', color: 'bg-red-50 border-red-200', badgeColor: 'bg-red-100 text-red-700', headerColor: 'text-red-700', icon: '🔥' },
  { key: 'build', label: 'Semaine 1', color: 'bg-blue-50 border-blue-200', badgeColor: 'bg-blue-100 text-blue-700', headerColor: 'text-blue-700', icon: '🔨' },
  { key: 'grow', label: 'Semaine 2-3', color: 'bg-green-50 border-green-200', badgeColor: 'bg-green-100 text-green-700', headerColor: 'text-green-700', icon: '🌱' },
  { key: 'later', label: 'Plus tard', color: 'bg-gray-50 border-gray-200', badgeColor: 'bg-gray-100 text-gray-600', headerColor: 'text-gray-600', icon: '📋' },
];

const FILTER_TABS = [
  { key: 'all', label: 'Tout' },
  { key: 'fire', label: "Aujourd'hui" },
  { key: 'build', label: 'Semaine 1' },
  { key: 'grow', label: 'Semaine 2-3' },
  { key: 'later', label: 'Plus tard' },
];

function TagBadge({ tag, phaseKey }) {
  if (!tag) return null;
  const phase = PHASES.find(p => p.key === phaseKey);
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${phase?.badgeColor || 'bg-gray-100 text-gray-600'}`}>
      {tag}
    </span>
  );
}

function TodoItem({ item, phaseKey, isSuperadmin, onToggle, onEdit, onDelete, dragHandleProps }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editNote, setEditNote] = useState(item.note || '');
  const [editTag, setEditTag] = useState(item.tag || '');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await onEdit(item.id, { title: editTitle.trim(), note: editNote.trim(), tag: editTag.trim() });
      setEditing(false);
      addToast('Todo updated', 'success');
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditNote(item.note || '');
    setEditTag(item.tag || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg border-2 border-indigo-300 p-3 space-y-2">
        <input
          className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          autoFocus
        />
        <input
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-500"
          value={editTag}
          onChange={e => setEditTag(e.target.value)}
          placeholder="Tag (ex: Maintenant)"
        />
        <textarea
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-500 resize-none"
          value={editNote}
          onChange={e => setEditNote(e.target.value)}
          placeholder="Note..."
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50"
          >
            <Check size={12} /> Save
          </button>
          <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/70 transition-colors ${item.is_done ? 'opacity-60' : ''}`}>
      {isSuperadmin && (
        <div {...dragHandleProps} className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={14} />
        </div>
      )}
      <button
        onClick={() => onToggle(item.id, !item.is_done)}
        className={`mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors ${
          item.is_done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400'
        }`}
        style={{ width: 18, height: 18, minWidth: 18 }}
      >
        {!!item.is_done && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium text-gray-800 ${item.is_done ? 'line-through text-gray-400' : ''}`}>
            {item.title}
          </span>
          <TagBadge tag={item.tag} phaseKey={phaseKey} />
        </div>
        {item.note && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.note}</p>
        )}
      </div>
      {isSuperadmin && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function AddTodoForm({ phaseKey, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd({ title: title.trim(), note: note.trim(), tag: tag.trim(), phase: phaseKey });
      addToast('Todo created', 'success');
      onCancel();
    } catch {
      addToast('Failed to create todo', 'error');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border-2 border-indigo-300 p-3 space-y-2 mt-2">
      <input
        autoFocus
        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Todo title..."
        required
      />
      <input
        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-500"
        value={tag}
        onChange={e => setTag(e.target.value)}
        placeholder="Tag (ex: Maintenant)"
      />
      <textarea
        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-500 resize-none"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note..."
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50"
        >
          <Check size={12} /> Add
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [addingPhase, setAddingPhase] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const isSuperadmin = user?.role === 'superadmin';

  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch {
      addToast('Failed to load todos', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleToggle = async (id, is_done) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_done: is_done ? 1 : 0 } : t));
    try {
      await api.patch(`/todos/${id}`, { is_done });
    } catch {
      addToast('Failed to update todo', 'error');
      setTodos(prev => prev.map(t => t.id === id ? { ...t, is_done: is_done ? 0 : 1 } : t));
    }
  };

  const handleEdit = async (id, data) => {
    const res = await api.patch(`/todos/${id}`, data);
    setTodos(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this todo?')) return;
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await api.delete(`/todos/${id}`);
      addToast('Deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
      fetchTodos();
    }
  };

  const handleAdd = async (data) => {
    const res = await api.post('/todos', data);
    setTodos(prev => [...prev, res.data]);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId || source.index === destination.index) return;

    const phaseKey = source.droppableId;
    const phaseTodos = todos.filter(t => t.phase === phaseKey).sort((a, b) => a.position - b.position);
    const reordered = [...phaseTodos];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const updated = reordered.map((t, i) => ({ ...t, position: i + 1 }));
    setTodos(prev => [
      ...prev.filter(t => t.phase !== phaseKey),
      ...updated,
    ]);

    try {
      await Promise.all(updated.map(t => api.patch(`/todos/${t.id}`, { position: t.position })));
    } catch {
      addToast('Failed to reorder', 'error');
      fetchTodos();
    }
  };

  const totalTodos = todos.length;
  const doneTodos = todos.filter(t => t.is_done).length;
  const percent = totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0;

  const visiblePhases = filter === 'all' ? PHASES : PHASES.filter(p => p.key === filter);

  const getTodosForPhase = (phaseKey) => {
    return todos
      .filter(t => t.phase === phaseKey)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
          <p className="text-gray-500 text-sm mt-1">Track your Quorex launch progress</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <ProgressBar
            percent={percent}
            label={`${doneTodos} / ${totalTodos} tâches terminées`}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-gray-100 rounded mb-2" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={isSuperadmin ? handleDragEnd : () => {}}>
            <div className="space-y-4">
              {visiblePhases.map(phase => {
                const phaseTodos = getTodosForPhase(phase.key);
                const phaseDone = phaseTodos.filter(t => t.is_done).length;

                return (
                  <div key={phase.key} className={`rounded-xl border p-4 ${phase.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span>{phase.icon}</span>
                        <h2 className={`text-sm font-bold ${phase.headerColor}`}>{phase.label}</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phase.badgeColor}`}>
                          {phaseDone}/{phaseTodos.length}
                        </span>
                      </div>
                      {isSuperadmin && (
                        <button
                          onClick={() => setAddingPhase(addingPhase === phase.key ? null : phase.key)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 border border-gray-300 hover:border-indigo-300 px-2 py-1 rounded-lg bg-white transition-colors"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      )}
                    </div>

                    <Droppable droppableId={phase.key} isDropDisabled={!isSuperadmin}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-0.5">
                          {phaseTodos.length === 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-3 px-2">
                              <AlertCircle size={14} />
                              No todos in this phase
                            </div>
                          )}
                          {phaseTodos.map((todo, index) => (
                            <Draggable
                              key={todo.id}
                              draggableId={String(todo.id)}
                              index={index}
                              isDragDisabled={!isSuperadmin}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={snapshot.isDragging ? 'shadow-lg rounded-lg' : ''}
                                >
                                  <TodoItem
                                    item={todo}
                                    phaseKey={phase.key}
                                    isSuperadmin={isSuperadmin}
                                    onToggle={handleToggle}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    dragHandleProps={provided.dragHandleProps}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {addingPhase === phase.key && (
                      <AddTodoForm
                        phaseKey={phase.key}
                        onAdd={handleAdd}
                        onCancel={() => setAddingPhase(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </Layout>
  );
}
