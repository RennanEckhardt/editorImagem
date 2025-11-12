/**
 * Utilitários para manipulação de imagens em escala de cinza
 * Implementação manual sem uso de métodos prontos
 */

class ImageUtils {
  /**
   * Converte dados de imagem RGB para escala de cinza
   * @param {Uint8ClampedArray} rgbData - Dados RGB (RGBA)
   * @returns {Uint8ClampedArray} - Dados em escala de cinza
   */
  static rgbToGrayscale(rgbData) {
    const length = rgbData.length / 4;
    const grayData = new Uint8ClampedArray(length);
    
    for (let i = 0, j = 0; i < rgbData.length; i += 4, j++) {
      // Fórmula padrão de conversão RGB para grayscale
      const r = rgbData[i];
      const g = rgbData[i + 1];
      const b = rgbData[i + 2];
      grayData[j] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    }
    
    return grayData;
  }

  /**
   * Renderiza dados de imagem em escala de cinza no canvas
   * @param {HTMLCanvasElement} canvas - Elemento canvas
   * @param {Uint8ClampedArray} grayData - Dados em escala de cinza
   * @param {number} width - Largura da imagem
   * @param {number} height - Altura da imagem
   */
  static renderGrayscale(canvas, grayData, width, height) {
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    const imageData = ctx.createImageData(width, height);
    
    for (let i = 0; i < grayData.length; i++) {
      const value = grayData[i];
      const idx = i * 4;
      imageData.data[idx] = value;     // R
      imageData.data[idx + 1] = value; // G
      imageData.data[idx + 2] = value; // B
      imageData.data[idx + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Cria uma cópia dos dados da imagem
   * @param {Uint8ClampedArray} data - Dados originais
   * @returns {Uint8ClampedArray} - Cópia dos dados
   */
  static cloneImageData(data) {
    return new Uint8ClampedArray(data);
  }

  /**
   * Valida se os dados têm o tamanho correto para as dimensões
   * @param {Uint8ClampedArray} data - Dados da imagem
   * @param {number} width - Largura
   * @param {number} height - Altura
   * @returns {boolean}
   */
  static validateImageData(data, width, height) {
    return data.length === width * height;
  }
}

