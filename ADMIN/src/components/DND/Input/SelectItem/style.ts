import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        width:'100%',
        zIndex:10,
        position:'relative'
      },
    paper: {
      marginRight: theme.spacing(2),
    },
    upDown:{
        position:'absolute',
        right:'0',
        float:'right'
    }
  }),
);

export default useStyles;