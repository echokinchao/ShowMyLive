import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { UploadedImage, GenerationStatus, GeneratedViews } from './types';
import { generateTryOnViews } from './services/geminiService';
import { Wand2, Sparkles, Download, AlertCircle, RefreshCw, Maximize2 } from 'lucide-react';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [resultViews, setResultViews] = useState<GeneratedViews | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!personImage || !productImage) return;

    setStatus(GenerationStatus.LOADING);
    setErrorMessage(null);
    setResultViews(null);

    try {
      const result = await generateTryOnViews(
        personImage.base64,
        personImage.mimeType,
        productImage.base64,
        productImage.mimeType,
        prompt
      );
      setResultViews(result);
      setStatus(GenerationStatus.SUCCESS);
    } catch (e: any) {
      setStatus(GenerationStatus.ERROR);
      setErrorMessage(e.message || "生成图片时发生错误，请稍后重试。");
    }
  };

  const handleReset = () => {
    setPersonImage(null);
    setProductImage(null);
    setPrompt('');
    setStatus(GenerationStatus.IDLE);
    setResultViews(null);
    setErrorMessage(null);
    setSelectedPreview(null);
  };

  const ViewCard = ({ label, imageUrl, delay }: { label: string; imageUrl?: string; delay: number }) => (
    <div 
      className={`relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50 aspect-[3/4] flex flex-col items-center justify-center transition-all duration-500 ${imageUrl ? 'opacity-100' : 'opacity-80'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedPreview(imageUrl)}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <div className="flex gap-2 justify-end pointer-events-auto">
              <button
                onClick={() => setSelectedPreview(imageUrl)}
                className="p-2 bg-slate-800/80 hover:bg-indigo-600 text-white rounded-full backdrop-blur-sm transition-colors"
                title="查看大图"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <a
                href={imageUrl}
                download={`style-fusion-${label}.png`}
                className="p-2 bg-slate-800/80 hover:bg-emerald-600 text-white rounded-full backdrop-blur-sm transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-600 animate-pulse">
          <div className="w-8 h-8 bg-slate-800 rounded-lg mb-2"></div>
        </div>
      )}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-medium text-white border border-white/10">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            全方位智能 <span className="text-indigo-400">虚拟试穿</span>
          </h2>
          <p className="text-slate-400 text-lg">
            上传人物与商品，一键生成 正面、侧面（左/右）、背面 四个视角的逼真效果图。
          </p>
        </div>

        <div className="grid xl:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Input Section (Left Side) */}
          <div className="xl:col-span-5 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-white">上传素材</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <ImageUpload
                  label="1. 人物照片"
                  description="包含清晰面部"
                  image={personImage}
                  onImageChange={setPersonImage}
                  disabled={status === GenerationStatus.LOADING}
                />
                <ImageUpload
                  label="2. 商品照片"
                  description="衣服或物品"
                  image={productImage}
                  onImageChange={setProductImage}
                  disabled={status === GenerationStatus.LOADING}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
                  额外要求 (可选)
                </label>
                <textarea
                  id="prompt"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                  placeholder="例如：场景在海边，阳光明媚..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={status === GenerationStatus.LOADING}
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={!personImage || !productImage || status === GenerationStatus.LOADING}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg border border-transparent
                    ${!personImage || !productImage
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : status === GenerationStatus.LOADING
                        ? 'bg-indigo-900/50 border-indigo-500/30 text-indigo-200 cursor-wait'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                    }`}
                >
                  {status === GenerationStatus.LOADING ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      正在生成 4 个视角...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      生成全套视角
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-400">
                    <p className="font-medium text-slate-300 mb-1">最佳效果建议：</p>
                    <ul className="list-disc list-inside space-y-1 ml-1 text-xs sm:text-sm">
                      <li>人物最好是正面全身或半身照。</li>
                      <li>生成的 4 张图会尽可能保持人物原貌。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Section (Right Side) */}
          <div className="xl:col-span-7">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-white">生成结果 (4 视角)</h3>
                </div>
                {status === GenerationStatus.SUCCESS && (
                  <button
                    onClick={handleReset}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                    新任务
                  </button>
                )}
              </div>

              <div className="flex-1 relative">
                {status === GenerationStatus.IDLE && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Wand2 className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-300 font-medium text-lg">准备就绪</p>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs">
                      上传图片后，AI 将为您生成该人物穿戴商品的正面、侧面及背面视图。
                    </p>
                  </div>
                )}

                {status === GenerationStatus.LOADING && (
                  <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-400">AI</span>
                      </div>
                    </div>
                    <p className="text-indigo-300 font-medium mt-6 animate-pulse text-lg">正在构建 3D 视角...</p>
                    <p className="text-slate-500 text-sm mt-2">同时生成 4 张高清图片，请稍候</p>
                  </div>
                )}

                {status === GenerationStatus.ERROR && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                     <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-red-400 font-medium mb-2 text-lg">生成中断</h4>
                    <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">{errorMessage}</p>
                    <button 
                      onClick={handleGenerate}
                      className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      重试
                    </button>
                  </div>
                )}

                {status === GenerationStatus.SUCCESS && resultViews && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-700">
                    <ViewCard label="正面 (Front)" imageUrl={resultViews.front} delay={0} />
                    <ViewCard label="左侧 (Left)" imageUrl={resultViews.left} delay={100} />
                    <ViewCard label="右侧 (Right)" imageUrl={resultViews.right} delay={200} />
                    <ViewCard label="背面 (Back)" imageUrl={resultViews.back} delay={300} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Preview Modal */}
        {selectedPreview && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPreview(null)}>
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
               <img 
                src={selectedPreview} 
                alt="Preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
              />
              <button 
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                onClick={() => setSelectedPreview(null)}
              >
                关闭预览
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;