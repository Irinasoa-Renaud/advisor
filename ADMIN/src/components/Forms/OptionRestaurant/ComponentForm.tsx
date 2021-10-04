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
import Input from '../../Common/inputChip';

interface Iprops {
    isView: boolean;
    setValue: (e: any) => void;
    title: string;
    values: any;
    type: string;
    code?: boolean;
}

const ComponentForm: FC<Iprops> = (props: any) => {

    const { isView, setValue, title, values, type, code } = props as Iprops;

    const [open, setOpen] = useState(false);
    const [discountIsPrice, setdiscountIsPrice] = useState(values.discount[type]?.discountIsPrice);

    const onchange = (e: any) => {

        const { name, value, checked } = e.target;

        const discount = {
            ...values.discount,
            [type]: {
                ...values.discount[type],
                [name]: name === 'discountIsPrice' ? checked : value
            }
        }

        name === 'discountIsPrice' && setdiscountIsPrice(!discountIsPrice);

        setValue({
            ...values,
            discount: discount
        });

    }

    const addCodePromo = (e: any[]) => {

        const discount = {
            ...values.discount,
            [type]: {
                ...values.discount[type],
                code: [...e]
            }
        }

        setValue({
            ...values,
            discount: discount
        });

    }

    return (<>

        {isView && (
            <div style={{
                border: '1px dashed #CDCDCD',
                width: '100%',
                margin: '1vh 0',
                padding: '2vh'
            }}>
                <Grid item xs={12}>

                    <div
                        style={{
                            cursor: 'pointer'
                        }}
                        onClick={() => setOpen(!open)}
                    >

                        <Grid container={true}>

                            <Grid item xs>
                                <Typography variant="h6" style={{ fontWeight: 'bold' }} gutterBottom>
                                    {title}
                                </Typography>
                            </Grid>

                            <Grid item>
                                {open ? <ExpandLess /> : <ExpandMore />}
                            </Grid>

                        </Grid>

                    </div>

                    <Collapse in={open}>

                        {code && (
                            <Input
                                value={values.discount[type]?.code || []}
                                updateValue={addCodePromo}
                                name="code"
                            />
                        )}

                        <TextField
                            name="value"
                            type="number"
                            placeholder="Remise"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">{discountIsPrice ? `€` : `%`}</InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            fullWidth
                            defaultValue={values.discount[type]?.value}
                            onChange={onchange}
                        />

                        <FormControlLabel
                            control={
                                <IOSSwitch
                                    defaultChecked={discountIsPrice}
                                    onChange={onchange}
                                    name="discountIsPrice"
                                />
                            }
                            label="Le remise est un prix fixe"
                        />

                    </Collapse>

                </Grid>
            </div>

        )
        }

    </>)

}

export default ComponentForm;
