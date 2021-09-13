import { FC, useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import Chip from '@material-ui/core/Chip';
import { ItemTypes } from './ItemTypes'
import { XYCoord } from 'dnd-core';
import { Avatar } from '@material-ui/core';
import FastfoodIcon from '@material-ui/icons/Fastfood';

const style = {
  backgroundColor: 'white',
  cursor: 'move',
  margin: '0.5vh 0.25vh',
  width: 'auto',
  padding: '0.5vh'
}

export interface CardProps {
  id: any;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  remove: (id: number) => () => void;
  imageURL: string;
  price?: any;
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Card: FC<CardProps> = ({ id, text, index, imageURL, moveCard, remove, price }) => {

  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  return (
    <div ref={ref} style={{ ...style, opacity, display: 'inline-table' }} data-handler-id={handlerId}>
      <Chip
        label={!price ? text : `${text} ( ${price} € )`}
        avatar={imageURL ? (<Avatar alt={text} src={imageURL} />) : (<FastfoodIcon />)}
        onDelete={remove(id)} />
    </div>
  )
}
