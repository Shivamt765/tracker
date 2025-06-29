import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [visits, setVisits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    const fetchData = async () => {
      const { data: visitData, error: visitError } = await supabase
        .from('visits')
        .select('*, employees(name, email)')
        .order('time', { ascending: false });

      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (visitError) console.error('Error fetching visits:', visitError.message);
      else setVisits(visitData);

      if (employeeError) console.error('Error fetching employees:', employeeError.message);
      else setEmployees(employeeData);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navWrapper}>
          <h1 style={styles.logo}>Admin Dashboard</h1>
          <button style={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <aside style={styles.sidebar}>
        <button onClick={() => setActiveTab('employees')} style={activeTab === 'employees' ? styles.activeTab : styles.tab}>Employee List</button>
        <button onClick={() => setActiveTab('visits')} style={activeTab === 'visits' ? styles.activeTab : styles.tab}>Visit Records</button>
      </aside>

      <main style={styles.mainContent}>
        {activeTab === 'employees' && (
          <div style={styles.section}>
            <h2 style={styles.subTitle}>👥 Employees</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'visits' && (
          <div style={styles.section}>
            <h2 style={styles.subTitle}>📍 Visit Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : visits.length === 0 ? (
              <p>No visits found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Photo</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{v.employees?.name || 'Unknown'}</strong><br />
                        <small>{v.employees?.email || ''}</small>
                      </td>
                      <td>
                        <img
                          src={v.photo_url}
                          alt="Visit"
                          style={styles.imageThumb}
                          onClick={() => setSelectedImage(v.photo_url)}
                        />
                      </td>
                      <td>{v.date}</td>
                      <td>{new Date(v.time).toLocaleTimeString()}</td>
                      <td>
                        {v.latitude && v.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {v.latitude.toFixed(3)}, {v.longitude.toFixed(3)}
                          </a>
                        ) : 'Unknown'}
                      </td>
                      <td>{v.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selectedImage && (
          <div style={styles.overlay} onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Zoom" style={styles.fullImage} />
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(to right, #c9d6ff, #e2e2e2)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 10,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '0 0 12px 12px',
    backdropFilter: 'blur(8px)',
    // padding: '1rem 2rem',
  },
  navWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  logout: {
    background: '#ff4d4d',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  sidebar: {
    position: 'fixed',
    top: '5rem',
    left: 0,
    width: '200px',
    height: 'calc(100vh - 5rem)',
    padding: '1rem',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(6px)',
    borderRight: '1px solid rgba(0,0,0,0.1)',
  },
  tab: {
    display: 'block',
    width: '100%',
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    background: '#ffffff90',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  activeTab: {
    display: 'block',
    width: '100%',
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  mainContent: {
    marginLeft: '220px',
    marginTop: '6rem',
    flexGrow: 1,
    padding: '2rem',
  },
  section: {
    background: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(12px)',
    borderRadius: '14px',
    padding: '1rem',
  },
  subTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  imageThumb: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '10px',
  },
};
