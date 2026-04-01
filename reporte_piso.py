import csv
from collections import defaultdict
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import box
from rich.prompt import Prompt

console = Console()

DARK_MODE = False

def get_theme():
    if DARK_MODE:
        return {
            "header_bg": "blue",
            "header_text": "bold cyan",
            "panel_bg": "blue",
            "panel_text": "bold yellow",
            "table_header": "bold magenta",
            "table_col1": "cyan",
            "table_col2": "white",
            "total": "bold green",
            "text": "white",
            "highlight": "yellow",
            "stats_label": "white",
            "stats_value": "cyan"
        }
    else:
        return {
            "header_bg": "dark_blue",
            "header_text": "bold cyan",
            "panel_bg": "blue", 
            "panel_text": "bold yellow",
            "table_header": "bold magenta",
            "table_col1": "cyan",
            "table_col2": "white",
            "total": "bold green",
            "text": "white",
            "highlight": "yellow",
            "stats_label": "white",
            "stats_value": "cyan"
        }

tema = get_theme()

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

config_panel = Panel(
    Text(f"""[bold]CONFIGURACION DEL SISTEMA[/bold]

[yellow]1.[/yellow] Modo: [cyan]{'DARK MODE' if DARK_MODE else 'LIGHT MODE'}[/cyan]
[yellow]2.[/yellow] Tema: [cyan]{'Oscuro' if DARK_MODE else 'Claro'}[/cyan]

[dim]Seleccione opcion:[/dim]
[yellow]1[/yellow] - Cambiar modo (Dark/Light)
[yellow]2[/yellow] - Iniciar reporte
[yellow]3[/yellow] - Salir""",
    justify="left", style="white"),
    box=box.ROUNDED,
    style="blue",
    padding=(1, 2),
    title="[bold cyan]PANEL DE CONFIGURACION[/bold cyan]"
)
console.print(config_panel)
console.print()

opcion = Prompt.ask(
    "[yellow]Seleccione una opcion:[/yellow]",
    choices=["1", "2", "3"],
    default="2"
)

if opcion == "1":
    DARK_MODE = not DARK_MODE
    tema = get_theme()
    console.print(f"\n[green]Modo cambiado a: {'DARK MODE' if DARK_MODE else 'LIGHT MODE'}[/green]\n")
elif opcion == "3":
    console.print("[yellow]Saliendo...[/yellow]")
    exit()

datos_por_dia = {}

with open("20-3-26.csv", "r", encoding="latin-1") as f:
    reader = csv.DictReader(f)
    campos = reader.fieldnames
    punto_col = next((c for c in campos if "verific" in c.lower()), None)
    if punto_col is None:
        raise ValueError("No se encontro columna de punto de verificacion")

with open("20-3-26.csv", "r", encoding="latin-1") as f:
    reader = csv.DictReader(f)
    for row in reader:
        nombre = row["Nombre"].strip()
        depto = row["Departamento"].strip()
        punto = row[punto_col]
        hora_str = row["Hora"].strip()
        
        try:
            fecha = datetime.strptime(hora_str, "%Y-%m-%d %H:%M:%S").date()
            hora_dt = datetime.strptime(hora_str, "%Y-%m-%d %H:%M:%S")
        except:
            continue
        
        key = (nombre, depto)
        if fecha not in datos_por_dia:
            datos_por_dia[fecha] = {"registros": [], "personas": {}, "horas": defaultdict(list)}
        
        datos_por_dia[fecha]["registros"].append(row)
        if key not in datos_por_dia[fecha]["personas"]:
            datos_por_dia[fecha]["personas"][key] = {"depto": depto, "punto": punto}
        datos_por_dia[fecha]["horas"][key].append(hora_dt)

pisos_orden = ["Piso 14", "Piso 13", "Piso 12", "Piso 11", "Piso 10", 
               "Piso 9", "Piso 8", "Piso 7", "Piso 6", "Piso 5",
               "Piso 4", "Piso 3", "Piso 2", "Piso 1", "Mezzanina", 
               "Planta Baja", "Sotano 1"]

header = Panel(
    Text("REPORTE DE PERSONAL POR PISO\nDETALLADO POR DIA", justify="center", style=tema["header_text"]),
    box=box.ROUNDED,
    style=tema["header_bg"],
    padding=(1, 2)
)
console.print(header)
console.print()

total_registros_semana = 0

for fecha in sorted(datos_por_dia.keys()):
    personas_datos = datos_por_dia[fecha]["personas"]
    registros = datos_por_dia[fecha]["registros"]
    horas = datos_por_dia[fecha]["horas"]
    conteo_por_piso = defaultdict(set)
    
    for (nombre, depto), datos in personas_datos.items():
        piso = obtener_piso_por_depto(depto)
        if piso is None:
            piso = obtener_piso_por_punto(datos["punto"])
        conteo_por_piso[piso].add((nombre, depto))
    
    fecha_panel = Panel(
        Text(f"Fecha: {fecha.strftime('%d/%m/%Y')}", justify="center", style=tema["panel_text"]),
        box=box.ROUNDED,
        style=tema["panel_bg"],
        padding=(0, 2)
    )
    console.print(fecha_panel)
    
    console.print(f"[{tema['stats_label']}]Registros (entradas/salidas):[/{tema['stats_label']}] [{tema['stats_value']}]{len(registros)}[/{tema['stats_value']}]  |  [{tema['stats_label']}]Personas unicas:[/{tema['stats_label']}] [{tema['stats_value']}]{len(personas_datos)}[/{tema['stats_value']}]")
    console.print()
    
    tabla = Table(box=box.ROUNDED, show_header=True, header_style=tema["table_header"])
    tabla.add_column("PISO", style=tema["table_col1"], width=15)
    tabla.add_column("CANTIDAD", justify="center", style=tema["table_col2"])
    
    for i, piso in enumerate(pisos_orden):
        count = len(conteo_por_piso[piso])
        if count > 0:
            color = "white" if i % 2 == 0 else "bright_black"
            tabla.add_row(piso, f"[{color}]{count}[/{color}]")
    
    total = sum(len(conteo_por_piso[piso]) for piso in pisos_orden)
    tabla.add_row("[bold]TOTAL[/bold]", f"[{tema['total']}]{total}[/{tema['total']}]")
    
    console.print(tabla)
    console.print()
    total_registros_semana += len(registros)
    
    console.print(f"[{tema['highlight']}]Horas trabajadas por persona:[/{tema['highlight']}]")
    console.print()
    
    for (nombre, depto), horas_persona in horas.items():
        horas_persona.sort()
        primera = horas_persona[0]
        ultima = horas_persona[-1]
        duracion = ultima - primera
        horas_trabajadas = duracion.total_seconds() / 3600
        
        piso = obtener_piso_por_depto(depto)
        if piso is None:
            piso = obtener_piso_por_punto(personas_datos[(nombre, depto)]["punto"])
        
        if horas_trabajadas >= 4:
            color_hora = "green"
            indicador = "[green]+[/green]"
        elif horas_trabajadas >= 2:
            color_hora = "yellow"
            indicador = "[yellow]o[/yellow]"
        else:
            color_hora = "red"
            indicador = "[red]-[/red]"
        
        console.print(f"  {indicador} [cyan]{nombre}[/cyan] ([yellow]{piso}[/yellow]): [white]{primera.strftime('%H:%M')}[/white] - [white]{ultima.strftime('%H:%M')}[/white] ([{color_hora}]{horas_trabajadas:.1f}h[/{color_hora}])")

    console.print()

resumen = Panel(
    Text(f"""[bold cyan]RESUMEN SEMANAL[/bold cyan]

[{tema['stats_label']}]Dias con datos:[/{tema['stats_label']}] [green]{len(datos_por_dia)}[/green]
[{tema['stats_label']}]Fechas:[/{tema['stats_label']}] [yellow]{', '.join([f.strftime('%d/%m') for f in sorted(datos_por_dia.keys())])}[/yellow]
[{tema['stats_label']}]Total registros:[/{tema['stats_label']}] [cyan]{total_registros_semana}[/cyan]
[{tema['stats_label']}]Personas unicas (semana):[/{tema['stats_label']}] [green]{sum(len(d["personas"]) for d in datos_por_dia.values())}[/green]""",
    justify="left", style=tema["text"]),
    box=box.ROUNDED,
    style=tema["header_bg"],
    padding=(1, 2)
)
console.print(resumen)
