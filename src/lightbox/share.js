/* @flow strict-local */
import { Share } from 'react-native';

import { BRAND_COLOR } from '../styles';

export default (url: string) => {
  const shareOptions = {
    message: url,
    title: 'Shared using TandaPay!',
  };
  Share.share(shareOptions, { tintColor: BRAND_COLOR }).catch(err => {});
};
