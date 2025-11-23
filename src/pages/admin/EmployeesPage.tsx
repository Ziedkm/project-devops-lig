// src/pages/EmployeesPage.tsx

console.log("--- [FILE LOAD] Reached EmployeesPage.tsx ---");
import { useState } from 'react';

// Les imports sont corrects, Stack et useTheme sont bien présents.
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  TextField, 
  InputAdornment, 
  useMediaQuery, 
  Stack, 
  useTheme 
} from '@mui/material';
import { DataGrid, type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keyframes } from '@emotion/react';
import { toast } from 'react-hot-toast';

// Imports des composants et services
import EmployeeCard from '../../features/employees/EmployeeCard';
import { getEmployees, deleteEmployee, createEmployee, updateEmployee, type Employee } from '../../services/apiEmployees';
import AddEmployeeModal from '../../features/employees/AddEmployeeModal';
import EditEmployeeModal from '../../features/employees/EditEmployeeModal'; 

// Imports des icônes
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Animation pour une apparition fluide des éléments
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/**
 * Page de gestion des employés.
 * Affiche une liste d'employés sous forme de tableau ou de cartes (sur mobile),
 * et permet la création, la modification, la suppression et la recherche.
 */
function EmployeesPage() {
  // Hooks pour la gestion de l'état et des requêtes
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // États locaux pour les modales et la recherche
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Requête pour récupérer la liste des employés
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  // --- CORRECTIONS & TRADUCTIONS ---

  // Mutation pour la création d'un employé
  const { mutate: performCreate, isPending: isCreating } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success('Employé créé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setAddModalOpen(false); // Ferme la modale après succès
    },
    onError: (err: Error) => toast.error(`Erreur : ${err.message}`),
  });
  
  // Mutation pour la mise à jour d'un employé
  const { mutate: performUpdate, isPending: isUpdating } = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      toast.success('Employé mis à jour avec succès !');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditModalOpen(false); // Ferme la modale après succès
    },
    onError: (err: Error) => toast.error(`Erreur : ${err.message}`),
  });

  // Mutation pour la suppression d'un employé
  const { mutate: performDelete } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success('Employé supprimé avec succès.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: Error) => toast.error(`Erreur : ${err.message}`),
  });
  
  // Fonctions de gestion des actions de l'utilisateur
  const handleEditClick = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Confirmation avant une action destructive
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.')) {
      performDelete(id);
    }
  };
  
  // Filtrage des employés en fonction du terme de recherche
  const filteredEmployees = employees?.filter(emp =>
    emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Définition des colonnes pour le DataGrid
  const columns: GridColDef<Employee>[] = [
    { field: 'first_name', headerName: 'Prénom', flex: 1, minWidth: 150 },
    { field: 'last_name', headerName: 'Nom', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'E-mail', flex: 1.5, minWidth: 200 },
    { field: 'role', headerName: 'Rôle', flex: 0.7, minWidth: 120 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Modifier" onClick={() => handleEditClick(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Supprimer" onClick={() => handleDelete(params.row.id_emp)} />,
      ],
    },
  ];

  // Affichage d'un indicateur de chargement
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
        {/* En-tête de la page */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={4}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">Gestion des Employés</Typography>
            <Typography color="text.secondary">Consultez, ajoutez et gérez les profils des employés.</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setAddModalOpen(true)}
            sx={{ textTransform: 'none', bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Ajouter un Employé
          </Button>
        </Stack>

        {/* Contenu principal avec barre de recherche et liste */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par nom, prénom ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
            }}
            sx={{ mb: 3 }}
          />
          {isMobile ? (
            // Vue mobile : liste de cartes
            <Stack spacing={2}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <EmployeeCard
                    key={employee.id_emp}
                    employee={employee}
                    onEdit={handleEditClick}
                    // --- FIX #3: Correction du handler onDelete ---
                    // On passe une fonction fléchée pour capturer l'ID de l'employé spécifique.
                    onDelete={() => handleDelete(employee.id_emp)}
                  />
                ))
              ) : (
                <Typography color="text.secondary" sx={{ p: 5, textAlign: 'center' }}>
                  Aucun employé trouvé.
                </Typography>
              )}
            </Stack>
          ) : (
            // Vue bureau : tableau de données
            <Box sx={{ height: '50vh', width: '100%' }}>
              <DataGrid
                rows={filteredEmployees}
                columns={columns}
                getRowId={(row) => row.id_emp}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                  },
                  '& .MuiDataGrid-cell:focus-within': {
                    outline: 'none !important',
                  },
                }}
                slots={{ 
                  noRowsOverlay: () => (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                      Aucun employé trouvé.
                    </Stack>
                  )
                }}
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Modales pour l'ajout et la modification */}
      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={performCreate}
        isSaving={isCreating}
      />
      {employeeToEdit && (
        <EditEmployeeModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEmployeeToEdit(null);
          }}
          onSave={performUpdate}
          isSaving={isUpdating}
          employeeToEdit={employeeToEdit}
        />
      )}
    </>
  );
}

export default EmployeesPage;