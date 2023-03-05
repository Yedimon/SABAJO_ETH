import { Button, Collapse, Checkbox, TimePicker, Divider, Input, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { useFirestore } from "reactfire";
import moment from "moment";

import { Address } from "../components";

const format = "HH:mm";
const workStartFormat = {
  nombre: "",
  codigo: "",
  workStart: true,
  actividades: {
    actividadPrimaria: "",
    actividadSecundaria: "",
    actividadFaltante: "",
  },
  proteccion: {
    guantes: false,
    chaleco: false,
    botas: false,
    casco: false,
    mascara: false,
    gafas: false,
    arnes: false,
  },
  capacitacion: {
    alturas: false,
    electricos: false,
    auxilios: false,
    maquinas: false,
  },
  bienestar: {
    dolorCabeza: false,
    dolorBrazos: false,
    dolorAbdominal: false,
    dolorPiernas: false,
    animo: false,
    familiares: false,
    emociones: false,
  },
  descanso: {
    dormirTimestamp: new Date().getTime(),
    despertarTimestamp: new Date().getTime(),
    cansado: false,
  },
};

const workEndFormat = {
  nombre: "",
  codigo: "",
  workStart: false,
  actividades: {
    cumplio: false,
    falto: "",
  },
  proteccion: {
    uso: false,
    estropeo: false,
  },
  bienestar: {
    dolorCabeza: false,
    dolorBrazos: false,
    dolorAbdominal: false,
    dolorPiernas: false,
    accidente: false,
  },
  descanso: {
    energia: false,
  },
};

export default function WorkerView({ address, mainnetProvider, tx, writeContracts }) {
  const eventsRef = collection(useFirestore(), "events");

  const [workStart, setWorkStart] = useState(true);
  const [formatState, setFormatState] = useState(workStartFormat);

  const handleRequestAccessWorker = async () => {
    const result = tx(writeContracts.HealthOcupational.PedirAcceso(formatState.nombre, formatState.codigo), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  const handleCreateWorkerSC = async () => {
    const result = tx(writeContracts.HealthOcupational.NuevoContratoDiario(), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  const handlePostWorkerData = async () => {
    const result = tx(
      writeContracts.HealthOcupational.DatosEntradaTrabajo("JSON.stringify(formatState).toString()"),
      update => {
        console.log("📡 Transaction Update:", update);
        // if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
        // Firebase upload
        addDoc(eventsRef, {
          timestamp: new Date().getTime(),
          form: formatState,
        });
        // }
      },
    );
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  const allTrue = array => {
    return array.filter(item => item).length === array.length;
  };

  const atleastOneTrue = array => {
    return array.filter(item => item).length > 0;
  };

  const onChangeWorkStart = () => {
    const _workStart = !workStart;
    if (_workStart) setFormatState(workStartFormat);
    else setFormatState(workEndFormat);
    setWorkStart(_workStart);
  };

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Worker</h2>
        <h4>
          Nombre{" "}
          <Input
            onChange={e => setFormatState({ ...formatState, nombre: e.target.value })}
            placeholder="Escribe tu nombre"
          />
        </h4>
        <h4>
          Codigo{" "}
          <Input
            onChange={e => setFormatState({ ...formatState, codigo: e.target.value })}
            placeholder="Escribe tu codigo"
          />
        </h4>
        <Divider />
        <Button onClick={handleRequestAccessWorker}>Solicitar Acceso a la Empresa</Button>
        <br />
        <Button onClick={handleCreateWorkerSC}>Crear Contrato del Trabajador</Button>
        <Divider />
        <div style={{ margin: 8, textAlign: "left" }}>
          <h4 style={{ paddingBottom: 20, display: "flex", justifyContent: "center", gap: 10 }}>
            Jornada de trabajo {" "}
            <Switch
              checked={workStart}
              onChange={onChangeWorkStart}
              checkedChildren="iniciando"
              unCheckedChildren="terminando"
            />
          </h4>
          {/* ACTIVIDADES */}
          <Collapse defaultActiveKey={["1"]}>
            <Collapse.Panel
              header={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Actividades
                </div>
              }
              key="1"
            >
              {workStart ? (
                <>
                  <h4>
                    Actividad Primaria{" "}
                    <Input
                      onChange={e =>
                        setFormatState({
                          ...formatState,
                          actividades: { ...formatState.actividades, actividadPrimaria: e.target.value },
                        })
                      }
                      placeholder="Escribe tu actividad primaria"
                    />
                  </h4>
                  <h4>
                    Actividad Secundaria{" "}
                    <Input
                      onChange={e =>
                        setFormatState({
                          ...formatState,
                          actividades: { ...formatState.actividades, actividadSecundaria: e.target.value },
                        })
                      }
                      placeholder="Escribe tu actividad secundaria"
                    />
                  </h4>
                  <h4>
                    Actividad Faltante{" "}
                    <Input
                      onChange={e =>
                        setFormatState({
                          ...formatState,
                          actividades: { ...formatState.actividades, actividadFaltante: e.target.value },
                        })
                      }
                      placeholder="Escribe tu actividad faltante"
                    />
                  </h4>
                </>
              ) : (
                <>
                  <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Cumplió con todas las actividades?
                    <Checkbox
                      onChange={e =>
                        setFormatState({
                          ...formatState,
                          actividades: { ...formatState.actividades, cumplio: !formatState.actividades.cumplio },
                        })
                      }
                      checked={formatState.actividades.cumplio}
                    />
                  </h4>
                  <h4>
                    ¿Qué actividad faltó por realizar?
                    <Input
                      onChange={e =>
                        setFormatState({
                          ...formatState,
                          actividades: { ...formatState.actividades, falto: e.target.value },
                        })
                      }
                      placeholder="Actividad faltante"
                    />
                  </h4>
                </>
              )}
            </Collapse.Panel>
          </Collapse>

          {/* PROTECCIÓN */}
          <Collapse defaultActiveKey={["1"]}>
            <Collapse.Panel
              header={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Protección
                  <Checkbox
                    checked={allTrue(Object.values(formatState.proteccion))}
                    indeterminate={
                      atleastOneTrue(Object.values(formatState.proteccion)) &&
                      !allTrue(Object.values(formatState.proteccion))
                    }
                    onClick={e => {
                      e.stopPropagation();
                      if (allTrue(Object.values(formatState.proteccion))) {
                        Object.keys(formatState.proteccion).forEach(key => {
                          formatState.proteccion[key] = false;
                        });
                        setFormatState({ ...formatState, proteccion: formatState.proteccion });
                      } else {
                        Object.keys(formatState.proteccion).forEach(key => {
                          formatState.proteccion[key] = true;
                        });
                        setFormatState({ ...formatState, proteccion: formatState.proteccion });
                      }
                    }}
                  ></Checkbox>
                </div>
              }
              key="1"
            >
              {workStart ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa guantes de protección?
                    <Checkbox
                      checked={formatState.proteccion.guantes}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, guantes: !formatState.proteccion.guantes },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa chaleco reflectivo?
                    <Checkbox
                      checked={formatState.proteccion.chaleco}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, chaleco: !formatState.proteccion.chaleco },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa botas inductriales?
                    <Checkbox
                      checked={formatState.proteccion.botas}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, botas: !formatState.proteccion.botas },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa casco de protección?
                    <Checkbox
                      checked={formatState.proteccion.casco}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, casco: !formatState.proteccion.casco },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa máscara facial de protección?
                    <Checkbox
                      checked={formatState.proteccion.mascara}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, mascara: !formatState.proteccion.mascara },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa gafas de protección?
                    <Checkbox
                      checked={formatState.proteccion.gafas}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, gafas: !formatState.proteccion.gafas },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Usa arnés para trabajar en la altura?
                    <Checkbox
                      checked={formatState.proteccion.arnes}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, arnes: !formatState.proteccion.arnes },
                        })
                      }
                    ></Checkbox>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Uso los elementos de protección durante toda la jornada laboral?
                    <Checkbox
                      checked={formatState.proteccion.uso}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, uso: !formatState.proteccion.uso },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Se daño o estropeo algún elemento de seguridad?
                    <Checkbox
                      checked={formatState.proteccion.estropeo}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          proteccion: { ...formatState.proteccion, estropeo: !formatState.proteccion.estropeo },
                        })
                      }
                    ></Checkbox>
                  </div>
                </>
              )}
            </Collapse.Panel>
          </Collapse>

          {/* CAPACITACION */}
          {workStart && (
            <Collapse defaultActiveKey={["1"]}>
              <Collapse.Panel
                header={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Capacitación
                    <Checkbox
                      checked={allTrue(Object.values(formatState.capacitacion))}
                      indeterminate={
                        atleastOneTrue(Object.values(formatState.capacitacion)) &&
                        !allTrue(Object.values(formatState.capacitacion))
                      }
                      onClick={e => {
                        e.stopPropagation();
                        if (allTrue(Object.values(formatState.capacitacion))) {
                          Object.keys(formatState.capacitacion).forEach(key => {
                            formatState.capacitacion[key] = false;
                          });
                          setFormatState({ ...formatState, capacitacion: formatState.capacitacion });
                        } else {
                          Object.keys(formatState.capacitacion).forEach(key => {
                            formatState.capacitacion[key] = true;
                          });
                          setFormatState({ ...formatState, capacitacion: formatState.capacitacion });
                        }
                      }}
                    ></Checkbox>
                  </div>
                }
                key="1"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Capacitación en alturas vigente?
                  <Checkbox
                    checked={formatState.capacitacion.alturas}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        capacitacion: { ...formatState.capacitacion, alturas: !formatState.capacitacion.alturas },
                      })
                    }
                  ></Checkbox>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Capacitación de riesgos eléctricos?
                  <Checkbox
                    checked={formatState.capacitacion.electricos}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        capacitacion: { ...formatState.capacitacion, electricos: !formatState.capacitacion.electricos },
                      })
                    }
                  ></Checkbox>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Capacitación de primeros auxilios y uso del botequín?
                  <Checkbox
                    checked={formatState.capacitacion.auxilios}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        capacitacion: { ...formatState.capacitacion, auxilios: !formatState.capacitacion.auxilios },
                      })
                    }
                  ></Checkbox>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Capacitación para uso de máquinas?
                  <Checkbox
                    checked={formatState.capacitacion.maquinas}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        capacitacion: { ...formatState.capacitacion, maquinas: !formatState.capacitacion.maquinas },
                      })
                    }
                  ></Checkbox>
                </div>
              </Collapse.Panel>
            </Collapse>
          )}

          {/* BIENESTAR */}
          <Collapse defaultActiveKey={["1"]}>
            <Collapse.Panel
              header={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Bienestar Físico y Mental
                  <Checkbox
                    checked={allTrue(Object.values(formatState.bienestar))}
                    indeterminate={
                      atleastOneTrue(Object.values(formatState.bienestar)) &&
                      !allTrue(Object.values(formatState.bienestar))
                    }
                    onClick={e => {
                      e.stopPropagation();
                      if (allTrue(Object.values(formatState.bienestar))) {
                        Object.keys(formatState.bienestar).forEach(key => {
                          formatState.bienestar[key] = false;
                        });
                        setFormatState({ ...formatState, bienestar: formatState.bienestar });
                      } else {
                        Object.keys(formatState.bienestar).forEach(key => {
                          formatState.bienestar[key] = true;
                        });
                        setFormatState({ ...formatState, bienestar: formatState.bienestar });
                      }
                    }}
                  ></Checkbox>
                </div>
              }
              key="1"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                ¿Presenta dolor de cabeza?
                <Checkbox
                  checked={formatState.bienestar.dolorCabeza}
                  onChange={() =>
                    setFormatState({
                      ...formatState,
                      bienestar: { ...formatState.bienestar, dolorCabeza: !formatState.bienestar.dolorCabeza },
                    })
                  }
                ></Checkbox>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                ¿Presenta dolor de brazos?
                <Checkbox
                  checked={formatState.bienestar.dolorBrazos}
                  onChange={() =>
                    setFormatState({
                      ...formatState,
                      bienestar: { ...formatState.bienestar, dolorBrazos: !formatState.bienestar.dolorBrazos },
                    })
                  }
                ></Checkbox>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                ¿Presenta dolor abdominal?
                <Checkbox
                  checked={formatState.bienestar.dolorAbdominal}
                  onChange={() =>
                    setFormatState({
                      ...formatState,
                      bienestar: { ...formatState.bienestar, dolorAbdominal: !formatState.bienestar.dolorAbdominal },
                    })
                  }
                ></Checkbox>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                ¿Presenta dolor de piernas?
                <Checkbox
                  checked={formatState.bienestar.dolorPiernas}
                  onChange={() =>
                    setFormatState({
                      ...formatState,
                      bienestar: { ...formatState.bienestar, dolorPiernas: !formatState.bienestar.dolorPiernas },
                    })
                  }
                ></Checkbox>
              </div>
              {workStart ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Se ha sentido bajo de ánimo o triste los últimos 2 días?
                    <Checkbox
                      checked={formatState.bienestar.animo}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          bienestar: { ...formatState.bienestar, animo: !formatState.bienestar.animo },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Siente que tiene problemas familiares?
                    <Checkbox
                      checked={formatState.bienestar.familiares}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          bienestar: { ...formatState.bienestar, familiares: !formatState.bienestar.familiares },
                        })
                      }
                    ></Checkbox>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Ha sufrido de emocionees fuertes los últimos dos días?
                    <Checkbox
                      checked={formatState.bienestar.emociones}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          bienestar: { ...formatState.bienestar, emociones: !formatState.bienestar.emociones },
                        })
                      }
                    ></Checkbox>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Ocurrió algún accidente?
                  <Checkbox
                    checked={formatState.bienestar.accidente}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        bienestar: { ...formatState.bienestar, emociones: !formatState.bienestar.accidente },
                      })
                    }
                  ></Checkbox>
                </div>
              )}
            </Collapse.Panel>
          </Collapse>

          {/* SUEÑO Y DESCANSO */}
          <Collapse defaultActiveKey={["1"]}>
            <Collapse.Panel
              header={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Sueño y descanso
                </div>
              }
              key="1"
            >
              {/* TODO: Time Picker instead of input */}
              {workStart ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4>Hora de dormir</h4>
                    <TimePicker
                      onChange={e =>
                        setFormatState({ ...formatState, descanso: { ...formatState.descanso, dormirTimestamp: e } })
                      }
                      placeholder="Hora en que fuiste a dormir"
                      defaultValue={moment("22:00", format)}
                      format={format}
                      size="small"
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4>Hora en la que despertó</h4>
                    <TimePicker
                      onChange={e =>
                        setFormatState({ ...formatState, descanso: { ...formatState.descanso, despertarTimestamp: e } })
                      }
                      placeholder="Hora en que despertaste"
                      defaultValue={moment("8:00", format)}
                      format={format}
                      size="small"
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    ¿Se siente cansado?
                    <Checkbox
                      checked={formatState.descanso.cansado}
                      onChange={() =>
                        setFormatState({
                          ...formatState,
                          descanso: { ...formatState.descanso, cansado: !formatState.descanso.cansado },
                        })
                      }
                    ></Checkbox>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  ¿Se sintió con energía durante toda la jornada laboral?
                  <Checkbox
                    checked={formatState.descanso.energia}
                    onChange={() =>
                      setFormatState({
                        ...formatState,
                        descanso: { ...formatState.descanso, energia: !formatState.descanso.energia },
                      })
                    }
                  ></Checkbox>
                </div>
              )}
            </Collapse.Panel>
          </Collapse>

          <Button style={{ marginTop: 8, justifySelf: "end" }} onClick={handlePostWorkerData}>
            Enviar datos
          </Button>
        </div>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
      </div>
    </div>
  );
}
