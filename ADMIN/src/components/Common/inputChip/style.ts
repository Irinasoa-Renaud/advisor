import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    dropzone: {
        height: '100%',
        margin: '1vh'
    },
    marginTop: {
        marginTop: '20px'
    },
    padding: {
        padding: '0 5vh'
    },
    paddingStripe: {
        padding: '2vh 5vh',
        backgroundColor: '#DCDCDC',
        margin: '1vh',
        borderRadius: '2vh'
    },
    input: {
        width: '100%',
        border: '1px solid #CDCDCD',
        borderRadius: '0.5vh',
        margin: '1vh 0'
    },
    inputForm: {
        height: '5vh',
        margin: '1vh',
        border: 'none'
    }
}));

export default useStyles;