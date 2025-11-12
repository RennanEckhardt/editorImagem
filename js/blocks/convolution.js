/**
 * Bloco de Convolução (Processamento Local)
 * Implementação manual de convolução com máscaras parametrizáveis
 * Suporta máscaras conhecidas: média, mediana, Laplaciano
 */

class ConvolutionBlock {
  /**
   * Aplica convolução aos dados da imagem
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @param {number} width - Largura da imagem
   * @param {number} height - Altura da imagem
   * @param {Array<Array<number>>} kernel - Máscara de convolução (matriz)
   * @returns {Uint8ClampedArray} - Dados processados
   */
  process(rawData, width, height, kernel) {
    const kernelSize = kernel.length;
    const kernelRadius = Math.floor(kernelSize / 2);
    const result = new Uint8ClampedArray(rawData.length);
    
    // Inicializar resultado com dados originais (para bordas)
    for (let i = 0; i < rawData.length; i++) {
      result[i] = rawData[i];
    }
    
    // Aplicar convolução (ignorando bordas)
    for (let y = kernelRadius; y < height - kernelRadius; y++) {
      for (let x = kernelRadius; x < width - kernelRadius; x++) {
        let sum = 0;
        
        // Aplicar kernel
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const imgY = y + ky - kernelRadius;
            const imgX = x + kx - kernelRadius;
            const pixelIndex = imgY * width + imgX;
            sum += rawData[pixelIndex] * kernel[ky][kx];
          }
        }
        
        // Limitar valor entre 0 e 255
        const pixelIndex = y * width + x;
        result[pixelIndex] = Math.max(0, Math.min(255, Math.round(sum)));
      }
    }
    
    return result;
  }

  /**
   * Cria máscara de média
   * @param {number} size - Tamanho da máscara (3, 5, 7, etc.)
   * @returns {Array<Array<number>>} - Máscara de média
   */
  static createMeanKernel(size) {
    const kernel = [];
    const value = 1 / (size * size);
    
    for (let i = 0; i < size; i++) {
      kernel[i] = [];
      for (let j = 0; j < size; j++) {
        kernel[i][j] = value;
      }
    }
    
    return kernel;
  }

  /**
   * Cria máscara de Laplaciano (detecção de bordas)
   * @returns {Array<Array<number>>} - Máscara de Laplaciano
   */
  static createLaplacianKernel() {
    return [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ];
  }

  /**
   * Cria máscara de Laplaciano alternativa (8-vizinhança)
   * @returns {Array<Array<number>>} - Máscara de Laplaciano
   */
  static createLaplacianKernel8() {
    return [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1]
    ];
  }

  /**
   * Aplica filtro de mediana (não é convolução, mas processamento local)
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @param {number} width - Largura
   * @param {number} height - Altura
   * @param {number} windowSize - Tamanho da janela (3, 5, 7, etc.)
   * @returns {Uint8ClampedArray} - Dados processados
   */
  static applyMedianFilter(rawData, width, height, windowSize) {
    const result = new Uint8ClampedArray(rawData.length);
    const radius = Math.floor(windowSize / 2);
    
    // Copiar dados originais
    for (let i = 0; i < rawData.length; i++) {
      result[i] = rawData[i];
    }
    
    // Aplicar filtro de mediana
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const values = [];
        
        // Coletar valores da janela
        for (let wy = -radius; wy <= radius; wy++) {
          for (let wx = -radius; wx <= radius; wx++) {
            const idx = (y + wy) * width + (x + wx);
            values.push(rawData[idx]);
          }
        }
        
        // Ordenar e pegar mediana
        values.sort((a, b) => a - b);
        const medianIndex = Math.floor(values.length / 2);
        result[y * width + x] = values[medianIndex];
      }
    }
    
    return result;
  }
}

