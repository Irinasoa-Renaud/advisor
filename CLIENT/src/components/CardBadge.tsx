import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';

const CardBadge = withStyles({
  root: {
    display: 'inline',
  },
  badge: {
    fontSize: 20,
    width: 30,
    height: 30,
    borderRadius: '50%',
  },
})(Badge);

export default CardBadge;
