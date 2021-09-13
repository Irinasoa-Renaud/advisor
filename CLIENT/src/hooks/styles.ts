import { makeStyles } from '@material-ui/core/styles';

export const useTypographyStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 700,
  },
  categoryTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(2),
  },
  link: {
    textDecoration: 'none',
    fontFamily: 'Raleway',
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
}));
