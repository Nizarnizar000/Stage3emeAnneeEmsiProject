import { useEffect, useState, useRef } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import "./AdminCrud.css";

const PAGE_SIZE = 5;

function SallesAdmin() {
  const [salles, setSalles] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ localisation: "" });
  const [page, setPage] = useState(1);
  const requestId = useRef(0);

  const loadAll = () => {
    const id = ++requestId.current;
    api.get("/salles").then((res) => {
      if (id !== requestId.current) return;
      setSalles(res.data);
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
      const res = await api.get("/salles/search", { params: { localisation: value } });
      if (id !== requestId.current) return;
      setSalles(res.data);
    } catch {
      if (id === requestId.current) setError("Erreur de recherche");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ localisation: "" });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ localisation: s.localisation });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/salles/${editing.id}`, form);
      } else {
        await api.post("/salles", form);
      }
      setShowModal(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette salle ?")) return;
    try {
      await api.delete(`/salles/${id}`);
      loadAll();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.max(1, Math.ceil(salles.length / PAGE_SIZE));
  const paginated = salles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-top">
          <h1>Salles</h1>
          <div className="crud-actions">
            <input className="search-input" placeholder="Rechercher par localisation..." value={search} onChange={handleSearch} />
            <button className="btn-primary" onClick={openCreate}>+ Nouvelle salle</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {salles.length === 0 ? (
          <p className="status-text">Aucune salle trouvée.</p>
        ) : (
          <>
            <table className="crud-table">
              <thead><tr><th>Localisation</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id}>
                    <td>{s.localisation}</td>
                    <td className="row-actions">
                      <button className="btn-edit" onClick={() => openEdit(s)}>Modifier</button>
                      <button className="btn-delete" onClick={() => handleDelete(s.id)}>Supprimer</button>
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
            <h2>{editing ? "Modifier la salle" : "Nouvelle salle"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-field">
                <label>Localisation</label>
                <input value={form.localisation} onChange={(e) => setForm({ localisation: e.target.value })} required />
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

export default SallesAdmin;