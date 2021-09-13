import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../redux/types';
import { Grid } from '@material-ui/core';

interface ChoiceStateProps {
  showPrice: boolean;
  authenticated: boolean;
}

interface ChoiceDispatchProps {}
interface ChoiceOwnProps {
  value: string;
  onChange: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void;
}

type ChoiceProps = ChoiceStateProps & ChoiceDispatchProps & ChoiceOwnProps;

const Choice: React.FC<ChoiceProps> = ({
  value,
  onChange,
  authenticated,
  showPrice,
}) => {
  return (
    <Grid item container xs={12}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="command-type-label" htmlFor="command-type">
          Type de commande
        </InputLabel>
        <Select
          labelId="command-type-label"
          value={value}
          onChange={onChange}
          inputProps={{
            name: 'command-type',
            id: 'command-type',
          }}
        >
          {showPrice && (
            <MenuItem
              value={'delivery'}
              disabled={!authenticated}
              className="translate"
            >
              Livraison
            </MenuItem>
          )}
          <MenuItem value={'on_site'} className="translate">
            Sur place
          </MenuItem>
          <MenuItem value={'takeaway'} className="translate">
            À emporter
          </MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );
};

const mapStateToProps: MapStateToProps<
  ChoiceStateProps,
  ChoiceOwnProps,
  RootState
> = ({ setting: { showPrice }, auth: { authenticated } }) => ({
  showPrice,
  authenticated,
});

const ConnectedChoice = connect<
  ChoiceStateProps,
  ChoiceDispatchProps,
  ChoiceOwnProps,
  RootState
>(mapStateToProps)(Choice);

export default ConnectedChoice;
