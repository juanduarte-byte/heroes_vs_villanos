## ⚡ Barras de Poder y Defensa

Cada personaje en batalla tiene dos barras:

- **Barra de Poder (`powerBar`)**: Se llena al recibir daño. Cuando llega a 100, el personaje puede activar un superataque (el siguiente golpe que use hace el doble de daño y la barra vuelve a 0).
- **Barra de Defensa (`defenseBar`)**: Se llena al recibir daño. Cuando llega a 100, el personaje puede activar una super defensa (el siguiente golpe recibido le hace la mitad de daño y la barra vuelve a 0).

Estas barras se exponen en los endpoints de estado de batalla y de información detallada, por ejemplo:

```json
{
  "id": "BATALLA_ID",
  "estado": "en_curso",
  "ronda": 2,
  "turno": "heroes",
  "personajeActual": {
    "id": 1,
    "idUnico": "H1",
    "alias": "Superman",
    "equipo": "heroes",
    "powerBar": 80,
    "defenseBar": 60
  },
  "equipoHeroes": {
    "nombre": "Equipo de Héroes",
    "personajes": [
      {
        "id": 1,
        "alias": "Superman",
        "vida": 120,
        "powerBar": 80,
        "defenseBar": 60,
        // ...
      },
      // ...
    ]
  },
  // ...
}
```

**Notas:**
- Las barras suben automáticamente al recibir daño.
- El usuario puede decidir cuándo activar el superataque o la super defensa si la barra está llena.
- El historial de la batalla también registra el estado de las barras tras cada ataque.
# API de Superhéroes - Sistema de Batallas por Equipos

API para gestionar batallas entre equipos de héroes y villanos con sistema de turnos por rondas y selección de personajes iniciales.

## 🚀 Características

- **Sistema de Batallas por Equipos**: 3 héroes vs 3 villanos
- **Sistema de Turnos**: Turnos alternados entre equipos
- **Selección de Personajes Iniciales**: El usuario puede elegir qué héroe y villano empiezan la batalla
- **Tipos de Ataque**: Básico (5), Especial (30) y Crítico (45) puntos de daño
- **Vida de Personajes**: 200 puntos de vida por personaje
- **IDs Únicos**: Sistema para evitar conflictos entre héroes y villanos
- **Persistencia**: Guardado automático de batallas finalizadas
- **Historial**: Consulta de batallas anteriores y estadísticas

## 🔧 Instalación

```bash
npm install
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 📚 Documentación API


La documentación completa está disponible en Swagger UI:
`http://localhost:3001/api-docs`

## ⚡ Activar Superataque y Superdefensa

Cuando la barra correspondiente de un personaje llega a 100, puedes activar su superataque o superdefensa usando los siguientes endpoints:

### Activar Superataque

```bash
POST /api/batallas/{batallaId}/activar-superataque
{
  "personajeId": "H1"  // ID único del personaje
}
```

### Activar Superdefensa

```bash
POST /api/batallas/{batallaId}/activar-superdefensa
{
  "personajeId": "H1"  // ID único del personaje
}
```

**Notas:**
- Solo puedes activar el superataque si la barra de poder (`powerBar`) está llena (100).
- Solo puedes activar la superdefensa si la barra de defensa (`defenseBar`) está llena (100).
- Una vez activado, el siguiente ataque (o defensa) del personaje será especial y la barra correspondiente volverá a 0.

Puedes consultar el estado de las barras y si hay un superataque/superdefensa pendiente en los endpoints `/info` y `/estado`.

## 🎯 Sistema de IDs Únicos

**IMPORTANTE**: Para evitar conflictos entre héroes y villanos que tienen el mismo ID numérico, el sistema asigna IDs únicos automáticamente:

- **Héroes**: H1, H2, H3, H4, etc.
- **Villanos**: V1, V2, V3, V4, etc.

### Ejemplo de IDs únicos:
- Héroe con ID 1 → ID único: "H1"
- Villano con ID 1 → ID único: "V1"
- Héroe con ID 2 → ID único: "H2"
- Villano con ID 2 → ID único: "V2"

## 🎮 Uso de la API

### 1. Crear una Batalla

```bash
POST /api/batallas/crear
{
  "equipoHeroes": [1, 2, 3],
  "equipoVillanos": [1, 2, 3],
  "iniciador": "heroes",
  "primerHeroe": 1,
  "primerVillano": 2
}
```

**Parámetros opcionales:**
- `primerHeroe`: ID del héroe que iniciará la batalla (debe estar en equipoHeroes)
- `primerVillano`: ID del villano que iniciará la batalla (debe estar en equipoVillanos)

### 2. Obtener Información de la Batalla

```bash
GET /api/batallas/{batallaId}/info
```

Este endpoint es **CRUCIAL** porque muestra:
- Los IDs únicos de cada personaje
- Qué personajes pueden atacar en el turno actual
- Qué personajes pueden ser atacados
- Estado de vida de cada personaje

### 3. Iniciar la Batalla

```bash
POST /api/batallas/{batallaId}/iniciar
```

### 4. Realizar Ataques

```bash
POST /api/batallas/{batallaId}/atacar
{
  "atacanteId": "H1",    // ID único del atacante
  "objetivoId": "V2",    // ID único del objetivo
  "tipoAtaque": "basico" // "basico", "especial", "critico"
}
```

## 🔍 Flujo Recomendado

1. **Crear batalla** con equipos de héroes y villanos (opcionalmente especificar personajes iniciales)
2. **Obtener información** (`/info`) para ver los IDs únicos
3. **Iniciar batalla**
4. **Realizar ataques** usando los IDs únicos mostrados en `/info`
5. **Repetir pasos 2-4** hasta que termine la batalla

## 📊 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/batallas/crear` | Crear nueva batalla |
| GET | `/api/batallas/{id}/info` | **INFO DETALLADA** (IDs únicos) |
| POST | `/api/batallas/{id}/iniciar` | Iniciar batalla |
| POST | `/api/batallas/{id}/atacar` | Realizar ataque |
| GET | `/api/batallas/{id}/estado` | Estado de batalla |
| GET | `/api/batallas/activas` | Batallas en curso |
| GET | `/api/batallas/historial` | Historial de batallas |
| GET | `/api/batallas/estadisticas` | Estadísticas |
| POST | `/api/batallas/simular` | Simular batalla completa |
| POST | `/api/batallas/probar` | Probar sistema |

## 🎲 Tipos de Ataque

- **Básico**: 5 puntos de daño, alta precisión
- **Especial**: 30 puntos de daño, precisión media
- **Crítico**: 45 puntos de daño, baja precisión

## ⚠️ Errores Comunes

### Error: "Atacante con ID X no encontrado"
**Solución**: Usa el endpoint `/info` para ver los IDs únicos válidos. Los IDs numéricos pueden confundirse entre héroes y villanos.

### Error: "No es el turno del atacante"
**Solución**: Verifica que estés atacando con un personaje del equipo que tiene el turno actual.

### Error: "Solo puedes atacar a personajes del equipo contrario"
**Solución**: Asegúrate de que el atacante y objetivo sean de equipos diferentes.

### Error: "El héroe inicial X no está en el equipo seleccionado"
**Solución**: Asegúrate de que el `primerHeroe` esté incluido en `equipoHeroes`.

## 🔧 Ejemplo Completo

```bash
# 1. Crear batalla con personajes iniciales
curl -X POST http://localhost:3001/api/batallas/crear \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1,2,3], 
    "equipoVillanos": [1,2,3],
    "iniciador": "heroes",
    "primerHeroe": 1,
    "primerVillano": 2
  }'

# 2. Obtener información (IMPORTANTE)
curl http://localhost:3001/api/batallas/BATALLA_ID/info

# 3. Iniciar batalla
curl -X POST http://localhost:3001/api/batallas/BATALLA_ID/iniciar

# 4. Atacar usando IDs únicos
curl -X POST http://localhost:3001/api/batallas/BATALLA_ID/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "H1", 
    "objetivoId": "V2", 
    "tipoAtaque": "basico"
  }'
```

## 📈 Características del Sistema

- **Turnos Alternados**: Los equipos atacan por turnos
- **Selección de Inicio**: Puedes elegir qué personaje de cada equipo inicia
- **Validación de Equipos**: Solo puedes atacar al equipo contrario
- **Sistema de Vida**: 200 puntos por personaje
- **Eliminación**: Personajes eliminados no pueden atacar
- **Finalización**: Batalla termina cuando un equipo es eliminado o se completan 3 rondas
- **Persistencia**: Las batallas finalizadas se guardan automáticamente

## 🛠️ Desarrollo

### Estructura del Proyecto

```
api-superheroes/
├── controllers/     # Controladores de la API
├── services/        # Lógica de negocio
├── repositories/    # Acceso a datos
├── models/          # Modelos de datos
├── data/           # Archivos JSON de datos
└── swagger.json    # Documentación API
```

### Tecnologías

- Node.js
- Express.js
- Swagger UI
- JSON (persistencia)

## 📝 Notas Importantes

1. **Siempre usa `/info`** antes de atacar para ver los IDs únicos válidos
2. **Los IDs únicos** son la forma correcta de identificar personajes en ataques
3. **Las batallas se guardan** automáticamente cuando terminan
4. **El sistema valida** que no ataques a tu propio equipo
5. **Los turnos alternan** automáticamente después de cada ataque
6. **Puedes especificar** qué personaje de cada equipo inicia la batalla

## 🎯 Próximas Mejoras

- [ ] Interfaz web para batallas
- [ ] Más tipos de ataques
- [ ] Habilidades especiales por personaje
- [ ] Sistema de niveles
- [ ] Modo multijugador 