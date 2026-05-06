import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <span className="site-brand">hkquantum-tools</span>
      <nav className="site-nav">
        <NavLink
          to="/myledger"
          className={({ isActive }) => `site-nav-link${isActive ? ' site-nav-link--active' : ''}`}
        >
          myLEDGER
        </NavLink>
      </nav>
    </header>
  );
}
