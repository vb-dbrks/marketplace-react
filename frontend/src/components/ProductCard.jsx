import { Card, CardContent, Typography, Box, Link as MuiLink, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../context/useData';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const CARD_HEIGHT = 340;

const ProductCard = ({ product }) => {
  const { setFilters } = useData();

  const handleTagClick = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: [tag]
    }));
  };

  // Function to get certification status styling
  const getCertificationStatus = (certified) => {
    switch (certified) {
      case 'Yes':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          label: 'Certified',
          bgColor: '#e8f5e8',
          textColor: '#2e7d32'
        };
      case 'No':
        return {
          color: 'error',
          icon: <CancelIcon />,
          label: 'Not Certified',
          bgColor: '#ffebee',
          textColor: '#c62828'
        };
      case 'In Progress':
        return {
          color: 'warning',
          icon: <PendingIcon />,
          label: 'In Progress',
          bgColor: '#fff3e0',
          textColor: '#ef6c00'
        };
      case 'Digital X to populate':
        return {
          color: 'info',
          icon: <HelpIcon />,
          label: 'Pending',
          bgColor: '#e3f2fd',
          textColor: '#1565c0'
        };
      default:
        return {
          color: 'default',
          icon: <HelpIcon />,
          label: certified || 'Unknown',
          bgColor: '#f5f5f5',
          textColor: '#757575'
        };
    }
  };

  const certStatus = getCertificationStatus(product.certified);

  return (
    <Card sx={{
      height: CARD_HEIGHT,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      minWidth: 0, // Allow shrinking below content size
      '& > *': {
        minWidth: 0 // Ensure children can also shrink
      }
    }}>
      <CardContent sx={{
        height: '100%',
        p: 2,
        '&:last-child': { pb: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}>
        {/* Title and Certification Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to={`/${product.id}`}
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              },
              fontSize: '1rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              flex: 1
            }}
          >
            {product.name}
          </Typography>
          
          {/* Certification Status Chip */}
          <Chip
            icon={certStatus.icon}
            label={certStatus.label}
            size="small"
            variant="filled"
            sx={{
              backgroundColor: certStatus.bgColor,
              color: certStatus.textColor,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              minWidth: 'fit-content',
              '& .MuiChip-icon': {
                fontSize: '16px'
              }
            }}
          />
        </Box>

        {/* Description */}
        <Box sx={{
          height: '40px',
          overflowY: 'auto',
          mb: 1
        }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            {product.description}
          </Typography>
        </Box>

        {/* Type, Domain, Classification and Certification */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ marginRight: '4px' }}>Type:</strong>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.type}</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ marginRight: '4px' }}>Domain:</strong>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.domain}</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ marginRight: '4px' }}>Classification:</strong>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.classification}</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ marginRight: '4px' }}>Status:</strong>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              color: certStatus.textColor,
              fontWeight: 500
            }}>
              {certStatus.label}
            </span>
          </Typography>
        </Box>

        {/* Tags */}
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          my: 1
        }}>
          {product.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              onClick={() => handleTagClick(tag)}
              sx={{
                height: '20px',
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' },
              }}
            />
          ))}
        </Box>

        {/* Links */}
        <Box sx={{ 
          mt: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1
        }}>
          {product.databricks_url && (
            <MuiLink 
              href={product.databricks_url}
              target="_blank"
              rel="noopener"
              sx={{ 
                color: '#ff6600',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Explore in Databricks
            </MuiLink>
          )}
          {product.ai_bi_genie_url && (
            <MuiLink 
              href={product.ai_bi_genie_url}
              target="_blank"
              rel="noopener"
              sx={{ 
                color: '#1976d2',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Ask Genie
            </MuiLink>
          )}
          {product.tableau_url && (
            <MuiLink 
              href={product.tableau_url}
              target="_blank"
              rel="noopener"
              sx={{ 
                color: '#009688',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Open Tableau
            </MuiLink>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
