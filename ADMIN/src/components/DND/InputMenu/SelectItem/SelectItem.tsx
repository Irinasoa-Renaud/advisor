import React, { FC } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import useStyles from './style';
import Accompaniment from '../../../../models/Accompaniment.model';

interface IMenuListComposition {
    listSelected: Accompaniment[];
    onSelected: (text: Accompaniment) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const MenuListComposition: FC<IMenuListComposition> = (props: IMenuListComposition) => {

    const { listSelected, onSelected, open, setOpen } = props as IMenuListComposition;
    const classes = useStyles();
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const handleClose = (event?: React.MouseEvent<EventTarget>) => {
        if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const selected = (text: Accompaniment) => () => {
        onSelected(text)
        handleClose();
    }

    return (
        <div className={classes.root}>

            <Popper open={open} style={{ width: '100%', position: 'relative' }} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: 'bottom' }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                    {listSelected.length > 0 ?
                                        listSelected.map((items: Accompaniment) => <MenuItem key={items._id} onClick={selected(items)}>{items.name}</MenuItem>) :
                                        (<div style={{padding:'2vh',textAlign:'center'}}>Aucun choix disponible</div>)
                                    }
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    );
}

export default MenuListComposition