import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/farms', label: 'Farms', icon: '🏠' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/orders', label: 'Orders', icon: '📋' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-prairie-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-prairie-800 px-6">
        <span className="text-xl font-bold">PR Ag Supply</span>
      </div>
      <nav className="mt-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-prairie-700 text-white' : 'text-prairie-200 hover:bg-prairie-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}