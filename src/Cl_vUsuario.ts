import Cl_controlador from "./Cl_controlador.js";
import Cl_mEquipo, { iEquipo, LISTA_ESTADOS, LISTA_LABORATORIOS } from "./Cl_mEquipo.js";
import Cl_vEquipo from "./Cl_vEquipo.js";
import Cl_vGeneral, { tHTMLElement } from "./tools/Cl_vGeneral.js";
import { opcionFicha } from "./tools/core.tools.js";

export default class Cl_vUsuario extends Cl_vGeneral {
  private vEquipo: Cl_vEquipo;
  
  // Botones Superiores
  private btBuscar: HTMLButtonElement;
  private btQuitarFiltro: HTMLButtonElement; 

  private divTabla: HTMLDivElement;
  
  // Stats
  private lblTotal: HTMLElement; private lblOperativos: HTMLElement; 
  private lblReparacion: HTMLElement; private lblDañado: HTMLElement;

  // --- ELEMENTOS DE BÚSQUEDA ---
  private modalBuscar: HTMLElement;
  private inBusSerial: HTMLInputElement; 
  
  // CAMBIO 1: Ya no son Select, ahora son Divs contenedores
  private divBusLab: HTMLDivElement; 
  private divBusEstado: HTMLDivElement;

  private inBusCpu: HTMLInputElement;
  private inBusRam: HTMLInputElement;
  private inBusFila: HTMLInputElement;
  private inBusPuesto: HTMLInputElement;
  
  private btBuscarCancelar: HTMLButtonElement; 
  private btBuscarAceptar: HTMLButtonElement;

  constructor() {
    super({ formName: "dcyt" });
    this.vEquipo = new Cl_vEquipo();
    this.vEquipo.show({ ver: false });

    this.btBuscar = this.crearHTMLButtonElement("btBuscar", { onclick: () => this.abrirBusqueda(), });
    
    this.btQuitarFiltro = this.crearHTMLButtonElement("btQuitarFiltro", { 
        onclick: () => this.limpiarFiltro(), 
    });
    this.btQuitarFiltro.innerText = "* Quitar Filtro";

    this.divTabla = this.crearHTMLElement("divTabla", { type: tHTMLElement.CONTAINER, refresh: () => this.mostrarEquipos(), }) as HTMLDivElement;
    
    this.lblTotal = document.getElementById("lblTotal") as HTMLElement;
    this.lblOperativos = document.getElementById("lblOperativos") as HTMLElement;
    this.lblReparacion = document.getElementById("lblReparacion") as HTMLElement;
    this.lblDañado = document.getElementById("lblDañado") as HTMLElement;

    // --- CONEXIÓN DE BÚSQUEDA ---
    this.modalBuscar = document.getElementById("modalBuscar") as HTMLElement;
    this.inBusSerial = document.getElementById("bus_inSerial") as HTMLInputElement;
    
    // CAMBIO 2: Obtener los DIVs en lugar de Selects
    this.divBusLab = document.getElementById("bus_divLab") as HTMLDivElement;
    this.divBusEstado = document.getElementById("bus_divEstado") as HTMLDivElement;

    this.inBusCpu = document.getElementById("bus_inCpu") as HTMLInputElement;
    this.inBusRam = document.getElementById("bus_inRam") as HTMLInputElement;
    this.inBusFila = document.getElementById("bus_inFila") as HTMLInputElement;
    this.inBusPuesto = document.getElementById("bus_inPuesto") as HTMLInputElement;

    // CAMBIO 3: Llenar con checkboxes en lugar de <option>
    this.generarCheckboxes(this.divBusLab, LISTA_LABORATORIOS);
    this.generarCheckboxes(this.divBusEstado, LISTA_ESTADOS);

    this.btBuscarCancelar = document.getElementById("btBuscarCancelar") as HTMLButtonElement;
    this.btBuscarCancelar.onclick = () => this.ocultarBusqueda();
    this.btBuscarAceptar = document.getElementById("btBuscarAceptar") as HTMLButtonElement;
    this.btBuscarAceptar.onclick = () => this.ejecutarBusqueda();
  }

  set controlador(controlador: Cl_controlador) { super.controlador = controlador; this.vEquipo.controlador = controlador; }
  get controlador(): Cl_controlador | null { return super.controlador; }

  // CAMBIO 4: Nueva función para crear checkboxes dinámicos
  generarCheckboxes(contenedor: HTMLElement, datos: string[]) {
      contenedor.innerHTML = "";
      datos.forEach(dato => { 
          // Creamos un label que envuelve al input para mejor click
          let label = document.createElement("label");
          label.className = "checkbox-item";
          
          let input = document.createElement("input");
          input.type = "checkbox";
          input.value = dato;
          
          label.appendChild(input);
          label.appendChild(document.createTextNode(dato));
          
          contenedor.appendChild(label);
      });
  }

  // CAMBIO 5: Función auxiliar para leer qué está marcado
  obtenerSeleccionados(contenedor: HTMLElement): string[] {
      let seleccionados: string[] = [];
      let inputs = contenedor.querySelectorAll("input[type='checkbox']:checked");
      inputs.forEach((input: any) => {
          seleccionados.push(input.value);
      });
      return seleccionados;
  }

  mostrarEquipos(listaFiltrada?: iEquipo[]) {
    this.divTabla.innerHTML = ""; 
    let equipos = listaFiltrada ? listaFiltrada : this.controlador?.dtEquipos;
    if (!equipos) return;

    if (listaFiltrada) {
        this.btQuitarFiltro.style.display = "flex"; 
    } else {
        this.btQuitarFiltro.style.display = "none"; 
    }

    // Stats
    let listaParaStats = equipos;
    let total = listaParaStats.length;
    let operativos = listaParaStats.filter(e => e.estado === "Operativo").length;
    let reparacion = listaParaStats.filter(e => e.estado === "En Mantenimiento").length;
    let danado = listaParaStats.filter(e => e.estado === "Dañado").length;

    if(this.lblTotal) this.lblTotal.innerHTML = total.toString();
    if(this.lblOperativos) this.lblOperativos.innerHTML = operativos.toString();
    if(this.lblReparacion) this.lblReparacion.innerHTML = reparacion.toString();
    if(this.lblDañado) this.lblDañado.innerHTML = danado.toString();
    
    let html = "";
    if (equipos.length === 0) html = `<div style="text-align:center; padding:20px; color:#666;">No se encontraron resultados 🔍</div>`;

    equipos.forEach((equipo: iEquipo, index: number) => {
      let claseColor = "";
      if(equipo.estado === "Operativo") claseColor = "txt-green";
      if(equipo.estado === "En Mantenimiento") claseColor = "txt-yellow";
      if(equipo.estado === "Dañado") claseColor = "txt-red";
      
      html += `<div class="card">
                <div class="card-content">
                    <div class="card-title">${equipo.lab} Fila:${equipo.fila} Puesto:${equipo.puesto}</div>
                    <div class="card-detail"> <b>Serial:</b> ${equipo.serial || "N/A"} | <b> Equipo:</b> ${equipo.cpu} - <b> RAM:</b> ${equipo.ram}GB</div>
                    <div class="card-status ${claseColor}"><span class="status-dot">●</span> ${equipo.estado}</div>
                </div>
                <div class="card-actions">
                    <button class="action-link link-blue" id="dcyt_btConsultar_${index}"><span>👁️</span> Consultar</button>
                </div>
               </div>`;
    });
    this.divTabla.innerHTML = html;
    
    equipos.forEach((equipo: iEquipo, index: number) => {
      let btnC = document.getElementById(`dcyt_btConsultar_${index}`); 
      if(btnC) btnC.onclick = () => this.consultarEquipo(equipo.serial);
    });
  }

  abrirBusqueda() { 
      // Limpiar inputs de texto
      this.inBusSerial.value = ""; this.inBusCpu.value = ""; this.inBusRam.value = "";
      this.inBusFila.value = ""; this.inBusPuesto.value = ""; 
      
      // CAMBIO 6: Desmarcar todos los checkboxes al abrir
      this.divBusLab.querySelectorAll("input").forEach(i => i.checked = false);
      this.divBusEstado.querySelectorAll("input").forEach(i => i.checked = false);

      this.modalBuscar.style.display = "flex"; 
  }
  
  ocultarBusqueda() { this.modalBuscar.style.display = "none"; }
  
  limpiarFiltro() { this.mostrarEquipos(); }

  ejecutarBusqueda() {
      let sSerial = this.inBusSerial.value.trim().toLowerCase();
      
      // CAMBIO 7: Obtener Arrays de seleccionados
      let sLabs = this.obtenerSeleccionados(this.divBusLab);
      let sEstados = this.obtenerSeleccionados(this.divBusEstado);

      let sCpu = this.inBusCpu.value.trim().toLowerCase();
      let sRam = this.inBusRam.value.trim();
      let sFila = this.inBusFila.value.trim().toLowerCase();
      let sPuesto = this.inBusPuesto.value.trim().toLowerCase();

      let todos = this.controlador?.dtEquipos || [];
      
      let filtrados = todos.filter((e: iEquipo) => {
          let coincide = true;
          if (sSerial && !e.serial.toLowerCase().includes(sSerial)) coincide = false;
          
          // CAMBIO 8: Lógica "Uno o Más". 
          // Si el array sLabs tiene elementos, verificamos si el e.lab está INCLUIDO en ese array.
          // Si el array está vacío, significa que el usuario quiere ver TODOS, así que no filtramos.
          if (sLabs.length > 0 && !sLabs.includes(e.lab)) coincide = false;
          if (sEstados.length > 0 && !sEstados.includes(e.estado)) coincide = false;

          if (sCpu && !e.cpu.toLowerCase().includes(sCpu)) coincide = false;
          if (sRam && String(e.ram) !== sRam) coincide = false;
          if (sFila && e.fila.toLowerCase() !== sFila) coincide = false;
          if (sPuesto && e.puesto.toLowerCase() !== sPuesto) coincide = false;
          return coincide;
      });

      this.ocultarBusqueda();
      this.mostrarEquipos(filtrados);
  }

  consultarEquipo(serial: string) { 
      let equipo = this.controlador?.equipo(serial); 
      if (equipo) this.controlador?.activarVista({ vista: "equipo", opcion: opcionFicha.read, objeto: equipo, }); 
  }

  activarVista({ vista, opcion, objeto }: { vista: string; opcion?: opcionFicha; objeto?: Cl_mEquipo; }): void {
    if (vista === "dcyt") { 
        this.show({ ver: true }); 
        this.mostrarEquipos(); 
        this.vEquipo.show({ ver: false }); 
    } 
    else { 
        this.show({ ver: false }); 
        this.vEquipo.show({ ver: true, equipo: objeto, opcion: opcionFicha.read }); 
    }
  }
}