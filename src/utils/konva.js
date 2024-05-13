import Konva from 'konva';

export default class ImgAnnotate {
  stage = null;
  layer = null;
  imageObj = null;

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
      const img = new Konva.Image({
        x: 0,
        y: 0,
        image: this.imageObj,
        width: this.imageObj.width,
        height: this.imageObj.height
      });
      layer.add(img);
      layer.batchDraw();
    };
    this.imageObj.src = imgSrc;
  }
}
