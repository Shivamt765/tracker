import { useEffect, useState } from 'react';
import { Layout, Menu, Table, Button, Spin, Image, Typography } from 'antd';
import { supabase } from '../../lib/supabaseClient';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminDashboard() {
  const [visits, setVisits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    const fetchData = async () => {
      const { data: visitData } = await supabase
        .from('visits')
        .select('*, employees(name, email)')
        .order('time', { ascending: false });

      const { data: employeeData } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (visitData) setVisits(visitData);
      if (employeeData) setEmployees(employeeData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const employeeColumns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
  ];

  const visitColumns = [
    {
      title: 'Employee',
      render: (_, record) => (
        <>
          <strong>{record.employees?.name || 'Unknown'}</strong><br />
          <small>{record.employees?.email || ''}</small>
        </>
      ),
    },
    {
      title: 'Photo',
      render: (_, record) => (
        <Image
          width={70}
          src={record.photo_url}
          alt="visit"
          style={{ borderRadius: 6 }}
          onClick={() => setSelectedImage(record.photo_url)}
          preview={{ visible: false }}
        />
      ),
    },
    { title: 'Date', dataIndex: 'date' },
    {
      title: 'Time',
      render: (_, record) => new Date(record.time).toLocaleTimeString(),
    },
    {
      title: 'Location',
      render: (_, record) =>
        record.latitude && record.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            {record.latitude.toFixed(3)}, {record.longitude.toFixed(3)}
          </a>
        ) : (
          'Unknown'
        ),
    },
    { title: 'Notes', dataIndex: 'notes' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#f0f2f5', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3}>Admin Dashboard</Title>
        <Button danger onClick={handleLogout}>Logout</Button>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            items={[
              { key: 'employees', label: 'Employee List' },
              { key: 'visits', label: 'Visit Records' },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content>
            {loading ? (
              <Spin tip="Loading..." />
            ) : activeTab === 'employees' ? (
              <Table
                columns={employeeColumns}
                dataSource={employees}
                rowKey="id"
              />
            ) : (
              <Table
                columns={visitColumns}
                dataSource={visits}
                rowKey={(v, i) => i}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
