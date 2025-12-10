import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createTodo, fetchAllTodo } from '@/lib/action';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'DOING' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
}

const SortableTask = ({ task, onDelete, onChangePriority, isEditing, editTitle, editDescription, onStartEdit, onChangeTitle, onChangeDescription, onSaveEdit, onCancelEdit }: { task: Task; onDelete?: (id: string) => void; onChangePriority?: (id: string, priority: Task['priority']) => void; isEditing?: boolean; editTitle?: string; editDescription?: string; onStartEdit?: (task: Task) => void; onChangeTitle?: (value: string) => void; onChangeDescription?: (value: string) => void; onSaveEdit?: () => void; onCancelEdit?: () => void; }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: Boolean(isEditing) });

  const style = {
    transform: isEditing ? undefined : CSS.Transform.toString(transform),
    transition: isEditing ? undefined : transition,
  };

  const priorityColors = {
    LOW: 'bg-muted text-black',
    MEDIUM: 'bg-accent/20 text-black',
    HIGH: 'bg-destructive/20 text-black',
  } as const;

  const priorityBackground = {
    LOW: 'bg-green-50',
    MEDIUM: 'bg-blue-50',
    HIGH: 'bg-violet-50',
  } as const;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(!isEditing ? attributes : undefined)}
      {...(!isEditing ? listeners : undefined)}
      className={`p-4 ${
        isEditing
          ? 'cursor-default bg-white border-black'
          : `cursor-grab active:cursor-grabbing ${priorityBackground[task.priority]} border border-zinc-200`
      } transition-all duration-200 hover:shadow-soft ${
        isDragging ? 'opacity-50 rotate-1 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => onChangeTitle && onChangeTitle(e.target.value)}
            className="text-black bg-white border-black"
            // onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <h4 className="font-medium text-black">{task.title}</h4>
        )}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                aria-label="Save task"
                className="text-black hover:text-foreground transition-colors"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (onSaveEdit) onSaveEdit(); }}
                // onPointerDown={(e) => e.stopPropagation()}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                aria-label="Cancel edit"
                className="text-black hover:text-foreground transition-colors"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (onCancelEdit) onCancelEdit(); }}
               >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {onStartEdit && (
                <button
                  aria-label="Edit task"
                  className="text-black hover:text-foreground transition-colors"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onStartEdit(task); }}
                  //onPointerDown={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  aria-label="Delete task"
                  className="text-black hover:text-destructive transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(task.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <Textarea
          value={editDescription}
          onChange={(e) => onChangeDescription && onChangeDescription(e.target.value)}
          className="mb-3 text-black bg-white border-black"
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Description (optional)"
        />
      ) : (
        task.description && (
          <p className="text-sm text-black mb-3">{task.description}</p>
        )
      )}
      <div className="flex items-center justify-between">
        {onChangePriority ? (
          <Select
            value={task.priority}
            onValueChange={(val) => onChangePriority(task.id, val as Task['priority'])}
          >
            <SelectTrigger
              className={`w-[120px] h-7 ${
                isEditing
                  ? 'bg-white text-black border border-black'
                  : `${priorityColors[task.priority]} border-0`
              }`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent onPointerDown={(e) => e.stopPropagation()}>
              <SelectItem className='text-black' value="LOW">Low</SelectItem>
              <SelectItem className='text-black' value="MEDIUM">Medium</SelectItem>
              <SelectItem className='text-black' value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={priorityColors[task.priority]} variant="secondary">
            {task.priority}
          </Badge>
        )}
        <span className="text-xs text-black">
          {task.createdAt.toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

const Todo = ({project}:{project: { id: string; todos?: Task[] }}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'LOW',
    projectId: project.id,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ title: string; description: string }>({ title: '', description: '' });

  // Fetch todos from API
  const refreshTodos = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllTodo(project.id);
      if (res && res.todo) {
        const mapped: Task[] = res.todo.map((t: { id: string; title: string; description?: string; status: string; priority: string; createdAt: string }) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? undefined,
          status: (String(t.status).toUpperCase() as 'TODO'|'DOING'|'DONE'),
          priority: (String(t.priority).toUpperCase() as 'LOW'|'MEDIUM'|'HIGH'),
          createdAt: new Date(t.createdAt),
        }));
        setTasks(mapped);
      }
    } catch (e) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    let newStatus: 'TODO' | 'DOING' | 'DONE';

    // Check if dropped on a column
    if (overId.endsWith('-column')) {
      newStatus = overId.replace('-column', '') as 'TODO' | 'DOING' | 'DONE';
    } else {
      // Check if dropped on another task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return; // Invalid drop target
      }
    }

    // Update task status if it changed
    if (activeTask.status.toLowerCase() !== newStatus) {
      // optimistic update
      setTasks(prev => prev.map(task => task.id === active.id ? { ...task, status: newStatus.toUpperCase() as 'TODO' | 'DOING' | 'DONE' } : task));
      // persist to backend
      fetch(`/api/todo/${active.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update');
        return res.json();
      }).then(updated => {
        // ensure createdAt remains Date
        setTasks(prev => prev.map(t => t.id === updated.id ? {
          id: updated.id,
          title: updated.title,
          description: updated.description ?? undefined,
          status: (String(updated.status).toUpperCase() as 'TODO'|'DOING'|'DONE'),
          priority: (String(updated.priority).toUpperCase() as 'LOW'|'MEDIUM'|'HIGH'),
          createdAt: new Date(updated.createdAt),
        } : t));
      }).catch(() => {
        // rollback on error
        setTasks(prev => prev.map(task => task.id === active.id ? { ...task, status: activeTask.status } : task));
      });
    }
  };

  const createTask = async () => {
    if (!formData.title.trim()) return;
    try {
      // Ensure enums are uppercase for Prisma
      const payload = {
        ...formData,
        status: formData.status.toUpperCase(),
        priority: formData.priority.toUpperCase(),
      };
      const res = await createTodo(payload);
      if (res && res.error) {
        alert('Error creating todo: ' + res.error);
        return;
      }
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'LOW',
        projectId: project.id,
      });
      setIsCreating(false);
      await refreshTodos();
    } catch (err) {
      alert('Failed to create task. See console for details.');
      console.error('Failed to create task error in Todo.tsx', err);
    }
  };

  const getTasksByStatus = (status: 'TODO' | 'DOING' | 'DONE') => {
    return tasks.filter(task => task.status === status.toUpperCase());
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/todo/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await refreshTodos();
    } catch {
      // error handled silently
    }
  };

  const changePriority = async (id: string, priority: Task['priority']) => {
    const previous = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
    try {
      const res = await fetch(`/api/todo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: priority.toUpperCase() }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? {
        ...t,
        priority: (String(updated.priority).toLowerCase() as Task['priority']),
      } : t));
    } catch {
      setTasks(previous);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFields({ title: task.title, description: task.description || '' });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditFields({ title: '', description: '' });
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    try {
      const res = await fetch(`/api/todo/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editFields.title, description: editFields.description || null }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingTaskId(null);
      setEditFields({ title: '', description: '' });
      await refreshTodos();
    } catch {
      setEditingTaskId(null);
    }
  };

  const DroppableColumn = ({ 
    status, 
    title, 
    tasks, 
    className 
  }: { 
    status: string;
    title: string;
    tasks: Task[];
    className: string;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `${status}-column`,
    });

    return (
      <div className={`flex-1 min-h-0 ${className}`}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black">{title}</h3>
            <Badge variant="secondary" className="text-xs text-black">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`space-y-3 min-h-96 p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
              isOver 
                ? 'bg-primary/10 border-primary/50 shadow-lg' 
                : 'bg-muted/30 border-border/50'
            }`}
          >
            {tasks.map(task => {
              const isEditing = editingTaskId === task.id;
              // Use a stable key for editing state
              return (
                <SortableTask
                  key={task.id + (isEditing ? '-editing' : '')}
                  task={task}
                  onDelete={deleteTask}
                  onChangePriority={changePriority}
                  isEditing={isEditing}
                  editTitle={isEditing ? editFields.title : undefined}
                  editDescription={isEditing ? editFields.description : undefined}
                  onStartEdit={startEdit}
                  onChangeTitle={isEditing ? (v) => setEditFields(prev => ({ ...prev, title: v })) : undefined}
                  onChangeDescription={isEditing ? (v) => setEditFields(prev => ({ ...prev, description: v })) : undefined}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                />
              );
            })}
          </div>
        </SortableContext>
      </div>
    );
  };

  // Fetch todos on mount
  // useEffect replaced above with refreshTodos on [project.id]

  return (
    <div className="h-full p-6 rounded-xl  bg-white shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Todos</h2>
            <p className="text-black">Organize your tasks with drag & drop</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
        {isLoading && (
          <div className="mt-4 text-sm text-black">Loading...</div>
        )}
        {isCreating && (
          <Card className="mt-4 p-4 bg-card/80 backdrop-blur-sm">
            <div className="space-y-3">
              <Input
                name="title"
                placeholder="Task title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) createTask();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
              />
              <Textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select value={formData.priority} onValueChange={val => setFormData({ ...formData, priority: val as Task['priority'] })}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={createTask} size="sm">Create</Button>
                <Button variant="ghost" onClick={() => setIsCreating(false)} size="sm" className="text-black">Cancel</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6">
          <DroppableColumn status="TODO" title="To Do" tasks={getTasksByStatus('TODO')} className="bg-muted/30" />
          <DroppableColumn status="DOING" title="In Progress" tasks={getTasksByStatus('DOING')} className="bg-muted/30" />
          <DroppableColumn status="DONE" title="Done" tasks={getTasksByStatus('DONE')} className="bg-muted/30" />
        </div>
        <DragOverlay>
          {activeTask ? <SortableTask task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
      {/* Floating edit modal outside mapped list */}
      {editingTaskId && (
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', zIndex: 1000, background: 'white', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', padding: 24, minWidth: 320 }}>
          <h3 className="font-bold mb-2">Edit Task</h3>
          <Input
            value={editFields.title}
            onChange={e => setEditFields(prev => ({ ...prev, title: e.target.value }))}
            autoFocus
            className="mb-2"
          />
          <Textarea
            value={editFields.description}
            onChange={e => setEditFields(prev => ({ ...prev, description: e.target.value }))}
            className="mb-2"
            placeholder="Description (optional)"
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={saveEdit} size="sm">Save</Button>
            <Button variant="ghost" onClick={cancelEdit} size="sm">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todo;