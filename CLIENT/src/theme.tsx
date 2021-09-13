import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#dc143c',
      light: '#da657c',
    },
    background: {
      default: '#ffffff',
    },
  },
  mixins: {
    toolbar: {
      height: 90,
    },
  },
  typography: {
    fontFamily: 'Raleway',
  },
});

theme.typography.h1 = {
  ...theme.typography.h1,
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.1rem',
  },
};

theme.typography.h2 = {
  ...theme.typography.h2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
};

theme.typography.h3 = {
  ...theme.typography.h3,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.55rem',
  },
};

theme.typography.h4 = {
  ...theme.typography.h4,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.35rem',
  },
};

theme.typography.h5 = {
  ...theme.typography.h5,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.15rem',
  },
};

theme.typography.h6 = {
  ...theme.typography.h6,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
};

theme.typography.body1 = {
  ...theme.typography.body1,
  [theme.breakpoints.down('sm')]: {
    fontSize: '.9rem',
  },
};

theme.typography.body2 = {
  ...theme.typography.body2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '.8rem',
  },
};

theme.typography.button = {
  ...theme.typography.button,
  [theme.breakpoints.down('sm')]: {
    fontSize: '.75rem',
  },
};

theme.typography.subtitle1 = {
  ...theme.typography.subtitle1,
  [theme.breakpoints.down('sm')]: {
    fontSize: '.8rem',
  },
};

export default theme;
