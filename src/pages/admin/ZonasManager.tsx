import { useState, useEffect } from 'react';
import { Title, Paper, Table, Switch, TextInput, NumberInput, Button, Group, Stack, Text, ActionIcon, Loader, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Trash2, Plus, MapPin, Check, X, Save } from 'lucide-react';
import api from '../../api/axios';

const ZonasManager = () => {
  const [subzones, setSubzones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubzone, setNewSubzone] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState<number | string>(0);
  const [creating, setCreating] = useState(false);
  const [editingPrices, setEditingPrices] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    fetchSubzones();
  }, []);

  const fetchSubzones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/zones/gba-subzones');
      setSubzones(res.data);
      const priceMap: { [id: string]: number } = {};
      res.data.forEach((z: any) => {
        priceMap[z.id] = z.extraPrice || 0;
      });
      setEditingPrices(priceMap);
    } catch (error) {
      console.error('Error fetching subzones:', error);
      notifications.show({ title: 'Error', message: 'No se pudieron cargar las zonas', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/zones/gba-subzones/${id}`, { isEnabled: !currentStatus });
      setSubzones(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !currentStatus } : s));
      notifications.show({
        title: 'Actualizado',
        message: `Zona ${!currentStatus ? 'habilitada' : 'deshabilitada'} correctamente`,
        color: 'green',
        icon: <Check size={16} />
      });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el estado', color: 'red' });
    }
  };

  const handleUpdatePrice = async (id: string) => {
    const extraPrice = editingPrices[id] ?? 0;
    try {
      await api.patch(`/zones/gba-subzones/${id}`, { extraPrice });
      setSubzones(prev => prev.map(s => s.id === id ? { ...s, extraPrice } : s));
      notifications.show({
        title: 'Precio actualizado',
        message: 'Precio adicional de la zona guardado correctamente',
        color: 'green',
        icon: <Check size={16} />
      });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar el precio', color: 'red' });
    }
  };

  const handleCreate = async () => {
    if (!newSubzone.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/zones/gba-subzones', {
        name: newSubzone,
        extraPrice: Number(newExtraPrice) || 0
      });
      setSubzones(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setEditingPrices(prev => ({ ...prev, [res.data.id]: res.data.extraPrice || 0 }));
      setNewSubzone('');
      setNewExtraPrice(0);
      notifications.show({ title: 'Éxito', message: 'Zona añadida correctamente', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo crear la zona', color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;
    try {
      await api.delete(`/zones/gba-subzones/${id}`);
      setSubzones(prev => prev.filter(s => s.id !== id));
      notifications.show({ title: 'Eliminado', message: 'Zona eliminada correctamente', color: 'blue' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo eliminar la zona', color: 'red' });
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Gestión de Zonas GBA (AMBA)</Title>
          <Text c="dimmed" size="sm">Configurá la disponibilidad y precios adicionales por partido/zona.</Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group align="flex-end">
          <TextInput
            label="Añadir nuevo partido / subzona"
            placeholder="Ej: Quilmes"
            style={{ flex: 2 }}
            value={newSubzone}
            onChange={(e) => setNewSubzone(e.currentTarget.value)}
          />
          <NumberInput
            label="Precio Adicional ($)"
            placeholder="0"
            min={0}
            style={{ flex: 1 }}
            value={newExtraPrice}
            onChange={(val) => setNewExtraPrice(val || 0)}
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

      <Paper withBorder radius="md">
        {loading ? (
          <Group justify="center" py="xl">
            <Loader color="dark" />
          </Group>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Nombre del Partido / Zona</Table.Th>
                <Table.Th w={200}>Precio Adicional ($)</Table.Th>
                <Table.Th w={150} ta="center">Estado</Table.Th>
                <Table.Th w={120} ta="center">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {subzones.map((zone) => (
                <Table.Tr key={zone.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <MapPin size={16} className="text-gray-400" />
                      <Text fw={500}>{zone.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <NumberInput
                        size="xs"
                        min={0}
                        prefix="$ "
                        value={editingPrices[zone.id] ?? 0}
                        onChange={(val) => setEditingPrices(prev => ({ ...prev, [zone.id]: Number(val) || 0 }))}
                        style={{ width: 110 }}
                      />
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="blue"
                        title="Guardar precio"
                        onClick={() => handleUpdatePrice(zone.id)}
                      >
                        <Save size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="center">
                      <Switch
                        checked={zone.isEnabled}
                        onChange={() => handleToggle(zone.id, zone.isEnabled)}
                        color="green"
                        size="md"
                        thumbIcon={
                          zone.isEnabled ? (
                            <Check size={12} color="green" />
                          ) : (
                            <X size={12} color="red" />
                          )
                        }
                      />
                      <Badge variant="light" color={zone.isEnabled ? 'green' : 'red'}>
                        {zone.isEnabled ? 'Habilitada' : 'Deshabilitada'}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="center">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(zone.id)}
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
};

export default ZonasManager;
