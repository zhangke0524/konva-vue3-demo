<template>
  <div class="whole-content">
    <div id="container" class="konva-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ImgAnnotate from '../utils/konva';

// 功能说明
// 1、通过Konva.Image创建图片，然后将图片添加到舞台
// 2、在图片上添加事件监听器，在图片区域内，鼠标按住左键后拖动开始绘制矩形，鼠标抬起绘制完成，并在控制台输出矩形的坐标信息，仅允许在图片区域内绘制矩形
// 3、一张图片上可以绘制多个矩形，每个矩形都有自己的坐标信息
// 4、绘制的矩形可以拖动，拖动后的坐标信息会发生变化，但仅允许在图片区域内拖动
// 5、在矩形上添加事件监听器，当鼠标移动到矩形上时，矩形的边框颜色变为红色，移出矩形区域后恢复原来的颜色
// 6、当选中一个矩形时，矩形的边框颜色变为红色，其他矩形的边框颜色恢复原来的颜色，删除键盘按下时删除选中的矩形

// 代码实现
const annotate = ref(null);

onMounted(() => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let el = document.getElementById('container');
  let imgSrc = 'https://konvajs.org/assets/lion.png';
  // let imgSrc = 'https://upload-images.jianshu.io/upload_images/5809200-03bbbd715c24750e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240'
  annotate.value = new ImgAnnotate({ el, width, height, imgSrc });
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