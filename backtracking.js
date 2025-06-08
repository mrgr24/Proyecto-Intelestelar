export class BacktrackingExplorer {
  constructor(universe) {
    this.universe = universe;
    this.solution = null;
    this.exploring = false;
    this.stepMode = false;
    this.stepIndex = 0;
    this.steps = [];

    // Estadísticas
    this.stats = {
      totalSteps: 0,
      destroyedBlackHoles: 0,
      usedWormholes: 0,
      energyRecharges: 0,
      energyConsumed: 0,
      explorationTime: 0,
    };
  }

  async findPath() {
    this.exploring = true;
    this.solution = null;
    this.universe.reset();

    // Reiniciar estadísticas
    this.stats = {
      totalSteps: 0,
      destroyedBlackHoles: 0,
      usedWormholes: 0,
      energyRecharges: 0,
      energyConsumed: 0,
      explorationTime: 0,
    };

    const startTime = performance.now();
    this.universe.logMessage(
      "Iniciando exploración con backtracking...",
      "info"
    );

    // Iniciar backtracking desde el origen
    const [startRow, startCol] = this.universe.data.origen;
    const result = await this.backtrack(
      startRow,
      startCol,
      this.universe.initialEnergy,
      []
    );

    const endTime = performance.now();
    this.stats.explorationTime = ((endTime - startTime) / 1000).toFixed(2);

    if (result) {
      this.universe.logMessage(
        `¡Solución encontrada en ${this.stats.explorationTime} segundos!`,
        "success"
      );
      this.solution = result;
      // Log adicional para indicar que se encontró al menos una ruta
      this.universe.logMessage(
        `Se encontró al menos una ruta válida desde el origen al destino.`,
        "info"
      );

      // Actualizar estadísticas
      this.stats.totalSteps = this.solution.length - 1; // Restar 1 porque el origen no cuenta como paso

      if (!this.stepMode) {
        // Visualizar la solución
        await this.visualizeSolution();
      } else {
        // Preparar los pasos para la visualización paso a paso
        this.prepareSteps();
      }

      // Actualizar panel de estadísticas
      this.updateStatsPanel();
    } else {
      this.universe.logMessage(
        `No se encontró ninguna ruta después de ${this.stats.explorationTime} segundos.`,
        "error"
      );
      // Log adicional para indicar que no hay rutas
      this.universe.logMessage(
        `No existe ninguna ruta válida desde el origen al destino con las restricciones actuales.`,
        "error"
      );
    }

    this.exploring = false;
    return result !== null;
  }

  async backtrack(
    row,
    col,
    energy,
    path,
    destroyedBlackHoles = [],
    usedWormholes = []
  ) {
    // LOG para saber que se está ejecutando el backtracking
    console.log(
      `[BACKTRACK] Posición: [${row},${col}], Energía: ${energy}, Camino:`,
      path
    );

    // Si estamos en modo paso a paso, pausar aquí
    if (this.stepMode) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Verificar si hemos llegado al destino
    const [destRow, destCol] = this.universe.data.destino;
    if (row === destRow && col === destCol) {
      return [...path, [row, col]];
    }

    // Verificar si nos quedamos sin energía
    if (energy <= 0) {
      return null;
    }

    // Marcar la posición actual como visitada
    const currentPath = [...path, [row, col]];

    // Verificar si es una estrella gigante
    const localDestroyedBlackHoles = [...destroyedBlackHoles];
    if (this.universe.isGiantStar(row, col)) {
      const blackHole = this.universe.canDestroyBlackHole(row, col);
      if (
        blackHole &&
        !destroyedBlackHoles.some(
          (bh) => bh[0] === blackHole[0] && bh[1] === blackHole[1]
        )
      ) {
        localDestroyedBlackHoles.push(blackHole);
      }
    }

    // Obtener posibles movimientos (arriba, derecha, abajo, izquierda)
    const moves = [
      [row - 1, col], // arriba
      [row, col + 1], // derecha
      [row + 1, col], // abajo
      [row, col - 1], // izquierda
    ];

    // Intentar cada movimiento
    for (const [nextRow, nextCol] of moves) {
      // LOG para saber qué movimientos se están probando
      console.log(
        `[BACKTRACK] Intentando mover a: [${nextRow},${nextCol}] desde [${row},${col}]`
      );
      // Verificar si el movimiento es válido
      if (!this.universe.isValidCell(nextRow, nextCol)) continue;

      // Verificar si es un agujero negro y no ha sido destruido
      if (
        this.universe.isBlackHole(nextRow, nextCol) &&
        !localDestroyedBlackHoles.some(
          (bh) => bh[0] === nextRow && bh[1] === nextCol
        )
      ) {
        continue;
      }

      // Verificar si ya está en el camino (evitar ciclos)
      if (currentPath.some((pos) => pos[0] === nextRow && pos[1] === nextCol))
        continue;

      // Calcular energía después del movimiento
      let newEnergy = energy;

      // Verificar si es una zona de recarga
      const rechargeZone = this.universe.findRechargeZone(nextRow, nextCol);
      if (rechargeZone) {
        newEnergy *= rechargeZone[2];
      } else {
        // Verificar si es una celda con carga mínima requerida
        const minChargeCell = this.universe.findMinChargeCell(nextRow, nextCol);
        if (minChargeCell) {
          if (newEnergy < minChargeCell.cargaGastada) continue;
          newEnergy -= minChargeCell.cargaGastada;
        } else {
          // Restar el costo de energía normal
          newEnergy -= this.universe.data.matrizInicial[nextRow][nextCol];
        }
      }

      // Verificar si es un agujero de gusano
      const wormhole = this.universe.findWormhole(nextRow, nextCol);
      let nextPosition = null;
      let localUsedWormholes = [...usedWormholes];
      if (
        wormhole &&
        !usedWormholes.some((w) => w[0] === nextRow && w[1] === nextCol)
      ) {
        nextPosition = wormhole.salida;
        localUsedWormholes.push([nextRow, nextCol]);
      }

      // Realizar el movimiento recursivamente SOLO si hay energía suficiente
      let result;
      if (newEnergy > 0) {
        if (nextPosition) {
          // Si es un agujero de gusano, continuar desde la salida
          if (
            !currentPath.some(
              (pos) => pos[0] === nextPosition[0] && pos[1] === nextPosition[1]
            )
          ) {
            result = await this.backtrack(
              nextPosition[0],
              nextPosition[1],
              newEnergy,
              [...currentPath, [nextRow, nextCol]],
              localDestroyedBlackHoles,
              localUsedWormholes
            );
          }
        } else {
          result = await this.backtrack(
            nextRow,
            nextCol,
            newEnergy,
            currentPath,
            localDestroyedBlackHoles,
            localUsedWormholes
          );
        }
      } else {
        // LOG para saber que no se avanza por falta de energía
        console.log(
          `[BACKTRACK] No se avanza a [${nextRow},${nextCol}] desde [${row},${col}] por energía insuficiente (${newEnergy})`
        );
      }

      if (result) {
        return result;
      }
    }

    // No se encontró solución desde esta posición
    return null;
  }

  async visualizeSolution() {
    if (!this.solution) return;

    this.universe.reset();
    this.universe.logMessage("Visualizando solución...", "info");

    // Recorrer el camino de la solución
    for (let i = 0; i < this.solution.length; i++) {
      const [row, col] = this.solution[i];

      // Mover la nave a esta posición
      if (i > 0) {
        // Saltar el origen que ya está colocado
        const result = this.universe.moveShip(row, col);
        if (result === "no-energy") {
          this.universe.logMessage(
            "Error en la solución: sin energía.",
            "error"
          );
          break;
        }
      }

      // Pausa para visualización
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    this.universe.logMessage(
      "Visualización de solución completada.",
      "success"
    );
  }

  prepareSteps() {
    if (!this.solution) return;

    this.steps = [];
    let currentEnergy = this.universe.initialEnergy;

    // Preparar cada paso de la solución
    for (let i = 1; i < this.solution.length; i++) {
      // Empezar desde 1 para saltar el origen
      const [row, col] = this.solution[i];

      // Calcular cambio de energía
      let energyChange = 0;
      let specialAction = null;

      // Verificar si es una zona de recarga
      const rechargeZone = this.universe.findRechargeZone(row, col);
      if (rechargeZone) {
        const oldEnergy = currentEnergy;
        currentEnergy *= rechargeZone[2];
        energyChange = currentEnergy - oldEnergy;
        specialAction = `Recarga x${rechargeZone[2]}`;
      } else {
        // Verificar si es una celda con carga mínima requerida
        const minChargeCell = this.universe.findMinChargeCell(row, col);
        if (minChargeCell) {
          energyChange = -minChargeCell.cargaGastada;
          specialAction = `Carga mínima: ${minChargeCell.cargaGastada}`;
        } else {
          // Costo normal de energía
          energyChange = -this.universe.data.matrizInicial[row][col];
        }
        currentEnergy += energyChange;
      }

      // Verificar si es un agujero de gusano
      const wormhole = this.universe.findWormhole(row, col);
      if (wormhole) {
        specialAction = `Agujero de gusano → [${wormhole.salida[0]},${wormhole.salida[1]}]`;
      }

      // Agregar paso
      this.steps.push({
        position: [row, col],
        energy: currentEnergy,
        energyChange,
        specialAction,
      });
    }

    this.stepIndex = 0;
  }

  async takeStep() {
    if (!this.solution || this.stepIndex >= this.steps.length) return false;

    const step = this.steps[this.stepIndex];
    const [row, col] = step.position;

    // Mover la nave a esta posición
    const result = this.universe.moveShip(row, col);

    // Actualizar estadísticas
    if (step.specialAction) {
      if (step.specialAction.includes("Recarga")) {
        this.stats.energyRecharges++;
      } else if (step.specialAction.includes("Agujero de gusano")) {
        this.stats.usedWormholes++;
      } else if (step.specialAction.includes("Agujero negro")) {
        this.stats.destroyedBlackHoles++;
      }
    }

    if (step.energyChange < 0) {
      this.stats.energyConsumed += Math.abs(step.energyChange);
    }

    // Actualizar panel de estadísticas
    this.updateStatsPanel();

    this.stepIndex++;
    return this.stepIndex < this.steps.length;
  }

  enableStepMode() {
    this.stepMode = true;
  }

  disableStepMode() {
    this.stepMode = false;
  }

  // Añadir método para actualizar el panel de estadísticas
  updateStatsPanel() {
    const elements = {
      "total-steps": this.stats.totalSteps,
      "destroyed-blackholes": this.stats.destroyedBlackHoles,
      "used-wormholes": this.stats.usedWormholes,
      "energy-recharges": this.stats.energyRecharges,
      "energy-consumed": this.stats.energyConsumed.toFixed(0),
      "exploration-time": `${this.stats.explorationTime}s`,
    };

    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }
  }
}
