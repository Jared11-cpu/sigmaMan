# 构建说明（压缩版）

仓库根目录的 `app.js`、`pixel-progress.js`、`film.js` 和四个 `.css` 文件是**压缩后**的发布文件，请不要直接改它们。

- 未压缩源码在 `source/` 文件夹（已写入 `.gitignore`，不会被提交、也不会随 GitHub Pages 发布），改代码请改那里。
- 改完后在仓库根目录执行下面命令重新压缩（需要 Node.js）：

```bash
npx esbuild source/app.js --minify --outfile=app.js
npx esbuild source/pixel-progress.js --minify --outfile=pixel-progress.js
npx esbuild source/film.js --minify --outfile=film.js
npx esbuild source/style.css --minify --outfile=style.css
npx esbuild source/desktop.css --minify --outfile=desktop.css
npx esbuild source/pixel-progress.css --minify --outfile=pixel-progress.css
npx esbuild source/film.css --minify --outfile=film.css
```

- 重新压缩后，记得把 `index.html` 里资源链接的 `?v=` 版本号改一位（例如 `20261116e` → `20261116f`），再同步复制一份为 `404.html`，避免用户浏览器还用旧缓存。
