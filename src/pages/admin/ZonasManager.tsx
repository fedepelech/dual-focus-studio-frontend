import { useState, useEffect } from 'react';
import { Title, Paper, Table, Switch, TextInput, NumberInput, Button, Group, Stack, Text, ActionIcon, Loader, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Trash2, Plus, MapPin, Check, X, Save, Search } from 'lucide-react';
import api from '../../api/axios';
import type { BarrioConfig } from '../../types/questions';

const PRECIO_INICIAL_DEFECTO = 0;

const ZonasManager = () => {
  const [barrios, setBarrios] = useState<BarrioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newBarrio, setNewBarrio] = useState('');
  const [newPrice, setNewPrice] = useState<number | string>(PRECIO_INICIAL_DEFECTO);
  const [creating, setCreating] = useState(false);
  const [editingPrices, setEditingPrices] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    fetchBarrios();
  }, []);

  const fetchBarrios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/barrios');
      setBarrios(res.data);
      const priceMap: { [id: string]: number } = {};
      res.data.forEach((b: BarrioConfig) => {
        priceMap[b.id] = b.price || PRECIO_INICIAL_DEFECTO;
      });
      setEditingPrices(priceMap);
    } catch (error) {
      console.error('Error al obtener los barrios:', error);
      notifications.show({ title: 'Error', message: 'No se pudieron cargar los barrios', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/barrios/${id}`, { isEnabled: !currentStatus });
      setBarrios(prev => prev.map(b => b.id === id ? { ...b, isEnabled: !currentStatus } : b));
      notifications.show({
        title: 'Actualizado',
        message: `Barrio ${!currentStatus ? 'habilitado' : 'deshabilitado'} correctamente`,
        color: 'green',
        icon: <Check size={16} />
      });
    } catch (error) {
      console.error('Error al actualizar estado del barrio:', error);
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el estado', color: 'red' });
    }
  };

  const handleUpdatePrice = async (id: string) => {
    const price = editingPrices[id] ?? PRECIO_INICIAL_DEFECTO;
    try {
      await api.patch(`/barrios/${id}`, { price });
      setBarrios(prev => prev.map(b => b.id === id ? { ...b, price } : b));
      notifications.show({
        title: 'Precio actualizado',
        message: 'Precio del barrio guardado correctamente',
        color: 'green',
        icon: <Check size={16} />
      });
    } catch (error) {
      console.error('Error al actualizar precio del barrio:', error);
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el precio', color: 'red' });
    }
  };

  const handleCreate = async () => {
    if (!newBarrio.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/barrios', {
        name: newBarrio.trim(),
        price: Number(newPrice) || PRECIO_INICIAL_DEFECTO
      });
      setBarrios(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setEditingPrices(prev => ({ ...prev, [res.data.id]: res.data.price || PRECIO_INICIAL_DEFECTO }));
      setNewBarrio('');
      setNewPrice(PRECIO_INICIAL_DEFECTO);
      notifications.show({ title: 'Éxito', message: 'Barrio añadido correctamente', color: 'green' });
    } catch (error) {
      console.error('Error al crear barrio:', error);
      notifications.show({ title: 'Error', message: 'No se pudo crear el barrio', color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este barrio?')) return;
    try {
      await api.delete(`/barrios/${id}`);
      setBarrios(prev => prev.filter(b => b.id !== id));
      notifications.show({ title: 'Eliminado', message: 'Barrio eliminado correctamente', color: 'blue' });
    } catch (error) {
      console.error('Error al eliminar barrio:', error);
      notifications.show({ title: 'Error', message: 'No se pudo eliminar el barrio', color: 'red' });
    }
  };

  const filteredBarrios = barrios.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Gestión de Barrios y Ubicaciones</Title>
          <Text c="dimmed" size="sm">Configurá la disponibilidad y el precio individual para cada barrio de CABA y San Isidro.</Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group align="flex-end">
          <TextInput
            label="Añadir nuevo barrio"
            placeholder="Ej: Palermo o San Isidro"
            style={{ flex: 2 }}
            value={newBarrio}
            onChange={(e) => setNewBarrio(e.currentTarget.value)}
          />
          <NumberInput
            label="Precio ($)"
            placeholder="0"
            min={0}
            style={{ flex: 1 }}
            value={newPrice}
            onChange={(val) => setNewPrice(val || PRECIO_INICIAL_DEFECTO)}
          />
          <Button
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
            loading={creating}
            bg="#1c304a"
          >
            Añadir
          </Button>
        </Group>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <TextInput
          placeholder="Buscar barrio..."
          leftSection={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />

        {loading ? (
          <Group justify="center" py="xl">
            <Loader color="dark" />
          </Group>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Nombre del Barrio / Ubicación</Table.Th>
                <Table.Th w={220}>Precio Individual ($)</Table.Th>
                <Table.Th w={160} ta="center">Estado</Table.Th>
                <Table.Th w={100} ta="center">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredBarrios.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed" py="md">No se encontraron barrios.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredBarrios.map((barrio) => (
                  <Table.Tr key={barrio.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <MapPin size={16} className="text-gray-400" />
                        <Text fw={500}>{barrio.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <NumberInput
                          size="xs"
                          min={0}
                          prefix="$ "
                          value={editingPrices[barrio.id] ?? PRECIO_INICIAL_DEFECTO}
                          onChange={(val) => setEditingPrices(prev => ({ ...prev, [barrio.id]: Number(val) || PRECIO_INICIAL_DEFECTO }))}
                          style={{ width: 130 }}
                        />
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          title="Guardar precio"
                          onClick={() => handleUpdatePrice(barrio.id)}
                        >
                          <Save size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="center">
                        <Switch
                          checked={barrio.isEnabled}
                          onChange={() => handleToggle(barrio.id, barrio.isEnabled)}
                          color="green"
                          size="md"
                          thumbIcon={
                            barrio.isEnabled ? (
                              <Check size={12} color="green" />
                            ) : (
                              <X size={12} color="red" />
                            )
                          }
                        />
                        <Badge variant="light" color={barrio.isEnabled ? 'green' : 'red'}>
                          {barrio.isEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="center">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(barrio.id)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
};

export default ZonasManager;
