import csv
from collections import defaultdict

piso_areas = {
    "Piso 14": ["despacho"],
    "Piso 13": ["analisis del entorno", "estrategias", "analicis del entorno"],
    "Piso 12": ["viceministerio de gestion comunicacional", "comunicacion de gobierno", "oficina de informacion regional", "articulacion con medios", "viceministerio de estrategia"],
    "Piso 11": ["agencia venezolana de publicidad"],
    "Piso 10": ["tecnologia"],
    "Piso 9": ["agencia venezolana de publicidad"],
    "Piso 8": ["administracion", "presupuesto", "contabilidad", "tesoreria", "compras", "bienes nacionales"],
    "Piso 7": ["archivo administracion", "archivo rrhh"],
    "Piso 6": ["produccion nacional independiente", "auditoria", "medios internacionales"],
    "Piso 5": ["rrhh", "consultoria juridica", "planificacion"],
    "Piso 4": ["medios alternativos comunitarios", "fundacion premio nacional de periodismo"],
    "Piso 3": ["medios digitales", "pagina web", "guerrilla comunicacional"],
    "Piso 2": ["servicios generales", "vicemisterio de transmision"],
    "Piso 1": ["comedor", "servicios generales"],
    "Mezzanina": ["secretaria"],
    "Planta Baja": ["seguridad", "protocolo", "correspondencia", "atencion al cdno", "servicio medico"],
    "Sotano 1": ["seguridad", "gimnasio"]
}

depto_a_piso = {}
for piso, areas in piso_areas.items():
    for area in areas:
        depto_a_piso[area.lower()] = piso

def obtener_piso_por_depto(depto):
    depto_lower = depto.lower().strip()
    if depto_lower.startswith("mippci/"):
        depto_lower = depto_lower[7:]
    for key, piso in depto_a_piso.items():
        if key in depto_lower:
            return piso
    if "avp" in depto_lower or "publicidad" in depto_lower:
        return "Piso 11"
    return None

def obtener_piso_por_punto(punto):
    punto_lower = punto.lower()
    if "sotano" in punto_lower:
        return "Sotano 1"
    if "planta baja 1" in punto_lower:
        return "Planta Baja"
    if "planta baja 2" in punto_lower:
        return "Planta Baja"
    return "Planta Baja"

personas_datos = {}

with open("20-3-26.csv", "r", encoding="latin-1") as f:
    reader = csv.DictReader(f)
    for row in reader:
        nombre = row["Nombre"].strip()
        depto = row["Departamento"].strip()
        punto = row["Punto de verificación de asistencia"]
        key = (nombre, depto)
        if key not in personas_datos:
            personas_datos[key] = {"depto": depto, "punto": punto}

conteo_por_piso = defaultdict(set)
for (nombre, depto), datos in personas_datos.items():
    piso = obtener_piso_por_depto(depto)
    if piso is None:
        piso = obtener_piso_por_punto(datos["punto"])
    conteo_por_piso[piso].add((nombre, depto))

print("=" * 60)
print("REPORTE DE PERSONAL POR PISO")
print("=" * 60)
print(f"\nTotal de personas unicas: {len(personas_datos)}\n")

pisos_orden = ["Piso 14", "Piso 13", "Piso 12", "Piso 11", "Piso 10", 
               "Piso 9", "Piso 8", "Piso 7", "Piso 6", "Piso 5",
               "Piso 4", "Piso 3", "Piso 2", "Piso 1", "Mezzanina", 
               "Planta Baja", "Sotano 1"]

total = 0
for piso in pisos_orden:
    count = len(conteo_por_piso[piso])
    total += count
    if count > 0:
        print(f"{piso}: {count} persona(s)")

print(f"\n{'=' * 60}")
print(f"TOTAL GENERAL: {total}")
print("=" * 60)
