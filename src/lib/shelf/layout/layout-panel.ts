import _ from 'lodash';
import { CssUtils, PopPosition, Vars } from '../../../core';
import {
  LayoutBlock,
  LayoutItem,
  LayoutProps,
  LayoutState,
  autoSetLayoutItemType,
  setLayoutItemConfig,
} from './layout-support';

type PopItemProps = {
  position: PopPosition;
  showMask?: boolean;
  clickMaskToClose?: boolean;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  overflow?: string;
};

export type LayoutPanel = LayoutBlock & PopItemProps;

export type LayoutPanelItem = LayoutItem & {
  position: PopPosition;
  showMask?: boolean;
  clickMaskToClose?: boolean;
  /**
   * 计算出来的，当前段面板是否是隐藏
   */
  hidden: boolean;
  visible: boolean;
};

export type LayoutPanelProps = {
  panels?: LayoutPanel[];
  panelStyle?: Vars;
};

export function getLayoutPanelItems(
  state: LayoutState,
  props: LayoutProps & LayoutPanelProps
): LayoutPanelItem[] {
  let { panels = [], schema = {}, panelStyle = {} } = props;
  let { shown } = state;
  let list = [] as LayoutPanelItem[];

  for (let i = 0; i < panels.length; i++) {
    let item = panels[i];

    // 准备布局项目
    let it = _.cloneDeep(item) as unknown as LayoutPanelItem;
    it.index = i;
    if (!it.uniqKey) {
      it.uniqKey = it.name ?? `B${i}`;
    }
    autoSetLayoutItemType(it);
    it.itemConfig = {};

    if (it.clickMaskToClose && _.isNil(it.showMask)) {
      it.showMask = true;
    }

    // 布局项的 ClassName
    it.className = CssUtils.mergeClassName(
      it.className,
      `as-${it.type}`,
      `at-${it.position || 'center'}`,
      {
        'show-mask': it.showMask,
        'no-mask': !it.showMask,
      }
    );

    let _out_style = {} as Vars;
    let _con_style = {} as Vars;

    //
    let posKey = ['left', 'right', 'top', 'bottom'];
    let sizKey = [
      'overflow',
      'width',
      'height',
      'maxWidth',
      'maxHeight',
      'minWidth',
      'minHeight',
    ];
    if ('free' == item.position) {
      _con_style = _.pick(item, ...[...posKey, ...sizKey]);
    } else {
      _con_style = _.pick(item, sizKey);
    }

    // 布局项的样式
    it.conStyle = CssUtils.mergeStyles([
      panelStyle,
      it.style,
      it.grid,
      _con_style,
    ]);
    it.style = CssUtils.mergeStyles([_out_style]);

    it.visible = shown[it.uniqKey] ? true : false;
    it.hidden = !it.visible;

    // 设置布局项的属性
    setLayoutItemConfig(it, schema);

    // 记入一下 Panel 相关属性

    // 记入返回列表
    list.push(it);
  }
  return list;
}
