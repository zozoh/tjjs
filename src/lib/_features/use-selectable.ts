import _ from 'lodash';
import { Convertor, KeyboardStatus, Util, Vars } from '../../core';
import { objToMap } from '../../core/util';
// -----------------------------------------------------
//  Types
export type CheckStatus = 'all' | 'none' | 'part';
// -----------------------------------------------------
export type SelectableState<ID> = {
  currentId?: ID;
  checkedIds: Map<ID, boolean>;
  ids: ID[];
};
export type SelectEmitInfo<ID> = Omit<SelectableState<ID>, 'ids'> & {
  current?: Vars;
  checked: Vars[];
  oldCurrentId?: ID;
  oldCheckedIds: Map<ID, boolean>;
};
// -----------------------------------------------------
export type SelectableProps<ID extends string | number> = {
  /**
   * 传入的数据对象
   */
  data?: Vars[];
  /**
   * 从指定的对象获取 ID
   *
   * - `string` : 表示一个数据键，将通过 `_.get` 获取值，这个值必须是 `T`
   *              或者可以被 `anyConvertor` 转换的值
   * - `Function` : 一个获取 ID 的函数
   */
  getId?: string | Convertor<Vars, ID | undefined>;

  /**
   * 是否支持多重选择
   */
  multi?: boolean;

  currentId?: ID;
  checkedIds?: Record<ID, boolean> | Map<ID, boolean>;
};

// -----------------------------------------------------
export type SelectableFeature<ID extends string | number> = {
  getRowIds: () => ID[];
  createSelection: () => SelectableState<ID>;

  getDataId: Convertor<Vars, ID | undefined>;
  isIDChecked: (state: SelectableState<ID>, id?: ID) => boolean;
  isDataChecked: (state: SelectableState<ID>, checked?: Vars) => boolean;
  isDataActived: (state: SelectableState<ID>, checked?: Vars) => boolean;

  getCheckedData: (list: Vars[], state: SelectableState<ID>) => Vars[];
  getCurrentData: (
    list: Vars[],
    state: SelectableState<ID>
  ) => Vars | undefined;
  getSelectionEmitInfo: (
    state: SelectableState<ID>,
    list: Vars[],
    oldCheckedIds: Map<ID, boolean>,
    oldCurrentId?: ID
  ) => SelectEmitInfo<ID>;

  getCheckStatus: (state: SelectableState<ID>) => CheckStatus;

  select: (
    selection: SelectableState<ID>,
    rowId: ID,
    keyboard: KeyboardStatus
  ) => void;
  selectId: (state: SelectableState<ID>, id: ID) => void;
  toggleId: (state: SelectableState<ID>, id: ID) => void;
  selectRange: (
    state: SelectableState<ID>,
    ids: ID[],
    range: [ID, ID?]
  ) => void;
};
// -----------------------------------------------------
//
// Use Feature
//
export function useSelectable<ID extends string | number>(
  props: SelectableProps<ID>
): SelectableFeature<ID> {
  let { getId = (data) => data.id ?? data.value } = props;

  /**
   * 获取数据的 ID
   */
  function getDataId(it: Vars): ID | undefined {
    if (getId) {
      if (_.isString(getId)) {
        return _.get(it, getId);
      }
      return getId(it);
    }
  }

  /**
   * @returns  当前行是否被选中
   */
  function isIDChecked(state: SelectableState<ID>, id?: ID) {
    if (_.isUndefined(id)) {
      return false;
    }
    if (!state.checkedIds) {
      return false;
    }
    return state.checkedIds.get(id) || false;
  }

  /**
   * @returns  当前行是否被选中
   */
  function isDataChecked(state: SelectableState<ID>, data?: Vars) {
    if (!data) {
      return false;
    }
    let id = getDataId(data);
    return isIDChecked(state, id);
  }

  /**
   * 判断当前行是否为当前激活行
   *
   * @param currentId 激活行的 ID
   * @param data 行数据
   * @returns  当前行是否激活
   */
  function isDataActived(state: SelectableState<ID>, data?: Vars) {
    if (!data) {
      return false;
    }
    let id = getDataId(data);
    return id === state.currentId;
  }

  function getCheckedData(list: Vars[], state: SelectableState<ID>): Vars[] {
    let re = [] as Vars[];
    for (let li of list) {
      if (isDataChecked(state, li)) {
        re.push(li);
      }
    }
    return re;
  }
  function getCurrentData(
    list: Vars[],
    state: SelectableState<ID>
  ): Vars | undefined {
    for (let li of list) {
      if (isDataChecked(state, li)) {
        return li;
      }
    }
  }

  function getSelectionEmitInfo(
    state: SelectableState<ID>,
    list: Vars[],
    oldCheckedIds: Map<ID, boolean>,
    oldCurrentId?: ID
  ): SelectEmitInfo<ID> {
    let currentId = state.currentId;
    let checkedIds = state.checkedIds;
    let current = getCurrentData(list, state);
    let checked = getCheckedData(list, state);
    return {
      currentId,
      checkedIds,
      current,
      checked,
      oldCurrentId,
      oldCheckedIds,
    };
  }

  /*-----------------------------------------------------

                       State
                
  -----------------------------------------------------*/
  function getRowIds(): ID[] {
    let ids = [] as ID[];
    let data = props.data || [];
    for (let it of data) {
      let id = getDataId(it);
      if (!_.isUndefined(id)) {
        ids.push(id);
      }
    }
    return ids;
  }

  function createSelection(): SelectableState<ID> {
    let checkedIds;
    if (props.checkedIds) {
      checkedIds = objToMap(props.checkedIds);
    } else {
      checkedIds = new Map<ID, boolean>();
    }
    let ids = getRowIds();
    return {
      currentId: props.currentId,
      checkedIds,
      ids,
    };
  }

  /*-----------------------------------------------------

                     Evalue Status
                
  -----------------------------------------------------*/
  function getCheckStatus(state: SelectableState<ID>): CheckStatus {
    // 有选中的 ID，那就深入看看
    if (state.checkedIds.size > 0) {
      // 看看是否是全部
      let checkedIds = state.checkedIds;
      for (let id of state.ids) {
        if (!checkedIds.get(id)) {
          return 'part';
        }
      }
      // 通过了，那就是全选
      return 'all';
    }
    return 'none';
  }

  /*-----------------------------------------------------

                   Action Handler
                
  -----------------------------------------------------*/

  function select(
    selection: SelectableState<ID>,
    rowId: ID,
    se: KeyboardStatus
  ) {
    // Toggle Mode
    if (se.ctrlKey || se.metaKey) {
      toggleId(selection, rowId);
    }
    // shiftKey
    else if (se.shiftKey) {
      let ids = selection.ids;
      selectRange(selection, ids, [rowId, selection.currentId]);
    }
    // Default Simple Mode
    else {
      selectId(selection, rowId);
    }
  }

  function selectId(state: SelectableState<ID>, id: ID) {
    state.checkedIds.clear();
    state.currentId = id;
    state.checkedIds.set(id, true);
  }

  function toggleId(state: SelectableState<ID>, id: ID) {
    let checked: boolean = state.checkedIds.get(id) ?? false;
    checked = checked ? false : true;
    state.checkedIds.set(id, checked);
    if (!checked && state.currentId === id) {
      state.currentId = undefined;
    }
  }

  function selectRange(
    state: SelectableState<ID>,
    ids: ID[],
    range: [ID, ID?]
  ) {
    // 没有内容
    if (_.isEmpty(ids)) {
      return;
    }

    // 首先让我们确定选择的下标
    let [fromId, toId] = range;
    // 嗯，只给了一个 ID，就从 currentId 出发
    if (_.isUndefined(toId)) {
      toId = fromId;
      // 从 currentId 出发
      if (state.currentId) {
        fromId = state.currentId;
      }
      // 从第一个 ID 出发
      else if (ids.length > 0) {
        fromId = ids[0];
      }
      // 没有合适的 range
      else {
        return;
      }
    }

    // 再防守一遍
    if (fromId === toId) {
      return;
    }

    // 获取两个ID 的下标
    let fromIndex = _.findIndex(ids, (id) => id === fromId);
    let toIndex = _.findIndex(ids, (id) => id === toId);
    if (fromIndex === toIndex) {
      return;
    }
    if (fromIndex < 0) {
      fromIndex = ids.length - 1;
    }
    if (toIndex < 0) {
      toIndex = ids.length - 1;
    }
    let idx: [number, number];
    if (fromIndex < toIndex) {
      idx = [fromIndex, toIndex];
    } else {
      idx = [toIndex, fromIndex];
    }
    fromIndex = idx[0];
    toIndex = idx[1];

    // 准备要选择的 ids
    let idMap = new Map<ID, boolean>();
    for (let i = fromIndex; i <= toIndex; i++) {
      let id = ids[i];
      idMap.set(id, true);
    }

    // 更新
    if (idMap.size > 0) {
      Util.assignMap(state.checkedIds, idMap);
    }
  }

  return {
    getRowIds,
    createSelection,

    getDataId,
    isIDChecked,
    isDataChecked,
    isDataActived,

    getCheckedData,
    getCurrentData,
    getSelectionEmitInfo,

    getCheckStatus,

    select,
    selectId,
    toggleId,
    selectRange,
  };
}
