import { useState, useEffect } from 'react'
import { api } from '../services/api'

const empty = { full_name: '', email: '', phone: '' }

function avatar(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = () => api.customers.list().then(setCustomers).catch(e => setError(e.message))
  useEffect(() => { fetch() }, [])

  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.customers.create(form)
      setSuccess('Customer created')
      setShow(false); setForm(empty); fetch()
    } catch (e) { setError(e.message) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this customer?')) return
    try { await api.customers.delete(id); setSuccess('Customer deleted'); fetch() }
    catch (e) { setError(e.message) }
  }

  return (
    <>
      <div className="page-header">
        <h2>Customers</h2>
        <button className="btn btn-primary" onClick={() => setShow(true)}>New</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="table-inner">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr><td colSpan={4}><div className="empty-state">No customers yet</div></td></tr>
                )}
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="flex" style={{ display: 'inline-flex' }}>
                        <span className="avatar">{avatar(c.full_name)}</span>
                        <span style={{ fontWeight: 500 }}>{c.full_name}</span>
                      </span>
                    </td>
                    <td className="price-muted">{c.email}</td>
                    <td className="price-muted">{c.phone}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => del(c.id)}>Delete</button>
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
            <h3>New Customer</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Full Name</label>
                <input required value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShow(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
