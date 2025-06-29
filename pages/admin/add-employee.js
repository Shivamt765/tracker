import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AddEmployee() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setMessage('');

    let photoPath = null;

    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${email}_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(filePath, photo);

      if (uploadError) {
        console.error(uploadError);
        return setMessage('❌ Failed to upload photo.');
      }

      photoPath = filePath;
    }

    const { error: insertError } = await supabase.from('employees').insert([
      {
        email,
        name,
        role,
        department,
        position,
        photo_url: photoPath,
      },
    ]);

    if (insertError) {
      console.error(insertError);
      return setMessage('❌ Failed to add employee.');
    }

    setMessage('✅ Employee added successfully!');
    setEmail('');
    setName('');
    setDepartment('');
    setPosition('');
    setRole('employee');
    setPhoto(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleAddEmployee} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Add New Employee</h2>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} required className="w-full border p-2 rounded" />
        
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="w-full border p-2 rounded" />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Employee</button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}
