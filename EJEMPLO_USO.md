# 🎮 Ejemplo de Uso - Sistema de Batallas por Equipos

## 📋 Casos de Prueba

### Caso 1: Batalla Básica con IDs Repetidos

```bash
# Crear batalla con IDs repetidos (héroes y villanos con mismos IDs)
curl -X POST http://localhost:3001/api/batallas/crear \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1, 2, 3],
    "equipoVillanos": [1, 2, 3],
    "iniciador": "heroes",
    "primerHeroe": 1,
    "primerVillano": 2
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "batalla": {
    "id": "1703123456789",
    "estado": "iniciando",
    "ronda": 1,
    "turno": "heroes",
    "ganador": null,
    "personajeActual": {
      "id": 1,
      "idUnico": "H1",
      "alias": "Superman",
      "equipo": "heroes"
    },
    "equipoHeroes": {
      "nombre": "Equipo de Héroes",
      "personajes": [
        {
          "id": 1,
          "idUnico": "H1",
          "alias": "Superman",
          "vida": 200,
          "activo": true,
          "vivo": true
        },
        {
          "id": 2,
          "idUnico": "H2",
          "alias": "Iron Man",
          "vida": 200,
          "activo": true,
          "vivo": true
        },
        {
          "id": 3,
          "idUnico": "H3",
          "alias": "Batman",
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
          "idUnico": "V1",
          "alias": "Lex Luthor",
          "vida": 200,
          "activo": true,
          "vivo": true
        },
        {
          "id": 2,
          "idUnico": "V2",
          "alias": "Thanos",
          "vida": 200,
          "activo": true,
          "vivo": true
        },
        {
          "id": 3,
          "idUnico": "V3",
          "alias": "El Pingüino",
          "vida": 200,
          "activo": true,
          "vivo": true
        }
      ]
    }
  },
  "mensaje": "Batalla creada exitosamente"
}
```

### Caso 2: Obtener Información Detallada

```bash
# Obtener información detallada de la batalla
curl http://localhost:3001/api/batallas/1703123456789/info
```

**Respuesta esperada:**
```json
{
  "success": true,
  "batalla": {
    "id": "1703123456789",
    "estado": "iniciando",
    "ronda": 1,
    "turno": "heroes",
    "ganador": null,
    "personajeActual": {
      "id": 1,
      "idUnico": "H1",
      "alias": "Superman",
      "equipo": "heroes"
    },
    "personajesAtacantes": [
      {
        "id": 1,
        "idUnico": "H1",
        "alias": "Superman",
        "vida": 200,
        "equipo": "heroes"
      },
      {
        "id": 2,
        "idUnico": "H2",
        "alias": "Iron Man",
        "vida": 200,
        "equipo": "heroes"
      },
      {
        "id": 3,
        "idUnico": "H3",
        "alias": "Batman",
        "vida": 200,
        "equipo": "heroes"
      }
    ],
    "personajesObjetivo": [
      {
        "id": 1,
        "idUnico": "V1",
        "alias": "Lex Luthor",
        "vida": 200,
        "equipo": "villanos"
      },
      {
        "id": 2,
        "idUnico": "V2",
        "alias": "Thanos",
        "vida": 200,
        "equipo": "villanos"
      },
      {
        "id": 3,
        "idUnico": "V3",
        "alias": "El Pingüino",
        "vida": 200,
        "equipo": "villanos"
      }
    ]
  },
  "mensaje": "Información detallada de batalla obtenida"
}
```

### Caso 3: Iniciar Batalla

```bash
# Iniciar la batalla
curl -X POST http://localhost:3001/api/batallas/1703123456789/iniciar
```

### Caso 4: Realizar Ataques

```bash
# Ataque básico
curl -X POST http://localhost:3001/api/batallas/1703123456789/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "H1",
    "objetivoId": "V2",
    "tipoAtaque": "basico"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "batalla": {
    "id": "1703123456789",
    "estado": "en_curso",
    "ronda": 1,
    "turno": "villanos",
    "ganador": null,
    "personajeActual": {
      "id": 2,
      "idUnico": "V2",
      "alias": "Thanos",
      "equipo": "villanos"
    },
    "equipoHeroes": {
      "nombre": "Equipo de Héroes",
      "personajes": [
        {
          "id": 1,
          "idUnico": "H1",
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
          "id": 2,
          "idUnico": "V2",
          "alias": "Thanos",
          "vida": 195,
          "activo": true,
          "vivo": true
        }
      ]
    }
  },
  "ataque": {
    "atacante": "Superman",
    "objetivo": "Thanos",
    "tipoAtaque": "basico",
    "dano": 5,
    "vidaRestante": 195,
    "eliminado": false
  },
  "mensaje": "Superman atacó a Thanos con basico causando 5 puntos de daño"
}
```

### Caso 5: Ataque Especial

```bash
# Ataque especial
curl -X POST http://localhost:3001/api/batallas/1703123456789/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "V2",
    "objetivoId": "H1",
    "tipoAtaque": "especial"
  }'
```

### Caso 6: Ataque Crítico

```bash
# Ataque crítico
curl -X POST http://localhost:3001/api/batallas/1703123456789/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "H1",
    "objetivoId": "V2",
    "tipoAtaque": "critico"
  }'
```

## 🎯 Casos de Prueba Especiales

### Caso A: Simular Batalla Completa

```bash
# Simular una batalla completa automáticamente
curl -X POST http://localhost:3001/api/batallas/simular \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1, 2, 3],
    "equipoVillanos": [1, 2, 3],
    "iniciador": "heroes",
    "primerHeroe": 1,
    "primerVillano": 2
  }'
```

### Caso B: Probar Sistema

```bash
# Probar el sistema completo
curl -X POST http://localhost:3001/api/batallas/probar
```

### Caso C: Obtener Estadísticas

```bash
# Obtener estadísticas de todas las batallas
curl http://localhost:3001/api/batallas/estadisticas
```

## ⚠️ Casos de Error

### Error 1: IDs Inválidos

```bash
# Intentar atacar con ID numérico en lugar de ID único
curl -X POST http://localhost:3001/api/batallas/1703123456789/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "1",
    "objetivoId": "2",
    "tipoAtaque": "basico"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "error": "Atacante con ID 1 no encontrado. Verifica que el ID corresponda al equipo correcto."
}
```

### Error 2: Ataque al Equipo Incorrecto

```bash
# Intentar atacar a un personaje del mismo equipo
curl -X POST http://localhost:3001/api/batallas/1703123456789/atacar \
  -H "Content-Type: application/json" \
  -d '{
    "atacanteId": "H1",
    "objetivoId": "H2",
    "tipoAtaque": "basico"
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "error": "Solo puedes atacar a personajes del equipo contrario. Ambos personajes son del equipo de héroes."
}
```

### Error 3: Personaje Inicial Inválido

```bash
# Intentar crear batalla con personaje inicial que no está en el equipo
curl -X POST http://localhost:3001/api/batallas/crear \
  -H "Content-Type: application/json" \
  -d '{
    "equipoHeroes": [1, 2, 3],
    "equipoVillanos": [1, 2, 3],
    "iniciador": "heroes",
    "primerHeroe": 5,
    "primerVillano": 2
  }'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "error": "El héroe inicial 5 no está en el equipo seleccionado"
}
```

## 📊 Flujo Completo de Batalla

1. **Crear batalla** con equipos y personajes iniciales
2. **Obtener información** para ver IDs únicos
3. **Iniciar batalla**
4. **Realizar ataques** por turnos usando IDs únicos
5. **Continuar** hasta que termine la batalla
6. **Consultar historial** para ver batallas finalizadas

## 🎮 Consejos de Uso

1. **Siempre usa `/info`** antes de atacar para ver los IDs únicos válidos
2. **Los IDs únicos** son la forma correcta de identificar personajes
3. **Verifica el turno** antes de atacar
4. **Usa personajes iniciales** para controlar el inicio de la batalla
5. **Consulta el historial** para ver batallas anteriores
6. **Usa la simulación** para probar configuraciones rápidamente 