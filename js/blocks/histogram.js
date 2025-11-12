/**
 * Bloco de Plotagem de Histograma
 * Calcula e exibe o histograma da imagem
 */

class HistogramBlock {
  /**
   * Calcula o histograma da imagem
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @returns {Array<number>} - Histograma (256 valores)
   */
  calculate(rawData) {
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < rawData.length; i++) {
      const value = rawData[i];
      if (value >= 0 && value <= 255) {
        histogram[value]++;
      }
    }
    
    return histogram;
  }

  /**
   * Renderiza o histograma em um canvas
   * @param {HTMLCanvasElement} canvas - Canvas para renderizar
   * @param {Array<number>} histogram - Dados do histograma
   */
  render(canvas, histogram) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Encontrar valor máximo para normalização
    const maxValue = Math.max(...histogram);
    const barWidth = width / 256;
    
    // Desenhar eixos
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.moveTo(0, height - 1);
    ctx.lineTo(0, 0);
    ctx.stroke();
    
    // Desenhar barras do histograma
    ctx.fillStyle = '#3b82f6';
    for (let i = 0; i < 256; i++) {
      const barHeight = (histogram[i] / maxValue) * (height - 20);
      const x = i * barWidth;
      const y = height - barHeight - 1;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }
    
    // Adicionar labels
    ctx.fillStyle = '#000000';
    ctx.font = '10px sans-serif';
    ctx.fillText('0', 2, height - 2);
    ctx.fillText('255', width - 30, height - 2);
  }
}

