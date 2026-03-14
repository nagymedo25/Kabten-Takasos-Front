import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FaHeart, FaPray, FaHandHoldingHeart, FaStar } from 'react-icons/fa';

const flowers = ['🌸', '🌷', '🌹', '🌺', '🌼', '🪷', '💐', '✨', '🤍', '💖'];

const FarewellPage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the text blocks
      gsap.fromTo(
        '.reveal-element',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.3, ease: 'power3.out' }
      );

      // Animate the floating flowers
      gsap.utils.toArray('.floating-flower').forEach((flower) => {
        gsap.to(flower, {
          y: 'random(-100, 100)',
          x: 'random(-100, 100)',
          rotation: 'random(-360, 360)',
          duration: 'random(4, 8)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen relative overflow-hidden bg-dark-950 flex flex-col items-center py-20 px-4">
      
      {/* Dynamic Background with Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none"></div>

      {/* Floating Flowers Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="floating-flower absolute text-2xl md:text-4xl opacity-40 mix-blend-screen"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {flowers[Math.floor(Math.random() * flowers.length)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-12">
        
        {/* Quranic Title */}
        <div className="reveal-element">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 mb-4" style={{ fontFamily: 'Amiri, serif', lineHeight: '1.5' }}>
            ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Message from Mahmoud */}
        <div className="reveal-element glass-card p-6 md:p-10 border-t-4 border-pink-500 shadow-2xl shadow-pink-500/20 max-w-3xl">
          <FaHandHoldingHeart className="text-5xl text-pink-400 mx-auto mb-6 drop-shadow-lg" />
          <p className="text-xl md:text-2xl text-white leading-relaxed font-bold" style={{ lineHeight: '1.8' }}>
            عملت الموقع ده بكل حب وبكل نقطة عرق ومجهود علشان بحب كل أصحابي وإخواتي وزمايلي في الدفعة.
            حبيت أعمل حاجة تفضل ذكرى حلوة نختم بيها آخر سنة وتكون عون وسند لينا كلنا حتى لو هي حاجة بسيطة ومتواضعة.. ربنا يشهد إني حاولت أطلع أحسن ما عندي عشانكم. ❤️
          </p>
          <div className="mt-8 text-lg text-emerald-300 font-bold animate-pulse">
            كل اللي بطلبه منكم.. دعوة حلوة من القلب محتاجها جداً 🤍
          </div>
        </div>

        {/* Prayer for Mahmoud */}
        <div className="reveal-element w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-dark-800/80 backdrop-blur-xl ring-1 ring-white/10 p-8 rounded-[2rem] shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-emerald-400 mb-6 flex items-center justify-center gap-2">
              <FaStar className="text-amber-400" /> دعوة لمحمود <FaStar className="text-amber-400" />
            </h3>
            <p className="text-xl md:text-2xl text-teal-100 font-bold leading-loose text-center">
              "يا رب اجبر بخاطره ووفقه في سنته دي وأكرمه بأعلى الدرجات، ويسر له كل عسير، وحقق له كل أحلامه وطموحاته، وارزقه فرحة تسجد لها عيناه باكية، واجعل التوفيق حليفه في كل خطوة يخطوها يا رب العالمين"
            </p>
          </div>
        </div>

        {/* Call & Response */}
        <div className="reveal-element text-center my-4 space-y-4">
          <h2 className="text-4xl font-black text-pink-400 drop-shadow-md">
            دعتلي ؟؟
          </h2>
          <h2 className="text-5xl font-black text-amber-400 drop-shadow-md mt-4 relative inline-block">
            الدور علينا كلنا !!
            <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-amber-400 rounded-full animate-bounce"></span>
          </h2>
        </div>

        {/* Prayer for Everyone */}
        <div className="reveal-element w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-pink-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-dark-800/80 backdrop-blur-xl ring-1 ring-white/10 p-8 rounded-[2rem] shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-amber-400 mb-6 flex items-center justify-center gap-2">
              <FaPray className="text-pink-400" /> دعوة لدفعة سنة ثالثة كلها <FaPray className="text-pink-400" />
            </h3>
            <p className="text-xl md:text-2xl text-amber-100 font-bold leading-loose text-center">
              "اللهم وفقنا جميعاً في هذه السنة المفصلية المليئة بالتحديات، اللهم كلل تعبنا وسهرنا بالنجاح الباهر، وافرح قلوب أهالينا بنا، ولا تضيع لنا جهداً. يا رب افتح لنا أبواب الخير كلها واجعلنا من الأوائل المتفوقين وقر أعيننا بمستقبل باهر يا أرحم الراحمين"
            </p>
          </div>
        </div>

        <div className="reveal-element mt-10">
          <FaHeart className="text-red-500 text-6xl animate-ping mx-auto" />
        </div>

      </div>
    </div>
  );
};

export default FarewellPage;
