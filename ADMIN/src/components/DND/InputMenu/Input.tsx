import { FC, useState, useCallback, useMemo } from 'react';
import { Card } from './Card';
import update from 'immutability-helper';
import MenuListComposition from './SelectItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Button from '@material-ui/core/Button';
import Accompaniment from '../../../models/Accompaniment.model';
import {
  Grid,
} from '@material-ui/core';
import useStyles from './style';

const style = {
  width: 'auto',
}

interface InterfaceInput {
  listMenu: any[]
  disabled: boolean;
  setMenu: (e: any) => void;
  value: any
}

const InputDnd: FC<InterfaceInput> = (props:any) => {

  const {
    listMenu,
    disabled,
    setMenu,
    value
  } = props as InterfaceInput;

  const classes = useStyles();
  const [ref, setref] = useState<any>();
  const [open, setOpen] = useState<boolean>(false);
  const [cards, setCards] = useState<any[] | []>(value)
  const [text, setText] = useState("");

  useMemo(() => {
    setCards(value)
  }, [setCards, value])

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = cards[dragIndex]

      setMenu(update(cards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      }))

      setCards(
        update(cards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
      )

    },
    [cards, setMenu],
  )

  const removeById = (id: number) => () => {

    const newList = cards.filter((items: any) => items._id !== id);

    setMenu(newList)
    setCards(newList);

  }

  const renderCard = (card: Accompaniment, index: number) => {
    return (
      <Card
        key={card._id}
        index={index}
        id={card._id}
        text={card.name}
        moveCard={moveCard}
        remove={removeById}
      />
    )
  }

  const handleChange = (e: any) => {
    setText(e.target.value);
  }

  const toggleOpen = () => {
    setOpen(!open);
  }

  const onSelected = (data: Accompaniment) => {
    setMenu([...cards, data]);
    setCards([...cards, data]);
  }

  const deleteElement = (e: any) => {

    if (text === "" && cards.length > 0 && e.code === "Backspace") {

      let lastedArray = cards;
      lastedArray.pop();
      setMenu(lastedArray);

      setCards(lastedArray);

    }

  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container={true}>
        <Grid item={true} xs={12} md={12}>
          <div
            className={classes.inputAll}
            onClick={() => {
              ref.focus();
            }}
          >
            <div style={{ ...style, display: 'inline-block' }}>{cards.map((card: any, i: any) => renderCard(card, i))}</div>
            <div style={{ display: 'inline-block' }}>
              <input
                type="text"
                onChange={handleChange}
                value={text}
                ref={(ip) => setref(ip)}
                className={classes.input}
                onKeyUp={deleteElement}
              />
            </div>
            <Button
              className={classes.upDown}
              onClick={toggleOpen}
              disabled={disabled}
            >
              {!open ? (<ArrowDropDownIcon />) : (<ArrowDropUpIcon />)}
            </Button>

          </div >
        </Grid>

        <Grid item={true} xs={12} md={12}>
          <MenuListComposition
            listSelected={listMenu.filter((items: any) => !cards
              .map((cards: any) => cards._id)
              .includes(items._id))}
            onSelected={onSelected}
            open={open}
            setOpen={toggleOpen}
          />
        </Grid>
      </Grid>

    </DndProvider >
  )
}


export default InputDnd