<template>
  <div class="wrapper">
    <div ref="containerRef" class="container" id="containerId">
    </div>
    <div class="tool-area">
      <h2>工具栏</h2>
      <p>这里是工具栏</p>
      <div v-for="item in toolList">
        <div :class="{
          'rect-tool-icon': item.id === 'rect',
          'circle-tool-icon': item.id === 'circle',
          'line-tool-icon': item.id === 'line',
          'label-tool-icon': item.id === 'label',
          'custom-tool-icon': item.id === 'custom',
          }" :title="item.name">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const toolList = [
  { name: '矩形', id: 'rect' },
  { name: '圆形', id: 'circle' },
  { name: '线段', id: 'line' },
  { name: '标签', id: 'label'},
  { name: '自定义', id: 'custom' },
]

// 通过Konva库创建一个画布，并在画布中添加一张图片，作为背景
const initImage = () => {
  const container = document.getElementById('containerId');
  const stage = new Konva.Stage({
    container: container,
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // 将图片alarm.png添加到画布中作为背景
  let imageObj = new Image();
  imageObj.src = './alarm.png';
  imageObj.onload = function () {
    const image = new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      // width应该是图片本身的宽度
      width: imageObj.width,
      height: imageObj.height,
    });
    layer.add(image);
  };
}

onMounted(() => {
  initImage()
  // 监听鼠标按下事件，当鼠标a按下时，打印出鼠标的坐标
  document.addEventListener('mousedown', (e) => {
    console.log(e.clientX, e.clientY)
  })
})
</script>

<style>
.wrapper {
  padding: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  display: flex;
  justify-content: space-between;
}
.container {
  width: calc(100% - 500px);
  height: 100%;
  background-color: rgb(253, 223, 228);
}
.tool-area {
  width: 500px;
  background-color: rgb(207, 227, 245);
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
</style>