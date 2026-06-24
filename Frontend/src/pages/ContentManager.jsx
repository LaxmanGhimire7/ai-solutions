import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit3, FileText, Image, ImagePlus, LayoutGrid, Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  contentLabels,
  createContent,
  deleteContent,
  getAdminContent,
  updateContent,
} from '@/api/content';
import { uploadImage } from '@/api/uploads';

const contentTypes = ['articles', 'events', 'services', 'projects', 'testimonials', 'gallery'];

const fieldConfig = {
  articles: [
    { name: 'title', label: 'Title', required: true },
    { name: 'summary', label: 'Summary', required: true },
    { name: 'content', label: 'Content', type: 'textarea', required: true },
    { name: 'coverImage', label: 'Cover Image', type: 'image' },
    { name: 'tags', label: 'Tags', helper: 'Comma separated' },
  ],
  events: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
    { name: 'location', label: 'Location' },
    { name: 'type', label: 'Type', type: 'select', options: ['upcoming', 'past', 'online', 'in-person'] },
    { name: 'coverImage', label: 'Cover Image', type: 'image' },
    { name: 'registrationUrl', label: 'Registration URL' },
  ],
  services: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'icon', label: 'Icon Label' },
    { name: 'imageUrl', label: 'Service Image', type: 'image' },
    { name: 'order', label: 'Display Order', type: 'number' },
  ],
  projects: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'clientName', label: 'Client Name' },
    { name: 'industry', label: 'Industry' },
    { name: 'imageUrl', label: 'Project Image', type: 'image' },
    { name: 'technologies', label: 'Technologies', helper: 'Comma separated' },
    { name: 'outcome', label: 'Outcome', type: 'textarea' },
  ],
  testimonials: [
    { name: 'authorName', label: 'Author Name', required: true },
    { name: 'authorTitle', label: 'Author Title' },
    { name: 'authorCompany', label: 'Author Company' },
    { name: 'quote', label: 'Quote', type: 'textarea', required: true },
    { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5 },
    { name: 'authorAvatar', label: 'Avatar Image', type: 'image' },
    { name: 'order', label: 'Display Order', type: 'number' },
  ],
  gallery: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description' },
    { name: 'imageUrl', label: 'Gallery Image', type: 'image', required: true },
    { name: 'category', label: 'Category' },
    { name: 'order', label: 'Display Order', type: 'number' },
  ],
};

const defaultValues = {
  published: true,
};

const normalizeFormData = (type, values) => {
  const normalized = { ...values };

  if (type === 'articles' && typeof normalized.tags === 'string') {
    normalized.tags = normalized.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (type === 'projects' && typeof normalized.technologies === 'string') {
    normalized.technologies = normalized.technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  ['order', 'rating'].forEach((key) => {
    if (normalized[key] !== undefined && normalized[key] !== '') {
      normalized[key] = Number(normalized[key]);
    }
  });

  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === '') delete normalized[key];
  });

  return normalized;
};

const toFormValues = (type, item) => {
  const values = { ...item };

  if (type === 'articles' && Array.isArray(values.tags)) {
    values.tags = values.tags.join(', ');
  }

  if (type === 'projects' && Array.isArray(values.technologies)) {
    values.technologies = values.technologies.join(', ');
  }

  if (type === 'events' && values.eventDate) {
    values.eventDate = new Date(values.eventDate).toISOString().slice(0, 10);
  }

  return values;
};

const ContentManager = () => {
  const [activeType, setActiveType] = useState('articles');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const fields = useMemo(() => fieldConfig[activeType], [activeType]);
  const pendingReviewCount = useMemo(
    () =>
      activeType === 'testimonials'
        ? items.filter((item) => item.submissionSource === 'customer' && !item.published).length
        : 0,
    [activeType, items]
  );

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAdminContent(activeType, {
        search,
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        order: 'desc',
      });
      setItems(response.data || []);
    } catch (error) {
      toast.error(error.message || `Unable to load ${contentLabels[activeType]}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeType, search]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const openCreateModal = () => {
    setEditingItem(null);
    reset(defaultValues);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset(toFormValues(activeType, item));
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    setIsSaving(true);

    try {
      const payload = normalizeFormData(activeType, values);

      if (editingItem) {
        await updateContent(activeType, editingItem._id, payload);
        toast.success(`${contentLabels[activeType]} updated`);
      } else {
        await createContent(activeType, payload);
        toast.success(`${contentLabels[activeType]} created`);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      reset(defaultValues);
      loadContent();
    } catch (error) {
      toast.error(error.message || 'Unable to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete "${item.title || item.authorName}"?`);
    if (!confirmed) return;

    try {
      await deleteContent(activeType, item._id);
      toast.success('Content deleted');
      loadContent();
    } catch (error) {
      toast.error(error.message || 'Unable to delete content');
    }
  };

  const togglePublished = async (item) => {
    try {
      await updateContent(activeType, item._id, { published: !item.published });
      toast.success(item.published ? 'Unpublished' : 'Published');
      loadContent();
    } catch (error) {
      toast.error(error.message || 'Unable to update publish status');
    }
  };

  const handleImageSelect = async (fieldName, file) => {
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const response = await uploadImage(file);
      setValue(fieldName, response.data.imageUrl, { shouldDirty: true, shouldValidate: true });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.message || 'Unable to upload image');
    } finally {
      setUploadingField(null);
    }
  };

  const renderField = (field) => {
    const validation = field.required ? { required: `${field.label} is required` } : {};
    const error = errors[field.name]?.message;

    if (field.type === 'image') {
      const imageValue = watch(field.name);

      return (
        <div key={field.name} className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor={field.name}>{field.label}</label>
            {imageValue && (
              <button
                type="button"
                onClick={() => setValue(field.name, '', { shouldDirty: true })}
                className="text-xs font-medium text-slate-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
          <input type="hidden" {...register(field.name, validation)} />
          <label
            htmlFor={`${field.name}-file`}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 ${
              error ? 'border-red-300' : ''
            }`}
          >
            {imageValue ? (
              <img src={imageValue} alt={field.label} className="h-44 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-36 w-full flex-col items-center justify-center rounded-xl bg-white">
                <ImagePlus className="h-8 w-8 text-indigo-500" aria-hidden="true" />
                <span className="mt-3 text-sm font-medium text-slate-700">Choose photo from your computer</span>
                <span className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, or GIF up to 2MB</span>
              </div>
            )}
            <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {uploadingField === field.name ? 'Uploading...' : imageValue ? 'Change Photo' : 'Select Photo'}
            </span>
          </label>
          <input
            id={`${field.name}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => handleImageSelect(field.name, event.target.files?.[0])}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={field.name}>{field.label}</label>
          <textarea
            id={field.name}
            rows="4"
            className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${error ? 'border-red-300' : ''}`}
            {...register(field.name, validation)}
          />
          {field.helper && <p className="text-xs text-slate-400">{field.helper}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor={field.name}>{field.label}</label>
          <select
            id={field.name}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            {...register(field.name, validation)}
          >
            {field.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor={field.name}>{field.label}</label>
        <input
          id={field.name}
          type={field.type || 'text'}
          min={field.min}
          max={field.max}
          className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${error ? 'border-red-300' : ''}`}
          {...register(field.name, validation)}
        />
        {field.helper && <p className="text-xs text-slate-400">{field.helper}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-64 rounded-2xl border border-indigo-100 bg-indigo-50" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <LayoutGrid className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-indigo-600">Publishing workspace</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Content Manager</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Create and manage services, projects, testimonials, articles, events, and gallery items.
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add {contentLabels[activeType]}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          {contentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                activeType === type ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {contentLabels[type]}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{contentLabels[activeType]}</h2>
              <p className="mt-1 text-sm text-slate-500">{items.length} loaded records</p>
              {activeType === 'testimonials' && pendingReviewCount > 0 && (
                <p className="mt-2 text-xs font-semibold text-indigo-600">
                  {pendingReviewCount} customer review{pendingReviewCount === 1 ? '' : 's'} awaiting approval
                </p>
              )}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search content"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Search content"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Type Detail</th>
                  <th className="px-5 py-3 font-medium">Published</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl || item.coverImage || item.authorAvatar ? (
                          <img
                            src={item.imageUrl || item.coverImage || item.authorAvatar}
                            alt={item.title || item.authorName}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            {activeType === 'gallery' ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{item.title || item.authorName}</div>
                          <div className="mt-1 max-w-md truncate text-xs text-slate-400">
                            {item.summary || item.description || item.quote || item.content || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.industry || item.category || item.type || item.authorCompany || item.clientName || 'General'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => togglePublished(item)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.published
                          ? 'Published'
                          : activeType === 'testimonials' && item.submissionSource === 'customer'
                            ? 'Pending Review'
                            : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          aria-label="Edit content"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          aria-label="Delete content"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && items.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No {contentLabels[activeType].toLowerCase()} found.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Add'} ${contentLabels[activeType]}`}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          {fields.map(renderField)}
          <label className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('published')}
            />
            Published
          </label>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContentManager;
