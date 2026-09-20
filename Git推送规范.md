# Git 推送规范（所有模块开发助手共用，推送前必读）

> 用途：本项目的原型统一发布到同一个 GitHub 仓库。任何助手需要推送时，按本规范执行，**不要反复向业主确认账号**。

## 1. 默认账号与仓库（已定稿，直接使用，勿再问）

- GitHub 账号：**mjd13736087265**（业主默认账号，所有推送一律用这个）
- 仓库：`mjd13736087265/yinglaida-asset-prototype`，分支 `main`（公开仓库）
- 线上地址（GitHub Pages）：https://mjd13736087265.github.io/yinglaida-asset-prototype/

## 2. 推送通道：一律走 MCP 插件，禁止 git CLI 写操作（2026-09-20 修订）

- **推送一律走各会话自己的 GitHub MCP 插件通道**（Kimi 会话用 Kimi GitHub 插件，WorkBuddy 会话用 GitHub 连接器）。核心操作：`push_files`（多文件单提交）、`create_or_update_file`（单文件，可带 sha 乐观锁）、`delete_file`（删除远程文件）、`get_file_contents`（核对远程内容）、`list_commits`（查提交历史）。插件用业主已授权的 OAuth，**全程不需要业主输入账号密码**。
- **禁止 `git push`、`git credential fill` 及任何可能弹出登录框的 git 操作**。本机 Windows 凭据可能失效，一旦触发 Git Credential Manager 弹窗会打断业主——这是本规范的硬性红线。
- git CLI 只允许用于**只读操作**（`git status` / `git diff` / `git log` / 公开仓库的 `git fetch`），且必须带 `GIT_TERMINAL_PROMPT=0`；一旦出现登录提示立即中止，不得重试。
- ⚠️ **新会话 / 新连接器必须先自查写权限**：只读能成功拉取文件，不代表能推送。开新会话后第一次推送前，先做一次极小改动验证。若报 `403 Resource not accessible by integration`，说明当前连接器只有只读权限，需业主在连接器设置里授予 `contents: write`，或改由有写权限的会话代推——**不要反复重试**。

### 2.1 共享文件必须用 sha 乐观锁（防两个会话互相覆盖）

- 共享文件（`app.css` / `nav.js` / `m-tab.js` / 主页三端页面 / 规范文档）**禁止用 `push_files` 直接覆盖**——`push_files` 不带 sha，会无条件覆盖对方的改动。
- 正确做法：
  1. 动手前用 `get_file_contents` 拉远程最新版，记下返回的 blob SHA；
  2. 改完用 `create_or_update_file` 带上该 sha 提交；
  3. 若期间对方已改过同一文件，GitHub 会返回冲突拒绝。**此时不得重试覆盖**，须重新拉取、人工合并后再提交。
- 纯新增文件（远程不存在）无 sha 可带，用 `push_files` 即可。

## 3. 本地发布基线

- 路径：`02-需求设计/_临时文件/_repo/`（工作区 `02-需求设计` 本身不是 git 仓库）
- `_repo` 是上述仓库 main 分支的克隆，用作 diff 基线，只放要发布的文件（原型 html / 共享 assets / 交接文档 / 规范文档），`_临时文件` 里的脚本、截图、日志不进仓库
- **路径映射（易错红线）**：`push_files` / `delete_file` 的 path 是**仓库根目录**相对路径，**不带 `02-需求设计/` 前缀**。工作区 `02-需求设计\00-整体需求\...` 对应仓库根下 `00-整体需求/...`；各模块文件夹（`02-片区管理/`、`03-收费管理（APP）/`、`04-租务运营/`、`05-合同管理/` 等）同样在仓库根。写错前缀会在远程产生重复目录，推送后务必用 `get_file_contents` 核对目标路径内容

## 4. 标准推送流程

1. 核对：用 `_repo` 基线 diff 出自己负责的改动清单——**只推自己的文件，不得误删或回退其他助手的文件**（片区、收费等并行模块）；涉及共享文件的，走 §2.1 的 sha 乐观锁流程
2. 分批推送：单次 `push_files` 总内容控制在约 100KB 以内，按「共享资产 / 主页 / 各模块页面」分多个 commit；消息写清模块名 + 改动要点
3. 删除远程文件（需业主事先批准）用 `delete_file` 单独提交
4. 同步基线：推送完成后执行 `GIT_TERMINAL_PROMPT=0 git -C _repo fetch origin && git -C _repo reset --hard origin/main` 更新本地基线（公开仓库只读，不弹窗；失败就跳过，下次推送前再补）
5. 验证：推送成功后等约 1 分钟，FetchURL 线上地址确认内容生效

## 5. 何时才需要问业主

- 要推送到**其他账号或其他仓库**时
- 要执行 force push、删除远程分支等不可逆操作时（`delete_file` 删除已获批准的文件除外）
- **GitHub 插件本身未授权或授权过期**时（让业主在插件设置里重新授权一次即可，全程不碰 git 登录）

除以上三种情况，按本规范直接推送，不再逐步请示。

## 6. 说明

- 工具层面的操作审批弹窗属于客户端安全机制，与本规范无关，助手应把多个小操作合并成尽量少的调用，减少打扰
- 提交作者信息由插件自动带业主的 GitHub 身份，无需本地配置

## 7. 兜底方案：连接器 403 时的 PAT 直推（2026-09-20 新增）

### 7.1 适用情形

MCP 连接器返回 `403 Resource not accessible by integration`（可读不可写）。**这是 GitHub App 安装层的权限问题，重新授权 / 解绑重连都无效**，业主在连接器侧改不了。此时改用业主的 classic PAT 直接调 **GitHub Git Trees API**，一次 commit 推完，全程不碰 git 命令行、不弹登录框（符合 §2 红线）。

### 7.2 前置：业主生成 PAT

https://github.com/settings/tokens → Generate new token (**classic**) → **只勾 `repo`**，其余一律不勾 → 生成。

> PAT 等同于账号写权限，**用完立即撤销**（同一页面 Delete）。不要写进任何文档或代码，不要提交到仓库。

### 7.3 工具

`tools/push.ps1`（与 `class_audit.py` 同级，通用工具）。工作方式：读清单 → 逐个建 blob → 以远程 `base_tree` 为基础建 tree → 建 commit → 更新 ref，**单个 commit，且只覆盖清单内文件，不会误删其他会话的文件**。

清单文件 `tools/_pushlist.txt`（UTF-8），每行一条**相对仓库根**的本地路径，例如：

```
MSG: 通用：改了什么（原因）
00-整体需求\主页原型\assets\nav.js
原型对接规范.md
```

- `MSG:` 行 = commit 消息（不写则回退为 `chore: update shared files`）
- `#` 开头为注释
- 仓库路径自动由本地相对路径把 `\` 换成 `/` 得到，**天然不带 `02-需求设计/` 前缀**（§3 红线自动满足）

### 7.4 用法

先 dry-run 核对文件清单（不推送）：

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "D:\...\02-需求设计\tools\push.ps1" -Root "D:\...\02-需求设计" -DryRun
```

确认 `missing=0` 后再真推（把 PAT 填进 `-Token`）：

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "D:\...\02-需求设计\tools\push.ps1" -Root "D:\...\02-需求设计" -Token "ghp_xxxx"
```

结果写在脚本旁的 `_pushlog.txt`，**读那个文件确认**（控制台输出常被吞）。

### 7.5 五个坑（本机实测）

1. **执行策略 Restricted**：必须 `powershell -ExecutionPolicy Bypass -NoProfile -File`，直接 `& script.ps1` 会报「在此系统上禁止运行脚本」
2. **脚本里不能写中文**：PS 5.1 按 ANSI 读 `.ps1`，中文会乱码。所有中文值必须从 UTF-8 清单文件读、或从命令行参数传入；脚本内路径一律用 `$PSScriptRoot` 推导
3. **`Remove-Item` 失效**（报 `ResolveLinkTarget` 缺失）：删文件用 `[System.IO.File]::Delete($path)`，删目录用 `[System.IO.Directory]::Delete($path)`
4. **PowerShell 输出常被吞**：结果写进文件再读
5. **不要把中间文件写到 `C:\Users\...\Temp`**（业主要求），一律放自己可控目录内，用完即删

### 7.6 收尾

推完用 `get_file_contents`（读权限始终可用）列目录核对 → 等约 1 分钟抓 Pages 线上地址确认 → **提醒业主撤销 PAT**。
