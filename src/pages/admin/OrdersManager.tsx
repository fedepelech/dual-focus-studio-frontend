import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Title, Badge, ActionIcon, Group, Modal, Stack, Text, Card, SimpleGrid, Button, LoadingOverlay, ScrollArea, Paper, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Eye, Check, Clock, X, AlertCircle, MapPin, Building, Calendar, Mail, User, FileText } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderResponse {
  id: string;
  question: { text: string; inputType?: string };
  option?: { label: string; priceModifier: number };
  textValue?: string;
}

interface Order {
  id: string;
  status: string;
  address: string;
  propertySize?: string;
  zone?: string;
  gbaSubzone?: string;
  propertyType?: string;
  roomCount?: number;
  amenities?: string;
  details?: string;
  totalPrice?: number;
  createdAt: string;
  updatedAt?: string;
  customer: { name: string; email: string };
  services: { service: { id: string; name: string; category?: string; basePrice: number; description?: string } }[];
  responses: OrderResponse[];
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (orderId) {
      openDetail(orderId);
    }
  }, [orderId]);

  const openDetail = async (orderId: string) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${getStatusLabel(newStatus)}?`)) return;

    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      notifications.show({
        title: 'Estado actualizado',
        message: `El pedido ha sido marcado como ${getStatusLabel(newStatus)}`,
        color: 'green',
      });
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo actualizar el estado del pedido',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Proceso';
      case 'COMPLETED': return 'Finalizado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'IN_PROGRESS': return <AlertCircle size={16} />;
      case 'COMPLETED': return <Check size={16} />;
      case 'CANCELLED': return <X size={16} />;
      default: return null;
    }
  };

  const calculateTotal = (order: Order) => {
    if (order.totalPrice != null) return order.totalPrice;
    if (!order.services) return 0;
    let total = 0;
    order.services.forEach(s => {
      total += s.service.basePrice;
    });
    order.responses?.forEach(r => {
      if (r.option?.priceModifier) {
        total += r.option.priceModifier;
      }
    });
    return total;
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={2}>Gestión de Pedidos</Title>
        <Button variant="light" onClick={fetchOrders} loading={loading}>Actualizar</Button>
      </Group>

      <Card withBorder padding="0" radius="md">
        <LoadingOverlay visible={loading} />
        <ScrollArea>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Servicios</Table.Th>
                <Table.Th>Ubicación</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th ta="right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    {format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: es })}
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>{order.customer.name}</Text>
                      <Text size="xs" c="dimmed">{order.customer.email}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {order.services.map((s, idx) => (
                        <Badge key={idx} variant="outline" size="xs">{s.service.name}</Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="xs" fw={500}>{order.zone || 'CABA'}</Text>
                      {order.gbaSubzone && <Text size="xs" c="dimmed">{order.gbaSubzone}</Text>}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(order.status)} leftSection={getStatusIcon(order.status)} variant="light">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={700}>${calculateTotal(order).toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        title="Ver detalles"
                        onClick={() => openDetail(order.id)}
                      >
                        <Eye size={16} />
                      </ActionIcon>

                      {order.status === 'PENDING' && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            title="Marcar como Finalizado"
                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                          >
                            <Check size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            title="Cancelar Pedido"
                            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          >
                            <X size={16} />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {orders.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={7} ta="center">No hay pedidos registrados</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      <Modal
        opened={!!selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          if (orderId) navigate('/admin/orders');
        }}
        title={
          <Group gap="xs">
            <Text fw={700} size="lg">Detalle Completo del Pedido</Text>
            {selectedOrder && (
              <Badge variant="light" size="sm" color="gray">
                #{selectedOrder.id.slice(0, 8)}
              </Badge>
            )}
          </Group>
        }
        size="xl"
        radius="md"
      >
        <LoadingOverlay visible={detailLoading} />
        {selectedOrder && (
          <Stack gap="lg">
            {/* Header / Estado & Acciones rápidas */}
            <Card withBorder p="md" radius="md" bg="gray.0">
              <Group justify="space-between" align="center" wrap="wrap" mb="xs">
                <Group gap="md">
                  <Badge color={getStatusColor(selectedOrder.status)} leftSection={getStatusIcon(selectedOrder.status)} variant="filled" size="lg">
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                  <Group gap="xs">
                    <Calendar size={15} className="text-gray-500" />
                    <Text size="xs" c="dimmed">
                      Solicitado el {format(new Date(selectedOrder.createdAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </Text>
                  </Group>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" fw={600}>Total Estimado:</Text>
                  <Text fw={800} size="xl" c="#1c304a">
                    ${calculateTotal(selectedOrder).toLocaleString()}
                  </Text>
                </Group>
              </Group>

              <Divider my="xs" />

              <Group justify="space-between" align="center">
                <Text size="xs" fw={600} c="dimmed">Cambiar estado:</Text>
                <Group gap="xs">
                  {selectedOrder.status !== 'PENDING' && (
                    <Button size="xs" variant="light" color="yellow" onClick={() => handleStatusUpdate(selectedOrder.id, 'PENDING')}>
                      Marcar Pendiente
                    </Button>
                  )}
                  {selectedOrder.status !== 'IN_PROGRESS' && (
                    <Button size="xs" variant="light" color="blue" onClick={() => handleStatusUpdate(selectedOrder.id, 'IN_PROGRESS')}>
                      En Proceso
                    </Button>
                  )}
                  {selectedOrder.status !== 'COMPLETED' && (
                    <Button size="xs" variant="light" color="green" onClick={() => handleStatusUpdate(selectedOrder.id, 'COMPLETED')}>
                      Finalizado
                    </Button>
                  )}
                  {selectedOrder.status !== 'CANCELLED' && (
                    <Button size="xs" variant="subtle" color="red" onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}>
                      Cancelar
                    </Button>
                  )}
                </Group>
              </Group>
            </Card>

            {/* Grid principal: Cliente + Inmueble */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {/* Card Cliente */}
              <Card withBorder p="md" radius="md">
                <Group gap="xs" mb="xs">
                  <User size={16} color="#1c304a" />
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Información del Cliente</Text>
                </Group>
                <Stack gap={6}>
                  <div>
                    <Text size="xs" c="dimmed">Nombre completo</Text>
                    <Text fw={600}>{selectedOrder.customer.name}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Correo Electrónico</Text>
                    <Group gap="xs">
                      <Mail size={14} className="text-gray-400" />
                      <Text size="sm" component="a" href={`mailto:${selectedOrder.customer.email}`} c="blue" style={{ textDecoration: 'none' }}>
                        {selectedOrder.customer.email}
                      </Text>
                    </Group>
                  </div>
                </Stack>
              </Card>

              {/* Card Inmueble y Ubicación */}
              <Card withBorder p="md" radius="md">
                <Group gap="xs" mb="xs">
                  <MapPin size={16} color="#1c304a" />
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Inmueble y Ubicación</Text>
                </Group>
                <SimpleGrid cols={2} spacing="xs">
                  <div>
                    <Text size="xs" c="dimmed">Dirección</Text>
                    <Text size="sm" fw={500}>{selectedOrder.address || '-'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Tipo de Inmueble</Text>
                    <Text size="sm" fw={500}>{selectedOrder.propertyType || '-'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Zona Principal</Text>
                    <Badge variant="outline" color={selectedOrder.zone === 'GBA' ? 'orange' : 'cyan'}>
                      {selectedOrder.zone || 'CABA'}
                    </Badge>
                  </div>
                  {selectedOrder.gbaSubzone && (
                    <div>
                      <Text size="xs" c="dimmed">Partido / Subzona GBA</Text>
                      <Text size="sm" fw={600} c="dark.4">{selectedOrder.gbaSubzone}</Text>
                    </div>
                  )}
                  {selectedOrder.propertySize && (
                    <div>
                      <Text size="xs" c="dimmed">Superficie</Text>
                      <Text size="sm">{selectedOrder.propertySize}</Text>
                    </div>
                  )}
                  {selectedOrder.roomCount != null && (
                    <div>
                      <Text size="xs" c="dimmed">Ambientes</Text>
                      <Text size="sm">{selectedOrder.roomCount}</Text>
                    </div>
                  )}
                </SimpleGrid>
              </Card>
            </SimpleGrid>

            {/* Servicios Solicitados */}
            <Card withBorder p="md" radius="md">
              <Group gap="xs" mb="xs">
                <Building size={16} color="#1c304a" />
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Servicios Solicitados</Text>
              </Group>
              <Stack gap="xs">
                {selectedOrder.services.map((item, idx) => (
                  <Paper key={idx} p="xs" withBorder bg="blue.0" radius="sm">
                    <Group justify="space-between">
                      <div>
                        <Group gap="xs">
                          <Text fw={600} size="sm" c="#1c304a">{item.service.name}</Text>
                          {item.service.category && (
                            <Badge size="xs" color="blue" variant="filled">{item.service.category}</Badge>
                          )}
                        </Group>
                        {item.service.description && (
                          <Text size="xs" c="dimmed">{item.service.description}</Text>
                        )}
                      </div>
                      <Text fw={700} size="sm" c="#1c304a">
                        ${item.service.basePrice.toLocaleString()}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>

            {/* Respuestas del Formulario */}
            {selectedOrder.responses && selectedOrder.responses.length > 0 && (
              <Card withBorder p="md" radius="md">
                <Group gap="xs" mb="xs">
                  <FileText size={16} color="#1c304a" />
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Respuestas del Formulario</Text>
                </Group>
                <Stack gap="xs">
                  {selectedOrder.responses.map((resp) => (
                    <Paper key={resp.id} p="xs" withBorder radius="sm">
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text size="xs" fw={600} c="dimmed">{resp.question.text}</Text>
                          <Text size="sm" fw={500} mt={2}>
                            {resp.option ? resp.option.label : resp.textValue || '-'}
                          </Text>
                        </div>
                        {resp.option?.priceModifier ? (
                          <Badge color="violet" variant="light" size="sm">
                            +${resp.option.priceModifier.toLocaleString()}
                          </Badge>
                        ) : null}
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Card>
            )}

            {/* Observaciones o detalles adicionales */}
            {selectedOrder.details && (
              <Card withBorder p="md" radius="md" bg="amber.0">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>Observaciones Adicionales del Cliente</Text>
                <Text size="sm" fs="italic">{selectedOrder.details}</Text>
              </Card>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
