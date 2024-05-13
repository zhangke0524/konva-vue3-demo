

export const initImage = (imageUrl, container) => {
  // 将图片添加到画布中作为背景，图片在保持宽高比的情况下，填充整个画布
  let imageObj = new Image();
  imageObj.src = imageUrl;
  let imageWidth = container.clientWidth;
  let imageHeight = container.clientHeight;
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
    layer.add(image);
  };
  imageWidth = imageWidth;
  imageHeight = imageHeight;
}