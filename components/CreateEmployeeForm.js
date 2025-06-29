// components/CreateEmployeeForm.js
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CreateEmployeeForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    position: '',
    password: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating user...');

    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
    });

    if (authError) {
      setStatus(`❌ Auth Error: ${authError.message}`);
      return;
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into employees table
    const { error: dbError } = await supabase.from('employees').insert([
      {
        id: userId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        position: formData.position,
      },
    ]);

    if (dbError) {
      setStatus(`❌ DB Error: ${dbError.message}`);
    } else {
      setStatus('✅ Employee created successfully!');
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        position: '',
        password: '',
      });
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-4 bg-white rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Create New Employee</h2>

      {['name', 'email', 'department', 'position', 'password'].map((field) => (
        <input
          key={field}
          name={field}
          type={field === 'password' ? 'password' : 'text'}
          placeholder={field[0].toUpperCase() + field.slice(1)}
          value={formData[field]}
          onChange={handleChange}
          required
          className="w-full p-2 border mb-3 rounded"
        />
      ))}

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full p-2 border mb-3 rounded"
      >
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        Create
      </button>

      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </form>
  );
}
