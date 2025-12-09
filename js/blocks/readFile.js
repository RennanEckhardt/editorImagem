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
      // Verificar se é arquivo RAW pela extensão ou tipo
      const fileName = file.name.toLowerCase();
      const isRawFile = fileName.endsWith('.raw') || 
                        fileName.endsWith('.bin') || 
                        file.type === 'application/octet-stream' ||
                        file.type === '';
      
      // Se tem largura e altura especificadas, tratar como RAW
      const hasDimensions = width && height && width > 0 && height > 0;
      
      if (isRawFile || hasDimensions) {
        // Processar arquivo RAW binário
        // Tentar ler dimensões automaticamente do cabeçalho se não foram fornecidas
        (async () => {
          try {
            let finalWidth = width;
            let finalHeight = height;
            
            // Se não tem dimensões, tentar ler do cabeçalho
            if (!finalWidth || !finalHeight || finalWidth <= 0 || finalHeight <= 0) {
              const header = await this.readRawHeader(file);
              if (header) {
                finalWidth = header.width;
                finalHeight = header.height;
              } else {
                reject(new Error('Dimensões não encontradas. Arquivos RAW salvos por esta aplicação incluem as dimensões automaticamente. Para arquivos antigos, informe as dimensões manualmente.'));
                return;
              }
            }
            
            // Processar arquivo com as dimensões (do cabeçalho ou fornecidas)
            const rawData = await this.processRawFile(file, finalWidth, finalHeight);
            const imageId = this.imageStorage.addImage(rawData, finalWidth, finalHeight);
            resolve({ imageId, width: finalWidth, height: finalHeight });
          } catch (error) {
            reject(error);
          }
        })();
      } else if (file.type && file.type.startsWith('image/')) {
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
        // Tipo de arquivo não reconhecido
        reject(new Error('Tipo de arquivo não suportado. Use arquivos RAW (.raw, .bin) ou imagens (PNG, JPG, JPEG)'));
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
      if (!file) {
        reject(new Error('Arquivo não fornecido'));
        return;
      }
      
      const img = new Image();
      let objectUrl = null;
      
      img.onload = () => {
        try {
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
          
          // Limpar URL do objeto
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          
          resolve({
            rawData: grayData,
            width: img.width,
            height: img.height
          });
        } catch (error) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          reject(new Error(`Erro ao processar imagem: ${error.message}`));
        }
      };
      
      img.onerror = (error) => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        reject(new Error(`Erro ao carregar imagem. Verifique se o arquivo é uma imagem válida (PNG, JPG, JPEG).`));
      };
      
      try {
        objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      } catch (error) {
        reject(new Error(`Erro ao criar URL do arquivo: ${error.message}`));
      }
    });
  }

  /**
   * Tenta ler dimensões do cabeçalho do arquivo RAW
   * @param {File} file - Arquivo RAW
   * @returns {Promise<Object|null>} - {width, height} ou null se não tiver cabeçalho
   */
  async readRawHeader(file) {
    return new Promise((resolve, reject) => {
      // Verificar tamanho do arquivo primeiro
      const fileSize = file.size;
      
      // Precisa ter pelo menos 8 bytes para o cabeçalho
      if (fileSize < 8) {
        resolve(null); // Arquivo muito pequeno, sem cabeçalho
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Precisa ter pelo menos 8 bytes para o cabeçalho
          if (arrayBuffer.byteLength < 8) {
            resolve(null);
            return;
          }
          
          // Ler cabeçalho (primeiros 8 bytes)
          const headerView = new DataView(arrayBuffer);
          const width = headerView.getUint32(0, false);  // Big-endian
          const height = headerView.getUint32(4, false); // Big-endian
          
          // Validar dimensões (valores razoáveis)
          if (width > 0 && width < 100000 && height > 0 && height < 100000) {
            const expectedDataSize = width * height;
            const expectedTotalSize = 8 + expectedDataSize;
            
            console.log(`Lendo cabeçalho: width=${width}, height=${height}, fileSize=${fileSize}, expectedTotalSize=${expectedTotalSize}`);
            
            // Verificar se o tamanho do arquivo faz sentido
            // O arquivo deve ter pelo menos o tamanho mínimo esperado (cabeçalho + dados)
            // Se o arquivo for muito maior, pode ser que não tenha cabeçalho
            // Mas vamos ser mais permissivos - se as dimensões são válidas e o arquivo
            // tem pelo menos o tamanho mínimo, aceitar
            if (fileSize >= expectedTotalSize) {
              // Se o arquivo for muito maior (mais de 2x), provavelmente não tem cabeçalho
              // Mas se for até 2x maior, pode ser válido (arquivos podem ter padding, etc)
              const maxSize = expectedTotalSize * 2; // Permitir até 2x maior
              if (fileSize <= maxSize) {
                console.log(`✓ Cabeçalho detectado e validado: ${width}x${height}, arquivo: ${fileSize} bytes, esperado: ${expectedTotalSize} bytes`);
                resolve({ width, height });
                return;
              } else {
                console.log(`✗ Arquivo muito grande (${fileSize} bytes) para dimensões ${width}x${height} (esperado: ${expectedTotalSize} bytes, máximo: ${maxSize} bytes)`);
              }
            } else {
              // Arquivo menor que o esperado - pode ser que não tenha cabeçalho
              // Mas vamos verificar se pode ser um arquivo antigo (sem cabeçalho)
              // Se o tamanho do arquivo for exatamente width*height, não tem cabeçalho
              if (fileSize === expectedDataSize) {
                console.log(`✗ Arquivo parece não ter cabeçalho (tamanho exato dos dados: ${fileSize} bytes)`);
              } else {
                console.log(`✗ Arquivo muito pequeno (${fileSize} bytes) para dimensões ${width}x${height} (esperado: ${expectedTotalSize} bytes)`);
              }
            }
          } else {
            console.log(`✗ Dimensões inválidas no cabeçalho: ${width}x${height}`);
          }
          
          resolve(null); // Cabeçalho inválido ou não existe
        } catch (error) {
          console.error('Erro ao ler cabeçalho:', error);
          resolve(null); // Erro ao ler, assume que não tem cabeçalho
        }
      };
      
      reader.onerror = () => {
        console.error('Erro ao ler arquivo para cabeçalho');
        resolve(null);
      };
      
      // Ler apenas os primeiros 8 bytes para verificar o cabeçalho
      reader.readAsArrayBuffer(file.slice(0, 8));
    });
  }

  /**
   * Processa arquivo RAW binário
   * @param {File} file - Arquivo RAW
   * @param {number} width - Largura (opcional, será lida do cabeçalho se disponível)
   * @param {number} height - Altura (opcional, será lida do cabeçalho se disponível)
   * @returns {Promise<Uint8ClampedArray>} - Dados da imagem
   */
  async processRawFile(file, width = null, height = null) {
    return new Promise(async (resolve, reject) => {
      // Validar parâmetros
      if (!file) {
        reject(new Error('Arquivo não fornecido'));
        return;
      }
      
      // Tentar ler dimensões do cabeçalho se não foram fornecidas
      let finalWidth = width;
      let finalHeight = height;
      let hasHeader = false;
      let dataOffset = 0;
      
      if (!finalWidth || !finalHeight || finalWidth <= 0 || finalHeight <= 0) {
        const header = await this.readRawHeader(file);
        if (header) {
          finalWidth = header.width;
          finalHeight = header.height;
          hasHeader = true;
          dataOffset = 8; // Pular os 8 bytes do cabeçalho
        }
      }
      
      // Se ainda não tem dimensões, erro
      if (!finalWidth || !finalHeight || finalWidth <= 0 || finalHeight <= 0) {
        reject(new Error(`Dimensões não encontradas. Arquivos RAW salvos por esta aplicação incluem as dimensões automaticamente. Para arquivos antigos, informe as dimensões manualmente.`));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          if (!arrayBuffer) {
            reject(new Error('Erro ao ler arquivo: buffer vazio'));
            return;
          }
          
          const bytes = new Uint8Array(arrayBuffer);
          const expectedSize = finalWidth * finalHeight;
          const totalExpectedSize = hasHeader ? 8 + expectedSize : expectedSize;
          
          if (bytes.length === 0) {
            reject(new Error('Arquivo está vazio'));
            return;
          }
          
          if (bytes.length < totalExpectedSize) {
            reject(new Error(`Arquivo muito pequeno. Esperado: ${totalExpectedSize} bytes (${hasHeader ? '8 bytes cabeçalho + ' : ''}${expectedSize} bytes de dados para ${finalWidth}x${finalHeight}), recebido: ${bytes.length} bytes. Verifique se as dimensões estão corretas.`));
            return;
          }
          
          // Criar array de dados RAW (pular cabeçalho se existir)
          const rawData = new Uint8ClampedArray(expectedSize);
          for (let i = 0; i < expectedSize; i++) {
            rawData[i] = bytes[dataOffset + i];
          }
          
          resolve(rawData);
        } catch (error) {
          reject(new Error(`Erro ao processar dados do arquivo RAW: ${error.message}`));
        }
      };
      
      reader.onerror = (error) => {
        reject(new Error(`Erro ao ler arquivo RAW: ${error.message || 'Erro desconhecido'}`));
      };
      
      reader.onabort = () => {
        reject(new Error('Leitura do arquivo foi cancelada'));
      };
      
      // Ler arquivo como ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  }
}

