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

const state = reactive ({
  container: null,
  stage: null,
  layer: null,
  // 图片x渲染出来的宽高
  imageWidth: 0,
  imageHeight: 0,
})

// 是否正在画图
const isDrawing = ref(false);
// 鼠标按下的次数
let mousedownCount = ref(0);
let currentTool = ref('');
// 图形列表
const shapeList = ref([]);
let isClickInShape = ref(false);
// 标签类型列表
let labelType = ref('car');
// 选中的group
let selectedGroup = ref(null);

const toolList = [
  { name: '矩形', id: 'rect' },
  { name: '多边形', id: 'polyLine' },
]
const labelTypeList = [
  { label: 'car', value: 'car' },
  { label: 'person', value: 'person' },
  { label: 'face', value: 'face' },
  { label: 'fire', value: 'fire' },
]

const initImage = () => {
  // 将图片添加到画布中作为背景，图片在保持宽高比的情况下，填充整个画布
  let imageObj = new Image();
  // imageObj.src = './alarm.png';
  imageObj.src = 'https://n.sinaimg.cn/www/transform/300/w660h440/20240318/3875-37fb8533570d8661d3f547c7e3b0ddde.jpg';
  let imageWidth = state.container.clientWidth;
  let imageHeight = state.container.clientHeight;
  let imageRatio = imageObj.width / imageObj.height;
  if (imageWidth / imageHeight > imageRatio) {
    imageWidth = imageHeight * imageRatio;
  } else {
    imageHeight = imageWidth / imageRatio;
  }
  imageObj.onload = function () {
    const image = new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    });
    state.layer.add(image);
  };
  state.imageWidth = imageWidth;
  state.imageHeight = imageHeight;

  // stage初始化之后，不需要随着窗口的变化而变化
  window.addEventListener('resize', () => {
    state.stage.width(state.container.clientWidth);
    state.stage.height(state.container.clientHeight);
  });
}

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

const isInImage = (x, y) => {
  return x > 0 && x < state.imageWidth && y > 0 && y < state.imageHeight;
}

const renderRect = (startX, startY, endX, endY, id) => {
  // 创建一个group，将矩形和label放在一起
  const group = new Konva.Group({
    id: `group-${id}`,
  });
  // 创建一个矩形
  const rect = new Konva.Rect({
    id: `rect-${id}`,
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
    fill: '#67a56359',
    stroke: 'black',
    strokeWidth: 2,
  });
  // 绘制矩形时，也绘制对应的label标签
  const simpleLabel = new Konva.Label({
    id: `label-${id}`,
    x: startX,
    y: startY-20,
    height: 20,
    opacity: 0.75,
  });
  simpleLabel.add(
    new Konva.Tag({
      fill: 'yellow',
    })
  );
  simpleLabel.add(
    new Konva.Text({
      text: labelType.value,
      fontFamily: 'Arial',
      fontSize: 12,
      padding: 5,
      fill: 'black',
    })
  );
  // 将矩形和label放在一起
  group.add(rect);
  group.add(simpleLabel);
  // 鼠标按下
  group.on('mousedown', function() {
    isClickInShape.value = true;
    // 将矩形和label作为一个整体进行拖拽
    group.setAttrs({
      draggable: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  });
  group.on('click', function() {
    selectedGroup.value = group;
  });
  group.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
  });
  group.on('mouseout', function() {
    document.body.style.cursor = 'default';
  })
  group.on('mouseup', function() {
    isClickInShape.value = false;
  });
  // 如果进行拖拽了，需要将拖拽后的坐标保存到数据库
  group.on('dragend', function() {
    // TO DO 不能被拖拽到图片外面
    let { x, y } = rect.attrs;
    let shape = shapeList.value.find(item => item.id === `rect-${id}`);
    shape.startX = x;
    shape.startY = y;
    shape.endX = x + rect.width();
    shape.endY = y + rect.height();
  });
  state.layer.add(group);
}

const drawRect = () => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  // 获取鼠标第一次在图片上按下的坐标
  state.container.addEventListener('mousedown', (e) => {
    // 如果点击的是已经绘制的图形，则不再绘制新的图形
    if (isClickInShape.value) {
      return;
    }
    // 判断鼠标按下的坐标是否在图片上
    if (isInImage(e.clientX, e.clientY)) {
      // 如果没有选中的labelType，则不允许绘制矩形
      if (!labelType.value) {
        ElMessage.warning('请先选择标签类型');
        return;
      }
      startX = e.clientX;
      startY = e.clientY;
      isDrawing.value = true;
      mousedownCount.value++;
    } else {
      ElMessage.warning('请在图片上绘制');
    }
  });

  // 获取鼠标移动的坐标
  let randomId = '';
  state.container.addEventListener('mousemove', (e) => {
    // 如果点击的是已经绘制的图形，则不再绘制新的图形
    if (isClickInShape.value) {
      return;
    }
    if (!isInImage(e.clientX, e.clientY)) {
      return;
    } 
    if (!isDrawing.value) return;
    // 第一次按下鼠标时，绘制一个矩形，之后移动鼠标时，改变矩形的宽高
    if (mousedownCount.value === 1) {
      randomId = Math.random().toString(36).slice(-8) + Date.now();
      renderRect(startX, startY, e.clientX, e.clientY, randomId);
    } else {
      // 获取当前正在绘制的矩形
      let reacDom = state.stage.findOne(`#rect-${randomId}`);
      // 改变矩形的宽高
      reacDom && reacDom.setAttrs({
        x: startX,
        y: startY,
        width: e.clientX - startX,
        height: e.clientY - startY,
      });
    }
    mousedownCount.value++;
  });

  // 获取鼠标抬起的坐标
  state.container.addEventListener('mouseup', (e) => {
    // 如果点击的是已经绘制的图形，则不再绘制新的图形
    if (isClickInShape.value) {
      return;
    }
    if (isInImage(e.clientX, e.clientY)) {
      endX = e.clientX;
      endY = e.clientY;
      // 将最终绘制的矩形信息保存到数据库
      if (isDrawing.value && mousedownCount.value > 1) {
        shapeList.value.push({
          type: 'rect',
          id: `rect-${randomId}`,
          startX,
          startY,
          endX,
          endY,
        });
      }
      // 重置状态
      isDrawing.value = false;
      mousedownCount.value = 0;
    }
  });
}
const drawPolyLine = () => {
  console.log('多边形');
}

// 点击右侧的删除按钮，删除对应的shape，并且删除对应的group
const toDelByData = (item) => {
  // 通过group找到右侧的shapeList中对应的item，然后删除
  let id = item.id;
  let index = shapeList.value.findIndex(item => item.id === id);
  shapeList.value.splice(index, 1);
  // 根据id找到画布中对应的group，然后删除
  let group = state.stage.findOne(`#group-${id.split('-')[1]}`);
  // 删除group
  group.destroy();
}

// 点击键盘的delete键或者backspace键，删除对应的group
const toDelByCanvas = (group) => {
  // 通过group找到右侧的shapeList中对应的item，然后删除
  let id = group.id();
  let rectId = `rect-${id.split('-')[1]}`;
  let index = shapeList.value.findIndex(item => item.id === rectId);
  shapeList.value.splice(index, 1);
  // 删除group
  group.destroy();
}

onMounted(() => {
  // 初始化Konva画布
  state.container = document.getElementById('containerId');
  let {x, y} = state.container.getBoundingClientRect();
  state.stage = new Konva.Stage({
    x: -x,
    y: -y,
    container: state.container,
    width: state.container.clientWidth,
    height: state.container.clientHeight,
  });
  state.layer = new Konva.Layer();
  state.stage.add(state.layer);
  // 点击group后，当键盘按下delete键或者backspace时，删除当前矩形及其对应的label所在的group
  window.addEventListener('keydown', (e) => {
    console.log('e', e);
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedGroup.value) {
        toDelByCanvas(selectedGroup.value);
        state.layer.draw();
        selectedGroup.value = null;
      }
    }
  });
  // 初始化图片
  initImage();
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
    background-color: rgb(253, 223, 228);
  }
  .tool-area {
    width: 500px;
    background-color: rgb(207, 227, 245);
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