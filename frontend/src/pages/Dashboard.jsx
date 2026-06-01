import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard().then(setData).catch(e => setError(e.message))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {!data ? (
        <p style={{ color: 'var(--text-tertiary)' }}>Loading&hellip;</p>
      ) : (
        <div className="stats">
          <div className="stat-card">
            <div className="stat-card-body">
              <h3>Products</h3>
              <div className="stat-value">{data.total_products}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-body">
              <h3>Customers</h3>
              <div className="stat-value">{data.total_customers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-body">
              <h3>Orders</h3>
              <div className="stat-value">{data.total_orders}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-body">
              <h3>Low Stock</h3>
              <div className="stat-value" style={{ color: data.low_stock_products > 0 ? 'var(--danger)' : undefined }}>
                {data.low_stock_products}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
