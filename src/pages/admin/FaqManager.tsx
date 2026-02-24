import { useState, useEffect } from 'react';
import {
  Stack, Title, Button, Group, TextInput, Textarea, Card, LoadingOverlay,
  Table, ActionIcon, Switch, Text, Modal, NumberInput, ScrollArea
} from '@mantine/core';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import api from '../../api/axios';

interface Faq {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

/** Valores por defecto para un nuevo FAQ */
const DEFAULT_FAQ_FORM = {
  question: '',
  answer: '',
  displayOrder: 0,
};

export function FaqManager() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FAQ_FORM);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faq/all');
      setFaqs(res.data);
    } catch (error) {
      console.error('Error cargando FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      ...DEFAULT_FAQ_FORM,
      displayOrder: faqs.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;

    setSaving(true);
    try {
      if (editingFaq) {
        await api.patch(`/faq/${editingFaq.id}`, formData);
      } else {
        await api.post('/faq', formData);
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (error) {
      console.error('Error guardando FAQ:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;
    try {
      await api.delete(`/faq/${id}`);
      fetchFaqs();
    } catch (error) {
      console.error('Error eliminando FAQ:', error);
    }
  };

  const handleToggleActive = async (faq: Faq) => {
    try {
      await api.patch(`/faq/${faq.id}`, { isActive: !faq.isActive });
      fetchFaqs();
    } catch (error) {
      console.error('Error cambiando estado FAQ:', error);
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={2}>Gestión de FAQ</Title>
        <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
          Nueva Pregunta
        </Button>
      </Group>

      <Card withBorder padding="0" radius="md">
        <LoadingOverlay visible={loading} />
        <ScrollArea>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}><GripVertical size={14} /></Table.Th>
                <Table.Th>Pregunta</Table.Th>
                <Table.Th>Respuesta</Table.Th>
                <Table.Th w={80}>Activa</Table.Th>
                <Table.Th w={100} ta="right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {faqs.map((faq) => (
                <Table.Tr key={faq.id} opacity={faq.isActive ? 1 : 0.5}>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{faq.displayOrder}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} lineClamp={2}>{faq.question}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={2}>{faq.answer}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={faq.isActive}
                      onChange={() => handleToggleActive(faq)}
                      size="sm"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon variant="light" color="blue" onClick={() => openEditModal(faq)}>
                        <Pencil size={14} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="red" onClick={() => handleDelete(faq.id)}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {faqs.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    <Text c="dimmed" py="xl">No hay preguntas frecuentes. ¡Creá la primera!</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Modal para crear/editar FAQ */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={700}>{editingFaq ? 'Editar Pregunta' : 'Nueva Pregunta'}</Text>}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Pregunta"
            placeholder="¿Cuánto demora la entrega?"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          />
          <Textarea
            label="Respuesta"
            placeholder="La entrega se realiza en un plazo de 48hs hábiles..."
            required
            minRows={4}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          />
          <NumberInput
            label="Orden de visualización"
            description="Menor número = aparece primero"
            value={formData.displayOrder}
            onChange={(val) => setFormData({ ...formData, displayOrder: val as number || 0 })}
            min={0}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!formData.question.trim() || !formData.answer.trim()}
            >
              {editingFaq ? 'Guardar Cambios' : 'Crear Pregunta'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
