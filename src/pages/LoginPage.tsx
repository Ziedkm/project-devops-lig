// src/pages/LoginPage.tsx

// --- IMPORTATIONS ---
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

// --- NOS IMPORTS DE LOGIQUE ---
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- IMPORTS DE ZIED ---
import { WavyBackground } from '../components/WavyBackground';
import PerfomaItLogo from '../assets/logo-white.jpg';

export const LoginPage = () => {
  // --- ÉTATS ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HOOKS DE LOGIQUE ---
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirige si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);


  // --- LA FONCTION DE CONNEXION ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

    } catch (error: any) {
      setError(error.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // --- LE JSX ---
  return (
    // -- MODIFICATION CLÉ --
    // On utilise position: 'fixed' pour s'assurer que ce conteneur couvre
    // toute la fenêtre du navigateur, peu importe les styles des parents.
    // Cela garantit un centrage parfait sur tous les appareils.
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // On ajoute un peu de padding pour éviter que le formulaire
        // ne touche les bords sur les écrans très étroits.
        padding: 2, 
      }}
    >
      <WavyBackground />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ zIndex: 1 }} // S'assure que le formulaire est au-dessus du fond
      >
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 3, sm: 4 },
            // La largeur maximale est définie, mais elle ne dépassera pas la largeur de l'écran grâce au padding du parent.
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Box
              component="img"
              src={PerfomaItLogo}
              alt="Logo PerfomaIT"
              sx={{ height: 190, mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Bienvenue
            </Typography>
            <Typography variant="subtitle1">
              Connectez-vous pour gérer vos missions
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
            />

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};