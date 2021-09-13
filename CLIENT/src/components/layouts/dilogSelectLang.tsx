import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';


export interface IDialogLang {
    listLang: any;
    changeLang: (data: any) => void;
}

const DialogLang = (props: any) => {

    const { listLang, changeLang } = props as IDialogLang;
    const [selectedValue, setSelectedValue] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {

        const url = decodeURI(window.location.href);

        if (selectedValue.length > 0) {
            return;
        }

        if (url.includes('multiple')) {

            setOpen(true);

            const array = JSON.parse(url.split('&')[1].split(':')[1]).filter((items: any) => items !== "");

            const arrayNoDuplicate: any[] = [];

            array.map((items: string) => {

                if (!arrayNoDuplicate.includes(items)) {
                    arrayNoDuplicate.push(items)
                }

            });

            let lang = {};

            arrayNoDuplicate.forEach((items: string) => {
                lang = {
                    ...lang,
                    [items]: listLang[items]
                }
            })


            setSelectedValue(Object.keys(lang))

        }

    },[setOpen])

    const handleClose = (value: string) => {
        setOpen(false);
    };

    const handleListItemClick = (e: any) => {
        setOpen(false);
    }

    const selectLangue = (data: any) => {

        changeLang(data)

        setOpen(false);

    }

    return (<div>
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">Language :</DialogTitle>
            <List>
                {
                    selectedValue.map((data: any) => {

                        const { src, title } = listLang[data as any];
                        return (<ListItem button
                            key={title}
                            onClick={() => selectLangue(data as any)}
                        >
                            <ListItemAvatar>
                                <Avatar src={src} alt={title} />
                            </ListItemAvatar>
                            <ListItemText primary={title} />
                        </ListItem>)
                    })
                }

            </List>
        </Dialog>
    </div>
    );
}

export default DialogLang;