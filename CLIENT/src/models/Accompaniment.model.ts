export default interface Accompaniment {
  _id: string;
  name: string;
  price: {
    amount: number;
    currency: 'eur' | 'usd';
  };
  imageURL: string;
  isObligatory?: boolean;
}
