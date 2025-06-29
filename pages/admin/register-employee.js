import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Alert,
  message as antdMessage,
} from 'antd';

const { Title } = Typography;
const { Option } = Select;

export default function RegisterEmployee() {
  const [form] = Form.useForm();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (values) => {
    setSubmitting(true);
    setMessage('');

    const { email, password, name, role, department, position } = values;

    // Step 1: Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(`❌ Auth error: ${authError.message}`);
      setSubmitting(false);
      return;
    }

    const userId = authData?.user?.id;

    if (!userId) {
      setMessage('❌ Failed to get user ID from Supabase Auth.');
      setSubmitting(false);
      return;
    }

    // Step 2: Insert employee data
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
      antdMessage.success('User registered successfully!');
      form.resetFields();
    }

    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <Title level={3}>Register Employee/Admin</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            initialValue="employee"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="employee">Employee</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter position" />
          </Form.Item>

          {message && (
            <Alert
              type={message.startsWith('✅') ? 'success' : 'error'}
              message={message}
              className="mb-4"
              showIcon
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
