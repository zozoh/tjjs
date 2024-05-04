import { App } from 'vue';
import { TiComInfo, TiComRace } from '../../';
import TiTable from './TiTable.vue';
//const TiTable = defineAsyncComponent(() => import('./TiTable.vue'));
import { d10k, d1k, d300, simple, editable } from './example';
import i18n from './i18n';
import { COM_TYPE } from './use-table';

const TiTableInfo: TiComInfo = {
  icon: 'fas-table-cells',
  race: TiComRace.VIEW,
  name: COM_TYPE,
  text: 'i18n:ti-table-com-name',
  i18n,
  com: TiTable,
  install: (app: App) => {
    app.component(COM_TYPE, TiTable);
  },
  defaultProps: 'simple',
  exampleProps: [simple, d300, d1k, d10k, editable],
};

export { TiTable, TiTableInfo };
