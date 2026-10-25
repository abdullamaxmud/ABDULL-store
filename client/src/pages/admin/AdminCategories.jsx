import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/common/Modal';

const emptyForm = {
  name: '',
  description: '',
  image: '',
  isActive: true,
  showInMenu: true,
  translations: { so: { name: '', description: '' }, ar: { name: '', description: '' } },
};

const toForm = (cat) => ({
  name: cat.name || '',
  description: cat.description || '',
  image: cat.image || '',
  isActive: cat.isActive !== false,
  showInMenu: cat.showInMenu !== false,
  translations: {
    so: { name: cat.translations?.so?.name || '', description: cat.translations?.so?.description || '' },
    ar: { name: cat.translations?.ar?.name || '', description: cat.translations?.ar?.description || '' },
  },
});

/** Shared create/edit form body. */
const CategoryFields = ({ form, setForm }) => {
  const setT = (lang, field, value) =>
    setForm({ ...form, translations: { ...form.translations, [lang]: { ...form.translations[lang], [field]: value } } });

  return (
    <>
      <div className="input-group">
        <label className="input-label" htmlFor="cat-name">Name (English) *</label>
        <input id="cat-name" required maxLength={50} className="input-field" placeholder="e.g. Smart Home" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="input-group">
        <label className="input-label" htmlFor="cat-desc">Description (English)</label>
        <textarea id="cat-desc" rows="2" maxLength={250} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="input-group">
        <label className="input-label" htmlFor="cat-img">Image address</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input id="cat-img" type="url" className="input-field" placeholder="https://images.unsplash.com/..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          {form.image && <img src={form.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
        </div>
      </div>

      <details style={{ marginBottom: 14 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}>Somali & Arabic names (optional)</summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 10 }}>
          <div className="input-group">
            <label className="input-label">Soomaali — name</label>
            <input className="input-field" maxLength={60} value={form.translations.so.name} onChange={(e) => setT('so', 'name', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">العربية — الاسم</label>
            <input className="input-field" dir="rtl" maxLength={60} value={form.translations.ar.name} onChange={(e) => setT('ar', 'name', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Soomaali — description</label>
            <input className="input-field" maxLength={250} value={form.translations.so.description} onChange={(e) => setT('so', 'description', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">العربية — الوصف</label>
            <input className="input-field" dir="rtl" maxLength={250} value={form.translations.ar.description} onChange={(e) => setT('ar', 'description', e.target.value)} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Left empty, the built-in translation (or the English name) is used.</p>
      </details>

      <label className="toggle-row">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        Visible in the store
      </label>
      <label className="toggle-row">
        <input type="checkbox" checked={form.showInMenu} onChange={(e) => setForm({ ...form, showInMenu: e.target.checked })} />
        Show in the header menu
      </label>
    </>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // category being edited
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(null); // category pending delete
  const [moveTo, setMoveTo] = useState('');
  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllAdmin();
      if (res.success) setCategories(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await categoryService.createCategory(createForm);
      if (res.success) {
        showToast(`Category "${res.data.name}" created`, 'success');
        setCreateForm(emptyForm);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setEditForm(toForm(cat));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await categoryService.updateCategory(editing._id, editForm);
      if (res.success) {
        showToast('Category saved', 'success');
        setEditing(null);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const quickToggle = async (cat, field) => {
    try {
      const res = await categoryService.updateCategory(cat._id, { [field]: !(cat[field] !== false) });
      if (res.success) setCategories((list) => list.map((c) => (c._id === cat._id ? { ...c, ...res.data } : c)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const moveCategory = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await categoryService.reorder(next.map((c) => c._id));
    } catch (err) {
      showToast(err.message, 'error');
      fetchCategories();
    }
  };

  const openDelete = (cat) => {
    setDeleting(cat);
    setMoveTo(categories.find((c) => c._id !== cat._id)?._id || '');
  };

  const confirmDelete = async () => {
    try {
      const res = await categoryService.deleteCategory(deleting._id, deleting.productCount > 0 ? moveTo : undefined);
      if (res.success) {
        showToast(res.message, 'info');
        setDeleting(null);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout title="Categories & Menu">
      <div className="admin-two-col">
        {/* Create Category Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Add New Category</h3>
          <form onSubmit={handleCreate}>
            <CategoryFields form={createForm} setForm={setCreateForm} />
            <button type="submit" disabled={creating} className="btn btn-primary" style={{ width: '100%' }}>
              {creating ? 'Creating…' : '+ Save Category'}
            </button>
          </form>
        </div>

        {/* Categories list */}
        <div className="card" style={{ padding: '24px', minWidth: 0 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px' }}>All Categories ({categories.length})</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            The order here is the order in the header menu and on the homepage. Use ↑ ↓ to rearrange. Header menu links are edited in{' '}
            <Link to="/admin/settings" style={{ color: 'var(--accent)', fontWeight: 700 }}>Site Settings</Link>.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Products</th>
                  <th>In store</th>
                  <th>In menu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading categories...</td>
                  </tr>
                ) : (
                  categories.map((cat, i) => (
                    <tr key={cat._id} style={{ opacity: cat.isActive === false ? 0.55 : 1 }}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-outline btn-xs" disabled={i === 0} onClick={() => moveCategory(i, -1)} aria-label={`Move ${cat.name} up`}>↑</button>{' '}
                        <button className="btn btn-outline btn-xs" disabled={i === categories.length - 1} onClick={() => moveCategory(i, 1)} aria-label={`Move ${cat.name} down`}>↓</button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={cat.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 800 }}>{cat.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              /{cat.slug}
                              {(cat.translations?.so?.name || cat.translations?.ar?.name) && ' · translated'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link to={`/shop?category=${cat.slug}`} target="_blank" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                          {cat.productCount}
                        </Link>
                      </td>
                      <td>
                        <button className={`badge ${cat.isActive !== false ? 'badge-success' : 'badge-warning'}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => quickToggle(cat, 'isActive')} title="Click to switch">
                          {cat.isActive !== false ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <button className={`badge ${cat.showInMenu !== false ? 'badge-accent' : 'badge-primary'}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => quickToggle(cat, 'showInMenu')} title="Click to switch">
                          {cat.showInMenu !== false ? 'Shown' : 'Not shown'}
                        </button>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button onClick={() => openEdit(cat)} className="btn btn-outline btn-xs" style={{ marginInlineEnd: 6 }}>Edit</button>
                        <button onClick={() => openDelete(cat)} className="btn btn-danger btn-xs">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit "${editing.name}"` : ''} maxWidth="640px">
        <form onSubmit={handleSaveEdit}>
          <CategoryFields form={editForm} setForm={setEditForm} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation (with product move) */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title={deleting ? `Delete "${deleting.name}"?` : ''}>
        {deleting && (
          <div>
            {deleting.productCount > 0 ? (
              <>
                <p style={{ marginBottom: 12 }}>
                  This category has <strong>{deleting.productCount} product(s)</strong>. Choose where to move them:
                </p>
                <select className="input-field" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} style={{ marginBottom: 16 }}>
                  {categories
                    .filter((c) => c._id !== deleting._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
              </>
            ) : (
              <p style={{ marginBottom: 16 }}>No products use this category. This can't be undone.</p>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Tip: to take it off the store temporarily, set it to <strong>Hidden</strong> instead.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeleting(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" disabled={deleting.productCount > 0 && !moveTo} onClick={confirmDelete}>
                {deleting.productCount > 0 ? 'Move products & delete' : 'Delete category'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminCategories;
