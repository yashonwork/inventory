import { useState, useEffect } from 'react'
import { api } from '../services/api'

const empty = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = () => api.products.list().then(setProducts).catch(e => setError(e.message))
  useEffect(() => { fetch() }, [])

  const reset = () => { setForm(empty); setEdit(null); setError('') }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    const p = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
    try {
      if (edit) {
        await api.products.update(edit, p)
        setSuccess('Product updated')
      } else {
        await api.products.create(p)
        setSuccess('Product created')
      }
      setShow(false); reset(); fetch()
    } catch (e) { setError(e.message) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await api.products.delete(id); setSuccess('Product deleted'); fetch() }
    catch (e) { setError(e.message) }
  }

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => { reset(); setShow(true) }}>New</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="table-inner">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state">No products yet</div></td></tr>
                )}
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="price-muted">{p.sku}</td>
                    <td className="price price-accent">${p.price.toFixed(2)}</td>
                    <td>
                      <span className="stock-badge">
                        <span className={`stock-dot ${p.quantity < 5 ? 'low' : 'ok'}`} />
                        {p.quantity}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => {
                        setEdit(p.id)
                        setForm({
                          name: p.name, sku: p.sku,
                          price: String(p.price), quantity: String(p.quantity),
                        })
                        setShow(true)
                      }}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{edit ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" min="0" required value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="0" required value={form.quantity}
                    onChange={e => setForm({...form, quantity: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShow(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{edit ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
