import { ComPropExample } from '../../../../core';
import { ListProps } from '../ti-list-types';
import { Chance } from 'chance';
import { getListData } from './mock_date';

// 创建一个 Chance 实例
const cha = new Chance();

export default {
  name: 'simple',
  text: 'i18n:simple',
  comConf: {
    className: 'border-solid',
    size: 'b',
    data: getListData({ icon: false, tip: false }),
  } as ListProps,
} as ComPropExample;
