/**
 * Bloco de Ajuste de Brilho (Processamento Pontual)
 * Implementação manual sem métodos prontos
 */

class BrightnessBlock {
  /**
   * Aplica ajuste de brilho aos dados da imagem
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @param {number} value - Valor de ajuste de brilho (-255 a 255)
   * @returns {Uint8ClampedArray} - Dados processados
   */
  process(rawData, value) {
    const result = new Uint8ClampedArray(rawData.length);
    
    for (let i = 0; i < rawData.length; i++) {
      // Aplicar ajuste de brilho e limitar entre 0 e 255
      const newValue = rawData[i] + value;
      result[i] = Math.max(0, Math.min(255, newValue));
    }
    
    return result;
  }
}

