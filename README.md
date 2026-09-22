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
npm test
npm run build
```

`lint` 涵蓋 JS、JSX、TS、TSX。`build` 先執行 TypeScript 型別檢查，通過後由 Vite 輸出至 `dist/`。也可以使用 `npm run typecheck` 單獨檢查型別，或使用 `npm run preview` 預覽建置結果。

`.npmrc` 啟用 `engine-strict`，不相容的 Node.js 版本會在安裝依賴時被拒絕。CI 應使用 `.nvmrc` 指定的版本，依序執行 `npm ci`、`npm run lint`、`npm run build`。

TypeScript 檢查涵蓋 TS/TSX 與建置設定；既有 JS/JSX 應用程式仍由 ESLint 檢查，尚未啟用 `checkJs`。

## 功能目錄

`src/features/` 保留 `auth`、`dashboard`、`filter`；其餘依單一 entity 分類：

```text
features/
├── auth/
├── dashboard/
├── filter/
├── customer/
├── contact/
├── lead/
├── opportunity/
├── quote/
├── order/
└── product/
```

每個 entity 的 `models/`、`view-models/`、`views/` 分別管理資料與規則、畫面狀態、UI；專用元件放在該 entity 的 `components/`。Lead 資格轉換屬於 `lead`，報價轉入的訂單檢視屬於 `order`。

跨 entity 的表格放在 `src/components/ui/entity-table.tsx`，列表與表單外框放在 `src/components/entity/`，頁首及側欄放在 `src/components/layout/`。列表操作與表單狀態共用 `src/hooks/use-entity-list.ts`、`use-entity-form.ts`；各 entity 自己定義欄位、驗證與儲存行為。

資料夾採單數命名，既有路由仍使用 `#/customers`、`#/contacts`、`#/leads` 等複數網址。`npm test` 驗證跨 entity 資料關聯、Lead 資格轉換與報價流程；`npm run test:quotes` 可單獨執行報價測試。

七個 entity 列表皆支援單筆／多筆勾選及全選當頁。「刪除」位於新增按鈕左側，未選取時停用；確認視窗會列出選取資料。換頁保留勾選，搜尋或變更篩選會清空選取；刪除後更新筆數與分頁。刪除報價單會移除該單所有版本及紀錄，其他 entity 的關聯資料不會連帶刪除。目前刪除同樣只作用於本次記憶體資料，重新整理會還原示範資料。

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

## 報價單 Quote

入口：工作空間 → 銷售管理 → 報價單（`#/quotes`）。沿用共用 Header、Sidebar、Lookup、篩選、進階篩選、欄位拖移與分頁，新增頁為 `#/quotes/new`。

### 操作流程

報價頁已移除預設模擬身分及操作者切換。登入尚未串接時仍可操作本機報價資料，建立資訊及操作紀錄僅顯示時間與動作，不填入虛構人員。主管審批與客戶決策需接上登入身分及權限後才能操作；不會自動批准或代替客戶接受。

1. 新增報價，選擇客戶及來源商機，加入商品明細，設定數量、單價、折扣百分比、稅率、有效期限及付款／交貨／保固條款，儲存 v1 草稿。
2. 任一明細折扣 **超過 10%**，或折扣後含稅總額 **超過 NT$100,000**，需提交主管審批。門檻集中於 `src/features/quote/models/quote-policy.ts`；剛好等於門檻不需審批。
3. 主管批准或拒絕需由主管身分執行（待串接）。拒絕原因必填；待審及已批准版本鎖定。修改已批准報價須建立新版本，且新版本即使降至門檻以下仍須重新審批。
4. 業務可模擬送出已批准或無須審批的報價；送出後此版本唯讀。可建立 v2、v3，歷史版本保留查閱，僅最新版本可接受。
5. 客戶接受或拒絕需由客戶身分執行（待串接），記錄時間及原因；拒絕原因必填。
6. 接受後業務可轉換成訂單並跳轉。重複操作會開啟同一張訂單。轉入的訂單保存報價明細、折扣、稅金與條款快照，目前提供唯讀檢視。

每張報價單的詳細頁設有「版本管理」區塊，列出該單所有版本的狀態、審批、含稅總額、有效期限及建立資訊。點選「檢視版本」切換下方表單；「建立 vN」複製該單最新版本並直接開啟新草稿。歷史版本唯讀，有未儲存修改時須先儲存或重置才能切換／建立版本。列表維持一張報價單一筆資料，顯示最新版本摘要。

金額以分計算，各明細先計算折扣，再計算折後稅金，四捨五入後加總。商品名稱、SKU、目錄價及報價單價保存在版本中，後續商品調價不會回寫舊報價。操作紀錄保留操作者、時間、動作、版本與審批／決策原因。

有效期限以 Asia/Taipei 當日結束為界。草稿／已送出版本逾期改為 Expired；已接受或拒絕的結果保留。應用程式開啟時每 15 秒及回到視窗時檢查，任何狀態操作前也會檢查，所以逾期後不能接受，即使畫面計時器尚未更新。

### MVVM 與驗證

- `src/features/quote/models/`：型別、金額計算、審批門檻、版本、狀態轉換、快照與 Audit Log。
- `src/features/quote/view-models/`：表單、列表、操作與過期檢查。
- `src/features/quote/views/`、`components/`：Tailwind 與共用 UI 元件。
- `npm run test:quotes`：以 Node 內建測試工具驗證金額邊界、角色及狀態限制、版本不可修改、到期、價格快照與轉單防重複，不需額外依賴。

目前沿用專案的記憶體資料來源，**重新整理會清除新增的報價、訂單及操作紀錄**。目前未串接登入授權；送出不會寄信。接上後端時，需由伺服器保存版本與 Audit Log、驗證操作者權限、執行到期處理，並以交易保證轉單不重複。
