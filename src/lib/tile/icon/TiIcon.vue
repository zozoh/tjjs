<script setup lang="ts">
  import { computed } from 'vue';
  import { CssUtils, Icons } from '../../../core';
  import { IconProps } from './icon-props';
  import { getIconStyle } from './use-icon';
  defineOptions({
    name: 'TiIcon',
    inheritAttrs: true,
  });
  /*-------------------------------------------------------

                      Props

-------------------------------------------------------*/
  const props = defineProps<IconProps>();
  /*-------------------------------------------------------

                      Computed

-------------------------------------------------------*/
  const Icon = computed(() => {
    return Icons.toIconObj(props.value ?? props.defaultValue);
  });
  const TopClass = computed(() =>
    CssUtils.mergeClassName(props.className, Icon.value.topClass, () => {
      return `is-type-${Icon.value.type}`;
    })
  );
  const TopStyle = computed(() =>
    CssUtils.mergeStyles([
      {},
      props.style,
      CssUtils.toStyle({
        width: props.width,
        height: props.height,
        opacity: props.opacity,
      }),
    ])
  );
  const IconStyle = computed(() => getIconStyle(props, Icon));
</script>

<template>
  <div
    class="ti-icon"
    :class="TopClass"
    :style="TopStyle"
    :title="props.tip">
    <!-- Emoji Icon-->
    <div
      class="part-main as-emoji"
      :style="IconStyle"
      v-if="'emoji' == Icon.type">
      <span>{{ Icon.value }}</span>
    </div>
    <!-- Font Icon-->
    <div
      class="part-main as-font"
      :style="IconStyle"
      v-else-if="'font' == Icon.type">
      <i :class="Icon.className"></i>
    </div>
    <!-- Image Icon-->
    <img
      v-else
      :src="Icon.src"
      class="part-main as-image"
      :style="IconStyle" />
  </div>
</template>
<style lang="scss">
  @use './ti-icon.scss';
</style>
