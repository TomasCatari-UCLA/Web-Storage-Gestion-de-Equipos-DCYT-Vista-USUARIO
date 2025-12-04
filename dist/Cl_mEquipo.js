import Cl_mTablaWeb from "./tools/Cl_mTablaWeb.js";
export const LISTA_LABORATORIOS = ["Lab-01", "Lab-02", "Lab-03", "Lab-04", "Lab-05", "Lab-06"];
// 🔥 AQUÍ ES DONDE SE GENERAN LOS CHECKBOXES. 
// Si faltaba "Dañado", al agregarlo aquí aparecerá automáticamente en la búsqueda.
export const LISTA_ESTADOS = ["Operativo", "En Mantenimiento", "Dañado"];
// --- 3. CLASE EQUIPO ---
export default class Cl_mEquipo extends Cl_mTablaWeb {
    constructor({ id, creadoEl, alias, serial, lab, cpu, ram, estado, fila, puesto } = {
        id: null, creadoEl: null, alias: null,
        serial: "", lab: "Lab-01", cpu: "", ram: 0, estado: "Operativo", fila: "", puesto: ""
    }) {
        super({ id, creadoEl, alias });
        this._serial = "";
        this._lab = "Lab-01";
        this._cpu = "";
        this._ram = 0;
        this._estado = "Operativo";
        this._fila = "";
        this._puesto = "";
        this.serial = serial;
        this.lab = lab;
        this.cpu = cpu;
        this.ram = ram;
        this.estado = estado;
        this.fila = fila;
        this.puesto = puesto;
    }
    set serial(v) { this._serial = v.trim().toUpperCase(); }
    get serial() { return this._serial; }
    set lab(v) { this._lab = v; }
    get lab() { return this._lab; }
    set cpu(v) { this._cpu = v.trim(); }
    get cpu() { return this._cpu; }
    set ram(v) { this._ram = +v; }
    get ram() { return this._ram; }
    set estado(v) { this._estado = v; }
    get estado() { return this._estado; }
    set fila(v) { this._fila = v.trim(); }
    get fila() { return this._fila; }
    set puesto(v) { this._puesto = v.trim(); }
    get puesto() { return this._puesto; }
    // --- VALIDACIONES ---
    get serialOk() { return this._serial.length > 0 && this._serial.length <= 6; }
    get labOk() { return LISTA_LABORATORIOS.includes(this._lab); }
    get estadoOk() { return LISTA_ESTADOS.includes(this._estado); }
    get cpuOk() { return this._cpu.length > 0; }
    get ramOk() { return this._ram > 0; }
    get filaOk() { return this._fila.length > 0; }
    get puestoOk() { return this._puesto.length > 0; }
    get equipoOk() {
        if (!this.serialOk)
            return "Error: Serial inválido (vacío o >6 caracteres).";
        if (!this.labOk)
            return "Error: Laboratorio inválido.";
        if (!this.cpuOk)
            return "Error: CPU vacío.";
        if (!this.ramOk)
            return "Error: RAM inválida (debe ser número > 0).";
        if (!this.estadoOk)
            return "Error: Estado inválido.";
        if (!this.filaOk)
            return "Error: Fila vacía.";
        if (!this.puestoOk)
            return "Error: Puesto vacío.";
        return true;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { serial: this._serial, lab: this._lab, cpu: this._cpu, ram: this._ram, estado: this._estado, fila: this._fila, puesto: this._puesto });
    }
}
