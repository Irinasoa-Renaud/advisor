import React from 'react';
import {
  Grid,
  GridItemsAlignment,
  GridJustification,
  Typography,
} from '@material-ui/core';

interface NoResultProps {
  text?: string;
  height?: string | number;
  justify?: GridJustification;
  alignItems?: GridItemsAlignment;
}

const NoResult: React.FC<NoResultProps> = ({
  text,
  height = 400,
  justify = 'center',
  alignItems = 'center',
}) => (
  <Grid container justify={justify} alignItems={alignItems} style={{ height }}>
    <Typography variant="h5" color="textSecondary" className="translate">
      {text ? text : 'Aucun résultat'}
    </Typography>
  </Grid>
);

export default NoResult;
