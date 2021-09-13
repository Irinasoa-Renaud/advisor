import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { CardActionArea } from '@material-ui/core';
import { connect, MapDispatchToProps } from 'react-redux';
import RootState from '../redux/types';
import { changeShowPrice } from '../redux/actions/setting';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(30),
    height: theme.spacing(30),
  },
}));

interface CircleImageDispatchProps {
  setPrix: (value: boolean) => void;
}

interface CircleImageOwnProps {
  name: string;
  url: string;
}

type CircleImageProps = CircleImageDispatchProps & CircleImageOwnProps;

const CircleImage: React.FC<CircleImageProps> = ({ name, url, setPrix }) => {
  const history = useHistory();
  const classes = useStyles();

  const click = () => {
    history.push('/foods/' + name);
    setPrix(true);
  };

  return (
    <Grid container direction="column" style={{ textDecoration: 'none' }}>
      <CardActionArea onClick={click}>
        <Grid item>
          <Avatar alt="Remy Sharp" src={url} className={classes.large} />
        </Grid>
        <Grid item>
          <Typography
            variant="h6"
            color="textSecondary"
            align="center"
            style={{ marginTop: '10px' }}
          >
            {name}
          </Typography>
        </Grid>
      </CardActionArea>
    </Grid>
  );
};

const mapDispatchToProps: MapDispatchToProps<
  CircleImageDispatchProps,
  CircleImageOwnProps
> = (dispatch) => ({
  setPrix: (value) => dispatch(changeShowPrice(value)),
});

const ConnectedCircleImage = connect<
  {},
  CircleImageDispatchProps,
  CircleImageOwnProps,
  RootState
>(
  null,
  mapDispatchToProps,
)(CircleImage);

export default ConnectedCircleImage;
