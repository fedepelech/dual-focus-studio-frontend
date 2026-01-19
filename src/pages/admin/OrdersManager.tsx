import { useState, useEffect } from 'react';
import { Table, Title, Badge, ActionIcon, Group, Modal, Stack, Text, Card, SimpleGrid, Button, LoadingOverlay, ScrollArea } from '@mantine/core';
import { Eye, Check, Clock, X, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderResponse {
  id: string;
  question: { text: string };
  option?: { label: string; priceModifier: number };
  textValue?: string;
}

interface Order {
  id: string;
  status: string;
  address: string;
  propertySize: string;
  zone: string;
  propertyType: string;
  details?: string;
  createdAt: string;
  customer: { name: string; email: string };
  service: { name: string; basePrice: number };
  responses: OrderResponse[];
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
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
    if (!order.service) return 0;
    let total = order.service.basePrice;
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
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Servicio</Table.Th>
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
                  <Table.Td>{order.service.name}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(order.status)} leftSection={getStatusIcon(order.status)} variant="light">
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={700}>${calculateTotal(order)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <ActionIcon variant="light" color="blue" onClick={() => openDetail(order.id)}>
                      <Eye size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
              {orders.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={6} ta="center">No hay pedidos registrados</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      <Modal
        opened={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={<Text fw={700} size="lg">Detalle del Pedido</Text>}
        size="xl"
      >
        <LoadingOverlay visible={detailLoading} />
        {selectedOrder && (
          <Stack gap="xl">
            <SimpleGrid cols={2}>
              <Card withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Información del Cliente</Text>
                <Stack gap={5}>
                  <Text fw={500}>{selectedOrder.customer.name}</Text>
                  <Text size="sm">{selectedOrder.customer.email}</Text>
                </Stack>
              </Card>
              <Card withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Estado y Pago</Text>
                <Group justify="space-between">
                  <Badge color={getStatusColor(selectedOrder.status)} variant="filled">
                    {selectedOrder.status}
                  </Badge>
                  <Text fw={700} size="lg">${calculateTotal(selectedOrder)}</Text>
                </Group>
              </Card>
            </SimpleGrid>

            <Card withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Datos del Inmueble</Text>
              <SimpleGrid cols={3}>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Dirección</Text>
                  <Text size="sm">{selectedOrder.address}</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Tamaño</Text>
                  <Text size="sm">{selectedOrder.propertySize}</Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Tipo</Text>
                  <Text size="sm">{selectedOrder.propertyType}</Text>
                </Stack>
              </SimpleGrid>
              {selectedOrder.details && (
                <Stack gap={0} mt="md">
                  <Text size="xs" c="dimmed">Detalles adicionales</Text>
                  <Text size="sm">{selectedOrder.details}</Text>
                </Stack>
              )}
            </Card>

            <Card withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">Respuestas del Formulario</Text>
              <Stack gap="md">
                {selectedOrder.responses.map((resp) => (
                  <div key={resp.id}>
                    <Text size="sm" fw={600} mb={4}>{resp.question.text}</Text>
                    <Text size="sm" p="xs" bg="gray.0" style={{ borderRadius: '4px' }}>
                      {resp.option ? resp.option.label : resp.textValue}
                      {resp.option?.priceModifier ? ` (+$${resp.option.priceModifier})` : ''}
                    </Text>
                  </div>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
