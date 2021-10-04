import { FC } from 'react';
import ComponentForm from './ComponentForm';

interface Iprops {
    isDelivery: boolean;
    aEmporter: boolean;
    setValue: (e: any) => void;
    value: any;
    code: boolean;
}

const OptionRestaurant: FC<Iprops> = (props: any) => {

    const { isDelivery, aEmporter, setValue, value, code } = props as Iprops;

    return (<>

        <ComponentForm
            isView={isDelivery}
            setValue={setValue}
            title="Paramètres remise de livraison"
            values={value}
            type="delivery"
        />

        <ComponentForm
            isView={aEmporter}
            setValue={setValue}
            title="Paramètres remise des plat à emporter"
            values={value}
            type="aEmporter"
        />

        <ComponentForm
            isView={code}
            setValue={setValue}
            title="Paramètres remise code promo"
            values={value}
            type="codeDiscount"
            code={true}
        />

    </>)

}

export default OptionRestaurant;
