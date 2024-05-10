import { ComPropExample } from '../../../../core';
import { ListProps } from '../ti-list-types';

export default {
  name: 'with_icon',
  text: 'i18n:ti-list-example-with-icon',
  comConf: {
    className: 'border-dashed',
    size:"b",
    data: [
      { value: 1, text: 'This is a DOG', icon: 'fas-dog' },
      { value: 2, text: 'This is a CAT', icon: 'fas-cat' },
      { value: 3, text: 'This is a HIPPO', icon: 'fas-hippo' },
      { value: 4, text: 'This is a FROG', icon: 'fas-frog' },
      { value: 5, text: 'This is a LIZARD' },
      { value: 6, text: 'This is a FISH', icon: 'fas-fish' },
    ],
  } as ListProps,
} as ComPropExample;
