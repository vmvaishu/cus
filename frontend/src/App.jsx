
import { useState, useEffect } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000/api/tickets";

function App() {
  const emptyForm = {
    customer_name: "",
    email: "",
    subject: "",
    description: "",
    priority: "Medium",
  };

  const [form, setForm] = useState(emptyForm);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // READ: Retrieve tickets from PostgreSQL through Flask
  async function loadTickets() {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load tickets");
      }

      setTickets(data.tickets || []);
      setStats({
        total: data.total ?? 0,
        open: data.open ?? 0,
        in_progress: data.in_progress ?? 0,
        resolved: data.resolved ?? 0,
      });
    } catch (error) {
      setMessage(error.message || "Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // CREATE: Save a new ticket
  // UPDATE: Save edited ticket details
  async function submitTicket(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save ticket");
      }

      setForm({ ...emptyForm });
      setEditingId(null);
      setMessage(
        editingId
          ? "Ticket updated successfully!"
          : "Ticket created successfully!"
      );

      await loadTickets();
    } catch (error) {
      setMessage(error.message || "Unable to save ticket");
    } finally {
      setSaving(false);
    }
  }

  // Load ticket details into the form for editing
  function editTicket(ticket) {
    setEditingId(ticket.id);

    setForm({
      customer_name: ticket.customer_name || "",
      email: ticket.email || "",
      subject: ticket.subject || "",
      description: ticket.description || "",
      priority: ticket.priority || "Medium",
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
  }

  // UPDATE: Change ticket status
  async function updateStatus(id, status) {
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setMessage("Ticket status updated successfully!");
      await loadTickets();
    } catch (error) {
      setMessage(error.message || "Unable to update status");
    }
  }

  // DELETE: Remove a ticket from the database
  async function deleteTicket(id) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Ticket #${id}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Ticket deleted successfully!");
      await loadTickets();
    } catch (error) {
      setMessage(error.message || "Unable to delete ticket");
    }
  }

  const visibleTickets = tickets.filter(
    (ticket) => filter === "All" || ticket.status === filter
  );

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">CUSTOMER SUPPORT PORTAL</p>
          <h1>Customer Service Management</h1>
          <p>Manage customer requests in one place.</p>
        </div>
      </header>

      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      <section className="stats">
        <div className="stat">
          <span>Total Tickets</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="stat">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </div>

        <div className="stat">
          <span>In Progress</span>
          <strong>{stats.in_progress}</strong>
        </div>

        <div className="stat">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>
          {editingId ? `Edit Ticket #${editingId}` : "Create Support Ticket"}
        </h2>

        <form onSubmit={submitTicket} className="ticket-form">
          <label>
            Customer Name
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={150}
            />
          </label>

          <label>
            Issue Subject
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              maxLength={200}
            />
          </label>

          <label>
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>

          <label className="full">
            Issue Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
            />
          </label>

          <button className="primary full" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
              ? "Update Ticket"
              : "Submit Ticket"}
          </button>

          {editingId && (
            <button
              className="secondary full"
              type="button"
              onClick={cancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>Support Tickets</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter tickets by status"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        {loading ? (
          <p>Loading tickets...</p>
        ) : visibleTickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <div className="ticket-list">
            {visibleTickets.map((ticket) => (
              <article className="ticket" key={ticket.id}>
                <div className="ticket-top">
                  <div>
                    <span className="ticket-id">
                      Ticket #{ticket.id}
                    </span>
                    <h3>{ticket.subject}</h3>
                  </div>

                  <span
                    className={`badge ${ticket.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p>{ticket.description}</p>

                <p className="muted">
                  {ticket.customer_name} · {ticket.email}
                </p>

                <p>
                  Priority: <strong>{ticket.priority}</strong>
                </p>

                <label className="status-control">
                  Update Status
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateStatus(ticket.id, e.target.value)
                    }
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </label>

                <div className="ticket-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => editTicket(ticket)}
                  >
                    Edit Ticket
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteTicket(ticket.id)}
                  >
                    Delete Ticket
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
