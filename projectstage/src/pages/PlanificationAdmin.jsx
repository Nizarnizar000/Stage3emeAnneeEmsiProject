import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import "./AdminCrud.css";

const PAGE_SIZE = 5;

function PlanificationAdmin() {
  const [reunions, setReunions] = useState([]);
  const [salles, setSalles] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Heure "actuelle" -> se met à jour toutes les 30s pour faire apparaître
  // le bouton "Présence" dès que la réunion se termine, sans reload.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Modal salle
  const [showSalleModal, setShowSalleModal] = useState(false);
  const [salleReunion, setSalleReunion] = useState(null);
  const [selectedSalle, setSelectedSalle] = useState("");

  // Popup participants (ajouter / retirer ceux qui viennent — pas de statut ici)
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
  const [participantsReunion, setParticipantsReunion] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [linkedIds, setLinkedIds] = useState([]);
  const [loadingPopup, setLoadingPopup] = useState(false);

  // Popup présence (3e bouton, visible seulement après la fin de la réunion)
  const [showPresencePopup, setShowPresencePopup] = useState(false);
  const [presenceReunion, setPresenceReunion] = useState(null);
  const [presenceParticipants, setPresenceParticipants] = useState([]);
  const [loadingPresence, setLoadingPresence] = useState(false);

  const loadAll = () => {
    api.get("/reunions").then((res) => {
      setReunions(res.data);
      setPage(1);
    }).catch(() => setError("Erreur de chargement"));
    api.get("/salles").then((res) => setSalles(res.data)).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  // Vrai si la réunion est terminée par rapport à l'heure actuelle
  const isReunionEnded = (r) => {
    if (!r?.heureDeFin) return false;
    return new Date(r.heureDeFin).getTime() <= now;
  };

  // ---- Salle ----

  const openSalleModal = (r) => {
    setSalleReunion(r);
    setSelectedSalle(r.salle?.id ?? "");
    setShowSalleModal(true);
  };

  const saveSalle = async () => {
    setError("");
    try {
      await api.put(`/reunions/${salleReunion.id}/salle`, {
        salleId: selectedSalle ? Number(selectedSalle) : null,
      });
      setShowSalleModal(false);
      loadAll();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la salle : " + (err.response?.status ?? err.message));
    }
  };

  // ---- Participants (ceux qui viennent — ajout / retrait uniquement) ----

  const openParticipantsPopup = async (r) => {
    setParticipantsReunion(r);
    setShowParticipantsPopup(true);
    setLoadingPopup(true);
    setError("");
    try {
      const [allRes, linkedRes] = await Promise.all([
        api.get("/participants"),
        api.get(`/reunions/${r.id}/participants`),
      ]);
      setAllParticipants(allRes.data);
      setLinkedIds(linkedRes.data.map((p) => p.id));
    } catch (err) {
      setError("Erreur de chargement des participants : " + (err.response?.status ?? err.message));
    } finally {
      setLoadingPopup(false);
    }
  };

  const toggleParticipant = async (participantId, checked) => {
    setError("");
    try {
      if (checked) {
        await api.post(`/reunions/${participantsReunion.id}/participants/${participantId}`);
        setLinkedIds((prev) => [...prev, participantId]);
      } else {
        await api.delete(`/reunions/${participantsReunion.id}/participants/${participantId}`);
        setLinkedIds((prev) => prev.filter((id) => id !== participantId));
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour des participants : " + (err.response?.status ?? err.message));
    }
  };

  // ---- Présence (3e bouton, visible seulement après la fin de la réunion) ----

  const openPresencePopup = async (r) => {
    setPresenceReunion(r);
    setShowPresencePopup(true);
    setLoadingPresence(true);
    setError("");
    try {
      const res = await api.get(`/reunions/${r.id}/participants`);
      setPresenceParticipants(res.data);
    } catch (err) {
      setError("Erreur de chargement des participants : " + (err.response?.status ?? err.message));
    } finally {
      setLoadingPresence(false);
    }
  };

  const togglePresence = async (participantId, presence) => {
    setError("");
    try {
      await api.put(`/reunions/${presenceReunion.id}/participants/${participantId}/presence`, { presence });
      setPresenceParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, presence } : p))
      );
    } catch (err) {
      setError("Erreur lors de la mise à jour de la présence : " + (err.response?.status ?? err.message));
    }
  };

  // ---- Supprimer la planification ----

  const deletePlanification = async (r) => {
    if (!window.confirm(`Supprimer la planification de "${r.titre}" (salle + participants) ?`)) return;
    setError("");
    try {
      await api.delete(`/reunions/${r.id}/planification`);
      loadAll();
    } catch (err) {
      setError("Erreur lors de la suppression : " + (err.response?.status ?? err.message));
    }
  };

  const totalPages = Math.max(1, Math.ceil(reunions.length / PAGE_SIZE));
  const paginated = reunions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-top">
          <h1>Planification</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {reunions.length === 0 ? (
          <p className="status-text">Aucune réunion trouvée.</p>
        ) : (
          <>
            <table className="crud-table">
              <thead>
                <tr><th>Titre</th><th>Date</th><th>Début</th><th>Fin</th><th>Salle</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((r) => {
                  const ended = isReunionEnded(r);
                  return (
                    <tr key={r.id}>
                      <td>{r.titre}</td>
                      <td>{r.date}</td>
                      <td>{r.heureDeDebut?.slice(11, 16) ?? "-"}</td>
                      <td>{r.heureDeFin?.slice(11, 16) ?? "-"}</td>
                      <td>{r.salle?.localisation ?? "Non définie"}</td>
                      <td className="row-actions">
                        <button className="btn-edit" onClick={() => openSalleModal(r)}>🏢 Salle</button>
                        <button className="btn-edit" onClick={() => openParticipantsPopup(r)} title="Choisir les participants qui viendront">
                          👥
                        </button>
                        {ended && (
                          <button className="btn-edit" onClick={() => openPresencePopup(r)} title="Marquer la présence">
                            🕘 Présence
                          </button>
                        )}
                        <button className="btn-delete" onClick={() => deletePlanification(r)}>🗑️ Supprimer</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Modal Salle */}
      {showSalleModal && (
        <div className="modal-overlay" onClick={() => setShowSalleModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Salle — {salleReunion?.titre}</h2>
            <div className="modal-field">
              <label>Salle</label>
              <select value={selectedSalle} onChange={(e) => setSelectedSalle(e.target.value)}>
                <option value="">-- Choisir une salle --</option>
                {salles.map((s) => (
                  <option key={s.id} value={s.id}>{s.localisation}</option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowSalleModal(false)}>Annuler</button>
              <button type="button" className="btn-primary" onClick={saveSalle}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Participants qui viendront — ajout / retrait uniquement */}
      {showParticipantsPopup && (
        <div className="modal-overlay" onClick={() => setShowParticipantsPopup(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Participants — {participantsReunion?.titre}</h2>

            {loadingPopup ? (
              <p className="status-text">Chargement...</p>
            ) : allParticipants.length === 0 ? (
              <p className="status-text">Aucun participant enregistré.</p>
            ) : (
              <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {allParticipants.map((p) => {
                  const isLinked = linkedIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "6px 0",
                        borderBottom: "1px solid #f0f1f6",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={(e) => toggleParticipant(p.id, e.target.checked)}
                      />
                      {p.nom} {p.prenom} ({p.cin})
                    </label>
                  );
                })}
              </div>
            )}

            <div className="modal-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowParticipantsPopup(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Présence — 3e bouton, seulement visible après la fin de la réunion */}
      {showPresencePopup && (
        <div className="modal-overlay" onClick={() => setShowPresencePopup(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Présence — {presenceReunion?.titre}</h2>

            {loadingPresence ? (
              <p className="status-text">Chargement...</p>
            ) : presenceParticipants.length === 0 ? (
              <p className="status-text">Aucun participant lié à cette réunion.</p>
            ) : (
              <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {presenceParticipants.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "6px 0",
                      borderBottom: "1px solid #f0f1f6",
                    }}
                  >
                    <span>{p.nom} {p.prenom} ({p.cin})</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "11.5px",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: p.presence ? "#e5f8ec" : "#fdeaea",
                          color: p.presence ? "#1f9d55" : "#d9534f",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.presence ? "Présent" : "Non marqué"}
                      </span>
                      <button
                        type="button"
                        className="btn-edit"
                        style={{ padding: "3px 10px", fontSize: "12px" }}
                        onClick={() => togglePresence(p.id, !p.presence)}
                      >
                        {p.presence ? "Marquer absent" : "Marquer présent"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowPresencePopup(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanificationAdmin;