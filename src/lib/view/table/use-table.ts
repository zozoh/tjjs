import _ from 'lodash';
import { ComputedRef, Ref } from 'vue';
import {
  CellChanged,
  CheckStatus,
  SelectableFeature,
  TableColumn,
  TableEvent,
  TableProps,
  TableRowData,
  TableRowID,
  TableSelectEmitInfo,
  TableSelection,
  TableStrictColumn,
  makeFieldUniqKey,
  parseFieldConverter,
  useSelectable,
} from '../../';
import {
  Callback,
  Callback1,
  EventUtils,
  Util,
  Vars,
  getLogger,
} from '../../../core';

import { TableKeepFeature } from './use-table-keep';
import { useTableResizing } from './use-table-resizing';

const log = getLogger('TiTable.use-table');
/**
 * 拖动时的状态
 */
export type ColResizingState = {
  /**
   * 当前是否处于列调整模式
   */
  activated: boolean;
  /**
   * 拖动的列在视口的位置
   */
  left: number;

  /**
   * 拖动的列下标（0Base）
   */
  colIndex: number;
};

export type TableEmit = {
  (eventName: 'select', payload: TableSelectEmitInfo): void;
  (eventName: 'open', payload: TableRowData): void;
  (eventName: 'cell-open', payload: TableEvent): void;
  (eventName: 'cell-change', payload: CellChanged): void;
};

/*-------------------------------------------------------

                     Help methods

-------------------------------------------------------*/
function _build_table_columns(props: TableProps) {
  let reColumns = [] as TableStrictColumn[];
  for (let i = 0; i < props.columns.length; i++) {
    let col = props.columns[i];
    if (col.candidate) {
      continue;
    }
    // 列唯一键
    let uniqKey = makeFieldUniqKey([i], col.name, col.uniqKey);

    // 准备列
    let reColumns = [] as TableStrictColumn[];
    let re: TableStrictColumn = {
      uniqKey,
      name: col.name,
      type: col.type ?? 'String',
      className: col.className,
      title: col.title ?? _.upperCase(uniqKey),
      titleType: col.titleType ?? 'text',
      titleIcon: col.titleIcon,
      titleStyle: col.titleStyle,
      titleAlign: col.titleAlign,
      tip: col.tip,
      tipType: col.tipType ?? 'text',
      tipBy: col.tipBy,
      tipStyle: col.tipStyle,
      tipAlign: col.tipAlign,

      candidate: col.candidate ?? false,

      // 表格默认控件
      comType: col.comType ?? props.defaultCellComType ?? 'TiLabel',
      comConf: col.comConf ??
        props.defaultCellComConf ?? {
          className: 'is-nowrap',
        },
      autoValue: col.autoValue,
      readonlyComType: col.readonlyComType,
      readonlyComConf: col.readonlyComConf,
      // 表格默认激活控件
      activatedComType: Util.fallback(
        col.activatedComType,
        props.defaultCellActivatedComType
      ),
      activatedComConf: Util.fallback(
        col.activatedComConf,
        props.defaultCellActivatedComConf
      ),

      transformer: parseFieldConverter(
        col.type ?? 'String',
        'transform',
        props.vars || {},
        col.transformer,
        col.transArgs,
        col.transPartial
      ),
      serializer: parseFieldConverter(
        col.type ?? 'String',
        'serialize',
        props.vars || {},
        col.serializer,
        col.serialArgs,
        col.serialPartial
      ),
    };

    // 记入列表
    reColumns.push(re);
  }
  return reColumns;
}

/**
 * 获取表格数据
 * @param selectable 选择特性
 * @param data 表格数据
 * @param checkedIds 选中的 ID 表
 * @param currentId 当前的 ID 表
 * @returns 整理后的表格数据
 */
function _get_table_data(
  selectable: SelectableFeature<TableRowID>,
  _state: TableSelection,
  data: Vars[]
): TableRowData[] {
  // 启用特性
  let { getDataId, isIDChecked } = selectable;

  // 处理数据
  let list = [] as TableRowData[];
  let N = data.length;
  for (let index = 0; index < N; index++) {
    let rawData = data[index];
    let id = getDataId(rawData);
    list.push({
      id: id ?? `row-${index}`,
      index,
      indent: 0,
      // activated: id == state.currentId,
      // checked: isIDChecked(state, id),
      rawData,
    });
  }
  return list;
}

/**
 * 表格的行头被点击，通常是需要选择行
 */
function _on_row_select(
  selectable: SelectableFeature<TableRowID>,
  selection: TableSelection,
  rowEvent: TableEvent
) {
  let { event, row } = rowEvent;
  let se = EventUtils.getKeyboardStatus(event);

  selectable.select(selection, row.id, se);
}
/*-----------------------------------------------------

                   Use Feature
                
-----------------------------------------------------*/
export function useTable(props: TableProps, emit: TableEmit) {
  // 启用特性
  let selectable = useSelectable<TableRowID>(props);

  function getCurrentRow(selection: TableSelection, rows: TableRowData[]) {
    if (!_.isNil(selection.currentId)) {
      for (let row of rows) {
        if (row.id == selection.currentId) {
          return row;
        }
      }
    }
  }

  function getCheckedRows(
    selection: TableSelection,
    rows: TableRowData[]
  ): TableRowData[] {
    let checked = [] as TableRowData[];
    if (selection.checkedIds.size > 0) {
      for (let row of rows) {
        if (selectable.isIDChecked(selection, row.id)) {
          checked.push(row);
        }
      }
    }
    return checked;
  }

  return {
    selectable,
    getTableHeadClass: (selection: TableSelection, colIndex: number) => {
      return {
        'is-actived-column': selection.columnIndex == colIndex,
      };
    },
    getTableColumns: () => {
      return _build_table_columns(props);
    },
    getTableData: (state: TableSelection) => {
      return _get_table_data(selectable, state, props.data);
    },
    bindTableResizing: (
      $main: HTMLElement,
      colResizing: ColResizingState,
      columnSizes: Ref<number[]>,
      showRowMarker: boolean,
      onDestroy: Callback1<Callback>,
      Keep: ComputedRef<TableKeepFeature>
    ) => {
      if (props.columnResizable) {
        useTableResizing(
          $main,
          colResizing,
          columnSizes,
          showRowMarker,
          onDestroy,
          () => {
            if (_.isBoolean(props.columnResizeInTime)) {
              return props.columnResizeInTime;
            }
            let n = props.columnResizeInTime ?? 50;
            return props.data.length <= n;
          },
          Keep
        );
      }
    },

    createSelection: (): TableSelection => {
      let re = selectable.createSelection() as TableSelection;
      re.columnIndex = -1;
      return re;
    },

    getRowIds: selectable.getRowIds,

    getCheckStatus(selection: TableSelection) {
      return selectable.getCheckStatus(selection);
    },

    getCurrentRow,
    getCheckedRows,

    OnTableHeadCheckerClick(selection: TableSelection, status: CheckStatus) {
      let { ids, checkedIds } = selection;
      checkedIds.clear();
      if ('all' != status) {
        for (let id of ids) {
          checkedIds.set(id, true);
        }
      }
    },

    OnRowSelect(selection: TableSelection, rowEvent: TableEvent) {
      selection.columnIndex = -1;
      // Guard actived
      if (selection.currentId == rowEvent.row.id) {
        return;
      }
      log.debug('OnRowSelect', rowEvent);
      let oldCurrentId = _.cloneDeep(selection.currentId);
      let oldCheckedIds = _.cloneDeep(selection.checkedIds);
      _on_row_select(selectable, selection, rowEvent);

      //
      // Prepare the emit info
      //
      let info = selectable.getSelectionEmitInfo(
        selection,
        props.data,
        oldCheckedIds,
        oldCurrentId
      ) as TableSelectEmitInfo;

      emit('select', info);
    },

    OnRowCheck(selection: TableSelection, rowEvent: TableEvent) {
      log.debug('OnRowCheck', rowEvent);
      let oldCurrentId = _.cloneDeep(selection.currentId);
      let oldCheckedIds = _.cloneDeep(selection.checkedIds);
      selectable.toggleId(selection, rowEvent.row.id);
      selection.columnIndex = -1;

      //
      // Prepare the emit info
      //
      let info = selectable.getSelectionEmitInfo(
        selection,
        props.data,
        oldCheckedIds,
        oldCurrentId
      ) as TableSelectEmitInfo;

      emit('select', info);
    },

    OnCellSelect(
      selection: TableSelection,
      rowEvent: TableEvent,
      columns: TableColumn[]
    ) {
      let { row, colIndex } = rowEvent;
      selection.columnIndex = colIndex ?? -1;
      if (!selection.checkedIds.get(row.id)) {
        let oldCurrentId = _.cloneDeep(selection.currentId);
        let oldCheckedIds = _.cloneDeep(selection.checkedIds);
        log.debug('OnCellSelect', rowEvent);
        selectable.selectId(selection, row.id);

        //
        // Prepare the emit info
        //
        let info = selectable.getSelectionEmitInfo(
          selection,
          props.data,
          oldCheckedIds,
          oldCurrentId
        ) as TableSelectEmitInfo;

        // add Column info
        if (colIndex && colIndex >= 0) {
          info.colIndex = colIndex;
          info.column = columns[colIndex];
        }

        emit('select', info);
      }
    },

    OnRowOpen(_selection: TableSelection, rowEvent: TableEvent) {
      log.debug('OnRowOpen', rowEvent);
      emit('open', rowEvent.row);
    },

    OnCellOpen(_selection: TableSelection, rowEvent: TableEvent) {
      log.debug('OnCellOpen', rowEvent);
      emit('cell-open', rowEvent);
    },
  };
}
