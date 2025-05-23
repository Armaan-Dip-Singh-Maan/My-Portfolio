import { useEffect, useState } from "react";

export default function Hero() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="relative h-screen overflow-hidden">
      <img
        src="/hero-background.jpg"
        alt=""
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ transform: `translateY(${offset * 0.5}px)` }}
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          Your Name
        </h1>
      </div>
    </section>
  );
}
