import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const navItems = [
  { to: "/admin", label: "Tableau de bord", end: true },
  { to: "/admin/reunions", label: "Réunions" },
  { to: "/admin/salles", label: "Salles" },
  { to: "/admin/participants", label: "Participants" },
  { to: "/admin/planification", label: "Planification" },
  ...(role === "ADMIN" ? [{ to: "/admin/responsables", label: "Responsables" }] : []),
];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.7" />
              <path d="M3 9.5H21" stroke="white" strokeWidth="1.7" />
              <path d="M8 3V6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M16 3V6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="8" cy="13.5" r="1.2" fill="white" />
              <circle cx="12" cy="13.5" r="1.2" fill="white" />
              <circle cx="16" cy="13.5" r="1.2" fill="white" />
            </svg>
          </div>
          <span>Espace admin</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}

export default AdminLayout;