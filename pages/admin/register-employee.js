import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function RegisterEmployee() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    // Step 1: Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(`❌ Auth error: ${authError.message}`);
      return;
    }

    const userId = authData?.user?.id;

    if (!userId) {
      setMessage('❌ Failed to get user ID from Supabase Auth.');
      return;
    }

    // Step 2: Insert into employees table
    const { error: insertError } = await supabase.from('employees').insert([
      {
        id: userId,
        email,
        name,
        role,
        department,
        position,
      },
    ]);

    if (insertError) {
      setMessage(`❌ DB error: ${insertError.message}`);
    } else {
      setMessage(`✅ ${role === 'admin' ? 'Admin' : 'Employee'} registered successfully!`);
      setEmail('');
      setPassword('');
      setName('');
      setDepartment('');
      setPosition('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Register Employee/Admin</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border mb-3 rounded"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
        />

        {message && <p className="text-sm text-blue-700 mb-3">{message}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
