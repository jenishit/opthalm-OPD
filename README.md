This is a [Next.js project bootstrapped with ](https://nextjs.org "https://nextjs.org")[create-next-app.](https://nextjs.org/docs/app/api-reference/cli/create-next-app "https://nextjs.org/docs/app/api-reference/cli/create-next-app")  
**Getting Started**  
First, run the development server:  
npm run dev  
 # or  
 yarn dev  
 # or  
 pnpm dev  
 # or  
 bun dev  
   
Open [http://localhost:3000 with your browser to see the result.](http://localhost:3000 "http://localhost:3000")  
You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.  
This project uses [next/font to automatically optimize and load ](https://nextjs.org/docs/app/building-your-application/optimizing/fonts "https://nextjs.org/docs/app/building-your-application/optimizing/fonts")[Geist, a new font family for Vercel.](https://vercel.com/font "https://vercel.com/font")  
**Learn More**  
To learn more about Next.js, take a look at the following resources:  
- [Next.js Documentation - learn about Next.js features and API.](https://nextjs.org/docs "https://nextjs.org/docs")  
- [Learn Next.js - an interactive Next.js tutorial.](https://nextjs.org/learn "https://nextjs.org/learn")  
You can check out [the Next.js GitHub repository - your feedback and contributions are welcome!](https://github.com/vercel/next.js "https://github.com/vercel/next.js")  
**Deploy on Vercel**  
The easiest way to deploy your Next.js app is to use the [Vercel Platform from the creators of Next.js.](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme "https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme")  
Check out our [Next.js deployment documentation for more details.](https://nextjs.org/docs/app/building-your-application/deploying "https://nextjs.org/docs/app/building-your-application/deploying")  
npm i  
npm warn ERESOLVE overriding peer dependency  
npm warn While resolving: @napi-rs/wasm-runtime@1.2.0  
npm warn Found: @emnapi/core@1.10.0  
npm warn node_modules/@emnapi/core  
npm warn   @emnapi/core@"1.10.0" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi  
npm warn     optional @unrs/resolver-binding-wasm32-wasi@"1.12.2" from unrs-resolver@1.12.2  
npm warn     node_modules/unrs-resolver  
npm warn  
npm warn Could not resolve dependency:  
npm warn peer @emnapi/core@"^2.0.0-alpha.3" from @napi-rs/wasm-runtime@1.2.0  
npm warn node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@napi-rs/wasm-runtime  
npm warn   @napi-rs/wasm-runtime@"^1.1.4" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi  
npm warn  
npm warn Conflicting peer dependency: @emnapi/core@2.0.0-alpha.5  
npm warn node_modules/@emnapi/core  
npm warn   peer @emnapi/core@"^2.0.0-alpha.3" from @napi-rs/wasm-runtime@1.2.0  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@napi-rs/wasm-runtime  
npm warn     @napi-rs/wasm-runtime@"^1.1.4" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn     node_modules/@unrs/resolver-binding-wasm32-wasi  
npm warn ERESOLVE overriding peer dependency  
npm warn While resolving: @napi-rs/wasm-runtime@1.2.0  
npm warn Found: @emnapi/runtime@1.10.0  
npm warn node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@emnapi/runtime  
npm warn   @emnapi/runtime@"1.10.0" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi  
npm warn     optional @unrs/resolver-binding-wasm32-wasi@"1.12.2" from unrs-resolver@1.12.2  
npm warn     node_modules/unrs-resolver  
npm warn  
npm warn Could not resolve dependency:  
npm warn peer @emnapi/runtime@"^2.0.0-alpha.3" from @napi-rs/wasm-runtime@1.2.0  
npm warn node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@napi-rs/wasm-runtime  
npm warn   @napi-rs/wasm-runtime@"^1.1.4" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi  
npm warn  
npm warn Conflicting peer dependency: @emnapi/runtime@2.0.0-alpha.5  
npm warn node_modules/@emnapi/runtime  
npm warn   peer @emnapi/runtime@"^2.0.0-alpha.3" from @napi-rs/wasm-runtime@1.2.0  
npm warn   node_modules/@unrs/resolver-binding-wasm32-wasi/node_modules/@napi-rs/wasm-runtime  
npm warn     @napi-rs/wasm-runtime@"^1.1.4" from @unrs/resolver-binding-wasm32-wasi@1.12.2  
npm warn     node_modules/@unrs/resolver-binding-wasm32-wasi  
   
added 6 packages, removed 5 packages, and audited 408 packages in 8s  
   
151 packages are looking for funding  
  run `npm fund` for details  
   
3 high severity vulnerabilities  
   
To address all issues, run:  
  npm audit fix  
   
Run `npm audit` for details.  
npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:  
npm warn allow-scripts   unrs-resolver@1.12.2 (install: (install scripts present))  
npm warn allow-scripts  
npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.  
❯ npm run dev  
