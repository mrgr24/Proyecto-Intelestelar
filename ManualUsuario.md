# 🌌 Exploración Galáctica - Manual de Usuario 🚀

## 📋 Índice
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características Principales](#características-principales)
- [Instalación y Configuración](#instalación-y-configuración)
- [Guía de Uso](#guía-de-uso)
- [Elementos del Universo](#elementos-del-universo)
- [Controles](#controles)
- [Estadísticas](#estadísticas)
- [Estructura de Archivos](#estructura-de-archivos)
- [Autores](#autores)

## 🎯 Descripción del Proyecto

**Exploración Galáctica** es una aplicación web interactiva que simula la exploración del espacio utilizando el algoritmo de **backtracking**. El objetivo es encontrar una ruta desde un punto de origen hasta un destino en un universo lleno de obstáculos y elementos especiales.

Esta aplicación fue desarrollada como proyecto académico para la materia de AutoTécnicas en la Universidad de Caldas, demostrando la implementación práctica del algoritmo de backtracking en un entorno visual y educativo.

## ✨ Características Principales

- 🎮 **Interfaz Interactiva**: Visualización en tiempo real del proceso de exploración
- 🔄 **Algoritmo Backtracking**: Implementación completa del algoritmo de retroceso
- 📊 **Estadísticas Detalladas**: Seguimiento de métricas en tiempo real
- 🎨 **Diseño Espacial**: Interfaz temática del espacio con elementos visuales atractivos
- 🌌 **Universo Configurable**: Posibilidad de cargar diferentes configuraciones de universo
- 👣 **Modo Paso a Paso**: Visualización detallada del proceso de exploración

## 🚀 Instalación y Configuración

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (recomendado para evitar problemas de CORS)

### Instalación
1. **Descargar el proyecto**
   ```bash
   git clone [URL-del-repositorio]
   cd Proyecto-Intelestelar
   ```

2. **Ejecutar con servidor local**
   - **Opción 1 - Python:**
     ```bash
     python -m http.server 8000
     ```
   - **Opción 2 - Node.js:**
     ```bash
     npx http-server
     ```
   - **Opción 3 - Live Server (VS Code):**
     Instalar extensión "Live Server" y hacer clic derecho en `index.html`

3. **Abrir en navegador**
   ```
   http://localhost:8000
   ```

## 🎮 Guía de Uso

### Inicio Rápido
1. **Abrir la aplicación** en tu navegador
2. **Observar el universo** generado automáticamente
3. **Hacer clic en "🚀 Iniciar Exploración"** para comenzar
4. **Observar el proceso** de backtracking en tiempo real

### Modos de Exploración

#### Modo Automático
- Ejecuta el algoritmo completo de forma automática
- Muestra la visualización en tiempo real
- Ideal para observar el comportamiento general

#### Modo Paso a Paso
- Después de iniciar, usar el botón "👣 Siguiente Paso"
- Permite observar cada decisión del algoritmo
- Perfecto para fines educativos y análisis detallado

## 🌟 Elementos del Universo

| Elemento | Símbolo | Descripción |
|----------|---------|-------------|
| **Origen** | 🚀 | Punto de partida de la exploración |
| **Destino** | 🎯 | Meta a alcanzar |
| **Agujero Negro** | 🕳️ | Obstáculo que consume energía o bloquea el paso |
| **Estrella Gigante** | ⭐ | Puede destruir agujeros negros cercanos |
| **Agujero de Gusano** | 🌀 | Teletransporta a otra ubicación (uso único) |
| **Zona de Recarga** | 🔋 | Multiplica la energía disponible |
| **Carga Mínima** | ⚠️ | Indica el nivel mínimo de energía requerido |
| **Camino Recorrido** | 🟢 | Ruta que ha seguido el explorador |
| **Explorando** | 🟡 | Celda actualmente siendo evaluada |

## 🎯 Controles

### Botones Principales
- **🚀 Iniciar Exploración**: Comienza el proceso de backtracking
- **🔄 Reiniciar**: Resetea el universo y las estadísticas
- **👣 Siguiente Paso**: Avanza un paso en modo manual (disponible después de iniciar)

### Indicadores
- **Energía**: Muestra la energía actual disponible
- **Tiempo**: Cronómetro de la exploración actual

## 📊 Estadísticas

La aplicación rastrea las siguientes métricas en tiempo real:

### Métricas de Exploración
- **🔍 Celdas Exploradas**: Número total de celdas visitadas
- **🔄 Retrocesos**: Cantidad de veces que el algoritmo retrocedió
- **👣 Pasos Totales**: Número total de movimientos realizados

### Métricas de Interacción
- **💥 Agujeros Negros Destruidos**: Cantidad eliminada por estrellas
- **🌀 Agujeros de Gusano Usados**: Teletransportes realizados
- **🌈 Portales Usados**: Portales utilizados para transporte
- **🔋 Recargas de Energía**: Veces que se multiplicó la energía

### Métricas de Rendimiento
- **⚡ Energía Consumida**: Total de energía gastada
- **⏱️ Tiempo de Exploración**: Duración de la búsqueda

## 🗂️ Estructura de Archivos

```
Proyecto-Intelestelar/
├── index.html              # Interfaz principal
├── style.css               # Estilos visuales
├── app.js                  # Lógica principal de la aplicación
├── universe.js             # Clase para manejar el universo
├── backtracking.js         # Implementación del algoritmo
├── ejemplo.json            # Configuración del universo
├── README.md               # Este manual
└── Logo_de_la_Universidad_de_Caldas.svg.png
```

### Archivos Principales

#### `app.js`
- Inicialización de la aplicación
- Manejo de eventos de usuario
- Coordinación entre componentes

#### `universe.js`
- Representación visual del universo
- Manejo de elementos espaciales
- Actualización de la interfaz

#### `backtracking.js`
- Implementación del algoritmo de backtracking
- Lógica de exploración y retroceso
- Cálculo de estadísticas

#### `ejemplo.json`
- Configuración del universo
- Posiciones de elementos
- Parámetros de energía

## 🎓 Aspectos Educativos

### Concepto de Backtracking
El algoritmo de backtracking es una técnica de programación que:
- Explora sistemáticamente todas las posibilidades
- Retrocede cuando encuentra un callejón sin salida
- Mantiene un registro de las decisiones tomadas
- Optimiza la búsqueda evitando repetir caminos

### Visualización del Proceso
La aplicación muestra:
- **Exploración en tiempo real**: Cada celda visitada se marca visualmente
- **Retroceso**: Cuando el algoritmo retrocede, se puede observar el cambio
- **Toma de decisiones**: Las diferentes opciones disponibles en cada paso
- **Optimización**: Cómo el algoritmo evita repetir caminos inútiles

## 🛠️ Personalización

### Modificar el Universo
Para crear tu propio universo, edita el archivo `ejemplo.json`:

```json
{
  "matriz": {
    "filas": 20,
    "columnas": 20
  },
  "origen": [0, 0],
  "destino": [19, 19],
  "agujerosNegros": [[5, 5], [10, 10]],
  "estrellasGigantes": [[7, 7]],
  "portales": [
    { "desde": [3, 3], "hasta": [15, 15] }
  ],
  "agujerosGusano": [
    {
      "entrada": [6, 6],
      "salida": [8, 8]
    }
  ],
  "zonasRecarga": [[12, 12]],
  "cargaInicial": 100,
  "cargaMinima": 10
}
```

## 🔧 Solución de Problemas

### Problemas Comunes

1. **La aplicación no carga**
   - Verificar que se está ejecutando con un servidor local
   - Comprobar que todos los archivos están presentes

2. **El universo no se muestra**
   - Revisar la consola del navegador para errores
   - Verificar que el archivo `ejemplo.json` es válido

3. **La exploración no inicia**
   - Asegurar que hay una ruta posible desde origen a destino
   - Verificar que la energía inicial es suficiente

### Modo Depuración
- Abrir las herramientas de desarrollador (F12)
- Revisar la consola para mensajes de error
- Verificar la pestaña "Network" para problemas de carga

## 👥 Autores

**Proyecto desarrollado por:**
- **Mariana García** - Desarrollo y diseño
- **Alejandro Preciado** - Algoritmos y lógica

**Institución:**
- Universidad de Caldas
- Materia: AutoTécnicas
- Año: 2025

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para la Universidad de Caldas.

---

*¡Disfruta explorando el universo con backtracking! 🌌✨*

https://prod.liveshare.vsengsaas.visualstudio.com/join?0BEE0FE28C233F6CABEEA02E0DCDAEE72C06