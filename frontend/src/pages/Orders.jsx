import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: '' }] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = () => {
    api.orders.list().then(setOrders).catch(e => setError(e.message))
    api.products.list().then(setProducts).catch(() => {})
    api.customers.list().then(setCustomers).catch(() => {})
  }
  useEffect(() => { fetch() }, [])

  const add = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: '' }] })
  const remove = (i) => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })
  const upd = (i, f, v) => {
    const items = [...form.items]
    items[i][f] = v
    setForm({ ...form, items })
  }

  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.orders.create({
        customer_id: parseInt(form.customer_id),
        items: form.items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      })
      setSuccess('Order created')
      setShow(false)
      setForm({ customer_id: '', items: [{ product_id: '', quantity: '' }] })
      fetch()
    } catch (e) { setError(e.message) }
  }

  const del = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try { await api.orders.delete(id); setSuccess('Order cancelled'); fetch() }
    catch (e) { setError(e.message) }
  }

  return (
    <>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={() => setShow(true)}>New</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="table-inner">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state">No orders yet</div></td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>#{o.id}</td>
                    <td className="price-muted">{o.customer?.full_name || `ID: ${o.customer_id}`}</td>
                    <td>{o.items?.length || 0}</td>
                    <td className="price price-accent">${o.total_amount?.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={async () => {
                        try { setSelected(await api.orders.get(o.id)) }
                        catch (e) { setError(e.message) }
                      }}>View</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(o.id)}>Cancel</button>
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
            <h3>New Order</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Customer</label>
                <select required value={form.customer_id}
                  onChange={e => setForm({...form, customer_id: e.target.value})}>
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} &mdash; {c.email}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.01em', marginBottom: 12 }}>
                Items
              </div>

              {form.items.map((item, i) => (
                <div key={i} className="item-row">
                  <div className="form-group">
                    <label>Product</label>
                    <select required value={item.product_id}
                      onChange={e => upd(i, 'product_id', e.target.value)}>
                      <option value="">Select</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} &mdash; ${p.price.toFixed(2)} ({p.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Qty</label>
                    <input type="number" min="1" required value={item.quantity}
                      onChange={e => upd(i, 'quantity', e.target.value)} />
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger"
                      onClick={() => remove(i)}>&#10005;</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn" onClick={add}>+ Add item</button>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShow(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Order #{selected.id}</h3>

            <div className="order-detail-row">
              <strong>Customer</strong>
              <span>{selected.customer?.full_name}</span>
            </div>
            <div className="order-detail-row">
              <strong>Email</strong>
              <span>{selected.customer?.email}</span>
            </div>
            <div className="order-detail-row">
              <strong>Date</strong>
              <span>{new Date(selected.created_at).toLocaleString()}</span>
            </div>

            <hr />

            <table className="mini-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {selected.items?.map(it => (
                  <tr key={it.id}>
                    <td>{it.product?.name || `Product #${it.product_id}`}</td>
                    <td>{it.quantity}</td>
                    <td>${it.unit_price?.toFixed(2)}</td>
                    <td>${(it.quantity * it.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total-accent">
              Total: ${selected.total_amount?.toFixed(2)}
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
