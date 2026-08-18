import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import "./AdminCrud.css";

const PAGE_SIZE = 5;

function ResponsablesAdmin() {
  const [responsables, setResponsables] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "" });
  const [page, setPage] = useState(1);

  const loadAll = () => {
    api.get("/responsables").then((res) => {
      setResponsables(res.data);
      setPage(1);
    }).catch(() => setError("Erreur de chargement"));
  };

  useEffect(() => { loadAll(); }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    if (value.trim() === "") { loadAll(); return; }
    try {
      const res = await api.get("/responsables/search", { params: { nom: value } });
      setResponsables(res.data);
    } catch {
      setError("Erreur de recherche");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: "", prenom: "", email: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ nom: r.nom, prenom: r.prenom, email: r.email, password: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/responsables/${editing.id}`, form);
      } else {
        await api.post("/responsables", form);
      }
      setShowModal(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce responsable ?")) return;
    try {
      await api.delete(`/responsables/${id}`);
      loadAll();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const totalPages = Math.max(1, Math.ceil(responsables.length / PAGE_SIZE));
  const paginated = responsables.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-top">
          <h1>Responsables de planification</h1>
          <div className="crud-actions">
            <input className="search-input" placeholder="Rechercher par nom..." value={search} onChange={handleSearch} />
            <button className="btn-primary" onClick={openCreate}>+ Nouveau</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {responsables.length === 0 ? (
          <p className="status-text">Aucun responsable trouvé.</p>
        ) : (
          <>
            <table className="crud-table">
              <thead>
                <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nom}</td>
                    <td>{r.prenom}</td>
                    <td>{r.email}</td>
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
            <h2>{editing ? "Modifier le responsable" : "Nouveau responsable"}</h2>
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
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="modal-field">
                <label>Mot de passe {editing && "(laisser vide pour ne pas changer)"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
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

export default ResponsablesAdmin;