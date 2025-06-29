import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Typography,
  Alert,
  message as antdMessage,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function AddEmployee() {
  const [form] = Form.useForm();
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddEmployee = async (values) => {
    setSubmitting(true);
    setMessage('');

    const { email, name, department, position, role } = values;
    let photoPath = null;

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${email}_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(filePath, photoFile);

      if (uploadError) {
        console.error(uploadError);
        setMessage('❌ Failed to upload photo.');
        setSubmitting(false);
        return;
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
      setMessage('❌ Failed to add employee.');
      setSubmitting(false);
      return;
    }

    setMessage('✅ Employee added successfully!');
    antdMessage.success('Employee added!');
    form.resetFields();
    setPhotoFile(null);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <Title level={3}>Add New Employee</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEmployee}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Role" name="role" initialValue="employee">
            <Select>
              <Select.Option value="employee">Employee</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Photo (optional)">
            <Upload
              beforeUpload={(file) => {
                setPhotoFile(file);
                return false; // prevent auto-upload
              }}
              showUploadList={{ showRemoveIcon: true }}
              onRemove={() => setPhotoFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
            >
              Add Employee
            </Button>
          </Form.Item>
        </Form>

        {message && (
          <Alert
            type={message.startsWith('✅') ? 'success' : 'error'}
            message={message}
            showIcon
          />
        )}
      </div>
    </div>
  );
}
