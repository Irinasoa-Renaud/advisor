import { FC, useState, useCallback, useMemo } from 'react'
import { Card } from './Card'
import update from 'immutability-helper'
import MenuListComposition from './SelectItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@material-ui/core/Button';
import Accompaniment from '../../../models/Accompaniment.model';
import {
  Grid,
} from '@material-ui/core';
import useStyles from './style';

interface InterfaceInput {
  listAccompagnement: Accompaniment[];
  setUpdatePrice: (e: boolean) => void;
  setCurrentOption: (data: Accompaniment) => void;
  disabled: boolean;
  setAccompagnement: (e: any) => void;
  index: any;
  value: any;
  updatePrice: (data: any) => void;
}

const InputDnd: FC<InterfaceInput> = (props) => {

  const {
    listAccompagnement,
    setUpdatePrice,
    setCurrentOption,
    disabled,
    setAccompagnement,
    index,
    value,
    updatePrice
  } = props as InterfaceInput;

  const classes = useStyles();
  const [ref, setref] = useState<any>();
  const [open, setOpen] = useState<boolean>(false);
  const [cards, setCards] = useState<Accompaniment[] | []>([])
  const [text, setText] = useState("");

  useMemo(() => {
    setCards(value.map((item: any, i: any) => { return { ...item, id: i + 1 } }))
  }, [setCards, value]);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = cards[dragIndex]

      setAccompagnement({
        arrayAccompagnement: update(cards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
        index: index
      });

      setCards(
        update(cards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
      )

    },
    [cards, setAccompagnement, index],
  )

  const removeById = (id: number) => () => {

    const newList = cards.filter((items: any) => items._id !== id);
    setAccompagnement({
      arrayAccompagnement: newList,
      index: index
    });
    setCards(newList);

  }

  const renderCard = (card: Accompaniment, index: number) => {
    return (
      <Card
        imageURL={card.imageURL}
        key={card._id}
        index={index}
        id={card._id}
        text={card.name}
        price={card.price ? (card.price?.amount / 100) : undefined}
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
    setUpdatePrice(true);
    setCurrentOption(data);
    //  updatePrice(data);
    setAccompagnement({
      arrayAccompagnement: [...cards, data],
      index: index
    });
    setCards([...cards, data]);
  }

  const deleteElement = (e: any) => {

    if (text === "" && cards.length > 0 && e.code === "Backspace") {

      let lastedArray = cards;
      lastedArray.pop();

      setAccompagnement({
        arrayAccompagnement: lastedArray,
        index: index
      });

      setCards(lastedArray);

    }

  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container={true}>
        <Grid item={true} xs={12} md={12}>
          <div
            className={classes.inputAll}
          // onClick={() => {
          //   ref.focus();
          // }}
          >
            <div style={{
              width: '90%',
              height: 'auto',
              display: 'inline-table'
            }}>
              {cards
                .map((item: any, i: any) => { return { ...item, id: i + 1 } })
                .map((card: any, i: any) => renderCard(card, i))}</div>
            <div style={{
              width: '10%',
              height: '6vh',
              display: 'inline-table'
            }}>
              <Button
                className={classes.upDown}
                onClick={toggleOpen}
                disabled={disabled}
              >
                {!open ? (<ArrowDropDownIcon />) : (<ArrowDropUpIcon />)}
              </Button>

            </div>

          </div >
        </Grid>

        <Grid item={true} xs={12} md={12}>
          <MenuListComposition
            listSelected={listAccompagnement.filter((items: Accompaniment) => !cards
              .map((cards: Accompaniment) => cards._id)
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