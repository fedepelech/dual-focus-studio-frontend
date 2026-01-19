import { AppShell, Burger, Group, NavLink, Title, Button, Text, ActionIcon, Menu, Indicator } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, MessageSquare, Image, LogOut, ShoppingCart, Bell } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const unread = res.data.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} className="text-[#1e3a5f]">ArqAdmin</Title>
          </Group>
          <Group>
            <Menu shadow="md" width={300} position="bottom-end" onClose={markAllAsRead}>
              <Menu.Target>
                <Indicator label={unreadCount} size={16} disabled={unreadCount === 0} offset={2} color="red">
                  <ActionIcon variant="subtle" color="gray" size="lg">
                    <Bell size={20} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Notificaciones</Menu.Label>
                {notifications.length === 0 ? (
                  <Menu.Item disabled>No hay notificaciones</Menu.Item>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <Menu.Item
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      leftSection={!n.isRead && <Indicator color="blue" size={6} processing />}
                    >
                      <Text size="xs" fw={!n.isRead ? 600 : 400}>{n.message}</Text>
                      <Text size="10px" c="dimmed">{new Date(n.createdAt).toLocaleString()}</Text>
                    </Menu.Item>
                  ))
                )}
                {notifications.length > 5 && (
                  <>
                    <Menu.Divider />
                    <Menu.Item ta="center">Ver todas</Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>

            <Button variant="subtle" color="red" leftSection={<LogOut size={16} />} onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          leftSection={<LayoutDashboard size={16} />}
          active={location.pathname === '/admin/dashboard'}
          onClick={() => navigate('/admin/dashboard')}
        />
        <NavLink
          label="Gestionar Pedidos"
          leftSection={<ShoppingCart size={16} />}
          active={location.pathname === '/admin/orders'}
          onClick={() => navigate('/admin/orders')}
        />
        <NavLink
          label="Gestionar Preguntas"
          leftSection={<MessageSquare size={16} />}
          active={location.pathname === '/admin/questions'}
          onClick={() => navigate('/admin/questions')}
        />
        <NavLink
          label="Gestionar Portfolio"
          leftSection={<Image size={16} />}
          active={location.pathname === '/admin/portfolio'}
          onClick={() => navigate('/admin/portfolio')}
        />
      </AppShell.Navbar>

      <AppShell.Main className="bg-slate-50">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
