import { useEffect, useRef, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { formatPrice } from '../../utils/helpers'

const EMPTY_FORM = {
  name: '', description: '', category: 'photo-magnet', basePrice: '',
  requiresCustomImage: false, isFeatured: false, tags: '',
  variants: [{ size: '', price: '', mrp: '', inStock: true }],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]  = useState(null)
  const [form,      setForm]     = useState(EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [saving,    setSaving]   = useState(false)
  const fileRef = useRef()

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products?limit=100')
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setImagePreviews([])
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name:                product.name,
      description:         product.description,
      category:            product.category,
      basePrice:           product.basePrice,
      requiresCustomImage: product.requiresCustomImage,
      isFeatured:          product.isFeatured,
      tags:                product.tags?.join(', ') || '',
      variants:            product.variants?.length
        ? product.variants.map(v => ({ size: v.size, price: v.price, mrp: v.mrp || '', inStock: v.inStock }))
        : [{ size: '', price: '', mrp: '', inStock: true }],
    })
    setImageFiles([])
    setImagePreviews(product.images?.map(i => i.url) || [])
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleVariantChange = (index, field, value) => {
    setForm(f => {
      const variants = [...f.variants]
      variants[index] = { ...variants[index], [field]: value }
      return { ...f, variants }
    })
  }

  const addVariant    = () => setForm(f => ({ ...f, variants: [...f.variants, { size:'', price:'', mrp:'', inStock:true }] }))
  const removeVariant = (i) => setForm(f => ({ ...f, variants: f.variants.filter((_,idx) => idx !== i) }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.basePrice) {
      toast.error('Name, description and base price are required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name',                form.name)
      fd.append('description',         form.description)
      fd.append('category',            form.category)
      fd.append('basePrice',           form.basePrice)
      fd.append('requiresCustomImage', form.requiresCustomImage)
      fd.append('isFeatured',          form.isFeatured)
      fd.append('tags',                JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      fd.append('variants',            JSON.stringify(form.variants.map(v => ({
        ...v, price: Number(v.price), mrp: v.mrp ? Number(v.mrp) : undefined,
      }))))
      imageFiles.forEach(f => fd.append('images', f))

      if (editing) {
        await api.put(`/products/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated!')
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created!')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products yet. Add your first one!</td></tr>
                ) : products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-xl">🧲</div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-dark max-w-[200px]">
                      <p className="truncate">{p.name}</p>
                      {p.requiresCustomImage && <span className="text-xs text-brand-600">Custom image required</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{p.category.replace('-', ' ')}</td>
                    <td className="px-5 py-3 font-semibold text-dark">
                      {p.variants?.length > 1 ? `From ${formatPrice(p.basePrice)}` : formatPrice(p.basePrice)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-display text-xl font-semibold text-dark">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Product Images</label>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-brand-400 transition-colors text-gray-400 hover:text-brand-600">
                  <FiUpload size={20} />
                  <span className="text-sm">Click to upload images</span>
                  <span className="text-xs">Original quality preserved, max 20MB each</span>
                </button>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field" placeholder="e.g. Photo Magnet 2x2" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Description <span className="text-red-500">*</span></label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="input-field resize-none" placeholder="Product description…" />
              </div>

              {/* Category + Base Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field">
                    <option value="photo-magnet">Photo Magnet</option>
                    <option value="quote-magnet">Quote Magnet</option>
                    <option value="poster">Poster</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Base Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.basePrice} onChange={e => setForm(f => ({...f, basePrice: e.target.value}))} className="input-field" placeholder="320" />
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark">Size Variants</label>
                  <button type="button" onClick={addVariant} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                    <FiPlus size={12} /> Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {form.variants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="Size (e.g. 2x2)" value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)}
                        className="input-field text-sm flex-1" />
                      <input type="number" placeholder="Price ₹" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)}
                        className="input-field text-sm w-28" />
                      <input type="number" placeholder="MRP ₹" value={v.mrp} onChange={e => handleVariantChange(i, 'mrp', e.target.value)}
                        className="input-field text-sm w-28" />
                      {form.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 p-1">
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
                  className="input-field" placeholder="birthday, gift, custom" />
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                {[
                  { key: 'requiresCustomImage', label: 'Requires Custom Photo Upload' },
                  { key: 'isFeatured',          label: 'Show on Homepage' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))}
                      className="w-4 h-4 accent-brand-600" />
                    <span className="text-sm text-dark">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5 text-sm">
                {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
