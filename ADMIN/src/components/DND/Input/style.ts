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
        border: '1.5px solid #CCC',
        borderRadius: '0.5vh',
        cursor: 'text',
        width: '100%',
        display: 'block'
    },
    upDown: {
        right: '5vh',
        float: 'right',
        alignItems: 'center',
        margin: '1vh',
        padding: 0,
        position: 'absolute',
    }
});

export default useStyles;