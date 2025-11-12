/**
 * Bloco de Gravação de Arquivo RAW
 * Salva a imagem processada como arquivo RAW binário
 */

class SaveFileBlock {
  constructor(imageStorage) {
    this.imageStorage = imageStorage;
  }

  /**
   * Salva uma imagem como arquivo RAW
   * @param {string} imageId - ID da imagem a ser salva
   * @param {string} filename - Nome do arquivo (opcional)
   */
  process(imageId, filename = null) {
    const image = this.imageStorage.getImage(imageId);
    if (!image) {
      throw new Error(`Imagem ${imageId} não encontrada`);
    }

    // Criar blob com os dados RAW
    const blob = new Blob([image.rawData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Criar link de download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `image_${imageId}_${image.width}x${image.height}.raw`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Limpar URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return {
      success: true,
      filename: a.download,
      size: image.rawData.length
    };
  }
}

