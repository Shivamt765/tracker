import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setMessage('❌ Failed to fetch user');
        return;
      }

      const currentUser = data.user;
      setUser(currentUser);
      setEmployeeName(currentUser.user_metadata?.name || '');

      fetchLocation();
      checkAttendance(currentUser);
    };

    fetchUserAndLocation();
  }, []);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          setMessage('❌ Location access denied.');
        }
      );
    }
  };

  const checkAttendance = async (user) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', user.id)
      .eq('date', today);

    if (data?.length > 0) {
      setAttendanceMarked(true);
    }
  };

  const ensureEmployeeExists = async (user) => {
    if (!user?.id) return;

    const { data: existing } = await supabase
      .from('employees')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existing) {
      await supabase.from('employees').insert({
        id: user.id,
        email: user.email,
        name: employeeName || 'Unnamed',
        role: 'employee',
        department: 'Unknown',
        position: 'Field Executive',
      });
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage('');

    if (!user?.id || attendanceMarked) {
      setMessage('⚠️ Already checked in or not logged in');
      setLoading(false);
      return;
    }

    await ensureEmployeeExists(user);

    const now = new Date();
    const status = now.getHours() <= 9 ? 'present' : 'late';

    const { error } = await supabase.from('attendance').insert({
      employee_id: user.id,
      date: now.toISOString().split('T')[0],
      check_in_time: now.toISOString(),
      status,
    });

    if (error) {
      setMessage('⚠️ Already checked in or error occurred.');
    } else {
      setMessage('✅ Attendance marked.');
      setAttendanceMarked(true);
    }

    setLoading(false);
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user?.id) {
      setMessage('❌ Not logged in');
      setLoading(false);
      return;
    }

    await ensureEmployeeExists(user);

    const formData = new FormData();
    formData.append('UPLOADCARE_STORE', '1');
    formData.append('UPLOADCARE_PUB_KEY', '7b7a8724bdebefba1e10');
    formData.append('file', photo);

    const uploadcareRes = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    });

    const result = await uploadcareRes.json();
    if (!result.file) {
      setMessage('❌ Failed to upload image');
      setLoading(false);
      return;
    }

    const photoUrl = `https://ucarecdn.com/${result.file}/`;

    const { error } = await supabase.from('visits').insert({
      employee_id: user.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString().split('T')[1].split('Z')[0],
      photo_url: photoUrl,
      latitude: location.lat,
      longitude: location.lon,
      location_name: 'Unknown',
      notes: note,
    });

    if (error) {
      setMessage('❌ Could not save visit.');
    } else {
      setMessage('✅ Visit submitted.');
    }

    setLoading(false);
  };

  const handleNameUpdate = async () => {
    if (!user?.id || !employeeName) return;

    const { error } = await supabase
      .from('employees')
      .update({ name: employeeName })
      .eq('id', user.id);

    if (error) {
      setMessage('❌ Failed to update name');
    } else {
      setMessage('✅ Name updated');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div
      className="text-white"
      style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '20px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Welcome, {employeeName || 'Employee'}</h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#e3342f',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: '600' }}>Update Name</label>
        <input
          type="text"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginTop: '0.25rem',
            marginBottom: '0.5rem',
          }}
        />
        <button
          onClick={handleNameUpdate}
          style={{
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
          }}
        >
          Update Name
        </button>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={loading || attendanceMarked}
        style={{
          backgroundColor: attendanceMarked ? '#9ca3af' : '#2563eb',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '10px',
          border: 'none',
          width: '100%',
          marginBottom: '1rem',
        }}
      >
        {attendanceMarked ? 'Attendance Already Marked' : 'Mark Attendance'}
      </button>

      <form onSubmit={handleVisitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          required
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />

        <textarea
          placeholder="Optional notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #ccc', resize: 'vertical' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            border: 'none',
          }}
        >
          Upload Visit
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#eee' }}>{message}</p>
      )}
    </div>
  );
}
