import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Reveal from "./components/Reveal"; // for your About / Contact

function App() {
  return (
    <div>
      <Hero />
      <Reveal as="section" className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
        <p className="max-w-2xl mx-auto">
          {/* copy your exact copy here */}
        </p>
      </Reveal>
      <Projects />
      <Reveal as="footer" className="py-12 px-6 bg-gray-100 text-center">
        <p>© {new Date().getFullYear()} Your Name — Built with ❤️</p>
      </Reveal>
    </div>
  );
}
export default App;
