import React, { useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import logo from '../../assets/images/logo.png';
import google from '../../assets/images/google-play.png';
import apple from '../../assets/images/apple-store.png';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '40px',
    marginRight: theme.spacing(2),
  },
  storeLogo: {
    height: 60,
  },
  menu: {
    fontFamily: 'Cool Sans',
    fontSize: '1em',
  },
  advisor: {
    fontFamily: 'Golden Ranger',
    color: theme.palette.primary.main,
    fontSize: '1.5em',
  },
  bottomSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
}));

interface FooterProps {
  mini?: boolean;
}

const Footer: React.FC<FooterProps> = ({ mini }) => {
  const classes = useStyles();
  const footer = useRef<HTMLElement | null>();

  return (
    <footer className={classes.root}>
      {!mini && (
        <>
          <Grid
            container
            direction="row"
            spacing={10}
            justify="space-around"
            alignItems="flex-start"
            style={{ marginBottom: 16 }}
          >
            <Grid
              item
              container
              direction="column"
              alignItems="center"
              style={{ width: 'auto' }}
            >
              <Grid item>
                <Typography
                  variant="h4"
                  component="h2"
                  align="left"
                  className={classes.logoContainer}
                >
                  <img src={logo} alt="logo" className={classes.logo} />
                  <span className={classes.menu}>Menu</span>{' '}
                  <span className={classes.advisor}>Advisor</span>
                </Typography>
              </Grid>
              <Grid
                item
                container
                direction="row"
                spacing={2}
                justify="flex-start"
                alignItems="center"
              >
                <Grid item>
                  <img
                    src={apple}
                    alt="apple store logo"
                    className={classes.storeLogo}
                    style={{ height: 41 }}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={google}
                    alt="google play logo"
                    className={classes.storeLogo}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              style={{ width: 'auto', marginTop: -8 }}
              spacing={4}
            >
              <Grid
                item
                component={Link}
                to="/about"
                xs={'auto'}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  align="left"
                  className="translate"
                >
                  A propos
                </Typography>
              </Grid>
              <Grid
                item
                component={Link}
                to="/comment"
                xs={'auto'}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  align="left"
                  className="translate"
                >
                  Commentaire
                </Typography>
              </Grid>
              <Grid
                item
                component={Link}
                to="/help"
                xs={'auto'}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  align="left"
                  className="translate"
                >
                  Aide
                </Typography>
              </Grid>
              <Grid
                item
                component={Link}
                to="/FAQs"
                style={{ textDecoration: 'none', color: 'black' }}
                xs={'auto'}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  align="left"
                  className="translate"
                >
                  FAQs
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider />
        </>
      )}
      <div
        style={!mini ? { marginTop: '30px' } : undefined}
        className={classes.bottomSection}
      >
        <Typography variant="body1">
          {`© ${new Date().getUTCFullYear()} Menu Advisor.`}
        </Typography>
      </div>
    </footer>
  );
};

export default Footer;
