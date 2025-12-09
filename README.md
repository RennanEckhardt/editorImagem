# PSE-Image - Problem-Solving Environment para Processamento de Imagens

Sistema de processamento de imagens em escala de cinza que permite construir fluxos de processamento de forma gráfica, utilizando blocos interconectados, sem programação textual.

## 📋 Características

- **Interface Gráfica Intuitiva**: Construção de fluxos de processamento através de blocos visuais arrastáveis
- **Processamento Manual**: Todas as operações são implementadas manualmente, sem uso de métodos prontos ou bibliotecas de processamento de imagem
- **Múltiplas Imagens**: Suporte para trabalhar com várias imagens simultaneamente no workspace
- **Escala de Cinza**: Processamento de imagens acromáticas (8 bits/pixel, 0-255)
- **Visualização em Tempo Real**: Visualização imediata dos resultados após cada operação
- **Comparação de Imagens**: Visualização lado a lado em tela cheia para análise detalhada

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional, pode abrir diretamente o arquivo HTML)

## 📁 Estrutura do Projeto

```
trabalho/
├── index.html                  # Arquivo principal HTML com interface
├── css/
│   └── styles.css              # Estilos CSS personalizados
├── js/
│   ├── main.js                 # Orquestração principal e gerenciamento de fluxos
│   ├── utils/
│   │   ├── imageStorage.js     # Gerenciamento de múltiplas imagens no workspace
│   │   └── imageUtils.js       # Utilitários de manipulação de imagem
│   └── blocks/
│       ├── readFile.js         # Bloco de leitura de arquivo (RAW, PNG, JPG)
│       ├── displayImage.js     # Bloco de exibição de imagem
│       ├── saveFile.js         # Bloco de gravação de arquivo RAW
│       ├── brightness.js       # Bloco de ajuste de brilho
│       ├── threshold.js        # Bloco de limiarização (binarização)
│       ├── convolution.js      # Bloco de convolução (filtros)
│       ├── histogram.js        # Bloco de cálculo de histograma
│       ├── difference.js       # Bloco de diferença entre imagens
│       └── compareImages.js    # Bloco de comparação visual de imagens
└── README.md
```

## 🧩 Blocos Disponíveis

### 📥 Blocos de E/S (Entrada/Saída)

1. **Leitura de Arquivo**
   - Suporta arquivos RAW binários (com largura e altura especificadas)
   - Suporta imagens PNG, JPG, JPEG (convertidas automaticamente para escala de cinza)
   - A imagem carregada fica disponível para uso em outros blocos

2. **Exibição de Imagem**
   - Abre um modal para selecionar qual imagem exibir
   - Renderiza a imagem selecionada no canvas principal
   - Útil para visualizar qualquer imagem gerada durante o processamento

3. **Gravação de Arquivo**
   - Salva a imagem processada como arquivo RAW binário
   - Permite especificar nome do arquivo (opcional)
   - Download automático do arquivo gerado

### ⚙️ Blocos de Processamento

1. **Brilho** (Processamento Pontual)
   - Ajusta o brilho da imagem adicionando/subtraindo um valor constante
   - Valor: -255 a 255
   - Valores positivos aumentam o brilho, negativos diminuem
   - A imagem resultante é salva automaticamente

2. **Limiarização** (Processamento Pontual)
   - Converte imagem para binária (preto/branco)
   - Valor de limiar: 0 a 255
   - Pixels acima do limiar → branco (255), abaixo → preto (0)
   - Útil para segmentação e binarização

3. **Convolução** (Processamento Local)
   - Aplica máscaras de convolução parametrizáveis
   - Máscaras pré-definidas:
     - **Média**: Suavização (tamanho configurável: 3x3, 5x5, 7x7, etc.)
     - **Laplaciano 4-vizinhança**: Detecção de bordas (4 direções)
     - **Laplaciano 8-vizinhança**: Detecção de bordas (8 direções)
     - **Mediana**: Filtro não-linear para remoção de ruído
   - Suporte para **kernel customizado** (definido pelo usuário)
   - Permite criar filtros personalizados

### 📊 Blocos de Análise

1. **Histograma**
   - Calcula e exibe o histograma da distribuição de intensidades
   - Mostra frequência de cada valor de 0 a 255
   - Visualização gráfica em barras
   - Útil para análise de contraste e distribuição de tons

2. **Diferença entre Imagens**
   - Calcula a diferença absoluta pixel a pixel entre duas imagens
   - Requer imagens com as mesmas dimensões
   - Gera uma nova imagem com as diferenças
   - Útil para detecção de mudanças e comparação quantitativa

3. **Comparar Imagens**
   - Exibe duas imagens lado a lado em visualização em tela cheia
   - Permite comparação visual detalhada
   - Imagens são centralizadas verticalmente quando têm alturas diferentes
   - Ideal para análise comparativa de resultados de processamento

## 🚀 Como Usar

### 1. Abrir a aplicação
- Abra o arquivo `index.html` em um navegador web moderno
- Ou sirva através de um servidor web local (recomendado para melhor performance)

### 2. Carregar uma imagem
- Clique em **"Leitura de Arquivo"** na barra lateral esquerda
- Selecione um arquivo:
  - **Arquivos RAW**: Especifique largura e altura antes de carregar
  - **Imagens PNG/JPG/JPEG**: Convertidas automaticamente para escala de cinza
- Clique em **"Carregar"**
- A imagem será exibida automaticamente no canvas

### 3. Construir o fluxo de processamento
- Clique nos blocos na barra lateral para adicioná-los ao fluxo
- Configure os parâmetros de cada bloco quando o modal aparecer
- Os blocos aparecerão na ordem em que foram adicionados (painel esquerdo)
- Você pode remover blocos clicando no "X" de cada bloco

### 4. Executar o fluxo
- Clique em **"Executar Fluxo"** para processar a imagem
- O sistema processará cada bloco em sequência
- A imagem final será exibida automaticamente no canvas
- Todas as imagens intermediárias são salvas e ficam disponíveis

### 5. Visualizar imagens geradas
- Use **"Exibição de Imagem"** para visualizar qualquer imagem gerada
- Selecione a imagem desejada no modal
- A imagem será exibida no canvas principal

### 6. Comparar imagens
- Use **"Comparar Imagens"** para visualização lado a lado
- Selecione duas imagens diferentes
- As imagens serão exibidas em tela cheia para melhor visualização

### 7. Salvar resultado
- Clique em **"Gravação de Arquivo"**
- Selecione a imagem a ser salva
- Especifique o nome do arquivo (opcional)
- O arquivo RAW será baixado automaticamente

## Implementação Técnica

### Sem Métodos Prontos

Todas as operações de processamento de imagem são implementadas manualmente:

- **Conversão RGB para Grayscale**: Implementação manual da fórmula padrão (0.2126*R + 0.7152*G + 0.0722*B)
- **Convolução**: Implementação manual de convolução 2D com máscaras parametrizáveis
- **Filtro de Mediana**: Ordenação manual e seleção da mediana
- **Histograma**: Contagem manual de frequências
- **Operações Pontuais**: Loops manuais para aplicar transformações pixel a pixel

### Arquitetura

- **Modular**: Cada bloco é uma classe independente em arquivo separado
- **Gerenciamento de Estado**: `ImageStorage` gerencia múltiplas imagens no workspace
- **Orquestração**: `PSEImage` coordena a execução do fluxo e a interface

## Exemplos de Uso

### Exemplo 1: Ajuste de Brilho e Limiarização
1. Leitura de Arquivo
2. Brilho (valor: 50)
3. Limiarização (valor: 128)
4. Exibição de Imagem

### Exemplo 2: Suavização com Média
1. Leitura de Arquivo
2. Convolução (Média 3x3)
3. Exibição de Imagem

### Exemplo 3: Detecção de Bordas
1. Leitura de Arquivo
2. Convolução (Laplaciano)
3. Exibição de Imagem

### Exemplo 4: Análise de Histograma
1. Leitura de Arquivo
2. Histograma (selecione a imagem no modal)
3. Exibição de Imagem (para ver a imagem original)

### Exemplo 5: Comparação de Resultados
1. Leitura de Arquivo
2. Brilho (valor: 30)
3. Executar Fluxo
4. Comparar Imagens (selecione a original e a processada)

## ⚠️ Observações Importantes

- **Escala de Cinza**: Todas as imagens são processadas em escala de cinza (8 bits/pixel, valores 0-255)
- **Múltiplas Imagens**: O sistema suporta múltiplas imagens simultaneamente no workspace
- **Imagens Intermediárias**: Todas as imagens geradas durante o processamento são salvas automaticamente
- **Exibição e Gravação**: Não são mais parte do fluxo - são ações independentes que podem ser executadas a qualquer momento
- **Comparação Visual**: A comparação de imagens abre em tela cheia para melhor análise
- **Performance**: Processamento é feito no navegador - imagens muito grandes podem demorar mais

## Tecnologias Utilizadas

- HTML5
- CSS3 (Tailwind CSS via CDN)
- JavaScript (ES6+)
- Canvas API (para renderização)
- Lucide Icons (para ícones)

## Autor

Trabalho acadêmico - PSE-Image

## Data

- Controle Parcial: 04/11
- Entrega Final: 02/12

