// src/ui/Header.tsx
import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import { Menu } from 'lucide-react'; // Import the menu icon
import { ActiveMissionDisplay } from './ActiveMissionDisplay';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'background.paper', 
        boxShadow: 'inset 0 -1px 0 0 #e5e7eb',
        color: 'text.primary',
        zIndex: 100, // Lower than sidebar
      }}
    >
      <Toolbar>
        {/* Mobile menu button - only visible on mobile */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open menu"
          onClick={onOpenSidebar}
          sx={{
            mr: 2,
            display: { xs: 'block', md: 'none' }, // Show on mobile, hide on desktop
          }}
        >
          <Menu size={24} />
        </IconButton>
        
        {/* Espace flexible pour pousser les éléments à droite */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* --- LE COMPOSANT DYNAMIQUE EST ICI --- */}
        <ActiveMissionDisplay />
        
        {/* Tu peux ajouter d'autres éléments ici comme un menu de profil, etc. */}
        <Box sx={{ ml: 2 }}>
          {/* Par exemple: <UserMenu /> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
