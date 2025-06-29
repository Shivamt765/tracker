import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';

const { Title } = Typography;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      const { data: employee, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (empErr || !employee) {
        setError('Not authorized as admin');
        return;
      }

      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <Card
        style={{ width: 400 }}
        title={<Title level={3}>Admin Login</Title>}
      >
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </Form.Item>
          <button className='bg-red-900 text-900'> how can you  </button>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </Form.Item>

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
