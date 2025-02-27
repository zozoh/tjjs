import _, { kebabCase } from 'lodash';
import { SetupContext, VNode, h } from 'vue';
import { TiIcon } from '../';
import {
  FieldComProps,
  IconInput,
  TextContentType,
  ValueChange,
  Vars,
} from '../../_type';
import { CssUtils, I18n } from '../../core';
import { useFieldCom } from '../_features';

// export type TextSnippetEmitter = {
//   (evetName: 'change', payload: ValueChange<string>): void;
// };

// export type TextSnippetProps = FieldComProps & {
//   className?: any;
//   style?: Vars;
//   textStyle?: Vars;
//   tagName?: string;
//   attrs?: Vars;
//   props?: Vars;
//   // 用来动态 explain 传入的 comConf
//   vars?: Vars;
//   text: string;
//   textType?: TextContentType;
//   autoI18n?: boolean;
//   prefixIcon?: IconInput;
//   prefixTip?: string;
//   suffixIcon?: IconInput;
//   suffixTip?: string;
// };

// export function TextSnippet(
//   props: TextSnippetProps,
//   context: SetupContext<TextSnippetEmitter>
// ) {
//   //........................................
//   let tag = props.tagName ?? 'div';
//   let tagProps = {
//     class: CssUtils.mergeClassName(props.className),
//     style: props.style,
//   } as Vars;
//   //........................................
//   // 添加自定义属性
//   _.forEach(props.attrs, (v, k) => {
//     if (_.isNil(v)) return;
//     k = kebabCase(k);
//     if (!/^\^/.test(k)) {
//       k = '^' + k;
//     }
//     tagProps[k] = v;
//   });
//   //........................................
//   // 添加自定义选项
//   _.forEach(props.props, (v, k) => {
//     if (_.isNil(v)) return;
//     k = kebabCase(k);
//     if (!/^\./.test(k)) {
//       k = '.' + k;
//     }
//     tagProps[k] = v;
//   });
//   //........................................
//   let text = props.autoI18n ? I18n.text(props.text) : props.text;
//   //
//   // 自定义控件
//   //
//   if (props.comType) {
//     let eventKey = _.camelCase(`on-${props.changeEventName ?? 'change'}`);
//     let emit = context.emit as TextSnippetEmitter;

//     let com = useFieldCom(props);
//     let CustomizedCom = com.autoGetCom({}, props.vars ?? { text }, text);
//     let { rawCom: comType, comConf } = CustomizedCom;
//     comConf[eventKey] = (val: any) => {
//       emit('change', { value: val, oldVal: props.text });
//     };

//     let cusComNode = h(comType, comConf);
//     tagProps.class['customized-com'] = true;
//     return h(tag, tagProps, [cusComNode]);
//   }
//   //........................................
//   // 准备子内容
//   let children = [] as VNode[];

//   // 前缀图标
//   if (props.prefixIcon) {
//     children.push(
//       h(TiIcon, {
//         class: 'at-prefix',
//         value: props.prefixIcon,
//         tip: props.prefixTip,
//       })
//     );
//   }

//   // 文字内容
//   if (text) {
//     let textProps = {
//       class: 'as-snippet-text',
//       style: props.textStyle,
//     } as Vars;
//     if ('html' == props.textType) {
//       textProps.innerHTML = text;
//     } else {
//       textProps.innerText = text;
//     }
//     children.push(h('div', textProps));
//   }

//   // 后缀图标
//   if (props.suffixIcon) {
//     children.push(
//       h(TiIcon, {
//         class: 'at-suffix',
//         value: props.suffixIcon,
//         tip: props.suffixTip,
//       })
//     );
//   }

//   return h(tag, tagProps, children);
// }
