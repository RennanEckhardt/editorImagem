/**
 * Bloco de Diferença entre Duas Imagens
 * Calcula a diferença pixel a pixel entre duas imagens
 */

class DifferenceBlock {
  constructor(imageStorage) {
    this.imageStorage = imageStorage;
  }

  /**
   * Calcula a diferença entre duas imagens
   * @param {string} imageId1 - ID da primeira imagem
   * @param {string} imageId2 - ID da segunda imagem
   * @returns {Object} - {rawData, width, height} da imagem diferença
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
    
    // Verificar se as dimensões são compatíveis
    if (image1.width !== image2.width || image1.height !== image2.height) {
      throw new Error('As imagens devem ter as mesmas dimensões');
    }
    
    const width = image1.width;
    const height = image1.height;
    const result = new Uint8ClampedArray(width * height);
    
    // Calcular diferença absoluta pixel a pixel
    for (let i = 0; i < result.length; i++) {
      const diff = Math.abs(image1.rawData[i] - image2.rawData[i]);
      result[i] = Math.min(255, diff);
    }
    
    return {
      rawData: result,
      width,
      height
    };
  }
}

