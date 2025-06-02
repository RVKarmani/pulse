import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

type FormData = {
  channel_url: string;
  mode: string;
};

const YoutubeSub: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    channel_url: '',
    mode: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error on input change
  };

  const isValidYoutubeUrl = (url: string) => {
    const pattern = /^https:\/\/www\.youtube\.com\/@[\w\-]+$/;
    return pattern.test(url);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidYoutubeUrl(formData.channel_url)) {
      setError('Channel URL must be in the format https://www.youtube.com/@ChannelHandle');
      return;
    }

    const match = formData.channel_url.match(/^https:\/\/www\.youtube\.com\/@([\w\-]+)$/);
    const channelHandle = match?.[1];

    if (!channelHandle) {
      setError('Failed to extract channel handle.');
      return;
    }

    try {
      const payload = {
        channel_handle: channelHandle,
        mode: formData.mode,
      };

      const response = await axios.post('http://localhost:3000/setup', payload);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Subscribe to YouTube Channel
        </Typography>

        <TextField
          fullWidth
          label="Channel URL"
          name="channel_url"
          value={formData.channel_url}
          onChange={handleChange}
          required
          margin="normal"
          placeholder="https://www.youtube.com/@ChannelHandle"
        />

        <TextField
          fullWidth
          label="Mode"
          name="mode"
          value={formData.mode}
          onChange={handleChange}
          required
          margin="normal"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default YoutubeSub;
