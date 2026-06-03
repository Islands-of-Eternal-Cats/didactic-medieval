## 1. Scaffolding и зависимости

- [x] 1.1 Добавить в `package.json` зависимости: `react`, `react-dom`; dev: `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `typescript`
- [x] 1.2 Установить `"type": "module"` и скрипты `dev`, `build`, `preview`; сохранить существующий скрипт OpenSpec (`init`)
- [x] 1.3 Создать `vite.config.ts` с плагином `@vitejs/plugin-react`
- [x] 1.4 Создать `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (по шаблону react-ts)
- [x] 1.5 Обновить `.gitignore`: `dist`, `node_modules/.vite`

## 2. Приложение React

- [x] 2.1 Добавить `index.html` с точкой входа `/src/main.tsx` и контейнером `#root`
- [x] 2.2 Создать `src/main.tsx` — монтирование React в `#root`
- [x] 2.3 Создать `src/App.tsx` с `<h1>Hello World</h1>`
- [x] 2.4 Добавить минимальные `src/index.css` и при необходимости `src/App.css`
- [x] 2.5 Добавить `src/vite-env.d.ts` для типов Vite

## 3. Проверка и документация

- [x] 3.1 Выполнить `npm install` и убедиться, что lockfile обновлён
- [x] 3.2 Проверить `npm run dev` — страница открывается, виден Hello World
- [x] 3.3 Проверить `npm run build` и `npm run preview`
- [x] 3.4 Добавить в `devlog.md` команды запуска (dev / build / preview)
