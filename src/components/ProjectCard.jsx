import Reveal from "./Reveal";

export default function ProjectCard({ title, description, link, image }) {
  return (
    <Reveal className="p-4">
      <a
        href={link}
        className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
      >
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </a>
    </Reveal>
  );
}
