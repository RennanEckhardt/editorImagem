/**
 * Bloco de Leitura de Arquivo RAW
 * Suporta arquivos RAW binários e imagens (PNG, JPG, JPEG)
 */

class ReadFileBlock {
  constructor(imageStorage) {
    this.imageStorage = imageStorage;
  }

  /**
   * Processa um arquivo e retorna os dados da imagem
   * @param {File} file - Arquivo a ser processado
   * @param {number} width - Largura (para arquivos RAW)
   * @param {number} height - Altura (para arquivos RAW)
   * @returns {Promise<Object>} - {imageId, width, height}
   */
  async process(file, width = null, height = null) {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        // Processar imagem (PNG, JPG, etc)
        this.processImageFile(file)
          .then(result => {
            const imageId = this.imageStorage.addImage(
              result.rawData,
              result.width,
              result.height
            );
            resolve({ imageId, width: result.width, height: result.height });
          })
          .catch(reject);
      } else {
        // Processar arquivo RAW binário
        if (!width || !height) {
          reject(new Error('Largura e altura são obrigatórias para arquivos RAW'));
          return;
        }
        this.processRawFile(file, width, height)
          .then(rawData => {
            const imageId = this.imageStorage.addImage(rawData, width, height);
            resolve({ imageId, width, height });
          })
          .catch(reject);
      }
    });
  }

  /**
   * Processa arquivo de imagem (PNG, JPG, etc)
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<Object>} - {rawData, width, height}
   */
  processImageFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const rgbData = imageData.data;
        
        // Converter para escala de cinza manualmente
        const grayData = new Uint8ClampedArray(img.width * img.height);
        for (let i = 0, j = 0; i < rgbData.length; i += 4, j++) {
          const r = rgbData[i];
          const g = rgbData[i + 1];
          const b = rgbData[i + 2];
          grayData[j] = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        }
        
        resolve({
          rawData: grayData,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Processa arquivo RAW binário
   * @param {File} file - Arquivo RAW
   * @param {number} width - Largura
   * @param {number} height - Altura
   * @returns {Promise<Uint8ClampedArray>} - Dados da imagem
   */
  processRawFile(file, width, height) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        const expectedSize = width * height;
        
        if (bytes.length < expectedSize) {
          reject(new Error(`Arquivo muito pequeno. Esperado: ${expectedSize} bytes, recebido: ${bytes.length}`));
          return;
        }
        
        const rawData = new Uint8ClampedArray(expectedSize);
        for (let i = 0; i < expectedSize; i++) {
          rawData[i] = bytes[i];
        }
        
        resolve(rawData);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo RAW'));
      reader.readAsArrayBuffer(file);
    });
  }
}

