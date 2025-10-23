import React from "react";
import DashboardPanel from "../components/common/DashboardPanel";
import EnergyConsumption from "../components/dashboard/EnergyComsuption";
import BuildingEnergyConsumption from "../components/dashboard/BuildingEnergyConsumption";
import AlertNotifications from "../components/dashboard/AlertNotifications";
import Footer from "../components/common/Footer";
import WaterConsumptionByBuilding from "../components/dashboard/WaterConsumptionByBuilding";
import WaterConsumptionOverTime from "../components/dashboard/WaterConsumptionOverTime";

function Home() {
  return (
    <>
      {/* Grid con altezza minima pari all'intera viewport meno il footer */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-60px)]">
        {/* Colonna principale: 4/5 */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Pannelli compatti affiancati sopra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
            <DashboardPanel
              title="Consumi Energetici Totali (Periodo) -  Fasce orarie miste / prezzo spot
~0,12 €/kWh"
              bgClass="bg-yellow-100 border-yellow-300"
            >
              <EnergyConsumption />
            </DashboardPanel>

            <DashboardPanel
              title="Consumi Idrico Totali (Periodo)"
              bgClass="bg-blue-100 border-blue-300"
            >
              <WaterConsumptionOverTime />
            </DashboardPanel>
          </div>

          {/* Pannelli compatti affiancati sotto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DashboardPanel
              title="Consumi energetici totali per edificio - Fasce orarie miste / prezzo spot
~0,12 €/kWh"
              bgClass="bg-yellow-100 border-yellow-300"
            >
              <BuildingEnergyConsumption />
            </DashboardPanel>

            <DashboardPanel
              title="Andamento Consumi Idrico per edificio"
              bgClass="bg-blue-100 border-blue-300"
            >
              <WaterConsumptionByBuilding />
            </DashboardPanel>
          </div>
        </div>

        {/* Colonna alert: 1/5, allungata verticalmente */}
        <div className="lg:col-span-1 h-full">
          <DashboardPanel
            title="Alert Sensori Energia"
            bgClass="bg-red-200 border-red-300"
            className="h-full flex flex-col"
          >
            <div className="flex-grow overflow-y-auto">
              <AlertNotifications />
            </div>
          </DashboardPanel>
        </div>
      </div>

      <Footer minimal={true} />
    </>
  );
}

export default Home;