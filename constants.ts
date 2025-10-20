import { ContentType, ToolType, ContentTypeOption, ToolOption, AspectRatioOption } from './types';

export const GEMINI_TEXT_MODELS = [
    { name: 'Gemini 2.5 Flash (أسرع وأرخص)', value: 'gemini-2.5-flash' },
    { name: 'Gemini 2.5 Pro (أذكى وأقوى)', value: 'gemini-2.5-pro' },
];

export const GEMINI_IMAGE_MODELS = [
    { name: 'Imagen 4.0 (الأقوى)', value: 'imagen-4.0-generate-001', disabled: false, title: 'أحدث وأقوى نموذج لتوليد الصور من جوجل' },
    { name: 'Gemini Flash Image (الأسرع)', value: 'gemini-2.5-flash-image', disabled: false, title: 'نموذج سريع ومتعدد الاستخدامات لتوليد وتعديل الصور' },
];

export const ZODIAC_SIGN_MAP: { [key: string]: string } = {
  'الحمل': 'Aries', 'الثور': 'Taurus', 'الجوزاء': 'Gemini', 'السرطان': 'Cancer',
  'الأسد': 'Leo', 'العذراء': 'Virgo', 'الميزان': 'Libra', 'العقرب': 'Scorpio',
  'القوس': 'Sagittarius', 'الجدي': 'Capricorn', 'الدلو': 'Aquarius', 'الحوت': 'Pisces'
};

export const HOROSCOPE_IMAGE_PROMPTS = [
    { name: 'النمط الفاخر (Luxury)', prompt: 'Luxury, elegant, hyper-detailed 3D render of the {{ZODIAC_SIGN_EN}} zodiac sign symbol, made of glowing gold and precious gems, on a dark cosmic background with nebulae and stars, cinematic lighting, masterpiece, 8k resolution.' },
    { name: 'النمط الأسطوري (Mythical)', prompt: 'Mythical, epic digital painting of the astrological constellation for {{ZODIAC_SIGN_EN}}, personified as a celestial god/goddess, surrounded by ethereal light and cosmic energy, fantasy art, detailed, masterpiece, 8k resolution.' }
];

export const COOKING_IMAGE_PROMPTS = [
    { name: 'لقطة علوية', prompt: 'Overhead flat lay food photography of {{DISH_NAME}}, rustic wooden table, fresh ingredients scattered around, vibrant colors, professional lighting, 8K, high detail.', icon: 'fas fa-camera', color: '#f59e0b' },
    { name: 'نمط ريفي', prompt: 'Rustic, cozy scene of {{DISH_NAME}} served on a ceramic plate, warm lighting, blurred background of a kitchen, steam rising, appetizing, 8K.', icon: 'fas fa-home', color: '#84cc16' },
    { name: 'لقطة مقربة', prompt: 'Macro food photography, extreme close-up on the texture of {{DISH_NAME}}, highlighting details, shallow depth of field, delicious, professional shot, 8K.', icon: 'fas fa-search-plus', color: '#ef4444' },
    { name: 'مطعم فاخر', prompt: 'Fine dining presentation of {{DISH_NAME}}, minimalist white plate, elegant garnishing, dark moody background, Michelin star style, professional, 8K.', icon: 'fas fa-star', color: '#a855f7' },
];

export const NEWS_IMAGE_PROMPTS = [
    { name: 'تصوير صحفي', prompt: 'Photojournalism style, candid shot capturing the essence of {{ARTICLE_TITLE}}, realistic, dynamic action, dramatic lighting, high emotion, 8k.', icon: 'fas fa-camera-retro', color: '#3b82f6' },
    { name: 'رسم توضيحي', prompt: 'Modern, minimalist infographic illustration explaining the concept of {{ARTICLE_TITLE}}, clean lines, symbolic icons, clear text labels (in english), on a white background, 8k.', icon: 'fas fa-chart-pie', color: '#10b981' },
    { name: 'رياضة', prompt: 'High-speed action photography of a sports event related to {{ARTICLE_TITLE}}, motion blur, sharp focus on the athlete, dramatic, powerful, 8k.', icon: 'fas fa-futbol', color: '#f97316' },
    { name: 'اقتصاد', prompt: 'Conceptual image representing {{ARTICLE_TITLE}}, abstract 3D render of stock market charts, glowing data streams, and financial symbols, dark background, blue and green lights, 8k.', icon: 'fas fa-chart-line', color: '#22c55e' },
];

export const IMAGE_GENERATION_STYLES = [
    { name: 'بدون نمط (افتراضي)', prompt: '' },
    { name: 'فن رقمي', prompt: ', digital art, trending on artstation, masterpiece' },
    { name: 'تصوير سينمائي', prompt: ', cinematic shot, dramatic lighting, wide angle' },
    { name: 'نموذج ثلاثي الأبعاد', prompt: ', 3d render, octane render, v-ray, photorealistic' },
    { name: 'فن بيكسار', prompt: ', disney pixar style, 3d animation' },
    { name: 'أنمي ياباني', prompt: ', japanese anime style, makoto shinkai' },
    { name: 'لوحة زيتية', prompt: ', oil painting, detailed, classic art' },
    { name: 'فن خيالي', prompt: ', fantasy art, epic, detailed, magical' },
    { name: 'ديزني-بيكسار (شخصية)', prompt: ', character design, disney pixar style, 3d animation character, full body shot' },
];

export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { value: ContentType.News, label: 'الأخبار', emoji: '📰', iconClass: 'fas fa-newspaper', subCategories: [{label: "أخبار مصر", value: "أخبار مصر"}, {label: "أخبار عالمية", value: "أخبار عالمية"}, {label: "اقتصاد", value: "اقتصاد"}, {label: "رياضة", value: "رياضة"}, {label: "فن وثقافة", value: "فن وثقافة"}, {label: "تكنولوجيا", value: "تكنولوجيا"}] },
  { value: ContentType.SportsMedicine, label: 'الطب الرياضي', emoji: '⚕️', iconClass: 'fas fa-running' },
  { value: ContentType.AlternativeMedicine, label: 'الطب البديل', emoji: '🌿', iconClass: 'fas fa-seedling' },
  { value: ContentType.HealthWellness, label: 'الصحة والعافية', emoji: '💪', iconClass: 'fas fa-heartbeat' },
  { value: ContentType.Beauty, label: 'الجمال والمرأة', emoji: '💄', iconClass: 'fas fa-gem' },
  { value: ContentType.Cooking, label: 'الطبخ', emoji: '🍳', iconClass: 'fas fa-utensils' },
  { value: ContentType.Horoscope, label: 'الأبراج', emoji: '🔮', iconClass: 'fas fa-star' },
  { value: ContentType.Tech, label: 'التقنية', emoji: '💻', iconClass: 'fas fa-code' },
  { value: ContentType.Stories, label: 'القصص', emoji: '📖', iconClass: 'fas fa-book-open' },
  { value: ContentType.Travel, label: 'السفر والسياحة', emoji: '✈️', iconClass: 'fas fa-plane-departure' },
  { value: ContentType.Finance, label: 'المال والأعمال', emoji: '💼', iconClass: 'fas fa-chart-line' },
  { value: ContentType.Reviews, label: 'المراجعات', emoji: '⭐', iconClass: 'fas fa-star-half-alt' },
  { value: ContentType.AdvancedEditor, label: 'وضع الإنشاء المتقدم', emoji: '✍️', iconClass: 'fas fa-magic' },
  { value: ContentType.ImageStudio, label: 'استوديو الصور', emoji: '🎨', iconClass: 'fas fa-palette' },
  { value: ContentType.SeoStudio, label: 'استوديو SEO', emoji: '🚀', iconClass: 'fas fa-chart-bar' },
  { value: ContentType.VideoStudio, label: 'استوديو الفيديو', emoji: '🎬', iconClass: 'fas fa-video' },
  { value: ContentType.HoroscopeVideoStudio, label: 'فيديوهات الأبراج', emoji: '✨', iconClass: 'fas fa-hat-wizard' },
  { value: ContentType.HorusForge, label: 'صانع البروتوكولات', emoji: '📜', iconClass: 'fas fa-scroll' },
];

export const TOOL_OPTIONS: ToolOption[] = [
    { value: ToolType.BloggerCleaner, label: 'مركز صيانة بلوجر', iconClass: 'fab fa-blogger-b' },
    { value: ToolType.CodeConverter, label: 'محول الأكواد', iconClass: 'fas fa-exchange-alt' },
    { value: ToolType.WebpConverter, label: 'محول WebP', iconClass: 'fas fa-file-image' },
    { value: ToolType.WordCounter, label: 'لوحة تحليل المحتوى', iconClass: 'fas fa-tachometer-alt' },
    { value: ToolType.ChatGpt, label: 'شات حورس', iconClass: 'fas fa-robot' },
    { value: ToolType.PrivacyPolicy, label: 'مولد سياسة الخصوصية', iconClass: 'fas fa-user-shield' },
    { value: ToolType.TermsOfUse, label: 'مولد اتفاقية الاستخدام', iconClass: 'fas fa-handshake' },
    { value: ToolType.AboutUs, label: 'مولد صفحة "من نحن"', iconClass: 'fas fa-info-circle' },
    { value: ToolType.RobotsTxt, label: 'مولد Robots.txt', iconClass: 'fas fa-file-code' },
    { value: ToolType.Sitemap, label: 'مولد خرائط الموقع', iconClass: 'fas fa-sitemap' },
    { value: ToolType.CssMinifier, label: 'ضاغط أكواد CSS', iconClass: 'fas fa-compress-arrows-alt' },
    { value: ToolType.CodeEditor, label: 'محرر الأكواد الحي', iconClass: 'fas fa-code' },
    { value: ToolType.AiContentDetector, label: 'كاشف محتوى AI', iconClass: 'fas fa-search' },
    { value: ToolType.KeywordTool, label: 'بوصلة الكلمات المفتاحية', iconClass: 'fas fa-key' },
    { value: ToolType.ContactUs, label: 'مولد صفحة اتصل بنا', iconClass: 'fas fa-envelope' },
    { value: ToolType.BacklinkChecker, label: 'مرصد الروابط الخلفية', iconClass: 'fas fa-link' },
    { value: ToolType.PlagiarismChecker, label: 'فاحص الانتحال', iconClass: 'fas fa-file-signature' },
    { value: ToolType.NanoBananaStudio, label: 'استوديو نانو بنانا', iconClass: 'fas fa-edit' }, // Changed icon
    { value: ToolType.SocialMediaPostGenerator, label: 'مولّد منشورات السوشيال ميديا', iconClass: 'fas fa-share-square' },
    { value: ToolType.HeadlineAnalyzer, label: 'محلل العناوين', iconClass: 'fas fa-spell-check' },
    { value: ToolType.ShortVideoScriptWriter, label: 'كاتب نصوص الفيديو القصير', iconClass: 'fas fa-file-video' },
    { value: ToolType.AdvancedImageEnhancer, label: 'محسّن الصور المتقدم', iconClass: 'fas fa-photo-video' },
    { value: ToolType.EcommerceStudio, label: 'استوديو التجارة الإلكترونية', iconClass: 'fas fa-store' },
    { value: ToolType.EmailMarketingGenerator, label: 'مولد حملات البريد الإلكتروني', iconClass: 'fas fa-paper-plane' },
    { value: ToolType.ElearningStudio, label: 'استوديو المحتوى التعليمي', iconClass: 'fas fa-chalkboard-teacher' },
    { value: ToolType.PodcastScriptGenerator, label: 'مولد نصوص البودكاست', iconClass: 'fas fa-podcast' },
    { value: ToolType.PollinationsStudio, label: 'استوديو Pollinations', iconClass: 'fas fa-seedling' },
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
    // Social Media
    { label: 'Instagram Post (1:1)', aspectRatioValue: '1:1', width: 1080, height: 1080, category: 'Social Media' },
    { label: 'Instagram Story (9:16)', aspectRatioValue: '9:16', width: 1080, height: 1920, category: 'Social Media' },
    { label: 'Facebook Post (4:3)', aspectRatioValue: '4:3', width: 1200, height: 900, category: 'Social Media' },
    { label: 'Twitter Post (16:9)', aspectRatioValue: '16:9', width: 1600, height: 900, category: 'Social Media' },
    // General Use
    { label: 'Standard Landscape (16:9)', aspectRatioValue: '16:9', category: 'General' },
    { label: 'Standard Portrait (9:16)', aspectRatioValue: '9:16', category: 'General' },
    { label: 'Standard Square (1:1)', aspectRatioValue: '1:1', category: 'General' },
    { label: 'Classic Photo (4:3)', aspectRatioValue: '4:3', category: 'General' },
    { label: 'Classic Portrait (3:4)', aspectRatioValue: '3:4', category: 'General' },
];

export const IMAGE_STUDIO_EXAMPLE_PROMPTS = [
    { name: "شعار بسيط", prompt: "A minimalist vector logo of a wolf's head, geometric, clean lines, on a white background, SVG style." },
    { name: "مشهد سينمائي", prompt: "Cinematic shot of a lone astronaut standing on a desolate alien planet, two moons in the sky, dramatic lighting, wide-angle, hyper-detailed, 8k resolution." },
    { name: "شخصية كرتونية", prompt: "Character design of a friendly, steampunk-style robot sidekick, holding a glowing lantern, Disney Pixar style, 3d animation character." },
    { name: "تصوير طعام", prompt: "Overhead flat lay food photography of a stack of pancakes with blueberries and maple syrup, rustic wooden table, professional lighting, vibrant colors, 8K." },
    { name: "فن خيالي", prompt: "Epic fantasy art of a majestic dragon perched atop a mountain peak, storm clouds gathering, lightning, masterpiece, trending on ArtStation." },
];
