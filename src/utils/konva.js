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
  // 当前矩形所在的group
  currentGroup = null;
  // 当前选中的group
  selectedGroup = null;
  // 是否正在绘制
  isDrawing = false;
  // 是否点击在group上
  isClickInGroup = false;
  // konva数据(主要用于记录绘制的矩形数据)
  konvaData = [];
  // 画布上的数据（目前用来进行数据回显）
  annotateData = []

  constructor({ width, height, el, imgSrc, initData }) {
    this.stage = new Konva.Stage({
      container: el,
      width: width,
      height: height
    });

    this.annotateData = initData;
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
      // 绘制已有的矩形
      this.init();
    };
    this.imageObj.src = imgSrc;
  }

  // 初始化已有的矩形(即数据回显)
  init() {
    if (this.annotateData.length > 0) {
      this.annotateData.forEach((posData) => {
        this.drawRect(null, posData);
      });
      this.layer.batchDraw();
    }
  }

  // 判断当前位置是否在图片上
  getIsPosInImage() {
    const pos = this.stage.getPointerPosition();
    if (pos.x < 0 || pos.x > this.imageObj.width || pos.y < 0 || pos.y > this.imageObj.height) {
      return false;
    }
    return true;
  }

  /*
  * bindEvent 为stage绑定事件
  */
  bindEvent() {
    // 鼠标按下就开始绘制矩形
    this.stage.on('mousedown', (e) => {
      // 如果点击在group上，则不绘制矩形
      if (this.isClickInGroup) return;
      // 判断鼠标按下所在的位置是否在图片上，如果不在图片上则不绘制
      let isPosInImage = this.getIsPosInImage();
      if (!isPosInImage) return;
      if (this.currentPencil === 'rect' && !this.isDrawing) {
        this.drawRect(e);
        this.selectedGroup = null;
      }
    });
    // 鼠标移动时更新矩形大小
    this.stage.on('mousemove', (e) => {
      let isPosInImage = this.getIsPosInImage();
      if (!isPosInImage) return;
      if (this.currentPencil === 'rect') {
        this.updateRect(e);
      }
    });
    // 鼠标松开时结束绘制
    this.stage.on('mouseup', (e) => {
      let isPosInImage = this.getIsPosInImage();
      if (!isPosInImage) return;
      if (this.currentPencil === 'rect') {
        this.endDrawRect(e);
      }
    });
  }

  // 绘制矩形
  drawRect(e, posData) {
    let pos = null;
    let width = 0;
    let height = 0;
    if (posData) {
      // 如果传入了posData，则表示是数据回显，需要将posData中的数据解构出来
      pos = posData;
      width = posData.width;
      height = posData.height;
      this.isDrawing = false;
    } else {
      // 如果没有传入posData，则表示是用户手动绘制，需要获取当前鼠标的位置
      pos = this.stage.getPointerPosition();
      this.isDrawing = true;
    }
    this.currentRect = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: width,
      height: height,
      stroke: 'red',
      strokeWidth: 2
    });
    // 除了矩形外，还需要给这个矩形添加一个label标签
    const label = new Konva.Label({
      x: pos.x,
      y: pos.y,
      opacity: 0.75
    });
    label.add(new Konva.Tag({
      fill: 'yellow'
    }));
    label.add(new Konva.Text({
      text: 'Hello',
      fontFamily: 'Calibri',
      fontSize: 18,
      padding: 5,
      fill: 'black'
    }));
    // 将label和矩形添加到一个group中
    this.currentGroup = new Konva.Group();
    this.currentGroup.add(this.currentRect);
    this.currentGroup.add(label);
    // 为group绑定事件，用于通过鼠标点击group来选中当前的矩形，方便后续的删除操作
    this.bindEventForGroup(this.currentGroup);
    this.layer.add(this.currentGroup);
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
    // 将绘制后的数据传送到konvaVueNew中进行保存
    this.konvaData = this.getGroupData();
    bus.emit('canvasData', this.konvaData);
    this.currentRect = null;
    this.currentGroup = null;
  }

  // 获取当前画布上的数据
  getGroupData() {
    const data = [];
    this.layer.find('Group').forEach((group) => {
      const rect = group.findOne('Rect');
      if (rect) {
        data.push(group)
      }
    });
    return data;
  }

  /*
  * bindEventForGroup 为group绑定事件
  */
  bindEventForGroup(group) {
    const layer = this.layer;
    const getGroupData = this.getGroupData.bind(this);
    group.on('mousedown', () => {
      this.isClickInGroup = true;
    });
    group.on('mouseup', () => {
      this.isClickInGroup = false;
    });
    group.on('mouseover', function() {
      document.body.style.cursor = 'pointer';
    });
    group.on('mouseout', function() {
      document.body.style.cursor = 'default';
    });
    group.on('click', function() {
      this.selectedGroup = group;
      // 选中当前group时，将该group的矩形高亮显示, 其他group的矩形恢复原状
      // layer.find('Group').forEach((g) => {
      //   const r = g.findOne('Rect');
      //   r && r.stroke('red');
      // });
      // const rect = group.findOne('Rect');
      // rect.stroke('blue');
      // layer.batchDraw();
      // 如果此时用户按下了delete键或者backspace，则删除当前选中的group
      // 需要使用非箭头函数，否则this指向会有问题
      document.onkeydown = function(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          group.destroy();
          layer.batchDraw();
          // 删除后需要将当前选中的group置为null
          this.selectedGroup = null;
          // 删除后需要将当前的数据更新
          this.konvaData = getGroupData();
          bus.emit('canvasData', this.konvaData);
        }
      };
    })
  }

}
