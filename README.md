# PSE-Image - Problem-Solving Environment para Processamento de Imagens

Sistema de processamento de imagens em escala de cinza que permite construir fluxos de processamento de forma gráfica, utilizando blocos interconectados, sem programação textual.

## Características

- **Interface Gráfica**: Construção de fluxos de processamento através de blocos visuais
- **Processamento Manual**: Todas as operações são implementadas manualmente, sem uso de métodos prontos
- **Múltiplas Imagens**: Suporte para trabalhar com várias imagens simultaneamente no workspace
- **Escala de Cinza**: Processamento de imagens acromáticas (8 bits/pixel)

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional, pode abrir diretamente o arquivo HTML)

## Estrutura do Projeto

```
trabalho/
├── index.html              # Arquivo principal HTML
├── css/
│   └── styles.css          # Estilos CSS
├── js/
│   ├── main.js             # Orquestração principal
│   ├── utils/
│   │   ├── imageStorage.js # Gerenciamento de múltiplas imagens
│   │   └── imageUtils.js   # Utilitários de manipulação de imagem
│   └── blocks/
│       ├── readFile.js     # Bloco de leitura de arquivo
│       ├── displayImage.js # Bloco de exibição
│       ├── saveFile.js     # Bloco de gravação
│       ├── brightness.js   # Bloco de ajuste de brilho
│       ├── threshold.js    # Bloco de limiarização
│       ├── convolution.js # Bloco de convolução
│       ├── histogram.js    # Bloco de histograma
│       └── difference.js   # Bloco de diferença entre imagens
└── README.md
```

## Blocos Disponíveis

### Blocos de E/S (Entrada/Saída)

1. **Leitura de Arquivo**
   - Suporta arquivos RAW binários (com largura e altura especificadas)
   - Suporta imagens PNG, JPG, JPEG (convertidas automaticamente para escala de cinza)

2. **Exibição de Imagem**
   - Renderiza a imagem processada no canvas
   - Pode ser inserido em qualquer ponto do fluxo

3. **Gravação de Arquivo**
   - Salva a imagem processada como arquivo RAW binário
   - Permite especificar nome do arquivo

### Blocos de Processamento

1. **Brilho** (Processamento Pontual)
   - Ajusta o brilho da imagem
   - Valor: -255 a 255

2. **Limiarização** (Processamento Pontual)
   - Converte imagem para binária (preto/branco)
   - Valor de limiar: 0 a 255

3. **Convolução** (Processamento Local)
   - Aplica máscaras de convolução parametrizáveis
   - Máscaras pré-definidas:
     - Média (tamanho configurável: 3x3, 5x5, etc.)
     - Laplaciano 4-vizinhança (detecção de bordas)
     - Laplaciano 8-vizinhança (detecção de bordas)
     - Mediana (filtro não-linear)
   - Suporte para kernel customizado (definido pelo usuário)

### Blocos de Análise

1. **Histograma**
   - Calcula e exibe o histograma da distribuição de intensidades
   - Mostra frequência de cada valor de 0 a 255

2. **Diferença entre Imagens**
   - Calcula a diferença absoluta pixel a pixel entre duas imagens
   - Requer imagens com as mesmas dimensões

## Como Usar

1. **Abrir a aplicação**
   - Abra o arquivo `index.html` em um navegador web
   - Ou sirva através de um servidor web local

2. **Carregar uma imagem**
   - Clique em "Leitura de Arquivo" na barra lateral
   - Selecione um arquivo (RAW ou imagem)
   - Para arquivos RAW, especifique largura e altura
   - Clique em "Carregar"

3. **Construir o fluxo**
   - Clique nos blocos na barra lateral para adicioná-los ao fluxo
   - Configure os parâmetros de cada bloco quando solicitado
   - Os blocos aparecerão na ordem em que foram adicionados

4. **Executar o fluxo**
   - Clique em "Executar Fluxo" para processar a imagem
   - O resultado será exibido no canvas de visualização

5. **Salvar resultado**
   - Adicione o bloco "Gravação de Arquivo" ao fluxo
   - Selecione a imagem a ser salva
   - Especifique o nome do arquivo (opcional)
   - Execute o fluxo

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
2. Histograma
3. Exibição de Imagem

## Observações

- As imagens são sempre processadas em escala de cinza (8 bits/pixel)
- Múltiplas imagens podem ser carregadas e processadas simultaneamente
- Blocos de exibição e gravação podem ser inseridos em qualquer ponto do fluxo
- O sistema mantém todas as imagens processadas disponíveis para uso posterior

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

