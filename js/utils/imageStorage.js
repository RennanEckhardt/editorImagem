/**
 * Gerenciamento de múltiplas imagens no workspace
 */

class ImageStorage {
  constructor() {
    this.images = new Map(); // Map<imageId, {rawData, width, height}>
    this.nextId = 1;
  }

  /**
   * Adiciona uma nova imagem ao workspace
   * @param {Uint8ClampedArray} rawData - Dados da imagem
   * @param {number} width - Largura
   * @param {number} height - Altura
   * @returns {string} - ID da imagem
   */
  addImage(rawData, width, height) {
    const id = `img_${this.nextId++}`;
    this.images.set(id, {
      rawData: new Uint8ClampedArray(rawData),
      width,
      height
    });
    return id;
  }

  /**
   * Obtém uma imagem pelo ID
   * @param {string} imageId - ID da imagem
   * @returns {Object|null} - {rawData, width, height} ou null
   */
  getImage(imageId) {
    const img = this.images.get(imageId);
    if (!img) return null;
    return {
      rawData: new Uint8ClampedArray(img.rawData),
      width: img.width,
      height: img.height
    };
  }

  /**
   * Remove uma imagem do workspace
   * @param {string} imageId - ID da imagem
   */
  removeImage(imageId) {
    this.images.delete(imageId);
  }

  /**
   * Lista todas as imagens disponíveis
   * @returns {Array} - Array de {id, width, height}
   */
  listImages() {
    return Array.from(this.images.entries()).map(([id, img]) => ({
      id,
      width: img.width,
      height: img.height
    }));
  }

  /**
   * Limpa todas as imagens
   */
  clear() {
    this.images.clear();
    this.nextId = 1;
  }

  /**
   * Verifica se uma imagem existe
   * @param {string} imageId - ID da imagem
   * @returns {boolean}
   */
  hasImage(imageId) {
    return this.images.has(imageId);
  }
}

