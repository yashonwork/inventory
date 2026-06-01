import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <NavLink to="/" className="navbar-brand">Inventory</NavLink>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <nav>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/customers">Customers</NavLink>
            <NavLink to="/orders">Orders</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
