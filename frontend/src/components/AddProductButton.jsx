import React from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton } from '@mui/material';

export default function AddProductButton({ onClick }) {
  return (
    <IconButton onClick={onClick} color="primary" aria-label="add new product" size="large">
      <AddCircleIcon sx={{ fontSize: 40 }} />
    </IconButton>
  );
}
