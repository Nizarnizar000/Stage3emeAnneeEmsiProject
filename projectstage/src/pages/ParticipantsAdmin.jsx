import { useEffect, useState, useRef } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import "./AdminCrud.css";

const PAGE_SIZE = 5;

function ParticipantsAdmin() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", cin: "" });
  const [page, setPage] = useState(1);
  const requestId = useRef(0);

  const loadAll = () => {
    const id = ++requestId.current;
    api.get("/participants").then((res) => {
      if (id !== requestId.current) return;
      setParticipants(res.data);
      setPage(1);
    }).catch(() => { if (id === requestId.current) setError("Erreur de chargement"); });
  };

  useEffect(() => { loadAll(); }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    if (value.trim() === "") { loadAll(); return; }
    const id = ++requestId.current;
    try {
      const res = await api.get("/participants/search", { params: { cin: value } });
      if (id !== requestId.current) return;
      setParticipants(res.data);
    } catch {
      if (id === requestId.current) setError("Erreur de recherche");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: "", prenom: "", cin: "" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, prenom: p.prenom, cin: p.cin });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/participants/${editing.id}`, { ...form, presence: editing.presence });
      } else {
        await api.post("/participants", { ...form, presence: false });
      }
      setShowModal(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce participant ?")) return;
    try {
      await api.delete(`/participants/${id}`);
      loadAll();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.max(1, Math.ceil(participants.length / PAGE_SIZE));
  const paginated = participants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-top">
          <h1>Participants</h1>
          <div className="crud-actions">
            <input className="search-input" placeholder="Rechercher par CIN..." value={search} onChange={handleSearch} />
            <button className="btn-primary" onClick={openCreate}>+ Nouveau</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {participants.length === 0 ? (
          <p className="status-text">Aucun participant trouvé.</p>
        ) : (
          <>
            <table className="crud-table">
              <thead>
                <tr><th>Nom</th><th>Prénom</th><th>CIN</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nom}</td>
                    <td>{p.prenom}</td>
                    <td>{p.cin}</td>
                    <td className="row-actions">
                      <button className="btn-edit" onClick={() => openEdit(p)}>Modifier</button>
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Modifier le participant" : "Nouveau participant"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label>Nom</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              </div>
              <div className="modal-field">
                <label>Prénom</label>
                <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
              </div>
              <div className="modal-field">
                <label>CIN</label>
                <input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} required />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary">{editing ? "Enregistrer" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantsAdmin;