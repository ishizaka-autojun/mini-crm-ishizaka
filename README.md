# Tabela de Leads

tabela de clientes com espaço para : empresa, valor, etapa (novo, em contato ou fechado) e nome para contato

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tabela-leads-ishizaka.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/953359b9-e82c-4c15-a692-2a450951e88b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Sugestões da IA: Usar o cloud da própria lovable, criar um type próprio para os estados de novo, em contato, fechado
Aceito: Type especifico para etapas
Negado: Cloud da lovable, foi utilizado o supabase para banco de dados

Onde este dado fica guardado?
Os clientes ficam guardados no Supabase
O que acontece se eu apagar esta linha no Supabase?
Ela é removida também na tabela do site do lovable
