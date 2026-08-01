import { useState, useEffect } from 'react';
import CampaignsView from './CampaignsView';

const API_BASE = 'http://localhost:8000';

const LANGUAGE_COLORS = {
  Telugu: '#B85C38',
  Hindi: '#3D6E63',
  English: '#4A5B7C',
  Tamil: '#8B5A8C',
  Kannada: '#B8862E',
  Malayalam: '#4A7C59',
};

function LanguageBadge({ language }) {
  const color = LANGUAGE_COLORS[language] || '#6B6B6B';
  return (
    <span className="badge" style={{ backgroundColor: color }}>
      {language}
    </span>
  );
}

function AudienceView() {
  const [audience, setAudience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    language_preference: 'Telugu',
    location: '',
    occupation: '',
  });

  useEffect(() => {
    fetchAudience();
  }, []);

  async function fetchAudience() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/audience/`);
      if (!res.ok) throw new Error('Could not reach the server');
      const data = await res.json();
      setAudience(data);
    } catch (err) {
      setError(
        'Could not connect to the backend. Check whether the FastAPI server is running (uvicorn app.main:app --reload).'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/audience/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Could not add member');

      setForm({
        name: '',
        email: '',
        phone: '',
        language_preference: 'Telugu',
        location: '',
        occupation: '',
      });
      fetchAudience();
    } catch (err) {
      setError('Something went wrong while adding the member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/audience/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete');
      setAudience(audience.filter((m) => m.id !== id));
    } catch (err) {
      setError('Something went wrong while deleting.');
    }
  }

  return (
    <>
      <section className="panel form-panel">
        <h2>Add New Audience Member</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ex: Ramesh Kumar"
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ex: ramesh@example.com"
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="ex: 9876543210"
            />
          </label>
          <label>
            Language Preference
            <select
              name="language_preference"
              value={form.language_preference}
              onChange={handleChange}
            >
              {Object.keys(LANGUAGE_COLORS).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="ex: Guntur"
            />
          </label>
          <label>
            Occupation
            <input
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              placeholder="ex: Teacher"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </section>

      <section className="panel list-panel">
        <div className="list-header">
          <h2>All Audience Members</h2>
          <span className="count">{audience.length} members</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : audience.length === 0 ? (
          <p className="muted">
            No members yet. Add your first audience member using the form on the left.
          </p>
        ) : (
          <table className="audience-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>Location</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {audience.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-name">{member.name}</div>
                    {member.occupation && (
                      <div className="member-sub">{member.occupation}</div>
                    )}
                  </td>
                  <td>
                    <LanguageBadge language={member.language_preference} />
                  </td>
                  <td>{member.location || '—'}</td>
                  <td>
                    <div className="member-sub">{member.email || '—'}</div>
                    <div className="member-sub">{member.phone || '—'}</div>
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(member.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function Dashboard({ user, onLogout }) {
  // Tab ela current ga select ayyindo track cheyadaniki
  const [activeTab, setActiveTab] = useState('audience');

  const tabInfo = {
    audience: {
      eyebrow: 'Module 01',
      title: 'Audience Management',
      subtitle: 'Add your campaign audience and organize them by language preference.',
    },
    campaigns: {
      eyebrow: 'Module 01',
      title: 'Campaign Planning',
      subtitle: 'Create and manage awareness drives, alerts, and announcements.',
    },
  };

  const current = tabInfo[activeTab];

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <span className="eyebrow">{current.eyebrow}</span>
              <h1>{current.title}</h1>
            </div>
            <div className="user-box">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role.replace('_', ' ')}</div>
              <button className="btn-logout" onClick={onLogout}>
                Log Out
              </button>
            </div>
          </div>
          <p className="subtitle">{current.subtitle}</p>

          <nav className="tab-nav">
            <button
              className={activeTab === 'audience' ? 'tab-btn tab-active' : 'tab-btn'}
              onClick={() => setActiveTab('audience')}
            >
              Audience
            </button>
            <button
              className={activeTab === 'campaigns' ? 'tab-btn tab-active' : 'tab-btn'}
              onClick={() => setActiveTab('campaigns')}
            >
              Campaigns
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {activeTab === 'audience' ? <AudienceView /> : <CampaignsView user={user} />}
      </main>
    </div>
  );
}

export default Dashboard;
