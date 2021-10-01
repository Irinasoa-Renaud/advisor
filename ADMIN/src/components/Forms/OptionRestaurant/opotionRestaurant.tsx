import { FC } from 'react';
import ComponentForm from './ComponentForm';

interface Iprops {
    isDelivery: boolean;
    aEmporter: boolean;
    setValue: (e: any) => void;
    value: any;
}

const OptionRestaurant: FC<Iprops> = (props: any) => {

    const { isDelivery, aEmporter, setValue, value } = props as Iprops;

    return (<>

        <ComponentForm
            isView={isDelivery}
            setValue={setValue}
            title="Paramètres remise de livraison"
            values={value}
            type="isDelivery"
        />

        <ComponentForm
            isView={isDelivery}
            setValue={setValue}
            title="Paramètres remise da a emporter"
            values={value}
            type="aEmporter"

        />

    </>)

}

export default OptionRestaurant;
