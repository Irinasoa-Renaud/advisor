import { useState, FC } from 'react';
import {
    FormControlLabel,
    Grid,
    TextField,
    Typography,
    InputAdornment
} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IOSSwitch from '../../Common/IOSSwitch';

interface Iprops {
    isView: boolean;
    setValue: (e: any) => void;
    title: string;
    values: any;
    type: string;
}

const ComponentForm: FC<Iprops> = (props: any) => {

    const { isView, setValue, title, values, type } = props as Iprops;

    const [open, setOpen] = useState(false);

    const onchange = (e: any) => {

        const { name, value } = e.target;

        const allvalue = {
            ...values
        }

        allvalue[type][name] = value;

        setValue(allvalue);

    }

    return (<>
        <Grid item xs={12}>

            <div
                style={{
                    cursor: 'pointer'
                }}
                onClick={() => setOpen(!open)}
            >

                <Grid container={true}>

                    <Grid item xs>
                        <Typography variant="h4" style={{ fontWeight: 'bold' }} gutterBottom>
                            {title}
                        </Typography>
                    </Grid>

                    <Grid item>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </Grid>

                </Grid>

            </div>

            <Collapse in={open}>

                <Typography variant="h5" gutterBottom>
                    Remise
                </Typography>

                <TextField
                    name="discount"
                    type="number"
                    placeholder="Remise"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">{values[type]?.isPriceFix ? `€` : `%`}</InputAdornment>
                        ),
                    }}
                    variant="outlined"
                    fullWidth
                    defaultValue={values[type]?.discount}
                    onChange={setValue}
                />

                <FormControlLabel
                    control={
                        <IOSSwitch
                            defaultChecked={values[type]?.discountIsPrice}
                            onChange={setValue}
                            name="discountIsPrice"
                        />
                    }
                    label="Le remise est un prix fixe"
                />

            </Collapse>

        </Grid>
    </>)

}

export default ComponentForm;
