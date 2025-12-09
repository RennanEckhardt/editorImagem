/**
 * Bloco de Comparar Imagens
 * Exibe duas imagens lado a lado no canvas
 */

class CompareImagesBlock {
  constructor(canvas, imageStorage) {
    this.canvas = canvas;
    this.imageStorage = imageStorage;
  }

  /**
   * Exibe duas imagens lado a lado no canvas
   * @param {string} imageId1 - ID da primeira imagem
   * @param {string} imageId2 - ID da segunda imagem
   * @returns {Object} - {width, height} do canvas resultante
   */
  process(imageId1, imageId2) {
    const image1 = this.imageStorage.getImage(imageId1);
    const image2 = this.imageStorage.getImage(imageId2);
    
    if (!image1) {
      throw new Error(`Imagem ${imageId1} não encontrada`);
    }
    if (!image2) {
      throw new Error(`Imagem ${imageId2} não encontrada`);
    }

    const ctx = this.canvas.getContext('2d');
    
    // Calcular dimensões do canvas para exibir ambas as imagens lado a lado
    const maxWidth = Math.max(image1.width, image2.width);
    const maxHeight = Math.max(image1.height, image2.height);
    
    // Canvas terá o dobro da largura para acomodar ambas as imagens
    this.canvas.width = maxWidth * 2;
    this.canvas.height = maxHeight;
    
    // Limpar canvas com fundo preto
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Criar ImageData para a primeira imagem
    const imageData1 = ctx.createImageData(image1.width, image1.height);
    for (let i = 0; i < image1.rawData.length; i++) {
      const value = image1.rawData[i];
      const idx = i * 4;
      imageData1.data[idx] = value;     // R
      imageData1.data[idx + 1] = value; // G
      imageData1.data[idx + 2] = value; // B
      imageData1.data[idx + 3] = 255;   // A
    }
    
    // Criar ImageData para a segunda imagem
    const imageData2 = ctx.createImageData(image2.width, image2.height);
    for (let i = 0; i < image2.rawData.length; i++) {
      const value = image2.rawData[i];
      const idx = i * 4;
      imageData2.data[idx] = value;     // R
      imageData2.data[idx + 1] = value; // G
      imageData2.data[idx + 2] = value; // B
      imageData2.data[idx + 3] = 255;   // A
    }
    
    // Calcular posição vertical para centralizar imagens de alturas diferentes
    const offsetY1 = Math.floor((maxHeight - image1.height) / 2);
    const offsetY2 = Math.floor((maxHeight - image2.height) / 2);
    
    // Desenhar primeira imagem à esquerda (centralizada verticalmente)
    ctx.putImageData(imageData1, 0, offsetY1);
    
    // Desenhar segunda imagem à direita (centralizada verticalmente)
    ctx.putImageData(imageData2, maxWidth, offsetY2);
    
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }
}

