import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/layouts/Navbar';

import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
// import { makeStyles } from '@material-ui/core/styles';
import TabsActive from '../../components/TabsActive';
import { getRestaurantPagesWithId, getRestaurantWithId } from '../../services/restaurant';
import { getFoodWithId, searchFoods } from '../../services/food';
import { connect } from 'react-redux';
import RootState, { RootActionTypes } from '../../redux/types';
import Restaurant from '../../models/Restaurant.model';
import Food from '../../models/Food.model';
import getMenuWithId, { searchMenus } from '../../services/menu';
import Menu from '../../models/Menu.model';
import HelmetMetaData from '../../components/HelmetMetaData';
import Footer from '../../components/layouts/Footer';
import { Lang } from '../../redux/types/setting';
import { Box } from '@material-ui/core';
import Loader from '../../components/Loader';
import useEffectOnUpdate from '../../hooks/useEffectOnUpdate';
import { useHistory } from 'react-router-dom';
import { ThunkDispatch } from 'redux-thunk';
import { changeLanguage, changePriceType } from '../../redux/actions/setting';
interface RestaurantPageStateProps {
  lang: Lang;
}

interface RestaurantPageDispatchProps {
  setLang: (lang: Lang) => Promise<void>;
  setPriceType: (price: string) => Promise<void>;
}

interface RestaurantPageOwnProps {
  id: string;
}

type RestaurantPageProps = RestaurantPageStateProps &
  RestaurantPageDispatchProps &
  RestaurantPageOwnProps;

const RestaurantPage: React.FC<RestaurantPageProps> = ({ id, lang, setLang, setPriceType }) => {
  // const classes = useStyles();
  const history = useHistory()

  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [foods, setFoods] = useState<Food[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchAttributes, setSearchAttributes] = useState<string[]>([]);

  const timeout = useRef<number | null>();

  const params = new URLSearchParams(history.location.search);

  const qrLang: Lang = params.get('language') as Lang
  const priceType = params.get('option')

  if (qrLang) {
    setLang(qrLang);
    params.delete('language')
  }
  setPriceType(priceType || '');

  const fetch = async (
    lang: string,
    query: string,
    restaurant: string,
    searchAttributes: string[]
  ) => {
    setLoading(true);

    const foods = await searchFoods({
      lang,
      query,
      restaurant,
      filter: {
        attributes: searchAttributes.length ? searchAttributes : undefined,
      },
    });

    setFoods(foods.map(({ content }) => content));

    const menus = await searchMenus({
      lang,
      query,
      restaurant,
    });
    setMenus(menus.map(({ content }) => content));

    setLoading(false);
  };

  const initResult = async () => {
    setLoading(true);

    //  getRestaurantWithId(id, lang)
    await getRestaurantPagesWithId(id, lang)
      .then(async (response: any) => {

        setRestaurant(response.restaurant);

        // refeha response zay de miverina mandefa requuete indray
        // // mget  foods

        // const foods = await Promise.all(
        //   restaurant.foods.map((id) => getFoodWithId(id, lang))
        // );

        setFoods(response.food);

        // // mget  menu

        // const menus = await Promise.all(
        //   restaurant.menus.map((id) => getMenuWithId(id, lang))
        // );

        setMenus(response.menu);

        setLoading(false);

      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onSearchAttributesChange = (attributes: string[]) => {
    setSearchAttributes(attributes);
  };

  useEffect(() => {
    initResult()
  }, [id]);

  useEffectOnUpdate(() => {
    if (!loading) {
      if (timeout.current) window.clearTimeout(timeout.current);

      timeout.current = window.setTimeout(
        () => fetch(lang, query, id, searchAttributes),
        1000
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, restaurant]);

  useEffectOnUpdate(() => {
    if (!loading) fetch(lang, query, id, searchAttributes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchAttributes]);

  return (
    <>
      <HelmetMetaData
        title={restaurant ? restaurant.name : undefined}
        description={restaurant ? restaurant.description : undefined}
        quote={
          restaurant ? restaurant.city + ' - ' + restaurant.address : undefined
        }
        image={restaurant ? restaurant.logo : undefined}
      />
      <Navbar
        onSearchSubmitted={(query) => setQuery(query)}
        onCloseSearch={initResult}
        isRestaurant
        restaurantId={restaurant?._id}
        alwaysVisible
      />
      {restaurant && <RestaurantHeader restaurant={restaurant} />}

      {loading ? (
        <Loader />
      ) : (
        <TabsActive
          foods={foods}
          menus={menus}
          id={id}
          resto={restaurant}
          onSearchAttributesChange={onSearchAttributesChange}
        />
      )}

      <Box height={50} />

      <Footer mini />
    </>
  );
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>
) => RestaurantPageDispatchProps = (dispatch) => ({
  setLang: (lang) => dispatch(changeLanguage(lang)),
  setPriceType: (price) => dispatch(changePriceType(price)),
});

const mapStateToProps: (state: RootState) => RestaurantPageStateProps = ({
  setting: { lang },
}) => ({
  lang,
});

const ConnectedRestaurantPage = connect(mapStateToProps, mapDispatchToProps)(RestaurantPage);

export default ConnectedRestaurantPage;
