const fs = require('fs');
const path = require('path');

console.log('=== 构建开始 ===');

const effectsDir = path.join(__dirname, 'effects');
const files = fs.readdirSync(effectsDir).filter(f => f.endsWith('.html'));
console.log('特效文件:', files);

const password = process.env.ADMIN_PASSWORD || '123456';

const adminHTML = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特效管理</title>
  <style>
    body { font-family: sans-serif; background: #111; color: #eee; padding: 20px; }
    #loginBox, #listBox { max-width: 500px; margin: 50px auto; }
    input, button { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; }
    .hidden { display: none; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; background: #222; padding: 12px; border-radius: 6px; }
    a { color: #4ea1f3; word-break: break-all; }
  </style>
</head>
<body>
  <div id="loginBox">
    <h2>管理后台</h2>
    <input type="password" id="pwdInput" placeholder="请输入专属密钥" />
    <button id="loginBtn">进入</button>
    <p id="error" style="color:red;"></p>
  </div>
  <div id="listBox" class="hidden">
    <h2>我的特效列表</h2>
    <p>点击链接复制发送给客户（直接全屏演示）</p>
    <ul id="effectList"></ul>
  </div>
  <script>
    const PASS = ${JSON.stringify(password)};
    const EFFECTS = ${JSON.stringify(files)};
    const BASE = window.location.origin;
    document.getElementById('loginBtn').onclick = () => {
      const input = document.getElementById('pwdInput').value;
      if (input === PASS) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('listBox').classList.remove('hidden');
        renderList();
      } else {
        document.getElementById('error').textContent = '密钥错误';
      }
    };
    function renderList() {
      const ul = document.getElementById('effectList');
      ul.innerHTML = '';
      EFFECTS.forEach(file => {
        const url = BASE + '/effects/' + file;
        const li = document.createElement('li');
        li.innerHTML = '<strong>' + file.replace('.html','') + '</strong><br><a href="' + url + '" target="_blank">' + url + '</a>';
        ul.appendChild(li);
      });
    }
  </script>
</body>
</html>`;

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

function copyFolderSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('跳过不存在的目录:', src);
    return;
  }
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('✓ 已复制', entries.length, '个文件到', dest);
}

copyFolderSync(path.join(__dirname, 'effects'), path.join(distDir, 'effects'));
copyFolderSync(path.join(__dirname, 'images'), path.join(distDir, 'images'));
copyFolderSync(path.join(__dirname, 'audio'), path.join(distDir, 'audio'));
copyFolderSync(path.join(__dirname, 'video'), path.join(distDir, 'video'));

fs.writeFileSync(path.join(distDir, 'admin.html'), adminHTML);
fs.writeFileSync(path.join(distDir, 'index.html'), `<meta http-equiv="refresh" content="0;url=/admin.html">`);

console.log('=== 构建完成 ===');
