# Style Lab · 实际动态样例

八段可播放、可逐帧查看、可编辑源码的 Remotion 短片。每段 12–16 秒，联播约 1 分 53 秒，1920×1080，30 fps，静音。全部画面与运动由代码绘制；没有使用图片生成模型的输出，也没有用静帧平移缩放充当不同视频风格。

## 运行

在本目录使用 Node.js 20.19+、22.13+ 或更新的受支持版本：

```bash
npm ci
npm run dev
```

打开终端实际打印的地址，默认 `http://localhost:3212/Style-Lab`。左侧 `Motion-Studies` 中可单独打开八段合成。画面里的文字和几何在 `src/`，每段是独立的 Interactive 组件与已注册的合成；所有运动由帧号驱动。

| 合成入口 | 源码 |
| --- | --- |
| `01-Ink-Mechanism` | [Ink.tsx](src/Ink.tsx) |
| `02-Kinetic-Type` | [Type.tsx](src/Type.tsx) |
| `03-Flat-Performance` | [Flat.tsx](src/Flat.tsx) |
| `04-Paper-Space` | [Paper.tsx](src/Paper.tsx) |
| `05-Isometric-Flow` | [Iso.tsx](src/Iso.tsx) |
| `06-Pixel-Action` | [Pixel.tsx](src/Pixel.tsx) |
| `07-Native-3D` | [Mesh.tsx](src/Mesh.tsx) |
| `08-Generative-Field` | [Field.tsx](src/Field.tsx) |

[为什么这样设计、什么条件会改选](DIRECTING.md) · [从实际动态合成取得的高清截图](../../docs/motion-studies.md)

## 检查与导出

```bash
npm run check
npm run review
```

`review` 从八段合成渲染关键时刻并记录输入指纹。它不自动播放、评定节奏或判断审美。源码帧位于 `out/review/`，不进入 Git。安装 Remotion 的浏览器或设置 `CHROME_PATH` 后可运行；Mac 上若已有标准位置的 Chrome，会使用该浏览器。

本仓库提供可播放源码与源帧，没有预先导出的完整 MP4。需要文件时可以在 Studio 的 Render 中自行导出所选合成。Remotion 作为第三方依赖仍遵循其自身的许可，项目的 MIT 许可不改写依赖许可。

## 资源与许可

本例源码采用仓库 MIT 许可。示例使用本地打包的 Inter 与 Source Serif 4 字体子集，字体自身的许可证在 [public/fonts](public/fonts)，播放时无需向字体服务请求。源码没有引用前面两部影片的私有素材或依赖本机的图片路径。

这些样例展示八种已经实际实现的动态方向，不是 Skill 的能力上限或全风格覆盖保证。实拍、黏土定格、复杂角色表演、照片级三维等需要相应素材与制作工具，不能用一张“看起来像”的生成图代替能力证明。
