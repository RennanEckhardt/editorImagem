/**
 * Bloco de Exibição de Imagem
 * Renderiza a imagem no canvas
 */

class DisplayImageBlock {
  constructor(canvas, imageStorage) {
    this.canvas = canvas;
    this.imageStorage = imageStorage;
  }

  /**
   * Exibe uma imagem no canvas
   * @param {string} imageId - ID da imagem a ser exibida
   * @returns {Object} - {width, height} da imagem exibida
   */
  process(imageId) {
    const image = this.imageStorage.getImage(imageId);
    if (!image) {
      throw new Error(`Imagem ${imageId} não encontrada`);
    }

    const ctx = this.canvas.getContext('2d');
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    
    const imageData = ctx.createImageData(image.width, image.height);
    
    // Renderizar dados em escala de cinza
    for (let i = 0; i < image.rawData.length; i++) {
      const value = image.rawData[i];
      const idx = i * 4;
      imageData.data[idx] = value;     // R
      imageData.data[idx + 1] = value; // G
      imageData.data[idx + 2] = value; // B
      imageData.data[idx + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return {
      width: image.width,
      height: image.height
    };
  }
}

