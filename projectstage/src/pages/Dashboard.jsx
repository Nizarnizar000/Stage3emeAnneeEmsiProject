import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import "./Dashboard.css";

function Dashboard() {
  const [counts, setCounts] = useState({ reunions: null, salles: null, responsables: null, participants: null });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/reunions"),
      api.get("/salles"),
      api.get("/responsables"),
      api.get("/participants"),
    ])
      .then(([reunionsRes, sallesRes, responsablesRes, participantsRes]) => {
        setCounts({
          reunions: reunionsRes.data.length,
          salles: sallesRes.data.length,
          responsables: responsablesRes.data.length,
          participants: participantsRes.data.length,
        });
      })
      .catch(() => setError("Erreur lors du chargement des statistiques"));
  }, []);

  const cards = [
    {
      key: "reunions",
      label: "Réunions",
      value: counts.reunions,
      to: "/admin/reunions",
      accent: "#4f5fe8",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 3V6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 3V6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "salles",
      label: "Salles",
      value: counts.salles,
      to: "/admin/salles",
      accent: "#0fae7c",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 7.5H9.5M14.5 7.5H16M8 11.5H9.5M14.5 11.5H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "responsables",
      label: "Responsables",
      value: counts.responsables,
      to: "/admin/responsables",
      accent: "#e8590c",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4.5 20C5.5 16.5 8.4 14.5 12 14.5C15.6 14.5 18.5 16.5 19.5 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "participants",
      label: "Participants",
      value: counts.participants,
      to: "/admin/participants",
      accent: "#9c36b5",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 20C3.8 16.8 6.1 15 9 15C11.9 15 14.2 16.8 15 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M15.5 15.3C17.7 15.3 19.5 16.8 20.2 19.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de votre espace de gestion</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="stats-grid">
          {cards.map((c) => (
            <Link to={c.to} key={c.key} className="stat-card" style={{ "--accent": c.accent }}>
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{c.value ?? "…"}</span>
                <span className="stat-label">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;