import React, { FC, useCallback, } from 'react'
import { Card } from './Card'
import update from 'immutability-helper'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


const style = {
	width: '400%',
}

export interface Item {
	id: number
	html: string
}

export interface ContainerState {
	cards: Item[]
}

const Container: FC<any> = (props: any) => {

	const {
		updateList,
		list,
		setUpdatePrice,
		setCurrentOption,
		selectedResto,
		disableAll,
		accompanimentOptions,
		updatePrice,
		setAddEdit
	} = props as any;

	const moveCard = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			const dragCard = list[dragIndex]

			updateList(update(list, {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragCard],
				],
			}).filter((items: any) => items.id))

		},
		[list, updateList],
	)

	const onchange = (e: any) => {

		const { value, name, index } = e;
		let newCard = list;
		newCard[index][name] = value;
		updateList(newCard);

	}

	const removeAccompaniment = (e: any) => {
		updateList(list.filter((items: any) => items.id !== e));
	}

	const setAccompagnement = (e: any) => {

		const { arrayAccompagnement, index } = e;
		let newCard: any[] = list;
		newCard[index].items = arrayAccompagnement;
		updateList(newCard);

	}

	return (
		<>
			<DndProvider backend={HTML5Backend}>

				<div style={style}>
					{list.map((card: any, index: any) => <div key={card.id} onClick={() => setAddEdit(card, index)}>
						<Card
							index={index}
							id={card.id}
							onchange={onchange}
							html={card}
							moveCard={moveCard}
							removeAccompaniment={removeAccompaniment}
							disabled={!selectedResto && disableAll}
							accompanimentOptions={accompanimentOptions}
							setUpdatePrice={setUpdatePrice}
							setCurrentOption={setCurrentOption}
							setAccompagnement={setAccompagnement}
							updatePrice={updatePrice}
						/>
					</div>)}

				</div>
			</DndProvider>
		</>

	)
}


export default Container;