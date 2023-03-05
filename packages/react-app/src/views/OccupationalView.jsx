import { Avatar, Button, Card, Divider, Modal } from "antd";
import React, { useState } from "react";
import { collection } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import healthWorkerIcon from "../assets/images/health.png";
import { EyeOutlined } from "@ant-design/icons";

import { Address } from "../components";

export default function OccupationalView({ address, mainnetProvider, tx, writeContracts }) {
  const [requestsList, setRequestsList] = useState([]);
  const [modalWorkerSummaryVisibleStarting, setModalWorkerSummaryVisibleStarting] = useState(false);
  const [modalWorkerSummaryVisibleEnding, setModalWorkerSummaryVisibleEnding] = useState(false);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const eventsRef = collection(useFirestore(), "events");
  const { data, status } = useFirestoreCollectionData(eventsRef);
  const workStartingData = data ? data.filter(({ form }) => form.workStart === true) : [];
  const workEndingData = data ? data.filter(({ form }) => form.workStart === false) : [];

  const handleRegisterOccupational = async () => {
    const result = tx(writeContracts.HealthOcupational.CrearSaludOcupacional(), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  const handleShowRequests = async () => {
    const result = tx(writeContracts.HealthOcupational.ObservarSolicitudes(), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const logresult = await result;
    setRequestsList(logresult);
  };

  const handleWorkerAccessClick = async address => {
    const result = tx(writeContracts.HealthOcupational.ConcederAccesoTrabajador(address), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" Success ");
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const logresult = await result;
    console.log(logresult);
  };

  const getHourString = value => {
    return `${
      parseFloat(parseInt(value) / 100)
        .toFixed(2)
        .toString()
        .split(".")[0]
    }:${
      parseFloat(parseInt(value) / 100)
        .toFixed(2)
        .toString()
        .split(".")[1]
    }`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    console.log("payload", payload); //you check payload
    if (active) {
      return (
        <div>
          <Card>
            <p>{JSON.stringify(payload)} </p>
            <p>Price : ${}</p>
            <p>Sales Rank :${} </p>
          </Card>
        </div>
      );
    }
    return null;
  };

  const renderInfoByCodigoStarting = () => {
    let currentCodigoData = data.filter(
      ({ form }) => form.codigo === modalWorkerSummaryVisibleStarting && form.workStart,
    );

    return (
      <>
        Reporte iniciando jornada laboral
        <Divider />
        <h4>Actividades</h4>
        <h5>Actividades Primarias</h5>
        <ul>
          {currentCodigoData.map(({ form, timestamp }) => (
            <li>
              <b>{new Date(timestamp).toLocaleString()}</b> {form.actividades.actividadPrimaria}
            </li>
          ))}
        </ul>
        <h5>Actividades Secundarias</h5>
        <ul>
          {currentCodigoData.map(({ form, timestamp }) => (
            <li>
              <b>{new Date(timestamp).toLocaleString()}</b> {form.actividades.actividadSecundaria}
            </li>
          ))}
        </ul>
        <h5>Actividades Faltantes</h5>
        <ul>
          {currentCodigoData.map(({ form, timestamp }) => (
            <li>
              <b>{new Date(timestamp).toLocaleString()}</b> {form.actividades.actividadFaltante}
            </li>
          ))}
        </ul>
        <h4>Protección</h4>
        <BarChart
          width={450}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form?.proteccion || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.proteccion[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#28b6ee" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
        <h4>Capacitación</h4>
        <BarChart
          width={450}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form?.capacitacion || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.capacitacion[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#ebbc3b" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
        <h4>Bienestar</h4>
        <BarChart
          width={450}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form?.bienestar || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.bienestar[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#93d161" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
      </>
    );
  };

  const renderInfoByCodigoEnding = () => {
    let currentCodigoData = data.filter(
      ({ form }) => form.codigo === modalWorkerSummaryVisibleEnding && !form.workStart,
    );

    return (
      <>
        Reporte terminando jornada laboral
        <Divider />
        <h4>Actividades</h4>
        <h5>Actividades Faltantes</h5>
        <ul>
          {currentCodigoData.map(({ form, timestamp }) => (
            <li>
              <b>{new Date(timestamp).toLocaleString()}</b> {form.actividades.falto}
            </li>
          ))}
        </ul>
        <h4>Protección</h4>
        <BarChart
          width={450}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form?.proteccion || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.proteccion[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#28b6ee" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
        <h4>Bienestar</h4>
        <BarChart
          width={450}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form?.bienestar || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.bienestar[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#93d161" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
        <h4>Descanso</h4>
        <BarChart
          width={480}
          height={200}
          data={[
            ...Object.keys(currentCodigoData[0]?.form.descanso || {}).map(item => ({
              name: `${item}`,
              value: currentCodigoData?.filter(({ timestamp, form }) => form?.descanso[item]).length,
            })),
          ]}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <YAxis dataKey="value" />
          <XAxis dataKey="name" />
          <Tooltip />
          <CartesianGrid stroke="#e4e4e4" />
          <Bar fill="#ebbc3b" type="monotone" dataKey="value" yAxisId={0} />
        </BarChart>
      </>
    );
  };

  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <Modal
        title={`Datos del trabajador '${modalWorkerSummaryVisibleStarting}' Iniciando Jornada`}
        centered
        motion={null}
        visible={modalWorkerSummaryVisibleStarting !== false}
        onOk={() => setModalWorkerSummaryVisibleStarting(false)}
        onCancel={() => setModalWorkerSummaryVisibleStarting(false)}
      >
        {renderInfoByCodigoStarting()}
      </Modal>

      <Modal
        title={`Datos del trabajador '${modalWorkerSummaryVisibleEnding}' Terminando Jornada`}
        centered
        motion={null}
        visible={modalWorkerSummaryVisibleEnding !== false}
        onOk={() => setModalWorkerSummaryVisibleEnding(false)}
        onCancel={() => setModalWorkerSummaryVisibleEnding(false)}
      >
        {renderInfoByCodigoEnding()}
      </Modal>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}>
        <h2>Salud Ocupacional</h2>
        <Button onClick={handleRegisterOccupational}>Registrarse blockchain</Button>
        <Button onClick={handleShowRequests}>Mostrar Requests de workers</Button>
        <div>
          {requestsList &&
            requestsList?.length > 0 &&
            requestsList[0].map((request, idx) => (
              <div>
                {`${requestsList[1][idx]}_${requestsList[2][idx]}`}{" "}
                <Button onClick={() => handleWorkerAccessClick(request)}>Accept</Button>
              </div>
            ))}
        </div>
        <Divider />
        Dirección:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <h2>Resumen por Tópico</h2>
        <Divider />
        <h3>Iniciando Jornada</h3>
        <p>Número de trabajadores por elementos de Protección, Capacitación y Bienestar. </p>
        <div style={{ display: "flex", gridGap: 10 }}>
          <div>
            <h3>Protección</h3>
            {/* Counts the number of formats using chaleco */}
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workStartingData[0]?.form.proteccion || {}).map(item => ({
                  name: `${item}`,
                  value: workStartingData?.filter(({ timestamp, form }) => form?.proteccion[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#28b6ee" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>

          <br />
          <div>
            <h3>Capacitación</h3>
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workStartingData[0]?.form.capacitacion || {}).map(item => ({
                  name: `${item}`,
                  value: workStartingData?.filter(({ timestamp, form }) => form?.capacitacion[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#ebbc3b" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            <h3>Bienestar</h3>
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workStartingData[0]?.form.bienestar || {}).map(item => ({
                  name: `${item}`,
                  value: workStartingData?.filter(({ timestamp, form }) => form?.bienestar[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#93d161" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>

          <div>
            <h4>Descanso (horario)</h4>
            <LineChart
              width={500}
              height={200}
              data={workStartingData.map(({ form, timestamp }, index) => ({
                timestamp: index,
                dormir:
                  new Date(parseInt(form.descanso.dormirTimestamp)).getHours() * 100 +
                  new Date(parseInt(form.descanso.dormirTimestamp)).getMinutes(),
                despertar:
                  new Date(parseInt(form.descanso.despertarTimestamp)).getHours() * 100 +
                  new Date(parseInt(form.descanso.despertarTimestamp)).getMinutes(),
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis tickFormatter={(value, index) => getHourString(value)} />
              <XAxis dataKey="timestamp" />
              <Tooltip
                // labelFormatter={<CustomTooltip/>}
                labelFormatter={label => `Empleado ${label}`}
                formatter={(value, name, props) => [getHourString(value), `Hora de ${name}`]}
              />
              <CartesianGrid stroke="#e4e4e4" />
              <Line stroke="#ee8828" type="monotone" dataKey="despertar" yAxisId={0} />
              <Line stroke="#4c28ee" type="monotone" dataKey="dormir" yAxisId={0} />
            </LineChart>
          </div>
        </div>
        <Divider />
        <h3>Terminando Jornada</h3>
        <p>Número de trabajadores por elementos de Protección, Capacitación y Bienestar. </p>
        <div style={{ display: "flex", gridGap: 10 }}>
          <div>
            <h3>Protección</h3>
            {/* Counts the number of formats using chaleco */}
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workEndingData[0]?.form.proteccion || {}).map(item => ({
                  name: `${item}`,
                  value: workEndingData?.filter(({ timestamp, form }) => form?.proteccion[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#28b6ee" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>

          <div>
            <h3>Bienestar</h3>
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workEndingData[0]?.form.bienestar || {}).map(item => ({
                  name: `${item}`,
                  value: workEndingData?.filter(({ timestamp, form }) => form?.bienestar[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#93d161" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            <h3>Descanso</h3>
            <BarChart
              width={480}
              height={200}
              data={[
                ...Object.keys(workEndingData[0]?.form.descanso || {}).map(item => ({
                  name: `${item}`,
                  value: workEndingData?.filter(({ timestamp, form }) => form?.descanso[item]).length,
                })),
              ]}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <YAxis dataKey="value" />
              <XAxis dataKey="name" />
              <Tooltip />
              <CartesianGrid stroke="#e4e4e4" />
              <Bar fill="#ebbc3b" type="monotone" dataKey="value" yAxisId={0} />
            </BarChart>
          </div>
        </div>
        <h3>Resumen por Trabajador</h3>
        <Divider />
        <h4>Iniciando Jornada</h4>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 10, overflow: "scroll" }}>
          {workStartingData
            .filter((value, index, self) => {
              return self.findIndex(v => v.form.codigo === value.form.codigo) === index;
            })
            .map(({ form }) => (
              <Card
                style={{ marginTop: 16 }}
                actions={[<EyeOutlined key="view" />]}
                onClick={() => setModalWorkerSummaryVisibleStarting(form.codigo)}
              >
                <Card.Meta
                  style={{ width: 200 }}
                  avatar={<Avatar src={healthWorkerIcon} />}
                  title={`Código ${form.codigo}`}
                  description={`${form.nombre}`}
                />
              </Card>
            ))}
        </div>
        <Divider />
        <h4>Terminando Jornada</h4>
        <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 10, overflow: "scroll" }}>
          {workEndingData
            .filter((value, index, self) => {
              return self.findIndex(v => v.form.codigo === value.form.codigo) === index;
            })
            .map(({ form }) => (
              <Card
                style={{ marginTop: 16 }}
                actions={[<EyeOutlined key="view" />]}
                onClick={() => setModalWorkerSummaryVisibleEnding(form.codigo)}
              >
                <Card.Meta
                  style={{ width: 200 }}
                  avatar={<Avatar src={healthWorkerIcon} />}
                  title={`Código ${form.codigo}`}
                  description={`${form.nombre}`}
                />
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
