<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip
        v-if="search"
        class="item"
        effect="dark"
        :content="showSearch ? '隐藏搜索' : '显示搜索'"
        placement="top">
        <el-button circle icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle icon="Refresh" @click="refresh()" />
      </el-tooltip>
      <el-tooltip v-if="columns" class="item" effect="dark" content="显隐列" placement="top">
        <el-button circle icon="Menu" @click="showColumn()" />
      </el-tooltip>
    </el-row>
    <el-dialog v-model="open" :title="title" append-to-body>
      <el-transfer v-model="value" :titles="['显示', '隐藏']" :data="columns" @change="dataChange"></el-transfer>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  showSearch: propTypes.bool.def(true),
  columns: {
    type: Array as PropType<FieldOption[]>,
  },
  search: propTypes.bool.def(true),

  gutter: propTypes.number.def(10),
})

const emits = defineEmits(['update:showSearch', 'queryTable'])

// 显隐数据
const value = ref<Array<number>>([])
// 弹出层标题
const title = ref('显示/隐藏')
// 是否显示弹出层
const open = ref(false)

const style = computed(() => {
  const ret: any = {}
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`
  }
  return ret
})

// 搜索
function toggleSearch() {
  emits('update:showSearch', !props.showSearch)
}

// 刷新
function refresh() {
  emits('queryTable')
}

// 右侧列表元素变化
function dataChange(data: TransferKey[]) {
  props.columns?.forEach((item) => {
    item.visible = !data.includes(item.key)
  })
}

// 打开显隐列dialog
const showColumn = () => {
  open.value = true
}

// 显隐列初始默认隐藏列
onMounted(() => {
  props.columns?.forEach((item) => {
    if (!item.visible) {
      value.value.push(item.key)
    }
  })
})
</script>

<style lang="scss" scoped>
.top-right-btn {
  margin-left: auto;
}
</style>
