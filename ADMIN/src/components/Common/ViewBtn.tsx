import React from 'react';
import { Button, ButtonProps, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

const ViewButton: React.FC<ButtonProps> = (props) => {
  return (
    <Tooltip title="Voir le restaurant">
      <Button
        color="default"
        variant="contained"
        style={{
          minWidth: 'fit-content',
          borderRadius: 4,
          padding: 6,
          margin: 4,
        }}
        {...props}
      >
        <VisibilityIcon />
      </Button>
    </Tooltip>
  );
};

export default ViewButton;
