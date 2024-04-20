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
              'circle-tool-icon': item.id === 'circle',
              'line-tool-icon': item.id === 'line',
              'label-tool-icon': item.id === 'label',
              'custom-tool-icon': item.id === 'custom',
              'is-active': currentTool === item.id,
              'is-active-line': currentTool === 'line',
            }"
          >
          </div>
        </div>
        <div class="shape-list">
          <div class="shape-item" v-for="(item,index) in shapeList" :key="item.id">
            <span class="shape-name">{{ item.type }}-{{ index + 1 }}</span>
            <span class="shape-position">坐标：{{ `(${item.startX}, ${item.startY})`}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
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

const toolList = [
  { name: '矩形', id: 'rect' },
  { name: '圆形', id: 'circle' },
  { name: '线段', id: 'line' },
  { name: '标签', id: 'label'},
  { name: '自定义', id: 'custom' },
]

const initImage = () => {
  // 将图片添加到画布中作为背景，图片在保持宽高比的情况下，填充整个画布
  let imageObj = new Image();
  imageObj.src = './alarm.png';
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
    case 'circle':
      drawCircle();
      break;
    case 'line':
      drawLine();
      break;
    case 'label':
      drawLabel();
      break;
    case 'custom':
      drawCustom();
      break;
    default:
      break;
  }
}

const isInImage = (x, y) => {
  return x > 0 && x < state.imageWidth && y > 0 && y < state.imageHeight;
}

const renderRect = (startX, startY, endX, endY, id) => {
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
  rect.on('mousedown', function() {
    isClickInShape.value = true;
    console.log('点击了矩形');
    // 添加konva的transform属性，可以对图形进行缩放、旋转、平移等操作
    rect.setAttrs({
      draggable: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  });
  rect.on('mouseup', function() {
    isClickInShape.value = false;
  });
  // 如果进行拖拽了，需要将拖拽后的坐标保存到数据库
  rect.on('dragend', function() {
    let { x, y } = rect.attrs;
    let shape = shapeList.value.find(item => item.id === `rect-${id}`);
    shape.startX = x;
    shape.startY = y;
    shape.endX = x + rect.width();
    shape.endY = y + rect.height();
  });
  state.layer.add(rect);
  console.log('id', id);
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
      console.log('randomId', randomId);
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
const drawCircle = () => {
  console.log('圆形工具');
}
const drawLine = () => {
  console.log('线段工具');
}
const drawLabel = () => {
  console.log('标签工具');
}
const drawCustom = () => {
  console.log('自定义工具');
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
      .circle-tool-icon {
        width: 30px;
        height: 30px;
        border: 1px solid black;
        border-radius: 50%;
      }
      .line-tool-icon::before {
        content: '';
        display: block;
        width: 30px;
        height: 1px;
        background-color: black;
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
      .label-tool-icon {
        display: inline-block;
        padding: 5px 10px;
        border: 1px solid black;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        color: #333;
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
    }
  }
}
</style>