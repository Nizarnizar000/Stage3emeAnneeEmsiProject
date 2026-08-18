import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "./CalendrierParticipant.css";
import "./AdminCrud.css";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 5;

function CalendrierParticipant() {
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [showPopup, setShowPopup] = useState(false);
  const [popupReunion, setPopupReunion] = useState(null);
  const [popupParticipants, setPopupParticipants] = useState([]);
  const [popupLoading, setPopupLoading] = useState(false);

  // "now" is initialized lazily (once, on mount) and only ever updated
  // from inside the setInterval callback — never synchronously in the
  // effect body — to avoid cascading renders.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api
      .get("/reunions/public")
      .then((res) => {
        const sorted = [...res.data].sort((a, b) =>
          (a.date + a.heureDeDebut).localeCompare(b.date + b.heureDeDebut)
        );
        setReunions(sorted);
      })
      .catch((err) => {
        console.error("Erreur calendrier:", err.response?.status, err.response?.data || err.message);
        setError("Impossible de charger le calendrier");
      })
      .finally(() => setLoading(false));
  }, []);

  // Vrai si la réunion est terminée par rapport à l'heure actuelle
  const isReunionEnded = (r) => {
    if (!r?.heureDeFin) return false;
    return new Date(r.heureDeFin).getTime() <= now;
  };

  const openParticipants = async (r) => {
    setPopupReunion(r);
    setShowPopup(true);
    setPopupLoading(true);
    try {
      const res = await api.get(`/reunions/public/${r.id}/participants`);
      setPopupParticipants(res.data);
    } catch (err) {
      console.error("Erreur participants:", err.response?.status, err.response?.data || err.message);
      setPopupParticipants([]);
    } finally {
      setPopupLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(reunions.length / PAGE_SIZE));
  const paginated = reunions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const popupEnded = isReunionEnded(popupReunion);

  return (
    <div className="calendrier-page">
      <div className="calendrier-card">
        <div className="calendrier-header">
          <div className="calendrier-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.7" />
              <path d="M3 9.5H21" stroke="white" strokeWidth="1.7" />
              <path d="M8 3V6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M16 3V6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>Calendrier des réunions</h1>
            <p className="subtitle">{reunions.length} réunion(s) programmée(s)</p>
          </div>
        </div>

        {loading && <p className="status-text">Chargement...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && reunions.length === 0 && (
          <p className="status-text">Aucune réunion prévue pour le moment.</p>
        )}

        {!loading && !error && reunions.length > 0 && (
          <>
            <ul className="reunion-list">
              {paginated.map((r) => {
                const ended = isReunionEnded(r);
                return (
                  <li key={r.id} className="reunion-item">
                    <div className="date-badge">
                      <span className="day">{new Date(r.date).getDate()}</span>
                      <span className="month">
                        {new Date(r.date).toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                    </div>

                    <div className="reunion-info">
                      <h3>
                        {r.titre}{" "}
                        {ended && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: "#eef0fb",
                              color: "#4f5fe8",
                              marginLeft: "6px",
                            }}
                          >
                            Terminée
                          </span>
                        )}
                      </h3>
                      <div className="reunion-meta">
                        <span>
                          🕒 {formatTime(r.heureDeDebut)} – {formatTime(r.heureDeFin)}
                        </span>
                        <span>📍 {r.salle?.localisation ?? "Salle non définie"}</span>
                      </div>
                    </div>

                    <button
                      className="participants-icon-btn"
                      title="Voir les participants"
                      onClick={() => openParticipants(r)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="8" r="3" stroke="#4f5fe8" strokeWidth="1.6" />
                        <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#4f5fe8" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="17" cy="8.5" r="2.4" stroke="#4f5fe8" strokeWidth="1.4" />
                        <path d="M15.5 19c0-2.3 1.7-4.2 4-4.6" stroke="#4f5fe8" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Participants — {popupReunion?.titre}</h2>
            {popupLoading ? (
              <p className="status-text">Chargement...</p>
            ) : popupParticipants.length === 0 ? (
              <p className="status-text">Aucun participant inscrit.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {popupParticipants.map((p) => (
                  <li key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{p.nom} {p.prenom}</span>
                    {popupEnded && (
                      <span
                        style={{
                          fontSize: "11.5px",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: p.presence ? "#e5f8ec" : "#fdeaea",
                          color: p.presence ? "#1f9d55" : "#d9534f",
                        }}
                      >
                        {p.presence ? "✅ Présent" : "❌ Absent"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowPopup(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const d = new Date(dateTimeString);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default CalendrierParticipant;