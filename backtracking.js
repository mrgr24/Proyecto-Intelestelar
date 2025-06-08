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
    this.visitedMap = new Map();
    this.stepCounter = 0;

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

      this.universe.logMessage(
        `Pasos totales intentados: ${this.stepCounter}`,
        "info"
      );
    }

    this.exploring = false;
    return result !== null;
  }

  async backtrack(
    row,
    col,
    energy,
    path = [],
    destroyedBlackHoles = [],
    usedWormholes = []
  ) {
    const key = `${row},${col}`;
    if (!this.visitedMap) this.visitedMap = new Map();
    if (this.visitedMap.has(key) && this.visitedMap.get(key) >= energy)
      return null;
    this.visitedMap.set(key, energy);

    if (!this.stepCounter) this.stepCounter = 0;
    this.stepCounter++;
    if (this.stepCounter > 1000000) return null;

    const [destRow, destCol] = this.universe.data.destino;
    if (row === destRow && col === destCol) {
      return [...path, [row, col]];
    }

    if (energy <= 0) return null;

    path.push([row, col]);

    console.log(`[ENTER] (${row},${col}) - Energía: ${energy}`);

    let destroyedThisStep = null;
    if (this.universe.isGiantStar(row, col)) {
      const bh = this.universe.canDestroyBlackHole(row, col);
      if (
        bh &&
        !destroyedBlackHoles.some(([r, c]) => r === bh[0] && c === bh[1])
      ) {
        destroyedBlackHoles.push(bh);
        destroyedThisStep = bh;
      }
    }

    let moves = [
      [row - 1, col],
      [row, col + 1],
      [row + 1, col],
      [row, col - 1],
    ];

    moves.sort((a, b) => {
      const dA = Math.abs(a[0] - destRow) + Math.abs(a[1] - destCol);
      const dB = Math.abs(b[0] - destRow) + Math.abs(b[1] - destCol);
      return dA - dB;
    });

    for (const [nextRow, nextCol] of moves) {
      if (!this.universe.isValidCell(nextRow, nextCol)) continue;
      if (
        this.universe.isBlackHole(nextRow, nextCol) &&
        !destroyedBlackHoles.some(([r, c]) => r === nextRow && c === nextCol)
      ) {
        continue;
      }
      if (path.some(([r, c]) => r === nextRow && c === nextCol)) continue;

      let newEnergy = energy;
      const recharge = this.universe.findRechargeZone(nextRow, nextCol);
      if (recharge) {
        newEnergy *= recharge[2];
      } else {
        const minReq = this.universe.findMinChargeCell(nextRow, nextCol);
        if (minReq) {
          if (newEnergy < minReq.cargaGastada) continue;
          newEnergy -= minReq.cargaGastada;
        } else {
          newEnergy -= this.universe.data.matrizInicial[nextRow][nextCol];
        }
      }

      let wormhole = this.universe.findWormhole(nextRow, nextCol);
      let nextPos = null;
      let usedNow = false;
      if (
        wormhole &&
        !usedWormholes.some(([r, c]) => r === nextRow && c === nextCol)
      ) {
        nextPos = wormhole.salida;
        usedWormholes.push([nextRow, nextCol]);
        usedNow = true;
      }

      if (newEnergy <= 0) continue;

      let result = null;
      if (nextPos) {
        if (!path.some(([r, c]) => r === nextPos[0] && c === nextPos[1])) {
          path.push([nextRow, nextCol]);
          result = await this.backtrack(
            nextPos[0],
            nextPos[1],
            newEnergy,
            path,
            destroyedBlackHoles,
            usedWormholes
          );
          path.pop();
        }
      } else {
        result = await this.backtrack(
          nextRow,
          nextCol,
          newEnergy,
          path,
          destroyedBlackHoles,
          usedWormholes
        );
      }

      if (result) return result;
      if (usedNow) usedWormholes.pop();
    }

    if (destroyedThisStep) destroyedBlackHoles.pop();
    path.pop();
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
