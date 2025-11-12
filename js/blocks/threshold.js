/**
 * Bloco de Limiarização (Processamento Pontual)
 * Implementação manual sem métodos prontos
 */

class ThresholdBlock {
  /**
   * Aplica limiarização aos dados da imagem
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @param {number} threshold - Valor de limiar (0 a 255)
   * @returns {Uint8ClampedArray} - Dados processados (binário)
   */
  process(rawData, threshold) {
    const result = new Uint8ClampedArray(rawData.length);
    
    for (let i = 0; i < rawData.length; i++) {
      // Se o valor for maior que o limiar, define como 255 (branco), senão 0 (preto)
      result[i] = rawData[i] > threshold ? 255 : 0;
    }
    
    return result;
  }
}

