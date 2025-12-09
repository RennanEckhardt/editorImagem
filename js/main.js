/**
 * Arquivo principal - Orquestração do PSE-Image
 * Gerencia o fluxo de processamento e a interface
 */

class PSEImage {
  constructor() {
    // Inicializar componentes
    this.imageStorage = new ImageStorage();
    this.canvas = document.getElementById('image-canvas');
    this.flowSteps = [];
    
    // Inicializar blocos
    this.blocks = {
      readFile: new ReadFileBlock(this.imageStorage),
      displayImage: new DisplayImageBlock(this.canvas, this.imageStorage),
      saveFile: new SaveFileBlock(this.imageStorage),
      compareImages: new CompareImagesBlock(this.canvas, this.imageStorage),
      brightness: new BrightnessBlock(),
      threshold: new ThresholdBlock(),
      convolution: new ConvolutionBlock(),
      histogram: new HistogramBlock(),
      difference: new DifferenceBlock(this.imageStorage)
    };
    
    // Estado atual da execução
    this.currentImageId = null;
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Botões de blocos
    document.querySelectorAll('[data-block-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const blockId = btn.dataset.blockId;
        this.handleBlockClick(blockId);
      });
    });

    // Botão de novo fluxo
    document.getElementById('new-flow-btn').addEventListener('click', () => {
      this.newFlow();
    });

    // Botão de executar fluxo
    document.getElementById('run-flow-btn').addEventListener('click', () => {
      this.runFlow();
    });

    // Modais
    this.initializeModals();
  }

  initializeModals() {
    // Modal de leitura de arquivo
    document.getElementById('add-read-file-btn').addEventListener('click', () => {
      this.handleReadFile();
    });

    // Modal de limiarização
    document.getElementById('add-threshold-btn').addEventListener('click', () => {
      this.handleThreshold();
    });

    // Modal de brilho
    document.getElementById('add-brightness-btn').addEventListener('click', () => {
      this.handleBrightness();
    });

    // Modal de convolução
    document.getElementById('add-convolution-btn').addEventListener('click', () => {
      this.handleConvolution();
    });

    // Mostrar/ocultar campo de kernel customizado
    const kernelTypeSelect = document.getElementById('convolution-kernel-type');
    const customKernelContainer = document.getElementById('custom-kernel-container');
    if (kernelTypeSelect && customKernelContainer) {
      kernelTypeSelect.addEventListener('change', () => {
        if (kernelTypeSelect.value === 'custom') {
          customKernelContainer.classList.remove('hidden');
        } else {
          customKernelContainer.classList.add('hidden');
        }
      });
    }

    // Modal de exibição de imagem
    document.getElementById('add-display-image-btn').addEventListener('click', () => {
      this.handleDisplayImage();
    });

    // Modal de salvar arquivo
    document.getElementById('add-save-file-btn').addEventListener('click', () => {
      this.handleSaveFile();
    });

    // Modal de comparar imagens
    document.getElementById('add-compare-images-btn').addEventListener('click', () => {
      this.handleCompareImages();
    });

    // Fechar visualização em tela cheia de comparação
    document.getElementById('close-compare-fullscreen').addEventListener('click', () => {
      document.getElementById('compare-images-fullscreen').classList.add('hidden');
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const fullscreen = document.getElementById('compare-images-fullscreen');
        if (!fullscreen.classList.contains('hidden')) {
          fullscreen.classList.add('hidden');
        }
      }
    });

    // Modal de histograma
    document.getElementById('add-histogram-btn').addEventListener('click', () => {
      this.handleHistogram();
    });

    // Modal de diferença
    document.getElementById('add-difference-btn').addEventListener('click', () => {
      this.handleDifference();
    });
  }

  handleBlockClick(blockId) {
    switch (blockId) {
      case 'read_file':
        document.getElementById('read-file-modal').classList.remove('hidden');
        break;
      case 'display_image':
        // Abre modal para selecionar imagem a exibir
        document.getElementById('display-image-modal').classList.remove('hidden');
        this.updateImageSelects();
        break;
      case 'save_file':
        document.getElementById('save-file-modal').classList.remove('hidden');
        this.updateImageSelects();
        break;
      case 'compare_images':
        document.getElementById('compare-images-modal').classList.remove('hidden');
        this.updateImageSelects();
        break;
      case 'threshold':
        document.getElementById('threshold-modal').classList.remove('hidden');
        break;
      case 'brightness':
        document.getElementById('brightness-modal').classList.remove('hidden');
        break;
      case 'convolution':
        document.getElementById('convolution-modal').classList.remove('hidden');
        break;
      case 'histogram':
        document.getElementById('histogram-modal').classList.remove('hidden');
        break;
      case 'difference':
        document.getElementById('difference-modal').classList.remove('hidden');
        break;
    }
  }

  async handleReadFile() {
    const file = document.getElementById('raw-file-input').files[0];
    const widthInput = document.getElementById('raw-width').value;
    const heightInput = document.getElementById('raw-height').value;
    
    if (!file) {
      alert('Selecione um arquivo!');
      return;
    }

    // Verificar se é arquivo RAW pela extensão
    const fileName = file.name.toLowerCase();
    const isRawFile = fileName.endsWith('.raw') || fileName.endsWith('.bin');
    
    // Se for RAW e não tiver dimensões informadas, tentar ler do cabeçalho
    if (isRawFile) {
      const width = parseInt(widthInput);
      const height = parseInt(heightInput);
      
      // Se não tem dimensões, tentar ler automaticamente
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        try {
          this.showLoading(true);
          console.log('Tentando ler cabeçalho do arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
          const header = await this.blocks.readFile.readRawHeader(file);
          
          if (header) {
            console.log('Cabeçalho lido com sucesso:', header);
            // Preencher campos automaticamente
            document.getElementById('raw-width').value = header.width;
            document.getElementById('raw-height').value = header.height;
            // Continuar com o processamento
          } else {
            console.log('Cabeçalho não encontrado no arquivo');
            // Arquivo sem cabeçalho, precisa informar dimensões
            alert('Este arquivo RAW não possui cabeçalho com dimensões.\n\n' +
                  'Arquivos salvos por esta aplicação incluem as dimensões automaticamente.\n' +
                  'Para arquivos antigos, informe as dimensões manualmente.');
            this.showLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao ler cabeçalho:', error);
          this.showLoading(false);
          alert('Erro ao ler cabeçalho do arquivo: ' + error.message);
          return;
        }
      }
    }

    try {
      this.showLoading(true);
      
      // Passar dimensões (podem ter sido preenchidas automaticamente)
      const width = parseInt(document.getElementById('raw-width').value) || null;
      const height = parseInt(document.getElementById('raw-height').value) || null;
      
      const result = await this.blocks.readFile.process(file, width, height);
      this.currentImageId = result.imageId;
      this.addFlowStep('read_file', { imageId: result.imageId, width: result.width, height: result.height });
      
      // Exibir a imagem carregada
      this.blocks.displayImage.process(result.imageId);
      this.updateImageInfo(result.width, result.height);
      
      document.getElementById('read-file-modal').classList.add('hidden');
    } catch (error) {
      console.error('Erro ao carregar arquivo:', error);
      alert('Erro ao carregar arquivo: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  handleThreshold() {
    const value = parseInt(document.getElementById('threshold-value').value);
    if (isNaN(value) || value < 0 || value > 255) {
      alert('Valor de limiar deve estar entre 0 e 255');
      return;
    }
    this.addFlowStep('threshold', { value });
    document.getElementById('threshold-modal').classList.add('hidden');
  }

  handleBrightness() {
    const value = parseInt(document.getElementById('brightness-value').value);
    if (isNaN(value)) {
      alert('Valor de brilho inválido');
      return;
    }
    this.addFlowStep('brightness', { value });
    document.getElementById('brightness-modal').classList.add('hidden');
  }

  handleConvolution() {
    const kernelType = document.getElementById('convolution-kernel-type').value;
    const kernelSize = parseInt(document.getElementById('convolution-kernel-size').value);
    let kernel = null;

    if (kernelType === 'custom') {
      // Ler kernel customizado
      const kernelText = document.getElementById('convolution-kernel-custom').value;
      try {
        kernel = this.parseCustomKernel(kernelText, kernelSize);
      } catch (error) {
        alert('Erro ao parsear kernel: ' + error.message);
        return;
      }
    } else if (kernelType === 'mean') {
      kernel = ConvolutionBlock.createMeanKernel(kernelSize);
    } else if (kernelType === 'laplacian') {
      kernel = ConvolutionBlock.createLaplacianKernel();
    } else if (kernelType === 'laplacian8') {
      kernel = ConvolutionBlock.createLaplacianKernel8();
    } else if (kernelType === 'median') {
      this.addFlowStep('median', { windowSize: kernelSize });
      document.getElementById('convolution-modal').classList.add('hidden');
      return;
    }

    this.addFlowStep('convolution', { kernel, kernelSize });
    document.getElementById('convolution-modal').classList.add('hidden');
  }

  parseCustomKernel(text, size) {
    const lines = text.trim().split('\n');
    if (lines.length !== size) {
      throw new Error(`Kernel deve ter ${size} linhas`);
    }
    
    const kernel = [];
    for (let i = 0; i < lines.length; i++) {
      const values = lines[i].trim().split(/\s+/);
      if (values.length !== size) {
        throw new Error(`Linha ${i + 1} deve ter ${size} valores`);
      }
      kernel[i] = values.map(v => parseFloat(v));
    }
    return kernel;
  }

  handleDisplayImage() {
    const imageId = document.getElementById('display-image-id').value;
    
    if (!imageId || !this.imageStorage.hasImage(imageId)) {
      alert('Selecione uma imagem válida!');
      return;
    }

    try {
      const result = this.blocks.displayImage.process(imageId);
      this.updateImageInfo(result.width, result.height);
      document.getElementById('display-image-modal').classList.add('hidden');
    } catch (error) {
      alert('Erro ao exibir imagem: ' + error.message);
    }
  }

  handleSaveFile() {
    const imageId = document.getElementById('save-file-image-id').value;
    const filename = document.getElementById('save-file-filename').value || null;
    
    if (!imageId || !this.imageStorage.hasImage(imageId)) {
      alert('Selecione uma imagem válida!');
      return;
    }

    try {
      const result = this.blocks.saveFile.process(imageId, filename);
      const image = this.imageStorage.getImage(imageId);
      
      // Mensagem informativa sobre como carregar o arquivo
      alert(`Arquivo salvo com sucesso!\n\n` +
            `Arquivo: ${result.filename}\n` +
            `Dimensões: ${result.width}x${result.height}\n` +
            `Tamanho: ${result.size} bytes\n\n` +
            `✨ NOVO: As dimensões foram salvas automaticamente no arquivo!\n\n` +
            `Para carregar este arquivo RAW novamente:\n` +
            `1. Use o botão "Leitura de Arquivo"\n` +
            `2. Selecione o arquivo .raw\n` +
            `3. As dimensões serão detectadas automaticamente\n` +
            `4. Clique em "Carregar"\n\n` +
            `(Arquivos antigos sem cabeçalho ainda precisam das dimensões informadas manualmente)`);
      
      document.getElementById('save-file-modal').classList.add('hidden');
      // Limpar campo de nome de arquivo
      document.getElementById('save-file-filename').value = '';
    } catch (error) {
      alert('Erro ao salvar arquivo: ' + error.message);
    }
  }

  handleCompareImages() {
    const imageId1 = document.getElementById('compare-image-id-1').value;
    const imageId2 = document.getElementById('compare-image-id-2').value;
    
    if (!imageId1 || !imageId2) {
      alert('Selecione duas imagens!');
      return;
    }

    if (imageId1 === imageId2) {
      alert('Selecione imagens diferentes!');
      return;
    }

    if (!this.imageStorage.hasImage(imageId1) || !this.imageStorage.hasImage(imageId2)) {
      alert('Uma ou ambas as imagens não foram encontradas!');
      return;
    }

    try {
      // Obter canvas de comparação em tela cheia
      const compareCanvas = document.getElementById('compare-canvas');
      const image1 = this.imageStorage.getImage(imageId1);
      const image2 = this.imageStorage.getImage(imageId2);
      
      // Criar instância temporária do bloco com o canvas de comparação
      const compareBlock = new CompareImagesBlock(compareCanvas, this.imageStorage);
      const result = compareBlock.process(imageId1, imageId2);
      
      // Atualizar informações
      const infoText = `Imagem 1: ${image1.width}x${image1.height} | Imagem 2: ${image2.width}x${image2.height} | Canvas: ${result.width}x${result.height}`;
      document.getElementById('compare-images-info').textContent = infoText;
      
      // Fechar modal de seleção e abrir visualização em tela cheia
      document.getElementById('compare-images-modal').classList.add('hidden');
      document.getElementById('compare-images-fullscreen').classList.remove('hidden');
      
      // Atualizar ícones do Lucide
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (error) {
      alert('Erro ao comparar imagens: ' + error.message);
    }
  }

  handleHistogram() {
    const imageId = document.getElementById('histogram-image-id').value;
    
    if (!imageId || !this.imageStorage.hasImage(imageId)) {
      alert('Selecione uma imagem válida!');
      return;
    }

    const image = this.imageStorage.getImage(imageId);
    const histogram = this.blocks.histogram.calculate(image.rawData);
    
    // Renderizar histograma
    const histogramCanvas = document.getElementById('histogram-canvas');
    if (histogramCanvas) {
      this.blocks.histogram.render(histogramCanvas, histogram);
    }
    
    this.addFlowStep('histogram', { imageId });
    document.getElementById('histogram-modal').classList.add('hidden');
  }

  handleDifference() {
    const imageId1 = document.getElementById('difference-image-id-1').value;
    const imageId2 = document.getElementById('difference-image-id-2').value;
    
    if (!imageId1 || !imageId2) {
      alert('Selecione duas imagens!');
      return;
    }

    if (imageId1 === imageId2) {
      alert('Selecione imagens diferentes!');
      return;
    }

    try {
      const result = this.blocks.difference.process(imageId1, imageId2);
      const newImageId = this.imageStorage.addImage(result.rawData, result.width, result.height);
      this.addFlowStep('difference', { imageId1, imageId2, resultImageId: newImageId });
      
      // Exibir resultado
      this.blocks.displayImage.process(newImageId);
      this.updateImageInfo(result.width, result.height);
      
      document.getElementById('difference-modal').classList.add('hidden');
    } catch (error) {
      alert('Erro ao calcular diferença: ' + error.message);
    }
  }

  addFlowStep(type, params) {
    this.flowSteps.push({ type, params });
    this.updateFlowDisplay();
  }

  removeFlowStep(index) {
    if (index >= 0 && index < this.flowSteps.length) {
      this.flowSteps.splice(index, 1);
      this.updateFlowDisplay();
    }
  }

  updateFlowDisplay() {
    const container = document.getElementById('flow-container');
    container.innerHTML = '';
    
    this.flowSteps.forEach((step, index) => {
      const div = document.createElement('div');
      div.className = 'flow-step p-3 rounded-lg bg-gray-50 mb-2 flex items-center justify-between';
      
      const label = this.getBlockLabel(step.type, step.params);
      div.innerHTML = `
        <span class="flex items-center">
          <i data-lucide="${this.getBlockIcon(step.type)}" class="w-4 h-4 mr-2"></i>
          ${label}
        </span>
        <button class="text-red-500 hover:text-red-700" onclick="pseImage.removeFlowStep(${index})">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;
      
      container.appendChild(div);
    });
    
    lucide.createIcons();
  }

  getBlockLabel(type, params = {}) {
    const labels = {
      'read_file': 'Leitura de Arquivo',
      'brightness': params?.value !== undefined ? `Brilho (${params.value})` : 'Brilho',
      'threshold': params?.value !== undefined ? `Limiarização (${params.value})` : 'Limiarização',
      'convolution': 'Convolução',
      'median': params?.windowSize ? `Mediana (${params.windowSize}x${params.windowSize})` : 'Mediana',
      'histogram': 'Histograma',
      'difference': 'Diferença entre Imagens'
    };
    return labels[type] || type;
  }

  getBlockIcon(type) {
    const icons = {
      'read_file': 'file-input',
      'brightness': 'sun',
      'threshold': 'sliders-horizontal',
      'convolution': 'boxes',
      'median': 'grid-3x3',
      'histogram': 'bar-chart-2',
      'difference': 'minus'
    };
    return icons[type] || 'square';
  }

  newFlow() {
    this.flowSteps = [];
    this.updateFlowDisplay();
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    document.getElementById('image-info').textContent = 'Fluxo limpo.';
  }

  async runFlow() {
    if (this.flowSteps.length === 0) {
      alert('Adicione blocos ao fluxo primeiro!');
      return;
    }

    // Encontrar a primeira imagem carregada
    let currentImageId = null;
    for (const step of this.flowSteps) {
      if (step.type === 'read_file' && step.params.imageId) {
        currentImageId = step.params.imageId;
        break;
      }
    }

    if (!currentImageId) {
      alert('Adicione um bloco de leitura de arquivo primeiro!');
      return;
    }

    try {
      this.showLoading(true);
      
      let image = this.imageStorage.getImage(currentImageId);
      if (!image) {
        throw new Error('Imagem não encontrada');
      }

      // Processar cada passo do fluxo
      for (const step of this.flowSteps) {
        if (step.type === 'read_file') {
          // Já temos a imagem
          continue;
        } else if (step.type === 'display_image') {
          // Ignorar - exibição de imagem não é mais parte do fluxo
          continue;
        } else if (step.type === 'brightness') {
          const processed = this.blocks.brightness.process(image.rawData, step.params.value);
          currentImageId = this.imageStorage.addImage(processed, image.width, image.height);
          image = this.imageStorage.getImage(currentImageId);
        } else if (step.type === 'threshold') {
          const processed = this.blocks.threshold.process(image.rawData, step.params.value);
          currentImageId = this.imageStorage.addImage(processed, image.width, image.height);
          image = this.imageStorage.getImage(currentImageId);
        } else if (step.type === 'convolution') {
          const processed = this.blocks.convolution.process(
            image.rawData,
            image.width,
            image.height,
            step.params.kernel
          );
          currentImageId = this.imageStorage.addImage(processed, image.width, image.height);
          image = this.imageStorage.getImage(currentImageId);
        } else if (step.type === 'median') {
          const processed = ConvolutionBlock.applyMedianFilter(
            image.rawData,
            image.width,
            image.height,
            step.params.windowSize
          );
          currentImageId = this.imageStorage.addImage(processed, image.width, image.height);
          image = this.imageStorage.getImage(currentImageId);
        } else if (step.type === 'histogram') {
          // Usar imageId específico se fornecido, senão usar imagem atual
          const imageIdForHistogram = step.params?.imageId || currentImageId;
          const imgForHistogram = this.imageStorage.getImage(imageIdForHistogram);
          if (imgForHistogram) {
            const histogram = this.blocks.histogram.calculate(imgForHistogram.rawData);
            const histogramCanvas = document.getElementById('histogram-canvas');
            if (histogramCanvas) {
              this.blocks.histogram.render(histogramCanvas, histogram);
            }
          }
        } else if (step.type === 'difference') {
          const result = this.blocks.difference.process(step.params.imageId1, step.params.imageId2);
          currentImageId = this.imageStorage.addImage(result.rawData, result.width, result.height);
          image = this.imageStorage.getImage(currentImageId);
        }
      }

      // Exibir resultado final e atualizar selects
      if (currentImageId) {
        this.blocks.displayImage.process(currentImageId);
        this.updateImageInfo(image.width, image.height);
        // Atualizar selects de imagem para incluir a nova imagem gerada
        this.updateImageSelects();
      }

    } catch (error) {
      alert('Erro ao executar fluxo: ' + error.message);
      console.error(error);
    } finally {
      this.showLoading(false);
    }
  }

  updateImageInfo(width, height) {
    document.getElementById('image-info').textContent = `${width}x${height} pixels`;
  }

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  updateImageSelects() {
    const images = this.imageStorage.listImages();
    const selects = document.querySelectorAll('[data-image-select]');
    
    selects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Selecione uma imagem</option>';
      
      images.forEach(img => {
        const option = document.createElement('option');
        option.value = img.id;
        option.textContent = `${img.id} (${img.width}x${img.height})`;
        if (img.id === currentValue) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    });
  }
}

// Inicializar quando o DOM estiver pronto
let pseImage;
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar um pouco para garantir que o Lucide carregou
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    pseImage = new PSEImage();
    
    // Atualizar selects de imagem periodicamente
    setInterval(() => {
      if (pseImage) {
        pseImage.updateImageSelects();
      }
    }, 1000);
    
    // Atualizar ícones quando necessário
    setInterval(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 2000);
  }, 100);
});

