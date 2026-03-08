import { useState, useMemo } from "react";

const servicesList = [
  { id: "backend", name: "Node Backend" },
  { id: "frontend", name: "React Frontend" },
  { id: "postgres", name: "PostgreSQL" },
  { id: "redis", name: "Redis" },
];

function App() {
  const [services, setServices] = useState({
    backend: false,
    frontend: false,
    postgres: false,
    redis: false,
    kubernetes: false,
  });

  const [config, setConfig] = useState({
    dbName: "mydb",
    dbUser: "postgres",
    dbPassword: "postgres",
    enableVolume: true,
  });

  const [loading, setLoading] = useState(false);

  /* -------- Toggle Services -------- */

  const toggleService = (id) => {
    setServices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* -------- Config Change -------- */

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;

    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* -------- Live Docker Compose Preview -------- */

  const dockerPreview = useMemo(() => {
    let yaml = `version: '3.9'\nservices:\n`;

    if (services.backend) {
      yaml += `  backend:\n    build: ./backend\n    ports:\n      - "5000:5000"\n`;
    }

    if (services.frontend) {
      yaml += `  frontend:\n    build: ./frontend\n    ports:\n      - "3000:80"\n`;
    }

    if (services.postgres) {
      yaml += `  postgres:\n    image: postgres:15\n    environment:\n      POSTGRES_DB: ${config.dbName}\n      POSTGRES_USER: ${config.dbUser}\n      POSTGRES_PASSWORD: ${config.dbPassword}\n`;

      if (config.enableVolume) {
        yaml += `    volumes:\n      - postgres_data:/var/lib/postgresql/data\n`;
      }
    }

    if (services.redis) {
      yaml += `  redis:\n    image: redis:7\n    ports:\n      - "6379:6379"\n`;
    }

    if (services.postgres && config.enableVolume) {
      yaml += `\nvolumes:\n  postgres_data:\n`;
    }

    return yaml;
  }, [services, config]);

  /* -------- Generate Stack -------- */

  const generateStack = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services,
          config,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "stack.zip";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating stack:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
      <div className="bg-white w-full max-w-7xl mx-auto rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🚀 Stack Builder
        </h1>

        <div className="grid grid-cols-2 gap-8">

          {/* LEFT PANEL */}
          <div>

            <div className="grid grid-cols-2 gap-4">
              {servicesList.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`cursor-pointer p-5 rounded-xl border-2 transition-all ${
                    services[service.id]
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-400"
                  }`}
                >
                  <h2 className="font-semibold">{service.name}</h2>
                </div>
              ))}
            </div>

            {/* Kubernetes Toggle */}
            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                checked={services.kubernetes}
                onChange={() => toggleService("kubernetes")}
              />
              <span className="font-medium">
                Generate Kubernetes YAML
              </span>
            </div>

            {/* Postgres Config */}
            {services.postgres && (
              <div className="mt-6 p-5 border rounded-xl bg-gray-50">
                <h2 className="font-semibold mb-4">
                  PostgreSQL Configuration
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    name="dbName"
                    value={config.dbName}
                    onChange={handleConfigChange}
                    placeholder="Database Name"
                    className="p-2 border rounded"
                  />

                  <input
                    name="dbUser"
                    value={config.dbUser}
                    onChange={handleConfigChange}
                    placeholder="Database User"
                    className="p-2 border rounded"
                  />

                  <input
                    name="dbPassword"
                    value={config.dbPassword}
                    onChange={handleConfigChange}
                    placeholder="Database Password"
                    className="p-2 border rounded"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="enableVolume"
                      checked={config.enableVolume}
                      onChange={handleConfigChange}
                    />
                    Enable Persistent Volume
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={generateStack}
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              {loading ? "Generating..." : "Generate Stack"}
            </button>
          </div>

          {/* RIGHT PANEL - YAML PREVIEW */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              📄 Live Docker Compose Preview
            </h2>

            <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-auto text-sm h-[500px]">
              {dockerPreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


