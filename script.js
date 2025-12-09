// وظيفة للتنقل بين الأقسام
document.addEventListener('DOMContentLoaded', function() {
    // التعامل مع روابط التنقل
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // التعامل مع نموذج الاتصال
    const contactForm = document.querySelector('.contact form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // جمع بيانات النموذج
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // عرض رسالة تأكيد بسيطة
            alert('تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.');
            
            // إعادة تعيين النموذج
            this.reset();
        });
    }
    
    // إضافة تأثيرات عند تمرير الماوس على بطاقات الخدمات
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // تأثير تدريجي للألوان عند التمرير
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = 'translateY(' + rate + 'px)';
        }
    });
});

// وظيفة لعرض/إخفاء القائمة في الأجهزة المحمولة
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}