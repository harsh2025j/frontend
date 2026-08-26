"use client";

import React, { useState, useEffect } from "react";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { courseApi } from "@/data/services/academy-service/course.service";
import toast from "react-hot-toast";
import ContentEditorDrawer from "./ContentEditorDrawer";
import { 
  Plus, Edit2, Trash2, Video, FileText, PlaySquare, 
  FileCheck, GripVertical, Loader2, ChevronDown, ChevronRight, FolderPlus
} from "lucide-react";

type CurriculumItem = {
  id: string;
  type: "video" | "document" | "live" | "assignment" | "test";
  title: string;
  orderIndex: number;
  moduleId: string;
  fileUrl?: string;
  assignmentData?: any;
};

type CourseModule = {
  id: string;
  title: string;
  orderIndex: number;
  parentId: string | null;
  items: CurriculumItem[];
  children?: CourseModule[];
};

// SORTABLE ITEM COMPONENT
const SortableItem = ({ item, onDelete, onClick }: { item: CurriculumItem, onDelete: (id: string) => void, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} onClick={onClick} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 group ml-8 mb-2 shadow-sm cursor-pointer">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={16} />
        </button>
        <div className={`p-2 rounded-lg ${
          item.type === 'video' ? 'bg-indigo-50 text-indigo-600' :
          item.type === 'document' ? 'bg-emerald-50 text-emerald-600' :
          item.type === 'live' ? 'bg-red-50 text-red-600' :
          'bg-orange-50 text-orange-600'
        }`}>
          {item.type === 'video' && <Video size={16} />}
          {item.type === 'document' && <FileText size={16} />}
          {item.type === 'live' && <PlaySquare size={16} />}
          {item.type === 'assignment' && <FileCheck size={16} />}
        </div>
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        {(item.fileUrl || item.assignmentData?.instructionsPdfUrl) && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-green-100 text-green-700 rounded-full ml-2">Content Added</span>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-gray-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// RECURSIVE MODULE NODE COMPONENT
const ModuleNode = ({ 
  module, 
  onAddSubModule, 
  onAddItem, 
  onRename, 
  onDelete,
  onDeleteItem,
  onEditItem
}: { 
  module: CourseModule, 
  onAddSubModule: (parentId: string) => void,
  onAddItem: (moduleId: string, type: any) => void,
  onRename: (id: string, newTitle: string) => void,
  onDelete: (id: string) => void,
  onDeleteItem: (id: string) => void,
  onEditItem: (item: any) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const handleRenameSubmit = () => {
    if (editTitle.trim() && editTitle !== module.title) {
      onRename(module.id, editTitle);
    }
    setIsEditing(false);
  };

  const childModuleIds = module.children?.map(c => c.id) || [];
  const itemIds = module.items?.map(i => i.id) || [];

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      {/* Module Header */}
      <div className={`flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm transition-colors ${module.parentId ? 'border-gray-200 hover:border-blue-200' : 'border-gray-300 hover:border-blue-300 bg-gray-50/50'}`}>
        <div className="flex items-center gap-2 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-1">
            <GripVertical size={18} />
          </button>
          
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:bg-gray-200 p-1 rounded">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          {isEditing ? (
            <input 
              autoFocus
              className="font-bold text-gray-900 text-base bg-white border border-blue-400 rounded px-2 py-1 focus:outline-none flex-1"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()}
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              <span className="font-bold text-gray-900 text-base">{module.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 p-1 transition-opacity"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button onClick={() => onAddSubModule(module.id)} className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded mr-2" title="Add Sub-section">
            <FolderPlus size={14} /> Sub-section
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button onClick={() => onAddItem(module.id, "video")} className="p-1.5 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 rounded" title="Add Video"><Video size={16} /></button>
          <button onClick={() => onAddItem(module.id, "document")} className="p-1.5 text-gray-500 hover:bg-emerald-100 hover:text-emerald-700 rounded" title="Add Document"><FileText size={16} /></button>
          <button onClick={() => onAddItem(module.id, "live")} className="p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-700 rounded" title="Add Live Session"><PlaySquare size={16} /></button>
          <button onClick={() => onAddItem(module.id, "assignment")} className="p-1.5 text-gray-500 hover:bg-orange-100 hover:text-orange-700 rounded" title="Add Assignment"><FileCheck size={16} /></button>
          <button onClick={() => onDelete(module.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded ml-2">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Children & Items */}
      {isExpanded && (
        <div className="mt-3 ml-6 border-l-2 border-gray-100 pl-4">
          
          {/* Sub Modules Sortable Context */}
          {childModuleIds.length > 0 && (
            <SortableContext items={childModuleIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {module.children?.map(child => (
                  <ModuleNode 
                    key={child.id} 
                    module={child} 
                    onAddSubModule={onAddSubModule}
                    onAddItem={onAddItem}
                    onRename={onRename}
                    onDelete={onDelete}
                    onDeleteItem={onDeleteItem}
                    onEditItem={onEditItem}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {/* Items Sortable Context */}
          {itemIds.length > 0 && (
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <div className="mt-3">
                {module.items.map(item => (
                  <SortableItem key={item.id} item={item} onDelete={onDeleteItem} onClick={() => onEditItem(item)} />
                ))}
              </div>
            </SortableContext>
          )}

        </div>
      )}
    </div>
  );
};

export default function CurriculumBuilder({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [modulesMap, setModulesMap] = useState<Map<string, CourseModule>>(new Map());
  const [rootModules, setRootModules] = useState<CourseModule[]>([]);

  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [activeModuleForAdd, setActiveModuleForAdd] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"video" | "document" | "live" | "assignment" | "test">("video");
  const [newItemTitle, setNewItemTitle] = useState("");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  // Content Editor Drawer State
  const [editorItem, setEditorItem] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCurriculum = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await courseApi.fetchCourseById(courseId);
      const flatModules = res.data.modules || [];
      
      // Build Tree
      const map = new Map<string, CourseModule>();
      flatModules.forEach((m: any) => map.set(m.id, { ...m, children: [] }));
      
      const roots: CourseModule[] = [];
      flatModules.forEach((m: any) => {
        if (m.parentId) {
          const parent = map.get(m.parentId);
          if (parent) parent.children!.push(map.get(m.id)!);
          else roots.push(map.get(m.id)!); // Fallback if parent missing
        } else {
          roots.push(map.get(m.id)!);
        }
      });

      const sortRecursive = (nodes: CourseModule[]) => {
        nodes.sort((a, b) => a.orderIndex - b.orderIndex);
        nodes.forEach(n => {
          if (n.items) n.items.sort((a, b) => a.orderIndex - b.orderIndex);
          if (n.children) sortRecursive(n.children);
        });
      };
      
      sortRecursive(roots);
      setRootModules(roots);
      setModulesMap(map);
    } catch (e) {
      toast.error("Failed to load curriculum");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const handleAddModule = async (parentId: string | null = null) => {
    try {
      const parentName = parentId ? "Sub-section" : "Module";
      const toastId = toast.loading(`Adding ${parentName}...`);
      
      let newOrderIndex = 0;
      if (parentId) {
        const parent = modulesMap.get(parentId);
        if (parent && parent.children) newOrderIndex = parent.children.length;
      } else {
        newOrderIndex = rootModules.length;
      }

      await courseApi.createModule(courseId, { 
        title: `New ${parentName}`, 
        orderIndex: newOrderIndex,
        parentId: parentId || undefined
      });
      
      toast.success(`${parentName} added!`, { id: toastId });
      fetchCurriculum(true);
    } catch (e) {
      toast.error(`Failed to add module`);
    }
  };

  const handleRenameModule = async (id: string, newTitle: string) => {
    try {
      await courseApi.updateModule(courseId, id, { title: newTitle });
      fetchCurriculum(true);
      toast.success("Renamed!");
    } catch (e) {
      toast.error("Failed to rename");
    }
  };

  const handleDeleteModule = async (id: string) => {
    confirmAction(
      "Delete Section",
      "Are you sure? This will delete all sub-sections and items inside too. This action cannot be undone.",
      async () => {
        try {
          const toastId = toast.loading("Deleting section...");
          await courseApi.deleteModule(courseId, id);
          fetchCurriculum(true);
          toast.success("Deleted!", { id: toastId });
        } catch (e) {
          toast.error("Failed to delete");
        }
      }
    );
  };

  const handleAddItemModalOpen = (moduleId: string, type: any) => {
    setActiveModuleForAdd(moduleId);
    setItemType(type);
    setNewItemTitle("");
    setShowItemModal(true);
  };

  const handleAddItemSubmit = async () => {
    if (!newItemTitle.trim() || !activeModuleForAdd) return;
    try {
      const toastId = toast.loading("Adding item...");
      const targetModule = modulesMap.get(activeModuleForAdd);
      const newOrderIndex = targetModule?.items?.length || 0;

      await courseApi.createCurriculumItem(courseId, {
        moduleId: activeModuleForAdd,
        type: itemType,
        title: newItemTitle,
        orderIndex: newOrderIndex
      });

      toast.success("Item added!", { id: toastId });
      setShowItemModal(false);
      fetchCurriculum(true);
    } catch (e) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    confirmAction(
      "Delete Lesson",
      "Are you sure you want to delete this lesson? This action cannot be undone.",
      async () => {
        try {
          const toastId = toast.loading("Deleting lesson...");
          await courseApi.deleteCurriculumItem(itemId);
          fetchCurriculum(true);
          toast.success("Item deleted!", { id: toastId });
        } catch (e) {
          toast.error("Failed to delete item");
        }
      }
    );
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    let activeType: 'module' | 'item' | null = null;
    let activeModule: CourseModule | null = null;
    let parentModuleForItems: CourseModule | null = null;

    if (modulesMap.has(activeId)) {
      activeType = 'module';
      activeModule = modulesMap.get(activeId)!;
    } else {
      for (const [_, mod] of Array.from(modulesMap.entries())) {
        const it = mod.items?.find(i => i.id === activeId);
        if (it) {
          activeType = 'item';
          parentModuleForItems = mod;
          break;
        }
      }
    }

    if (!activeType) return;

    if (activeType === 'module') {
      const overModule = modulesMap.get(overId);
      if (!overModule) return;

      if (activeModule!.parentId !== overModule.parentId) {
        toast.error("You can only reorder sections within the same parent level.");
        return;
      }

      const siblings = activeModule!.parentId 
        ? modulesMap.get(activeModule!.parentId!)!.children! 
        : rootModules;
      
      const oldIndex = siblings.findIndex(m => m.id === activeId);
      const newIndex = siblings.findIndex(m => m.id === overId);
      
      const newArray = arrayMove(siblings, oldIndex, newIndex);
      
      if (activeModule!.parentId) {
        const p = modulesMap.get(activeModule!.parentId!);
        p!.children = newArray;
        setModulesMap(new Map(modulesMap));
      } else {
        setRootModules(newArray);
      }

      try {
        await Promise.all(newArray.map((m, index) => 
          courseApi.updateModule(courseId, m.id, { orderIndex: index })
        ));
      } catch (e) {
        toast.error("Failed to save new order");
        fetchCurriculum(true); 
      }

    } else if (activeType === 'item') {
      const overItem = parentModuleForItems!.items.find(i => i.id === overId);
      if (!overItem) {
        toast.error("You can only reorder items within the same sub-section.");
        return;
      }

      const items = parentModuleForItems!.items;
      const oldIndex = items.findIndex(i => i.id === activeId);
      const newIndex = items.findIndex(i => i.id === overId);
      const newItems = arrayMove(items, oldIndex, newIndex);

      parentModuleForItems!.items = newItems;
      setModulesMap(new Map(modulesMap));

      try {
        await courseApi.reorderCurriculumItems({
          items: newItems.map((it, idx) => ({ id: it.id, orderIndex: idx, moduleId: parentModuleForItems!.id }))
        });
      } catch (e) {
        toast.error("Failed to save new order");
        fetchCurriculum(true);
      }
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const rootModuleIds = rootModules.map(m => m.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Course Curriculum</h2>
          <p className="text-sm text-gray-500 mt-1">Create modules and nested sub-sections. Use drag handles to reorder within the same level.</p>
        </div>
        <button 
          onClick={() => handleAddModule(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm font-semibold"
        >
          <Plus size={18} /> Add Root Module
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rootModuleIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {rootModules.map(module => (
              <ModuleNode 
                key={module.id} 
                module={module}
                onAddSubModule={handleAddModule}
                onAddItem={handleAddItemModalOpen}
                onRename={handleRenameModule}
                onDelete={handleDeleteModule}
                onDeleteItem={handleDeleteItem}
                onEditItem={setEditorItem}
              />
            ))}
            {rootModules.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 font-medium">No modules yet. Click "+ Add Root Module" to start.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* ITEM ADDITION MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">Add {itemType} Lesson</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" 
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder={`e.g. Introduction to ${itemType}...`} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddItemSubmit()}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-lg border border-gray-200 transition">Cancel</button>
              <button onClick={handleAddItemSubmit} disabled={!newItemTitle.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg disabled:opacity-50 transition">Add Lesson</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h2>
            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                className="px-4 py-2 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-lg border border-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  confirmModal.onConfirm();
                }} 
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 rounded-lg transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Editor Drawer */}
      <ContentEditorDrawer 
        item={editorItem}
        isOpen={!!editorItem}
        onClose={() => setEditorItem(null)}
        onSave={async (id, data) => {
          await courseApi.updateCurriculumItem(id, data);
          await fetchCurriculum(true); // refresh the UI silently so "Content Added" pill shows up without unmounting
        }}
      />
    </div>
  );
}
