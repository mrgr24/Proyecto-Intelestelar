// Importar clases necesarias
import { Universe } from "./universe.js";
import { BacktrackingExplorer } from "./backtracking.js";

// Variables globales
let universeData;
let universe;
let explorer;

// Cargar datos del JSON
async function loadUniverseData(customFilePath = null) {
  try {
    let jsonData;

    if (customFilePath) {
      // Cargar JSON externo
      const response = await fetch(customFilePath);
      if (!response.ok) {
        throw new Error(
          `Error al cargar ${customFilePath}: ${response.statusText}`
        );
      }
      jsonData = await response.json();
    } else {
      try {
        // Intentar cargar JSON interno
        const response = await fetch("ejemplo.json");
        if (!response.ok) {
          throw new Error("No se pudo cargar ejemplo.json");
        }
        jsonData = await response.json();
      } catch (internalError) {
        console.warn(
          "No se pudo cargar el JSON interno, usando valores por defecto:",
          internalError
        );
        // Usar JSON por defecto
        jsonData = getDefaultJsonData();
      }
    }

    // Validar la estructura del JSON
    if (!validateJSONStructure(jsonData)) {
      throw new Error("El archivo JSON no cumple con la estructura requerida");
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
      // Eliminar listeners previos para evitar duplicados
      const newStartBtn = startBtn.cloneNode(true);
      startBtn.parentNode.replaceChild(newStartBtn, startBtn);
      newStartBtn.addEventListener("click", async () => {
        if (explorer.exploring) return;

        newStartBtn.disabled = true;
        // Habilitar modo paso a paso
        explorer.enableStepMode();

        // Iniciar exploración
        const success = await explorer.findPath();

        newStartBtn.disabled = false;
        // Habilitar el botón de paso solo si hay solución
        const stepBtn = document.getElementById("step-btn");
        if (stepBtn) stepBtn.disabled = !success;
      });
    }

    if (resetBtn) {
      const newResetBtn = resetBtn.cloneNode(true);
      resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
      newResetBtn.addEventListener("click", () => {
        universe.reset();
        const stepBtn = document.getElementById("step-btn");
        if (stepBtn) stepBtn.disabled = true;
      });
    }

    if (stepBtn) {
      const newStepBtn = stepBtn.cloneNode(true);
      stepBtn.parentNode.replaceChild(newStepBtn, stepBtn);
      newStepBtn.addEventListener("click", async () => {
        if (!explorer.solution) return;

        const hasMoreSteps = await explorer.takeStep();
        newStepBtn.disabled = !hasMoreSteps;
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
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Validar la estructura del JSON
        if (!validateJSONStructure(data)) {
          throw new Error("El archivo no cumple con la estructura requerida");
        }

        // Si no hay matriz inicial, generarla
        if (!data.matrizInicial || data.matrizInicial.length === 0) {
          data.matrizInicial = [];
          for (let i = 0; i < data.matriz.filas; i++) {
            const row = [];
            for (let j = 0; j < data.matriz.columnas; j++) {
              // Generar valores aleatorios entre 1 y 10
              row.push(Math.floor(Math.random() * 10) + 1);
            }
            data.matrizInicial.push(row);
          }
        }

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

// Validar la estructura del JSON
function validateJSONStructure(data) {
  try {
    // 1. Verificar que existan todos los campos requeridos
    const requiredFields = [
      "matriz",
      "origen",
      "destino",
      "agujerosNegros",
      "estrellasGigantes",
      "portales",
      "agujerosGusano",
      "zonasRecarga",
      "celdasCargaRequerida",
      "cargaInicial",
      "matrizInicial",
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    // 2. Validar matriz
    if (
      !data.matriz.filas ||
      !data.matriz.columnas ||
      typeof data.matriz.filas !== "number" ||
      typeof data.matriz.columnas !== "number"
    ) {
      throw new Error("Dimensiones de matriz inválidas");
    }
    // Quitar temporalmente la validación de mínimo 30x30
    // if (data.matriz.filas < 30 || data.matriz.columnas < 30) {
    //   throw new Error("La matriz debe ser mínimo de 30x30");
    // }

    // 3. Validar coordenadas origen y destino
    if (
      !Array.isArray(data.origen) ||
      data.origen.length !== 2 ||
      !Array.isArray(data.destino) ||
      data.destino.length !== 2
    ) {
      throw new Error("Formato inválido de coordenadas origen/destino");
    }

    // 4. Validar estrellas gigantes (mínimo 5)
    if (
      !Array.isArray(data.estrellasGigantes) ||
      data.estrellasGigantes.length < 5
    ) {
      throw new Error("Se requieren al menos 5 estrellas gigantes");
    }

    // 5. Validar agujeros negros
    if (!Array.isArray(data.agujerosNegros)) {
      throw new Error("Formato inválido de agujeros negros");
    }

    // 6. Validar portales
    if (!Array.isArray(data.portales)) {
      throw new Error("Formato inválido de portales");
    }
    for (const portal of data.portales) {
      if (
        !portal.desde ||
        !portal.hasta ||
        !Array.isArray(portal.desde) ||
        !Array.isArray(portal.hasta)
      ) {
        throw new Error("Formato inválido en la definición de portales");
      }
    }

    // 7. Validar agujeros de gusano
    if (!Array.isArray(data.agujerosGusano)) {
      throw new Error("Formato inválido de agujeros de gusano");
    }
    for (const gusano of data.agujerosGusano) {
      if (
        !gusano.entrada ||
        !gusano.salida ||
        !Array.isArray(gusano.entrada) ||
        !Array.isArray(gusano.salida)
      ) {
        throw new Error(
          "Formato inválido en la definición de agujeros de gusano"
        );
      }
    }

    // 8. Validar zonas de recarga
    if (!Array.isArray(data.zonasRecarga)) {
      throw new Error("Formato inválido de zonas de recarga");
    }
    for (const zona of data.zonasRecarga) {
      if (
        !Array.isArray(zona) ||
        zona.length !== 3 ||
        typeof zona[2] !== "number"
      ) {
        throw new Error(
          "Formato inválido en la definición de zonas de recarga"
        );
      }
    }

    // 9. Validar celdas con carga requerida
    if (!Array.isArray(data.celdasCargaRequerida)) {
      throw new Error("Formato inválido de celdas con carga requerida");
    }
    for (const celda of data.celdasCargaRequerida) {
      if (
        !celda.coordenada ||
        !Array.isArray(celda.coordenada) ||
        typeof celda.cargaGastada !== "number"
      ) {
        throw new Error(
          "Formato inválido en la definición de celdas con carga requerida"
        );
      }
    }

    // 10. Validar carga inicial
    if (typeof data.cargaInicial !== "number" || data.cargaInicial <= 0) {
      throw new Error("Carga inicial inválida");
    }

    // 11. Validar matriz inicial
    if (!Array.isArray(data.matrizInicial)) {
      throw new Error("Formato inválido de matriz inicial");
    }
    if (data.matrizInicial.length > 0) {
      const filas = data.matrizInicial.length;
      const columnas = data.matrizInicial[0].length;
      if (filas !== data.matriz.filas || columnas !== data.matriz.columnas) {
        throw new Error(
          "Dimensiones de matriz inicial no coinciden con las dimensiones especificadas"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error de validación:", error.message);
    return false;
  }
}

// Obtener datos JSON por defecto
function getDefaultJsonData() {
  const defaultData = {
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
      [15, 15],
      [25, 25],
    ],
    estrellasGigantes: [
      [7, 7],
      [14, 14],
      [20, 20],
      [26, 26],
      [32, 32],
    ],
    portales: [
      { desde: [5, 10], hasta: [25, 30] },
      { desde: [12, 3], hasta: [2, 39] },
    ],
    agujerosGusano: [
      { entrada: [11, 11], salida: [13, 13] },
      { entrada: [18, 5], salida: [21, 6] },
    ],
    zonasRecarga: [
      [4, 4, 3],
      [15, 15, 2],
    ],
    celdasCargaRequerida: [
      { coordenada: [9, 9], cargaGastada: 30 },
      { coordenada: [22, 22], cargaGastada: 22 },
    ],
    cargaInicial: 200,
    matrizInicial: [],
  };

  // Generar matriz inicial
  defaultData.matrizInicial = [];
  for (let i = 0; i < defaultData.matriz.filas; i++) {
    const row = [];
    for (let j = 0; j < defaultData.matriz.columnas; j++) {
      row.push(Math.floor(Math.random() * 10) + 1);
    }
    defaultData.matrizInicial.push(row);
  }

  return defaultData;
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  setupFileUpload(); // Solo habilita la carga de archivos, no inicializa universo
});
