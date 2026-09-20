# CRM frontend

## 開發與建置

使用 nvm 切換至 `.nvmrc` 指定的 Node.js 22.14.0：

```bash
nvm install
nvm use
npm ci
npm run dev
```

驗證及產生正式環境檔案：

```bash
npm run lint
npm run build
```

`lint` 涵蓋 JS、JSX、TS、TSX。`build` 先執行 TypeScript 型別檢查，通過後由 Vite 輸出至 `dist/`。也可以使用 `npm run typecheck` 單獨檢查型別，或使用 `npm run preview` 預覽建置結果。

`.npmrc` 啟用 `engine-strict`，不相容的 Node.js 版本會在安裝依賴時被拒絕。CI 應使用 `.nvmrc` 指定的版本，依序執行 `npm ci`、`npm run lint`、`npm run build`。

TypeScript 檢查涵蓋 TS/TSX 與建置設定；既有 JS/JSX 應用程式仍由 ESLint 檢查，尚未啟用 `checkJs`。

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 登入功能架構（MVVM）

- `src/features/auth/models/auth-model.ts`：登入資料型別與服務介面，目前使用直接成功的前端模擬實作。
- `src/features/auth/view-models/use-login-view-model.ts`：表單狀態、提交流程、防止重複提交、密碼切換與提示訊息。可注入 `AuthService`。
- `src/features/auth/views/login-view.tsx`：呈現登入畫面，透過 props 綁定 ViewModel。
- `src/features/auth/components/brand-content.tsx`：登入品牌區元件，使用 Tailwind utilities。
- `src/components/ui/`：shadcn base-nova 共用元件。
- `src/App.jsx`：組合 View 與 ViewModel。

View 保留瀏覽器的必填與 email 格式驗證；Model 不依賴 React。尚未接上登入 API，也不會儲存密碼。登入成功後透過 ViewModel 的 `onSignedIn` 回呼導向 `#/dashboard`；接上 API 時，請替換 `AuthService` 實作。

目前登入為前端模擬：輸入有效格式的 email 與非空密碼即可前往工作空間。使用 hash 路由支援重新整理與瀏覽器上一頁，首頁提供返回登入頁。這不是身分驗證或路由權限保護，未建立登入 session，也未儲存密碼。

頁面樣式統一使用 Tailwind utilities，重複的畫面結構拆成 React 元件。`src/index.css` 僅保留 Tailwind / shadcn 匯入、主題 token 與基礎樣式，不新增頁面專用 CSS class。
