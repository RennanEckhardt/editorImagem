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

    // Garantir que o nome do arquivo tenha a extensão .raw
    let finalFilename = filename || `image_${imageId}_${image.width}x${image.height}.raw`;
    if (!finalFilename.endsWith('.raw')) {
      finalFilename += '.raw';
    }

    // Converter Uint8ClampedArray para Uint8Array para garantir compatibilidade
    const rawBytes = new Uint8Array(image.rawData);
    
    // Criar cabeçalho com as dimensões (8 bytes: 4 para width, 4 para height)
    // Formato: [width (4 bytes), height (4 bytes), dados da imagem...]
    const header = new ArrayBuffer(8);
    const headerView = new DataView(header);
    headerView.setUint32(0, image.width, false);   // Big-endian
    headerView.setUint32(4, image.height, false);   // Big-endian
    
    // Combinar cabeçalho + dados da imagem
    const fileData = new Uint8Array(8 + rawBytes.length);
    fileData.set(new Uint8Array(header), 0);
    fileData.set(rawBytes, 8);
    
    // Criar blob com os dados RAW (incluindo cabeçalho)
    const blob = new Blob([fileData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Criar link de download para o arquivo RAW
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Aguardar um pouco antes de remover para garantir que o download iniciou
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Criar arquivo de texto com as dimensões (mais fácil de ler)
    const metadataText = `Dimensões do Arquivo RAW
========================

Arquivo: ${finalFilename}
Largura: ${image.width} pixels
Altura: ${image.height} pixels
Tamanho: ${image.rawData.length} bytes (dados) + 8 bytes (cabeçalho) = ${image.rawData.length + 8} bytes total
Formato: RAW (8 bits por pixel) com cabeçalho de dimensões

✨ NOVO: As dimensões estão salvas automaticamente no cabeçalho do arquivo!

INSTRUÇÕES PARA CARREGAR:
1. Abra a aplicação PSE-Image
2. Clique em "Leitura de Arquivo"
3. Selecione o arquivo: ${finalFilename}
4. As dimensões serão detectadas automaticamente do cabeçalho
5. Clique em "Carregar"

NOTA: Arquivos RAW não podem ser abertos diretamente.
Eles precisam ser carregados através da aplicação.

Arquivos antigos sem cabeçalho ainda precisam das dimensões informadas manualmente:
   - Largura: ${image.width}
   - Altura: ${image.height}`;
    
    const metadataBlob = new Blob([metadataText], { type: 'text/plain;charset=utf-8' });
    const metadataUrl = URL.createObjectURL(metadataBlob);
    const metadataFilename = finalFilename.replace('.raw', '_dimensoes.txt');
    
    // Criar link de download para o arquivo de metadados
    const metadataLink = document.createElement('a');
    metadataLink.href = metadataUrl;
    metadataLink.download = metadataFilename;
    metadataLink.style.display = 'none';
    document.body.appendChild(metadataLink);
    
    // Baixar metadados após um pequeno delay para não interferir com o download do RAW
    setTimeout(() => {
      metadataLink.click();
      setTimeout(() => {
        document.body.removeChild(metadataLink);
        URL.revokeObjectURL(metadataUrl);
      }, 100);
    }, 300);
    
    return {
      success: true,
      filename: finalFilename,
      metadataFilename: metadataFilename,
      size: image.rawData.length,
      width: image.width,
      height: image.height
    };
  }
}

