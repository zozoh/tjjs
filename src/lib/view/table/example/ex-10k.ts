import { TableCell } from '../../../';
import { mockData } from './mock-table-row';

export default {
  name: '10k',
  text: 'i18n:ti-table-example-10k',
  comConf: () => {
    return {
      className: 'fit-parent',
      columns: [
        {
          name: 'id',
        },
        {
          name: 'name',
        },
        {
          name: 'age',
        },
        {
          name: 'birthday',
        },
        {
          name: 'city',
        },
        {
          name: 'address',
        },
        {
          name: 'street',
        },
        {
          name: 'local_ip',
        },
      ] as TableCell[],
      data: mockData(10000),
    };
  },
};
