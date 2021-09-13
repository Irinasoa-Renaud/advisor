import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    heading: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(3.5),
    },
    title: {
        fontWeight: 700,
        marginLeft: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            maxWidth: 120,
        },
    },
    sliderControls: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(3),
        '&>a': {
            color: 'black',
            marginRight: theme.spacing(2),
        },
        '&>button+button': {
            marginLeft: theme.spacing(1),
        },
    },
}));


export default useStyles;
