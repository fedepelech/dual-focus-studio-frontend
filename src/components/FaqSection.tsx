import { useState, useEffect } from 'react';
import { Accordion, Container, Stack, Text } from '@mantine/core';
import api from '../api/client';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

/** Texto por defecto si no hay FAQs cargadas */
const EMPTY_FAQ_TEXT = 'Próximamente agregaremos preguntas frecuentes.';

export function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faq');
        setFaqs(res.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Mientras carga, no mostrar nada pero mantener el anchor
  // Cuando no hay FAQs, se muestra un mensaje placeholder

  return (
    <section id="faq" className="py-24 bg-white">
      <Container size="md">
        <Stack align="center" gap="xs" mb={40}>
          <h2 className="text-3xl font-bold text-[#1c304a]">Preguntas Frecuentes</h2>
          <Text c="dimmed" ta="center">
            Respondemos las consultas más habituales de nuestros clientes.
          </Text>
        </Stack>

        {loading ? (
          <Text c="dimmed" ta="center">Cargando preguntas...</Text>
        ) : faqs.length > 0 ? (
          <Accordion
            variant="separated"
            radius="md"
            styles={{
              item: {
                borderColor: '#e4d0bb',
              },
              control: {
                fontWeight: 600,
                color: '#1c304a',
              },
              panel: {
                color: '#555',
              },
            }}
          >
            {faqs.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id}>
                <Accordion.Control>{faq.question}</Accordion.Control>
                <Accordion.Panel>{faq.answer}</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Text c="dimmed" ta="center">{EMPTY_FAQ_TEXT}</Text>
        )}
      </Container>
    </section>
  );
}
