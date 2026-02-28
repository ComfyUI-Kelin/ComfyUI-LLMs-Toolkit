# 任务追踪：修复 API Seed 参数类型错误
## 阶段与进度
1. [x] 定位错误源头 -> `nodes/openai_compatible.py` 文件中向 `payload` 添加 `seed` 时。
2. [x] 分析为什么 seed 不是 integer -> 虽然 Python 中转换为了 `int(seed)`，但是 ComfyUI 传入的随机种子可能是 64 位无符号整数（非常巨大），导致发送给云厂商（如阿里云大模型）时超出了某些强类型解析器支持的最大整型（通常是 32 位），使其被错误识别或解析为指数浮点数（float），进而抛出“必须是 Integer”的报错。
3. [x] 修复代码转换 -> 根据 `CONTRIBUTING.md` 的规范（3.1 节），非标准的 `seed` 应当完全从 payload 抽离，而不能传给远端接口。
4. [x] 验证修复 -> 已删去构建 `seed` 参数的逻辑，并使用测试脚本检查模拟的 LLMClient 参数，由于 `seed` 未进入到字典里，已完美避免此“must be Integer/Float”的大模型解析异常并在本地安全屏蔽了这个 ComfyUI-LLMs-Toolkit 发送错误。

## 决策与思考
- 初始阶段：用户反馈 `[Error] [BAD_REQUEST] 请求参数有误 API: 'seed' must be Integer`，这通常发生在调用大模型 API（如 qwen3-vl-plus）时，传入的 `seed` 字段格式不对（可能是 float 或是 string）。
- 搜索发生点：主要在 `ComfyUI-LLMs-Toolkit` 中的 `openai_compatible.py` 文件，我需要抓取 `seed` 关键字。

## 遇到的错误
无
