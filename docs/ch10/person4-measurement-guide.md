# Chapter 10 measured behavior: which version to run and how

For Person 4 (measured behavior). This is the build that contains the
150 x 150 chest X-ray CNN referred to in the Person 3 section (ALT.1). There is
nothing extra to download: the model is in this repository.

中文版在下面。

## Version

- Repository: https://github.com/sysen5151-fall2026/DeepSee
- Branch `main`, commit `5a316ae` or later (merge of PR #3).
- Model file: `backend/core/imaging_service/model/pneumonia_model.keras` (about 10 MB).
- Preprocessing: the image is converted to grayscale and resized to 150 x 150
  (`model_predict.INPUT_SIZE`). Decision threshold 0.5. Model version string
  `cnn-pneumonia-v1`.
- Call path: `POST /api/upload-scan` → `imaging_service.views.upload_scan` →
  `clinical_analysis.perform_clinical_analysis` (F.3) →
  `KerasChestXrayClassifier` → `model_predict.predict_pneumonia` (F.3.1).

## Start it (connected mode is required)

Backend, Python 3.10 to 3.12 (TensorFlow 2.19 does not install on 3.13):

```bash
cd DeepSee/backend
python3.12 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r core/requirements.txt
cd core && python manage.py migrate && python manage.py runserver
```

Frontend, in a second terminal. Create `frontend/.env.local` containing:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

then:

```bash
cd DeepSee/frontend
npm install
npm run dev
```

Open http://localhost:3000, register a clinician account, and run a review.

## Test chest X-rays

Use the images in `frontend/assets/x-ray-images/` (for example
`00000001_001.png`). They are NIH ChestX-ray14 samples.

## Check that you are timing the CNN, not the rule based demo

All of these should be true:

1. The workspace header shows **Connected**, not **Demo mode**. Without
   `NEXT_PUBLIC_API_URL` the frontend runs a mock model in the browser, and its
   timing is not CNN inference.
2. The `/api/upload-scan` response contains `"modelVersion": "cnn-pneumonia-v1"`
   and an `analysisStatus` list with F.3.1 to F.3.4.
3. The backend log shows `Loading model from ...pneumonia_model.keras` (first
   request only) and `Pneumonia probability ...` for every request.

Do not time `DeepSee-demo-folder.zip` or the local browser demo. They are the
Milestone 1 rule based demos and contain no CNN.

## Timing notes

- The first request after `runserver` includes loading the model (cold start).
  Record it separately or discard it, then collect at least 30 runs.
- Record the machine (CPU, RAM, operating system) with the results.
- Person 3's simulation assumed CNN inference of TRI(5, 12, 30) seconds, which
  represents a full resolution model. If the measured time is well under one
  second, use the sensitivity result in the Person 3 section: the baseline and
  the early analysis alternative perform about the same.

---

# 第 10 章实测：用哪个版本、怎么运行

给 Person 4（实测）。Person 3 报告里提到的 150×150 胸片 CNN 就在这个仓库里，不用另外下载。

## 版本

- 仓库：https://github.com/sysen5151-fall2026/DeepSee
- 主分支 `main`，提交 `5a316ae` 或更新的版本（PR #3 合并之后）。
- 模型文件：`backend/core/imaging_service/model/pneumonia_model.keras`（约 10 MB）。
- 预处理：图片先转成灰度图，再缩放到 150×150。阈值 0.5，模型版本号 `cnn-pneumonia-v1`。
- 调用路径：`POST /api/upload-scan` → `views.upload_scan` → `clinical_analysis.perform_clinical_analysis`（F.3）→ `predict_pneumonia`（F.3.1）。

## 启动（必须用 Connected 模式）

后端需要 Python 3.10 到 3.12（3.13 装不了 TensorFlow 2.19），命令见上面英文部分。

前端：新建 `frontend/.env.local`，写入 `NEXT_PUBLIC_API_URL=http://localhost:8000`，然后运行 `npm install` 和 `npm run dev`。打开 http://localhost:3000，注册一个账号，然后上传胸片。

## 测试胸片

用 `frontend/assets/x-ray-images/` 里的图片，例如 `00000001_001.png`。

## 怎么确认测的是 CNN，不是规则版

1. 页面显示 **Connected**，不是 **Demo mode**。没配 `NEXT_PUBLIC_API_URL` 时，前端用的是浏览器里的模拟模型，测出来的时间不是 CNN 推理时间。
2. API 响应里有 `"modelVersion": "cnn-pneumonia-v1"`，还有列出 F.3.1 到 F.3.4 的 `analysisStatus`。
3. 后端日志出现 `Loading model from ...pneumonia_model.keras` 和 `Pneumonia probability ...`。

不要用 `DeepSee-demo-folder.zip` 或本地浏览器演示。它们是 Milestone 1 的规则版，里面没有 CNN。

## 计时提醒

- `runserver` 之后的第一次请求包含加载模型的时间（冷启动），要单独记录或者剔除，再采集至少 30 次。
- 结果里注明测试电脑的配置（CPU、内存、操作系统）。
- Person 3 的仿真假设 CNN 推理时间是 TRI(5, 12, 30) 秒，适用于全分辨率模型。如果实测远低于 1 秒，就按 Person 3 报告里的敏感性分析处理：两种架构基本等价。
