export class Universe {
  constructor(data) {
    this.data = data;
    this.grid = document.getElementById("universe-grid");
    this.cells = [];
    this.shipPosition = [...data.origen];
    this.initialEnergy = data.cargaInicial;
    this.currentEnergy = this.initialEnergy;
    this.path = [];

    this.setupGrid();
    this.updateEnergyDisplay();
  }

  setupGrid() {
    const { filas, columnas } = this.data.matriz;

    // Configurar el grid CSS
    this.grid.style.gridTemplateColumns = `repeat(${columnas}, 20px)`;
    this.grid.style.gridTemplateRows = `repeat(${filas}, 20px)`;

    // Crear celdas
    for (let i = 0; i < filas; i++) {
      this.cells[i] = [];
      for (let j = 0; j < columnas; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;

        // Mostrar el costo de energía
        const energyCost = this.data.matrizInicial[i][j];
        cell.textContent = energyCost;

        // Crear tooltip con información
        const cellInfo = document.createElement("div");
        cellInfo.className = "cell-info";
        cellInfo.textContent = `[${i},${j}] - Energía: ${energyCost}`;
        cell.appendChild(cellInfo);

        this.grid.appendChild(cell);
        this.cells[i][j] = cell;
      }
    }

    // Aplicar tipos especiales de celdas
    this.applySpecialCells();
  }

  applySpecialCells() {
    const {
      origen,
      destino,
      agujerosNegros,
      estrellasGigantes,
      agujerosGusano,
      zonasRecarga,
      celdasCargaRequerida,
    } = this.data;

    // Origen
    this.setCellType(origen[0], origen[1], "origin");
    this.cells[origen[0]][origen[1]].textContent = "O";

    // Destino
    this.setCellType(destino[0], destino[1], "destination");
    this.cells[destino[0]][destino[1]].textContent = "D";

    // Agujeros Negros
    if (agujerosNegros && Array.isArray(agujerosNegros)) {
      agujerosNegros.forEach((pos) => {
        this.setCellType(pos[0], pos[1], "black-hole");
        this.cells[pos[0]][pos[1]].textContent = "";
      });
    }

    // Estrellas Gigantes
    if (estrellasGigantes && Array.isArray(estrellasGigantes)) {
      estrellasGigantes.forEach((pos) => {
        this.setCellType(pos[0], pos[1], "giant-star");
        this.cells[pos[0]][pos[1]].textContent = "★";
      });
    }

    // Agujeros de Gusano
    if (agujerosGusano && Array.isArray(agujerosGusano)) {
      agujerosGusano.forEach((wormhole) => {
        const { entrada, salida } = wormhole;
        this.setCellType(entrada[0], entrada[1], "wormhole");
        this.cells[entrada[0]][entrada[1]].textContent = "W";

        // Actualizar tooltip para mostrar la salida
        const cellInfo =
          this.cells[entrada[0]][entrada[1]].querySelector(".cell-info");
        if (cellInfo) {
          cellInfo.textContent += ` → [${salida[0]},${salida[1]}]`;
        }
      });
    }

    // Zonas de Recarga
    if (zonasRecarga && Array.isArray(zonasRecarga)) {
      zonasRecarga.forEach((zone) => {
        this.setCellType(zone[0], zone[1], "recharge");
        this.cells[zone[0]][zone[1]].textContent = `x${zone[2]}`;
      });
    }

    // Celdas con Carga Mínima
    if (celdasCargaRequerida && Array.isArray(celdasCargaRequerida)) {
      celdasCargaRequerida.forEach((cell) => {
        const { coordenada, cargaGastada } = cell;
        this.setCellType(coordenada[0], coordenada[1], "min-charge");
        this.cells[coordenada[0]][coordenada[1]].textContent = cargaGastada;
      });
    }

    // Posición inicial de la nave
    this.updateShipPosition(origen[0], origen[1]);
  }

  setCellType(row, col, type) {
    if (this.isValidCell(row, col)) {
      this.cells[row][col].classList.add(type);

      // Actualizar tooltip
      const cellInfo = this.cells[row][col].querySelector(".cell-info");
      if (cellInfo) {
        cellInfo.textContent += ` - ${this.getTypeName(type)}`;
      }
    }
  }

  getTypeName(type) {
    // Eliminar la entrada 'portal' del diccionario de tipos
    const types = {
      origin: "Origen",
      destination: "Destino",
      "black-hole": "Agujero Negro",
      "giant-star": "Estrella Gigante",
      wormhole: "Agujero de Gusano",
      recharge: "Zona de Recarga",
      "min-charge": "Carga Mínima",
      ship: "Nave",
      path: "Camino",
    };
    return types[type] || type;
  }

  updateShipPosition(row, col) {
    // Quitar la nave de la posición anterior
    if (this.shipPosition) {
      const [prevRow, prevCol] = this.shipPosition;
      this.cells[prevRow][prevCol].classList.remove("ship");

      // Marcar como parte del camino si no es el origen
      if (
        !(prevRow === this.data.origen[0] && prevCol === this.data.origen[1])
      ) {
        this.cells[prevRow][prevCol].classList.add("path");
      }
    }

    // Actualizar posición
    this.shipPosition = [row, col];
    this.cells[row][col].classList.add("ship");

    // Registrar en el camino
    this.path.push([row, col]);
  }

  moveShip(row, col) {
    // Verificar si es un movimiento válido
    if (!this.isValidMove(row, col)) {
      this.logMessage(`Movimiento inválido a [${row},${col}]`, "error");
      return false;
    }

    // Verificar si es una estrella gigante
    if (this.isGiantStar(row, col)) {
      // Verificar si hay un agujero negro adyacente
      const blackHole = this.canDestroyBlackHole(row, col);
      if (blackHole) {
        // Destruir el agujero negro
        this.destroyBlackHole(blackHole[0], blackHole[1]);
      }
    }

    // Calcular costo de energía
    let energyCost = this.data.matrizInicial[row][col];

    // Verificar si es una zona de recarga
    const rechargeZone = this.findRechargeZone(row, col);
    if (rechargeZone) {
      const multiplier = rechargeZone[2];
      this.currentEnergy *= multiplier;
      this.logMessage(
        `¡Recarga de energía! x${multiplier} → ${this.currentEnergy}`,
        "success"
      );
    } else {
      // Verificar si es una celda con carga mínima requerida
      const minChargeCell = this.findMinChargeCell(row, col);
      if (minChargeCell) {
        const requiredCharge = minChargeCell.cargaGastada;
        if (this.currentEnergy < requiredCharge) {
          this.logMessage(
            `Energía insuficiente para entrar a [${row},${col}]. Requiere: ${requiredCharge}`,
            "error"
          );
          return false;
        }
        energyCost = requiredCharge;
      }

      // Restar energía
      this.currentEnergy -= energyCost;
      this.logMessage(
        `Movimiento a [${row},${col}] - Energía: -${energyCost} → ${this.currentEnergy}`,
        "info"
      );
    }

    // Verificar si es un agujero de gusano
    const wormhole = this.findWormhole(row, col);
    if (wormhole) {
      const [exitRow, exitCol] = wormhole.salida;
      this.logMessage(
        `¡Agujero de gusano! [${row},${col}] → [${exitRow},${exitCol}]`,
        "info"
      );

      // Consumir el agujero de gusano
      this.consumeWormhole(row, col);

      // Actualizar posición a la salida del agujero
      row = exitRow;
      col = exitCol;
    }

    // Actualizar posición de la nave
    this.updateShipPosition(row, col);
    this.updateEnergyDisplay();

    // Verificar si llegó al destino
    if (row === this.data.destino[0] && col === this.data.destino[1]) {
      this.logMessage("¡Destino alcanzado! Exploración completada.", "success");
      return "destination";
    }

    // Verificar si se quedó sin energía
    if (this.currentEnergy <= 0) {
      this.logMessage("¡Sin energía! La nave no puede continuar.", "error");
      return "no-energy";
    }

    return true;
  }

  isValidCell(row, col) {
    const { filas, columnas } = this.data.matriz;
    return row >= 0 && row < filas && col >= 0 && col < columnas;
  }

  isValidMove(row, col) {
    // Verificar si está dentro de los límites
    if (!this.isValidCell(row, col)) {
      return false;
    }

    // Verificar si es un agujero negro
    if (this.isBlackHole(row, col)) {
      return false;
    }

    // Verificar si ya está en el camino (evitar ciclos)
    if (this.path.some((pos) => pos[0] === row && pos[1] === col)) {
      return false;
    }

    return true;
  }

  // Modificar el método isBlackHole para verificar en tiempo real
  isBlackHole(row, col) {
    // Verificar si la celda está en la lista de agujeros negros
    return (
      this.data.agujerosNegros &&
      this.data.agujerosNegros.some((pos) => pos[0] === row && pos[1] === col)
    );
  }

  // Añadir método para verificar si una estrella gigante puede destruir un agujero negro adyacente
  canDestroyBlackHole(starRow, starCol) {
    // Verificar las celdas adyacentes (arriba, derecha, abajo, izquierda)
    const adjacentCells = [
      [starRow - 1, starCol], // arriba
      [starRow, starCol + 1], // derecha
      [starRow + 1, starCol], // abajo
      [starRow, starCol - 1], // izquierda
    ];

    // Buscar agujeros negros adyacentes
    const adjacentBlackHoles = adjacentCells.filter(
      ([row, col]) => this.isValidCell(row, col) && this.isBlackHole(row, col)
    );

    return adjacentBlackHoles.length > 0 ? adjacentBlackHoles[0] : null;
  }

  // Añadir método para destruir un agujero negro
  destroyBlackHole(row, col) {
    // Encontrar el índice del agujero negro en el array
    const index = this.data.agujerosNegros.findIndex(
      (pos) => pos[0] === row && pos[1] === col
    );

    if (index !== -1) {
      // Eliminar el agujero negro del array
      this.data.agujerosNegros.splice(index, 1);

      // Actualizar la visualización
      this.cells[row][col].classList.remove("black-hole");
      this.cells[row][col].textContent = this.data.matrizInicial[row][col];

      this.logMessage(
        `Agujero negro en [${row},${col}] destruido por una estrella gigante.`,
        "success"
      );
      return true;
    }

    return false;
  }

  // Añadir método para consumir un agujero de gusano
  consumeWormhole(row, col) {
    // Encontrar el índice del agujero de gusano en el array
    const index = this.data.agujerosGusano.findIndex(
      (wormhole) => wormhole.entrada[0] === row && wormhole.entrada[1] === col
    );

    if (index !== -1) {
      // Guardar la información del agujero de gusano antes de eliminarlo
      const wormhole = this.data.agujerosGusano[index];

      // Eliminar el agujero de gusano del array
      this.data.agujerosGusano.splice(index, 1);

      // Actualizar la visualización
      this.cells[row][col].classList.remove("wormhole");
      this.cells[row][col].textContent = this.data.matrizInicial[row][col];

      this.logMessage(
        `Agujero de gusano en [${row},${col}] consumido.`,
        "info"
      );

      return wormhole.salida;
    }

    return null;
  }

  // Añadir método para verificar si una celda es una estrella gigante
  isGiantStar(row, col) {
    return (
      this.data.estrellasGigantes &&
      this.data.estrellasGigantes.some(
        (pos) => pos[0] === row && pos[1] === col
      )
    );
  }

  findRechargeZone(row, col) {
    return (
      this.data.zonasRecarga &&
      this.data.zonasRecarga.find((zone) => zone[0] === row && zone[1] === col)
    );
  }

  findMinChargeCell(row, col) {
    return (
      this.data.celdasCargaRequerida &&
      this.data.celdasCargaRequerida.find(
        (cell) => cell.coordenada[0] === row && cell.coordenada[1] === col
      )
    );
  }

  findWormhole(row, col) {
    return (
      this.data.agujerosGusano &&
      this.data.agujerosGusano.find(
        (wormhole) => wormhole.entrada[0] === row && wormhole.entrada[1] === col
      )
    );
  }

  updateEnergyDisplay() {
    const energyElement = document.getElementById("energy-value");
    if (energyElement) {
      energyElement.textContent = this.currentEnergy.toFixed(0);
    }
  }

  logMessage(message, type = "info") {
    const log = document.getElementById("exploration-log");
    if (log) {
      const entry = document.createElement("div");
      entry.className = `log-entry log-${type}`;
      entry.textContent = message;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
    }
  }

  reset() {
    // Limpiar el camino
    this.path.forEach(([row, col]) => {
      if (this.cells[row] && this.cells[row][col]) {
        this.cells[row][col].classList.remove("path", "ship");
      }
    });

    // Restablecer valores
    this.path = [];
    this.currentEnergy = this.initialEnergy;
    this.updateEnergyDisplay();

    // Colocar la nave en el origen
    this.updateShipPosition(this.data.origen[0], this.data.origen[1]);

    // Limpiar el registro
    const log = document.getElementById("exploration-log");
    if (log) {
      log.innerHTML = "";
      this.logMessage("Sistema reiniciado.", "info");
    }
  }
}
