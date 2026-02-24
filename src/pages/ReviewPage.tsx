import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Stack, Rating, Textarea, Button, Center, Loader, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Check, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const ReviewPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await api.get(`/reviews/check/${token}`);
        setReviewData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Token no válido o expirado');
      } finally {
        setLoading(false);
      }
    };
    if (token) checkToken();
  }, [token]);

  const handleSubmit = async () => {
    if (rating === 0) {
      notifications.show({
        title: 'Atención',
        message: 'Por favor, selecciona una puntuación',
        color: 'yellow'
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/reviews/submit/${token}`, { rating, comment });
      notifications.show({
        title: '¡Gracias!',
        message: 'Tu valoración ha sido enviada con éxito.',
        color: 'green',
        icon: <Check size={16} />
      });
      // Redirigir al inicio después de unos segundos
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'No se pudo enviar la valoración',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh', backgroundColor: '#fcfaf7' }}>
        <Loader color="dark" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="sm" py={100}>
        <Alert icon={<AlertCircle size={16} />} title="Ups!" color="red" radius="md">
          {error}
          <div style={{ marginTop: 15 }}>
            <Button variant="outline" color="red" size="xs" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#fcfaf7', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container size="sm" py={50}>
        <Paper shadow="xl" p={40} radius="lg" withBorder>
          <Stack align="center" gap="xl">
            <div style={{ textAlign: 'center' }}>
              <Title order={2} c="#1c304a" mb="xs">Tu opinión nos importa</Title>
              <Text c="dimmed">Hola {reviewData?.authorName}, ¡gracias por confiar en Dual Focus Studio!</Text>
            </div>

            <Stack align="center" gap={5}>
              <Text fw={700} size="lg">¿Cómo calificarías nuestro servicio?</Text>
              <Rating
                size="xl"
                value={rating}
                onChange={setRating}
                defaultValue={5}
                color="yellow"
              />
            </Stack>

            <Textarea
              label="Contanos un poco más (opcional)"
              placeholder="¿Qué te pareció el trabajo? ¿Alguna sugerencia?"
              minRows={4}
              w="100%"
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              styles={{
                label: { fontWeight: 600, marginBottom: 8 }
              }}
            />

            <Button
              size="lg"
              bg="#1c304a"
              fullWidth
              loading={submitting}
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Enviar Valoración
            </Button>

            <Text size="xs" c="dimmed" ta="center">
              Tu valoración será visible en nuestra sección de clientes para ayudar a otros profesionales.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default ReviewPage;
