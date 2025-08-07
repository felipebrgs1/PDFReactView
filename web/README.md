# PDFReactView

Este é um projeto React para visualização de PDFs usando a biblioteca react-pdf.

## Estrutura do Projeto

```
PDFReactView/
├── src/
│   ├── components/
│   │   ├── PDFViewer.tsx    # Componente principal do visualizador de PDF
│   │   └── index.ts         # Exportações dos componentes
│   ├── styles/
│   │   └── PDFViewer.css    # Estilos do visualizador de PDF
│   ├── assets/
│   │   └── sample.pdf       # Arquivo PDF de exemplo
│   └── main.tsx             # Ponto de entrada da aplicação
├── index.html               # Template HTML principal
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
├── vite.config.ts           # Configuração do Vite
└── README.md                # Este arquivo
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Faz o build da aplicação para produção
- `npm run preview` - Preview do build de produção

## Como Usar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em `http://localhost:5173` (ou a porta indicada no terminal)

## Funcionalidades

- Visualização de arquivos PDF
- Upload de arquivos PDF personalizados
- Interface responsiva
- Navegação por páginas

## Dependências Principais

- React 18
- react-pdf
- Vite
- TypeScript
