<template>
  <div class="whole-content">
    <div id="container" class="konva-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import ImgAnnotate from '../utils/konva';
import bus from '../utils/bus'

const annotate = ref(null);
const canvasData = ref(null);

// 数据回填逻辑
let initData = [
  {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    id: '1'
  },
  {
    x: 200,
    y: 200,
    width: 100,
    height: 100,
    id: '2'
  }
];

onMounted(() => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let el = document.getElementById('container');
  let imgSrc = 'https://n.sinaimg.cn/www/transform/300/w660h440/20240318/3875-37fb8533570d8661d3f547c7e3b0ddde.jpg'
  annotate.value = new ImgAnnotate({ el, width, height, imgSrc, initData });
  // 监听canvasData事件，获取绘制的矩形坐标信息
  bus.on('canvasData', (data) => {
    canvasData.value = data;
    console.log('canvasData', canvasData.value);
  });
});

</script>

<style scoped>
.whole-content {
  width: 100%;
  height: 100%;
}
.konva-container {
  width: 100%;
  height: 100%;
  background-color: rgb(219, 243, 243);
}
</style>