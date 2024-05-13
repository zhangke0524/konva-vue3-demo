<template>
  <div class="wrapper">
    <div ref="containerRef" class="container-area" id="containerId"></div>
    <div class="tool-area">
      <h2>工具栏</h2>
      <p>这里是工具栏</p>
      <div class="right-content">
        <div class="tool-list">
          <div
            v-for="(item, index) in toolList"
            :key="index"
            :title="item.name"
            class="tool-icon"
            @click="handleToolClick(item.id)"
            :class="{
              'rect-tool-icon': item.id === 'rect',
              'custom-tool-icon': item.id === 'polyLine',
              'is-active': currentTool === item.id,
            }"
          >
          </div>
          <div class="label-choose">
            <el-select v-model="labelType" placeholder="请选择标签类型">
              <el-option
                v-for="item in labelTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="shape-list">
          <div class="shape-item" v-for="(item,index) in shapeList" :key="item.id">
            <span class="shape-name">{{ item.type }} - {{ index }}</span>
            <span class="shape-position">坐标：{{ `(${item.startX}, ${item.startY})`}}</span>
            <span @click="toDelByData(item)"><el-icon><Delete /></el-icon></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElIcon } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import { initImage } from './KonvaUtil.js';

const toolList = [
  { name: '矩形', id: 'rect' },
  // { name: '多边形', id: 'polyLine' },
]
const labelTypeList = [
  { label: 'car', value: 'car' },
  { label: 'person', value: 'person' },
  { label: 'face', value: 'face' },
  { label: 'fire', value: 'fire' },
]

let imageUrl = ref('');

// 已绘制的图形列表
const shapeList = ref([]);
// 当前工具
let currentTool = ref('rect');
// 当前标签
let labelType = ref('car');

const handleToolClick = (toolId) => {
  currentTool.value = toolId;
  switch (toolId) {
    case 'rect':
      drawRect();
      break;
    case 'polyLine':
      drawPolyLine();
      break;
    default:
      break;
  }
}

// 绘制矩形
const drawRect = () => {
  console.log('drawRect');
}
const drawPolyLine = () => {
  console.log('drawPolyLine');
}

const containerRef = ref(null);
onMounted(() => {
  imageUrl.value = 'https://n.sinaimg.cn/www/transform/300/w660h440/20240318/3875-37fb8533570d8661d3f547c7e3b0ddde.jpg'
  initImage(imageUrl.value, containerRef.value);
})
</script>

<style>
.wrapper {
  padding: 50px;
  width: calc(100% - 100px);
  height: calc(100% - 100px);
  display: flex;
  justify-content: space-between;
  .container-area {
    width: calc(100% - 500px);
    height: 100%;
    background-color: rgb(250, 242, 243);
  }
  .tool-area {
    width: 500px;
    background-color: rgb(228, 236, 243);
    .tool-list {
      display: flex;
      justify-content: center;
      align-items: center;
      .tool-icon {
        margin: 10px;
        cursor: pointer;
      }
      .rect-tool-icon {
        width: 30px;
        height: 30px;
        border: 1px solid black;
      }
      .is-active-line::before {
        background-color: #FFD700;
      }
      .triangle-tool-icon {
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 30px solid black;
      }
      .custom-tool-icon {
        width: 30px;
        height: 30px;
        background-color: #7FFFD4; /* 设置背景颜色 */
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); /* 使用多边形裁剪 */
      }
      .is-active {
        background-color: #FFD700;
      }
      .label-choose {
        width: 50%;
      }
    }
    .shape-list {
      .shape-item {
        height: 20px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        .shape-name {
          font-size: 16px;
        }
        .shape-position {
          font-size: 14px;
        }
      }
    }
  }
}
</style>

