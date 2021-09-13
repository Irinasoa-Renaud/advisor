import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    input: {
        margin: '0 1vh',
        '&:focus': {
            outline: 'none'
        },
        '&:active': {
            outline: 'none'
        },
        border: 'none',
        width: '100%'
    },
    inputAll: {
        padding: '2vh 1vh',
        border: '1.5px solid #CCC',
        borderRadius: '0.5vh',
        cursor: 'text',
        width: '100%',
    },
    upDown: {
        right: '0',
        float: 'right',
        alignItems: 'center',
        margin: 0,
        padding: 0,
    }
});

export default useStyles;