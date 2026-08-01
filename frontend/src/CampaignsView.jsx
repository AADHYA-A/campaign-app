import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

const CAMPAIGN_TYPE_LABELS = {
  awareness_drive: 'Awareness Drive',
  emergency_alert: 'Emergency Alert',
  educational_notification: 'Educational Notification',
  organizational_announcement: 'Organizational Announcement',
};

const STATUS_COLORS = {
  draft: '#6B7280',
  scheduled: '#B8862E',
  sent: '#4A7C59',
};

function StatusBadge({ status }) {
  return (
    <span className="badge" style={{ backgroundColor: STATUS_COLORS[status] || '#6B7280' }}>
      {status}
    </span>
  );
}

function CampaignsView({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    campaign_type: 'awareness_drive',
    target_language: 'Telugu',
    status: 'draft',
  });

  // Idi Campaign create/edit/delete cheyagalada ledha ani decide chestundi -
  // backend lo require_role("admin", "campaign_manager") tho match avvali
  const canManage = user.role === 'admin' || user.role === 'campaign_manager';

  function authHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/campaigns/`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Could not fetch campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      setError('Could not load campaigns. Check whether the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/campaigns/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Could not create campaign');
      }
      setForm({
        title: '',
        description: '',
        campaign_type: 'awareness_drive',
        target_language: 'Telugu',
        status: 'draft',
      });
      fetchCampaigns();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Could not delete campaign');
      }
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {canManage ? (
        <section className="panel form-panel">
          <h2>Create New Campaign</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="ex: Flood Safety Awareness"
                required
              />
            </label>
            <label>
              Description
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short summary of this campaign"
                required
              />
            </label>
            <label>
              Campaign Type
              <select name="campaign_type" value={form.campaign_type} onChange={handleChange}>
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Target Language
              <select name="target_language" value={form.target_language} onChange={handleChange}>
                {['Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 'Malayalam'].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </label>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        </section>
      ) : (
        <section className="panel form-panel">
          <h2>Create New Campaign</h2>
          <p className="muted">
            Your role ({user.role.replace('_', ' ')}) does not have permission to create
            campaigns. Only Admin and Campaign Manager roles can do this.
          </p>
        </section>
      )}

      <section className="panel list-panel">
        <div className="list-header">
          <h2>All Campaigns</h2>
          <span className="count">{campaigns.length} campaigns</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="muted">No campaigns yet.</p>
        ) : (
          <table className="audience-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Language</th>
                <th>Status</th>
                <th>Created By</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="member-name">{c.title}</div>
                    <div className="member-sub">{c.description}</div>
                  </td>
                  <td className="member-sub">{CAMPAIGN_TYPE_LABELS[c.campaign_type] || c.campaign_type}</td>
                  <td>{c.target_language}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="member-sub">{c.created_by || '—'}</td>
                  {canManage && (
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

export default CampaignsView;
