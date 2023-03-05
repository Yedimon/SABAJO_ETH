// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 < 0.9.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

contract HealthOcupational {
    
    // Direccion del profesional en salud ocupacional -> Owner / Dueño del contrato 
    address public DireccionSaludOcupacional;
    
    function CrearSaludOcupacional () public {
        DireccionSaludOcupacional = msg.sender;
        emit ValidarSaludOcupacional (DireccionSaludOcupacional);
    }

    // Mapping para relacionar los empleados (direccion/address) con la validez del sistema de gestion
    mapping (address => bool) public ValidacionTrabajador;
    
    // Array de las direcciones que soliciten acceso 
    address [] public SolicitudesTrabajadores;
    //Array de codigos y nombres de empleados
    string [] public Nombre;
    //Array de codigos y nombres de empleados
    string [] public Codigo;

    // Eventos a emitir 
    event SolicitudAccesoTrabajador (address, string, string);
    event TrabajadorValidado (address);
    event NuevoContratoDiarioTrabajador (address, address);
    event ValidarSaludOcupacional (address);
    
    // Modificador que permita unicamente la ejecucion de funciones por el profesional de salud ocupacional 
    modifier OnlyHO(address _directionSC) {
        require(_directionSC == DireccionSaludOcupacional, "No tienes permisos para realizar esta funcion.");
        _;
    }

    // Funcion para solicitar acceso al sistema
    function PedirAcceso(string memory _Nombre, string memory _Codigo) public {
        // Almacenar la direccion en el array de solicitudes 
        SolicitudesTrabajadores.push(msg.sender);
        // Almacenar el nombre del trabajador
        Nombre.push(_Nombre);
        // Almacenar el codigo del trabajador
        Codigo.push(_Codigo);
        // Emision de los evento
        emit SolicitudAccesoTrabajador (msg.sender, _Nombre, _Codigo);
    }
    
    // Funcion que visualiza las direcciones que han solicitado este acceso 
    function ObservarSolicitudes() public view OnlyHO(msg.sender) returns (address [] memory, string [] memory, string [] memory){
        //emit RevRequest (SolicitudesTrabajadores);
        return (SolicitudesTrabajadores, Nombre, Codigo);  
    }
    
    // Funcion para validar nuevos empleados que puedan autogestionarse -> Unicamente prof. en S. O.
    function ConcederAccesoTrabajador (address _empleado) public OnlyHO(msg.sender) {
        // Asignacion del estado de validez del empleado 
        ValidacionTrabajador[_empleado] = true;
        // Emision del evento 
        emit TrabajadorValidado(_empleado);
    }

    address public DireccionTrabajador = msg.sender;

    // Mapping para relacionar el hash de la persona con los resultados
    mapping (address => ResultadosIN) ResultadosEntradaTrabajo;
    mapping (address => ResultadosOUT) ResultadosSalidaTrabajo;

    // Estructura de los resultados de entrada al trabajo
    struct ResultadosIN {
        string formatJSON;
    }
    // Estructura de los resultados de entrada al trabajo
    struct ResultadosOUT {
        string formatJSON;
    }

    // Eventos
    event EntradaTrabajo (string);
    event SalidaTrabajo (string);

    // modificador para que las funciones solo se activen con un trabajador validado
    modifier OnlyWorker(address _directionT) {
        require (_directionT != DireccionTrabajador, "No tienes permisos para ejecutar esta funcion.");
        _;
    }
    // Funcion para emitir resultados de entrada al tarabajo
    function DatosEntradaTrabajo(string memory formatJSON) public {
        // Relacion del hash de la persona con la estructura de resultados 
        ResultadosEntradaTrabajo[DireccionTrabajador] = ResultadosIN(formatJSON);
        // Emision de un evento 
        emit EntradaTrabajo(formatJSON);
    }

    // Funcion para emitir resultados de salida del trabajo
    function DatosSalidaTrabajo(string memory formatJSON) public OnlyWorker(msg.sender){
        // Relacion del hash de la persona con la estructura de resultados 
        ResultadosSalidaTrabajo[DireccionTrabajador] = ResultadosOUT(formatJSON);
        // Emision de un evento 
        emit SalidaTrabajo(formatJSON);
    }

    // Funcion para visulizar los datos de entrada al trabajo en el SC
    function VerInfoEntradaTrabajo(address _idPersona) public view returns (string memory formatJSON) {
        // Retorno de los parametros necesarios
        formatJSON = ResultadosEntradaTrabajo[_idPersona].formatJSON;
    }
    // Funcion para visulizar los datos de salida del trabajo en el SC
    function VerInfoSalidaTrabajo(address _idPersona) public view returns (string memory formatJSON) {
        // Retorno de los parametros necesarios
        formatJSON = ResultadosSalidaTrabajo[_idPersona].formatJSON;
    }
    
}