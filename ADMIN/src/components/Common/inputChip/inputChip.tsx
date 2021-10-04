import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Chip from '@material-ui/core/Chip';
import useStyles from './style';

interface DashboardProps {
    value: any[];
    updateValue: (data: any[]) => void;
    name: string;
}

const InputChip: React.FC<DashboardProps> = ({ value, updateValue, name }) => {

    const classes = useStyles();
    const [text, setUpdate] = useState("");

    const handleChangeLiraison = (e: any) => {
        const { name, value } = e.target;
        setUpdate(value);
    }

    const handleAddArray = () => {
        const lastValue: any[] = [...value];
        lastValue.push(text);
        updateValue(lastValue);
        (document.getElementById("inputForm") && document.getElementById("inputForm") as any).value = "";
    }

    return (
        <div
            className={classes.input}
        >
            <div
                style={{
                    width: '93%',
                    display: 'inline-block',
                }}
            >

                <div
                    style={{
                        display: 'inline-block'
                    }}
                >
                    {
                        value.length > 0 && value.map((items: any, index: any) => {
                            return <Chip
                                label={items}
                                key={items}
                                onDelete={() => updateValue(value.filter((item: any) => item !== items))}
                                style={{
                                    margin: '0.5vh 0.5vh'
                                }}
                            />
                        })
                    }
                </div>

                <div
                    style={{
                        display: 'inline-block'
                    }}
                >
                    <input
                        className={classes.inputForm}
                        name={name}
                        type="text"
                        onChange={handleChangeLiraison}
                        placeholder={name}
                        id="inputForm"
                        required
                    />
                </div>

            </div>

            <div
                style={{
                    width: '5%',
                    display: 'inline-block',
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    onClick={handleAddArray}
                >
                    <AddCircleIcon />
                </Button>
            </div>

        </div>


    );
}

export default InputChip
