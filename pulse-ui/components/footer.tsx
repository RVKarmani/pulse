export default function Footer() {
  return (
    <footer className="bg-black py-8">
      <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row space-y-4 lg:space-y-0 justify-between items-center">
        <div className="flex justify-center space-x-4">
          <a href="https://www.linkedin.com/in/rohit-vemparala/" className="text-primary">
            LinkedIn
          </a>
          <a
            href="https://github.com/RVKarmani/pulse"
            className="text-primary"
          >
            GitHub
          </a>
        </div>

        <p className="text-gray-300 text-sm">
          Built by{" "}
          <a href="https://www.linkedin.com/in/rohit-vemparala/" className="text-primary">
            Rohit Vemparala
          </a>
        </p>
      </div>
    </footer>
  );
}
