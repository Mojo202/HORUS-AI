import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateImage as generatePollinationsImage } from '../../services/pollinationsService';
import { uploadImageToHost, generatePromptSuggestions, analyzeImageForPrompt } from '../../services/geminiService';
import { convertToWebp, paintOverWatermark } from '../../utils/image';
import LoadingIndicator from '../LoadingIndicator';
import { ASPECT_RATIO_OPTIONS, IMAGE_STUDIO_EXAMPLE_PROMPTS, IMAGE_GENERATION_STYLES } from '../../constants';
import type { AspectRatioOption, CustomFont } from '../../types';
import { apiKeyManager } from '../../apiKeyManager';
import CanvasEditorModal from '../CanvasEditor';
import { PageBanner } from '../PageBanner';
import { ImageAnalyzer, BatchImageAnalyzer } from '../ImageStudio'; // Re-importing analyzers from the original studio

declare const fabric: any;

const TYPOGRAPHY_STYLES = [
  { value: 'none', label: 'بدون (افتراضي)' },
  { value: 'dramatic_scene', label: 'مشهد درامي سينمائي' },
  { value: 'dramatic', label: 'درامي (حجري/ناري)' },
  { value: 'joyful', label: 'مبهج (ملون/مضيء)' },
  { value: 'feminine', label: 'بناتي (ناعم/وردي)' },
  { value: 'sporty', label: 'رياضي (ديناميكي/معدني)' },
  { value: 'medical_alt', label: 'طبي فني (للأعشاب)' },
  { value: 'auto_fire', label: 'تلقائي: ناري' },
  { value: 'auto_ice', label: 'تلقائي: جليدي' },
  { value: 'auto_metallic', label: 'تلقائي: معدني لامع' },
];

const PROMPT_ENHANCERS_NEW = [
    { name: 'ألوان زاهية', value: ', vibrant colors, bright and lively tones' },
    { name: 'أسلوب فني', value: ', in a symbolic artistic non-realistic style' },
    { name: 'سينمائي', value: ', cinematic lighting, epic composition' },
    { name: 'واقعي', value: ', photorealistic, high detail' },
    { name: 'تجنب الأخطاء', value: ', correct any mistakes, ensure logical consistency' },
];


interface PollinationsStudioProps {
    onNavigateHome: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    setWarning: (warning: string | null) => void;
    customFonts: CustomFont[];
    imgbbApiKey: string;
    selectedTextModel: string;
}

const PollinationsStudio: React.FC<PollinationsStudioProps> = ({
    onNavigateHome,
    logStatus,
    setError,
    setWarning,
    customFonts,
    imgbbApiKey,
    selectedTextModel,
}) => {
    const [mainPrompt, setMainPrompt] = useState('');
    const [selectedAspectRatioLabel, setSelectedAspectRatioLabel] = useState<string>(ASPECT_RATIO_OPTIONS[0].label);
    const [isLogoMode, setIsLogoMode] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState<'view' | 'export'>('view');
    
    const [exportSlug, setExportSlug] = useState('');
    const [exportQuality, setExportQuality] = useState(0.9);
    
    const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
    const [showExamples, setShowExamples] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [useCreativeBypass, setUseCreativeBypass] = useState(true); // Kept for UI consistency
    const [imageStyle, setImageStyle] = useState(IMAGE_GENERATION_STYLES[0].prompt);
    const [typographyStyle, setTypographyStyle] = useState('none');
    const [textToRender, setTextToRender] = useState('');

    const smallPurpleGlassButton = "p-2 text-xs rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors duration-300";

    const selectedAspectRatioOption = useMemo(() => {
        return ASPECT_RATIO_OPTIONS.find(opt => opt.label === selectedAspectRatioLabel) || ASPECT_RATIO_OPTIONS[0];
    }, [selectedAspectRatioLabel]);

    const handleGenerateSuggestions = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API' لتوليد الاقتراحات.");
            return;
        }
        if (!mainPrompt.trim()) {
            setError("يرجى كتابة فكرة أولية في صندوق البرومبت أولاً.");
            return;
        }
        setIsGeneratingSuggestions(true);
        setPromptSuggestions([]);
        try {
            const suggestions = await generatePromptSuggestions(mainPrompt, logStatus);
            setPromptSuggestions(suggestions);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!mainPrompt.trim()) { setError("يرجى إدخال وصف (برومبت) للصورة."); return; }
        if (imgbbApiKey && !exportSlug.trim()) { setError("يرجى إدخال اسم مخصص (Slug) للصورة قبل الإنشاء."); return; }
        if (typographyStyle !== 'none' && !textToRender.trim()) { setError("يرجى إدخال النص المراد إضافته للصورة."); return; }

        setIsLoading(true);
        setLoadingStatus('');
        setError(null);
        setWarning(null);
        logStatus(`--- 🎨 [Pollinations] بدء إنشاء صورة ---`);
        
        try {
            let finalPrompt = mainPrompt.trim();
            if (isLogoMode) {
                finalPrompt = `Clean, modern, vector logo for ${finalPrompt}, minimalist, on a pure white background`;
            }
            if (imageStyle) {
                finalPrompt += `, ${imageStyle.replace(/^,/, '').trim()}`;
            }
            if (typographyStyle !== 'none' && textToRender.trim()) {
                finalPrompt += `, with the text "${textToRender}" written in a ${typographyStyle} style`;
            }

            const { width, height } = selectedAspectRatioOption;
            
            logStatus(`🖼️ استخدام برومبت Pollinations: "${finalPrompt.substring(0, 150)}..."`);
            setLoadingStatus("🎨 جاري إنشاء الصورة من Pollinations...");
            const rawImageUrl = generatePollinationsImage(finalPrompt, width, height);
            
            let finalImageUrl = rawImageUrl;

            if (imgbbApiKey) {
                setLoadingStatus("✨ جاري إزالة العلامة المائية...");
                const cleanedDataUrl = await paintOverWatermark(rawImageUrl);
                
                setLoadingStatus("🖼️ جاري التحويل إلى WebP...");
                const webpDataUrl = await convertToWebp(cleanedDataUrl, exportQuality);
                const webpBase64 = webpDataUrl.split(',')[1];
                
                setLoadingStatus("☁️ جاري رفع الصورة...");
                const hostedUrl = await uploadImageToHost(webpBase64, imgbbApiKey, exportSlug);
                finalImageUrl = hostedUrl;

            } else {
                setWarning('لم يتم توفير مفتاح ImgBB API. سيتم عرض الصورة مع العلامة المائية ولن يتم استضافتها.');
            }

            setLoadingStatus("✅ اكتملت العملية!");
            const newImages = [finalImageUrl, ...generatedImages];
            setGeneratedImages(newImages);
            setSelectedImage(finalImageUrl);
            setActiveTab('view');
            logStatus(`✅ تم إنشاء الصورة بنجاح.`);

        } catch (e: any) {
            setError(e.message);
            logStatus(`❌ [Pollinations] خطأ: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [mainPrompt, isLogoMode, imageStyle, typographyStyle, textToRender, exportSlug, selectedAspectRatioOption, exportQuality, imgbbApiKey, logStatus, setError, setWarning, generatedImages]);
    
    const handleSaveEdits = (dataUrl: string) => {
        const newImages = [dataUrl, ...generatedImages];
        setGeneratedImages(newImages);
        setSelectedImage(dataUrl);
        setActiveTab('view');
        logStatus("✅ تم حفظ التعديلات اليدوية.");
    };

    const handleDownloadImage = async () => {
        if (!selectedImage) return;
        const name = exportSlug || `horus-pollinations-image-${Date.now()}`;
        try {
            const webpDataUrl = await convertToWebp(selectedImage, exportQuality);
            const link = document.createElement('a');
            link.href = webpDataUrl;
            link.download = `${name}.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(webpDataUrl);
        } catch (err) {
            setError("فشل التحميل. قد يكون السبب مشكلة CORS. حاول فتح الصورة في تبويب جديد وحفظها.");
            window.open(selectedImage, '_blank');
        }
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors z-20 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="استوديو Pollinations" iconClass="fas fa-seedling" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                {/* Controls Column */}
                <div className="lg:col-span-1 flex flex-col gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
                    <textarea value={mainPrompt} onChange={(e) => setMainPrompt(e.target.value)} rows={5} placeholder="اكتب فكرتك الأولية هنا بالإنجليزية..." className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    
                    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={useCreativeBypass} onChange={e => setUseCreativeBypass(e.target.checked)} className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🎨 تطبيق الفلتر الفني الإبداعي (لتجنب القيود)</span>
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {PROMPT_ENHANCERS_NEW.map(p => <button key={p.name} onClick={() => setMainPrompt(prev => prev + p.value)} className={smallPurpleGlassButton}>{p.name}</button>)}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🎨 نمط الصورة العام</label>
                        <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                            {IMAGE_GENERATION_STYLES.map(style => <option key={style.name} value={style.prompt}>{style.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <button onClick={() => setImageStyle(IMAGE_GENERATION_STYLES.find(s => s.name.includes('ديزني-بيكسار'))?.prompt || '')} className="w-full p-3 rounded-lg font-bold glowing-pixar-btn flex items-center justify-center gap-2">
                            <i className="fas fa-magic"></i> {IMAGE_GENERATION_STYLES.find(s => s.name.includes('ديزني-بيكسار'))?.name}
                        </button>
                        <button onClick={() => setMainPrompt(prev => prev + ', 8K resolution, masterpiece, ultra high quality, photorealistic')} className="w-full p-3 rounded-lg font-bold glowing-8k-btn flex items-center justify-center gap-2">
                            <i className="fas fa-star"></i> 8K جودة فائقة
                        </button>
                    </div>

                    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-3 border border-purple-500/20">
                        <h4 className="text-sm font-bold text-center text-purple-400">✍️ نمط الخط ثلاثي الأبعاد (اختياري)</h4>
                        <select value={typographyStyle} onChange={e => setTypographyStyle(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                            {TYPOGRAPHY_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        {typographyStyle !== 'none' && (
                            <input type="text" value={textToRender} onChange={e => setTextToRender(e.target.value)} placeholder="النص المراد إضافته (بالإنجليزية)" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" />
                        )}
                    </div>

                    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-2">
                        <div className="flex gap-2">
                            <button onClick={handleGenerateSuggestions} disabled={isGeneratingSuggestions} className="w-full px-3 py-2 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2">
                                {isGeneratingSuggestions ? <LoadingIndicator /> : <>💡 توليد برومبتات (Gemini)</>}
                            </button>
                            <button onClick={() => setShowExamples(!showExamples)} className="w-full px-3 py-2 text-xs rounded-md bg-green-600 text-white hover:bg-green-700">
                                {showExamples ? 'إخفاء الأمثلة' : 'إظهار أمثلة'}
                            </button>
                        </div>
                        {promptSuggestions.map((s, i) => <button key={i} onClick={() => setMainPrompt(s)} className="w-full p-2 text-xs text-left bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-800 truncate">{s}</button>)}
                    </div>

                    <select value={selectedAspectRatioLabel} onChange={e => setSelectedAspectRatioLabel(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                         {/* FIX: Corrected reduce function logic to prevent a runtime error. The previous implementation was incorrect and caused the subsequent .map() to fail. */}
                         {Object.entries(ASPECT_RATIO_OPTIONS.reduce((acc, option) => {
                            if (!acc[option.category]) {
                                acc[option.category] = [];
                            }
                            acc[option.category].push(option);
                            return acc;
                         }, {} as Record<string, AspectRatioOption[]>)).map(([category, options]) => (
                            <optgroup label={category} key={category}>
                                {(options as AspectRatioOption[]).map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
                            </optgroup>
                         ))}
                    </select>

                    <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md space-y-3 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-center text-gray-500 dark:text-gray-400">إعدادات الملف النهائي</h4>
                        <input value={exportSlug} onChange={e => setExportSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="الاسم المخصص (Slug)" className="w-full bg-white dark:bg-gray-900 p-2 rounded-md border border-gray-300 dark:border-gray-600 font-mono text-sm" />
                        <div>
                            <label className="block text-sm font-medium">جودة الضغط: <span className="font-bold text-cyan-500">{Math.round(exportQuality * 100)}%</span></label>
                            <input type="range" min="0.1" max="1" step="0.05" value={exportQuality} onChange={e => setExportQuality(parseFloat(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <LoadingIndicator /> : '🚀 إنشاء الصورة'}
                    </button>

                    <ImageAnalyzer setMainPrompt={setMainPrompt} logStatus={logStatus} setError={setError} selectedTextModel={selectedTextModel} />
                    <BatchImageAnalyzer logStatus={logStatus} setError={setError} selectedTextModel={selectedTextModel} />
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                        <div className="border-b border-gray-300 dark:border-gray-600 flex mb-4">
                            <button onClick={() => setActiveTab('view')} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'view' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500'}`}>المعاينة</button>
                            <button onClick={() => selectedImage && setIsEditorOpen(true)} disabled={!selectedImage} className="px-4 py-2 text-sm font-semibold text-gray-500 disabled:text-gray-600">محرر Canva</button>
                            <button onClick={() => setActiveTab('export')} disabled={!selectedImage} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'export' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500'} disabled:text-gray-600`}>الرابط النهائي</button>
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900/50 rounded-lg min-h-[400px] p-2 relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                                    <LoadingIndicator statusText={loadingStatus || 'جاري الإنشاء...'} progress={0.5} />
                                </div>
                            )}
                            {activeTab === 'view' && !isLoading && (
                                <>
                                {!selectedImage && <p className="text-gray-500">ستظهر الصورة هنا</p>}
                                {selectedImage && <img src={selectedImage} alt="Art" className="max-w-full max-h-full object-contain rounded-md" />}
                                </>
                            )}
                            {activeTab === 'export' && selectedImage && !isLoading && (
                                <div className="space-y-4 w-full p-4">
                                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">الرابط النهائي</h4>
                                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                                        <input type="text" readOnly value={selectedImage} className="flex-grow bg-transparent text-xs font-mono text-cyan-700 dark:text-cyan-300 p-1" />
                                        <button onClick={() => { navigator.clipboard.writeText(selectedImage); logStatus("تم نسخ الرابط."); }} className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white">نسخ</button>
                                        <button onClick={handleDownloadImage} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white">تحميل</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="h-28 bg-gray-900/50 p-2 rounded-lg border border-gray-600 overflow-x-auto">
                        <div className="flex h-full gap-3">
                            {generatedImages.map((imgUrl, i) => <img key={i} src={imgUrl} onClick={() => { setSelectedImage(imgUrl); setActiveTab('view'); }} className={`h-full w-auto rounded-md cursor-pointer border-2 ${selectedImage === imgUrl ? 'border-cyan-500' : 'border-transparent'}`} />)}
                        </div>
                    </div>
                </div>
            </div>
            {isEditorOpen && selectedImage && (
                <CanvasEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveEdits}
                    initialImageUrl={selectedImage}
                    customFonts={customFonts}
                    logStatus={logStatus}
                    setError={setError}
                    imgbbApiKey={imgbbApiKey}
                    slug={exportSlug}
                />
            )}
        </>
    );
};

export default PollinationsStudio;