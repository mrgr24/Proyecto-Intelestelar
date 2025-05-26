// Variables globales
let universeData;
let universe;
let explorer;

// Importar clases necesarias
import { Universe } from "./universe.js";
import { BacktrackingExplorer } from "./backtracking-explorer.js";

// Cargar datos del JSON
async function loadUniverseData() {
  try {
    // En una aplicación real, esto sería una carga desde un archivo
    // Por ahora, usamos los datos proporcionados en la variable global
    const jsonData = {
      matriz: {
        filas: 35,
        columnas: 40,
      },
      origen: [0, 0],
      destino: [34, 39],
      agujerosNegros: [
        [3, 5],
        [10, 20],
        [8, 8],
      ],
      estrellasGigantes: [
        [7, 7],
        [14, 14],
        [20, 20],
      ],
      agujerosGusano: [
        {
          entrada: [11, 11],
          salida: [13, 13],
        },
        {
          entrada: [18, 5],
          salida: [21, 6],
        },
      ],
      zonasRecarga: [
        [6, 17, 4],
        [12, 39, 5],
        [28, 20, 3],
        [12, 11, 2],
        [9, 20, 4],
        [20, 10, 4],
        [20, 16, 3],
        [28, 7, 5],
        [9, 7, 3],
        [30, 35, 4],
      ],
      celdasCargaRequerida: [
        {
          coordenada: [9, 9],
          cargaGastada: 7,
        },
        {
          coordenada: [22, 22],
          cargaGastada: 12,
        },
      ],
      cargaInicial: 200,
      matrizInicial: [],
    };

    // Cargar la matriz inicial desde el JSON proporcionado
    // Esto es solo un ejemplo, en la implementación real se usaría la matriz completa
    jsonData.matrizInicial = [];
    for (let i = 0; i < jsonData.matriz.filas; i++) {
      const row = [];
      for (let j = 0; j < jsonData.matriz.columnas; j++) {
        // Generar valores aleatorios entre 1 y 10 para el ejemplo
        row.push(Math.floor(Math.random() * 10) + 1);
      }
      jsonData.matrizInicial.push(row);
    }

    universeData = jsonData;

    // Inicializar el universo
    initializeUniverse();
  } catch (error) {
    console.error("Error al cargar los datos del universo:", error);
    const logElement = document.getElementById("exploration-log");
    if (logElement) {
      logElement.innerHTML =
        '<div class="log-entry log-error">Error al cargar los datos del universo.</div>';
    }
  }
}

// Inicializar el universo
function initializeUniverse() {
  if (!universeData) {
    console.error("No hay datos del universo para inicializar");
    return;
  }

  try {
    // Crear instancia del universo
    universe = new Universe(universeData);

    // Crear explorador con backtracking
    explorer = new BacktrackingExplorer(universe);

    // Configurar botones
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");
    const stepBtn = document.getElementById("step-btn");

    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        if (explorer.exploring) return;

        startBtn.disabled = true;
        stepBtn.disabled = true;

        // Habilitar modo paso a paso
        explorer.enableStepMode();

        // Iniciar exploración
        const success = await explorer.findPath();

        startBtn.disabled = false;
        stepBtn.disabled = !success;
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        universe.reset();
        stepBtn.disabled = true;
      });
    }

    if (stepBtn) {
      stepBtn.addEventListener("click", async () => {
        if (!explorer.solution) return;

        const hasMoreSteps = await explorer.takeStep();
        stepBtn.disabled = !hasMoreSteps;
      });
    }
  } catch (error) {
    console.error("Error al inicializar el universo:", error);
    const logElement = document.getElementById("exploration-log");
    if (logElement) {
      logElement.innerHTML =
        '<div class="log-entry log-error">Error al inicializar el universo: ' +
        error.message +
        "</div>";
    }
  }
}

// Función para cargar un archivo JSON
function loadJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Añadir funcionalidad para cargar archivo JSON
function setupFileUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // Crear botón para cargar archivo
  const loadBtn = document.createElement("button");
  loadBtn.textContent = "Cargar JSON";
  loadBtn.className = "load-btn";
  loadBtn.onclick = () => fileInput.click();

  // Añadir botón a los controles
  const controls = document.querySelector(".controls");
  if (controls) {
    controls.prepend(loadBtn);
  }

  // Manejar evento de selección de archivo
  fileInput.addEventListener("change", async (event) => {
    if (event.target.files.length > 0) {
      try {
        const file = event.target.files[0];
        const data = await loadJSONFile(file);

        // Actualizar datos del universo
        universeData = data;

        // Reiniciar el universo con los nuevos datos
        if (universe) {
          universe.reset();
        }

        // Inicializar el universo
        initializeUniverse();

        // Mostrar mensaje de éxito
        const log = document.getElementById("exploration-log");
        if (log) {
          log.innerHTML =
            '<div class="log-entry log-success">Archivo JSON cargado correctamente.</div>';
        }
      } catch (error) {
        console.error("Error al cargar el archivo JSON:", error);
        const log = document.getElementById("exploration-log");
        if (log) {
          log.innerHTML =
            '<div class="log-entry log-error">Error al cargar el archivo JSON: ' +
            error.message +
            "</div>";
        }
      }
    }
  });
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadUniverseData();
  setupFileUpload();
});
