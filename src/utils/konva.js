import Konva from 'konva';
import bus from './bus.js';

export default class ImgAnnotate {
  stage = null;
  layer = null;
  // 原始的图片对象
  imageObj = null;
  // 放在konva中的图片对象
  konvaImage = null;
  // 当前画笔-仅支持绘制矩形
  currentPencil = 'rect'
  // 当前绘制的矩形
  currentRect = null;
  // 是否正在绘制
  isDrawing = false;
  // konva数据(主要用于记录绘制的矩形数据)
  konvaData = [];

  constructor({ width, height, el, imgSrc }) {
    this.stage = new Konva.Stage({
      container: el,
      width: width,
      height: height
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.initImage(this.layer, imgSrc);
  }

  // 初始化图片, 添加到layer
  initImage(layer, imgSrc) {
    this.imageObj = new Image();
    this.imageObj.onload = () => {
      this.konvaImage = new Konva.Image({
        x: 0,
        y: 0,
        image: this.imageObj,
        width: this.imageObj.width,
        height: this.imageObj.height
      });
      this.bindEvent();
      // 使用drawHitFromCache需要保证图片和当前执行的代码在同一个域下
      // this.konvaImage.cache();
      // this.konvaImage.drawHitFromCache()
      layer.add(this.konvaImage);
      layer.batchDraw();
    };
    this.imageObj.src = imgSrc;
  }

  bindEvent() {
    // 鼠标按下就开始绘制矩形
    this.stage.on('mousedown', (e) => {
      if (this.currentPencil === 'rect') {
        this.drawRect(e);
      }
    });
    // 鼠标移动时更新矩形大小
    this.stage.on('mousemove', (e) => {
      if (this.currentPencil === 'rect') {
        this.updateRect(e);
      }
    });
    // 鼠标松开时结束绘制
    this.stage.on('mouseup', (e) => {
      if (this.currentPencil === 'rect') {
        this.endDrawRect(e);
      }
    });
  }

  // 绘制矩形
  drawRect(e) {
    this.isDrawing = true;
    const pos = this.stage.getPointerPosition();
    this.currentRect = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      stroke: 'red',
      strokeWidth: 2
    });
    this.layer.add(this.currentRect);
  }

  // 更新矩形大小
  updateRect(e) {
    if (!this.isDrawing || !this.currentRect) return;
    const pos = this.stage.getPointerPosition();
    const x = this.currentRect.x();
    const y = this.currentRect.y();
    this.currentRect.width(pos.x - x);
    this.currentRect.height(pos.y - y);
    this.layer.batchDraw();
  }

  // 结束绘制
  endDrawRect(e) {
    this.isDrawing = false;
    this.currentRect = null;
    this.konvaData = this.getGroupData();
    // 将绘制后的数据传送到konvaVueNew中进行保存
    bus.emit('canvasData', this.konvaData);
  }

  // 获取当前画布上的数据
  getGroupData() {
    const group = new Konva.Group();
    this.layer.children.forEach((item) => {
      if (item instanceof Konva.Rect) {
        group.add(item.clone());
      }
    });
    return group.getChildren().map((item) => {
      return item;
    });
  }

}
