import { useEffect, useState, useRef } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import "./AdminCrud.css";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const PAGE_SIZE = 5;

function ReunionsAdmin() {
  const [reunions, setReunions] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    titre: "",
    date: "",
    debutH: "09",
    debutM: "00",
    finH: "10",
    finM: "00",
  });
  const [page, setPage] = useState(1);
  const requestId = useRef(0);

  const loadAll = () => {
    const id = ++requestId.current;
    api.get("/reunions").then((res) => {
      if (id !== requestId.current) return;
      setReunions(res.data);
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
      const res = await api.get("/reunions/search", { params: { titre: value } });
      if (id !== requestId.current) return;
      setReunions(res.data);
    } catch {
      if (id === requestId.current) setError("Erreur de recherche");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ titre: "", date: "", debutH: "09", debutM: "00", finH: "10", finM: "00" });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    const debut = r.heureDeDebut?.slice(11, 16) ?? "09:00";
    const fin = r.heureDeFin?.slice(11, 16) ?? "10:00";
    setForm({
      titre: r.titre,
      date: r.date,
      debutH: debut.split(":")[0],
      debutM: debut.split(":")[1],
      finH: fin.split(":")[0],
      finM: fin.split(":")[1],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      titre: form.titre,
      date: form.date,
      heureDeDebut: form.date ? `${form.date}T${form.debutH}:${form.debutM}:00` : null,
      heureDeFin: form.date ? `${form.date}T${form.finH}:${form.finM}:00` : null,
    };
    try {
      if (editing) {
        await api.put(`/reunions/${editing.id}`, payload);
      } else {
        await api.post("/reunions", payload);
      }
      setShowModal(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette réunion ?")) return;
    try {
      await api.delete(`/reunions/${id}`);
      loadAll();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.max(1, Math.ceil(reunions.length / PAGE_SIZE));
  const paginated = reunions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-top">
          <h1>Réunions</h1>
          <div className="crud-actions">
            <input className="search-input" placeholder="Rechercher par titre..." value={search} onChange={handleSearch} />
            <button className="btn-primary" onClick={openCreate}>+ Nouvelle réunion</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {reunions.length === 0 ? (
          <p className="status-text">Aucune réunion trouvée.</p>
        ) : (
          <>
            <table className="crud-table">
              <thead>
                <tr><th>Titre</th><th>Date</th><th>Début</th><th>Fin</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr key={r.id}>
                    <td>{r.titre}</td>
                    <td>{r.date}</td>
                    <td>{r.heureDeDebut?.slice(11, 16) ?? "-"}</td>
                    <td>{r.heureDeFin?.slice(11, 16) ?? "-"}</td>
                    <td className="row-actions">
                      <button className="btn-edit" onClick={() => openEdit(r)}>Modifier</button>
                      <button className="btn-delete" onClick={() => handleDelete(r.id)}>Supprimer</button>
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
            <h2>{editing ? "Modifier la réunion" : "Nouvelle réunion"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label>Titre</label>
                <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
              </div>
              <div className="modal-field">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="modal-field">
                <label>Heure de début</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select value={form.debutH} onChange={(e) => setForm({ ...form, debutH: e.target.value })}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{h} h</option>
                    ))}
                  </select>
                  <select value={form.debutM} onChange={(e) => setForm({ ...form, debutM: e.target.value })}>
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>{m} min</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label>Heure de fin</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select value={form.finH} onChange={(e) => setForm({ ...form, finH: e.target.value })}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>{h} h</option>
                    ))}
                  </select>
                  <select value={form.finM} onChange={(e) => setForm({ ...form, finM: e.target.value })}>
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>{m} min</option>
                    ))}
                  </select>
                </div>
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

export default ReunionsAdmin;