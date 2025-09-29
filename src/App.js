import { useRef, useState, useEffect } from "react";
import { Button, Card } from "flowbite-react";

function App() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);

  // Inicializar canvas con fondo negro
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // -------- Dibujado compatible PC y Móvil --------
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const endDrawing = () => {
    isDrawing.current = false;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  // Limpiar canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
    setConfidence(null);
  };

  // Método asíncrono que consume la API
  const predictDigit = async () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");

    try {
      const response = await fetch("https://numerix-backend.onrender.com/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();

      if (data.error) {
        alert("Error en la predicción: " + data.error);
      } else {
        setPrediction(data.prediction);
        setConfidence((data.confidence * 100).toFixed(2));
      }
    } catch (error) {
      alert("Error en la conexión con la API");
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md bg-gray-700 text-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          Reconocimiento de Dígitos
        </h2>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="border-4 border-gray-500 rounded-lg cursor-crosshair w-full max-w-[280px] h-auto"
            style={{ touchAction: "none" }}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchMove={draw}
          />
        </div>

        <div className="flex justify-around mt-6 gap-4">
          <Button color="gray" className="flex-1" onClick={clearCanvas}>
            Limpiar
          </Button>
          <Button color="blue" className="flex-1" onClick={predictDigit}>
            Predecir
          </Button>
        </div>

        <div className="text-center mt-6">
          <h3 className="text-lg">
            Predicción:{" "}
            <span className="font-bold text-yellow-300">
              {prediction != null ? prediction : "-"}
            </span>
          </h3>
          {confidence && (
            <p className="text-sm mt-2 text-gray-200">
              Confianza: <span className="font-semibold">{confidence}%</span>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default App;
