# Sistema de Batallas en Equipo - API Superhéroes

## Descripción

El sistema de batallas en equipo permite crear enfrentamientos épicos entre 3 héroes y 3 villanos, con un sistema de turnos por ronda que simula combates estratégicos.

## Características

- **Batallas en equipo**: 3 héroes vs 3 villanos
- **Sistema de vida**: Cada personaje tiene 200 puntos de vida
- **3 tipos de ataques**:
  - **Básico**: 5 puntos de daño
  - **Especial**: 30 puntos de daño
  - **Crítico**: 45 puntos de daño
- **3 rondas**: Cada batalla tiene un máximo de 3 rondas
- **Sistema de turnos**: Los personajes atacan por turnos
- **Persistencia**: Las batallas se guardan automáticamente
- **Historial**: Consulta todas las batallas realizadas
- **Estadísticas**: Análisis de victorias y rendimiento

## Endpoints Disponibles

### 1. Crear Nueva Batalla
```http
POST /api/batallas
```

**Body:**
```json
{
  "equipoHeroes": [1, 2, 3],
  "equipoVillanos": [1, 2, 3],
  "iniciador": "heroes"
}
```

### 2. Iniciar Batalla
```http
POST /api/batallas/{id}/iniciar
```

### 3. Realizar Ataque
```http
POST /api/batallas/{id}/atacar
```

**Body:**
```json
{
  "atacanteId": 1,
  "objetivoId": 4,
  "tipoAtaque": "especial"
}
```

### 4. Obtener Estado de Batalla
```http
GET /api/batallas/{id}
```

### 5. Obtener Información Detallada de Batalla
```http
GET /api/batallas/{id}/info
```

**Respuesta incluye:**
- Turno actual (Héroes o Villanos)
- Personaje actual que debe atacar
- Personajes disponibles para atacar
- Personajes objetivo disponibles

### 6. Obtener Batallas Activas
```http
GET /api/batallas/activas
```

### 7. Obtener Historial de Batallas
```http
GET /api/batallas/historial
```

### 8. Obtener Estadísticas
```http
GET /api/batallas/estadisticas
```

### 9. Simular Batalla Completa
```http
POST /api/batallas/simular
```

**Body:**
```json
{
  "equipoHeroes": [1, 2, 3],
  "equipoVillanos": [1, 2, 3],
  "iniciador": "heroes"
}
```

## Flujo de Batalla

1. **Crear batalla**: Selecciona 3 héroes y 3 villanos
2. **Iniciar batalla**: La batalla comienza en estado "iniciando"
3. **Turnos**: Los personajes atacan por turnos según el iniciador
4. **Ataques**: Cada personaje puede realizar 3 tipos de ataques
5. **Eliminación**: Cuando un personaje llega a 0 vida, se elimina
6. **Cambio de personaje**: Al siguiente personaje del mismo equipo
7. **Finalización**: La batalla termina cuando:
   - Un equipo pierde todos sus personajes
   - Se completan las 3 rondas
   - Se determina ganador por puntos de vida restantes

## Estados de Batalla

- **iniciando**: Batalla creada pero no iniciada
- **en_curso**: Batalla activa con turnos
- **finalizada**: Batalla completada con ganador

## Tipos de Ataque

- **basico**: 5 puntos de daño
- **especial**: 30 puntos de daño  
- **critico**: 45 puntos de daño

## Ejemplo de Uso

### 1. Crear una batalla
```bash
curl -X POST http://localhost:3001/api/batallas \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1, 2, 3],
    "equipoVillanos": [1, 2, 3],
    "iniciador": "heroes"
  }'
```

### 2. Iniciar la batalla
```bash
curl -X POST http://localhost:3001/api/batallas/{batalla_id}/iniciar
```

### 3. Realizar un ataque
```bash
curl -X POST http://localhost:3001/api/batallas/{batalla_id}/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": 1,
    "objetivoId": 1,
    "tipoAtaque": "especial"
  }'
```

**Ejemplo correcto:**
- Si es turno de héroes: `atacanteId: 1` (Superman) ataca a `objetivoId: 1` (Lex Luthor)
- Si es turno de villanos: `atacanteId: 1` (Lex Luthor) ataca a `objetivoId: 1` (Superman)

### 4. Consultar estado
```bash
curl http://localhost:3001/api/batallas/{batalla_id}
```

### 5. Obtener información detallada
```bash
curl http://localhost:3001/api/batallas/{batalla_id}/info
```

### 6. Simular batalla completa
```bash
curl -X POST http://localhost:3001/api/batallas/simular \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1, 2, 3],
    "equipoVillanos": [1, 2, 3],
    "iniciador": "heroes"
  }'
```

## Respuestas de Ejemplo

### Estado de Batalla
```json
{
  "success": true,
  "batalla": {
    "id": "1703123456789",
    "estado": "en_curso",
    "ronda": 1,
    "turno": "heroes",
    "ganador": null,
    "equipoHeroes": {
      "nombre": "Equipo de Héroes",
      "personajes": [
        {
          "id": 1,
          "alias": "Superman",
          "vida": 200,
          "activo": true,
          "vivo": true
        }
      ]
    },
    "equipoVillanos": {
      "nombre": "Equipo de Villanos", 
      "personajes": [
        {
          "id": 1,
          "alias": "Lex Luthor",
          "vida": 155,
          "activo": true,
          "vivo": true
        }
      ]
    },
    "historial": [...]
  },
  "mensaje": "Estado de batalla obtenido"
}
```

### Estadísticas
```json
{
  "success": true,
  "estadisticas": {
    "totalBatallas": 10,
    "batallasFinalizadas": 8,
    "victoriasHeroes": 5,
    "victoriasVillanos": 2,
    "empates": 1,
    "porcentajeVictoriasHeroes": "50.00",
    "porcentajeVictoriasVillanos": "20.00"
  },
  "mensaje": "Estadísticas obtenidas"
}
```

## Documentación Completa

Para ver la documentación completa de la API, visita:
```
http://localhost:3001/api-docs
```

## Notas Importantes

- Cada personaje tiene 200 puntos de vida inicial
- Los ataques se realizan por turnos
- **No puedes atacar a personajes de tu mismo equipo**
- **No puedes atacarte a ti mismo**
- **⚠️ IMPORTANTE: Los IDs pueden repetirse entre héroes y villanos**
  - Héroe ID 1 = Superman
  - Villano ID 1 = Lex Luthor
  - Asegúrate de usar el ID correcto del equipo correspondiente
- Cuando un personaje llega a 0 vida, se elimina y pasa al siguiente
- La batalla termina cuando un equipo pierde todos sus personajes
- Si se completan las 3 rondas, gana el equipo con más vida total
- Las batallas se guardan automáticamente al finalizar
- Puedes consultar el historial completo de batallas
- El sistema incluye estadísticas detalladas
- **Usa `/api/batallas/{id}/info` para ver qué personajes pueden atacar y cuáles son objetivos válidos** 