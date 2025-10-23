# 🌐 CSTE Energy & Water Management Platform v2

Un'applicazione **full-stack** per la gestione e l’analisi dei consumi energetici e idrici degli edifici.  
Il progetto integra un backend Node.js, un frontend React e script Python per l’estrazione e l’elaborazione dei dati, il tutto containerizzato con Docker.

---

## 📋 Funzionalità principali

- **Autenticazione e autorizzazione** basate su JWT (chiavi RSA).
- **Gestione dei dati energetici e idrici** tramite API REST.
- **Dashboard interattive** per visualizzare i consumi e generare report.
- **Estrazione e analisi di PDF** di fatture tramite script Python.
- **Esportazione dei dati** in formato Excel e PDF.
- **Monitoraggio automatico** con processi dedicati.
- **Frontend moderno** con React, TailwindCSS e Vite.
- **Containerizzazione completa** con Docker e Docker Compose.

---

## 🏗️ Struttura del progetto

![image](https://github.com/user-attachments/assets/acfbf364-1db2-4e4f-af12-0067f832b3b6)

## Descrizione del Progetto

Questa web app consente di monitorare i consumi energetici e idrici, rilevare anomalie, esportare report in formato **Excel** e **PDF** e inviare notifiche email in caso di consumi fuori soglia. Il progetto è composto da un backend basato su **Node.js** e **MongoDB** e un frontend **React**, con gestione dell’autenticazione e delle visualizzazioni tramite grafici.





---

## Tecnologie utilizzate

### Backend

- **Node.js** con Express.js per la gestione delle API.
- **MongoDB** come database per la gestione dei dati utente e dei consumi.
- **Studio3T** per interfacciarsi con MongoDB.
- **JWT (jsonwebtoken)** per la gestione dell’autenticazione.
- **Nodemailer** per l’invio delle notifiche email.
- **ExcelJS** e **PDFKit** per generare i report.

### Frontend

- **React** per la struttura della web app.
- **Redux** e **Context API** per la gestione dello stato.
- **Chart.js** per la visualizzazione dei grafici.
- **Axios** per le richieste API.
- **Tailwind CSS** per lo stile dell’interfaccia.

## Struttura del Progetto

### Documentazione completa dei moduli del progetto (JSDoc)

- **frontend** : Puoi trovare la documentazione dei moduli del frontend nella directory frontend/docs
- **backend** : Puoi trovare la documentazione dei moduli del backend nella directory backend/docs

**Generare la JSDoc**
Puoi generare la documentazione JSDoc con il seguente comando:

```bash
    npx jsdoc -c .\jsdoc.config.json src
```

È necessario farlo sia per il backend che per il frontend, `src` è il percorso dei file da includere nella documentazione.

**Struttura delle cartelle:**
```
├── LICENSE
├── README.md
├── docker-compose.yml
├── package.json
├── package-lock.json
├── backend
│ ├── .env
│ ├── Dockerfile
│ ├── estrazione_fattura.csv
│ ├── jsdoc.config.json
│ ├── keys/
│ │ ├── private.key
│ │ └── public.pem
│ ├── package.json
│ └── src/
│ ├── app.js
│ ├── config/
│ ├── controllers/
│ ├── middlewares/
│ ├── models/
│ ├── python-scripts/
│ ├── routes/
│ ├── services/
│ ├── tasks/
│ ├── test/
│ └── utils/
└── frontend
├── index.html
├── package.json
├── src/
│ ├── components/
│ ├── context/
│ ├── hooks/
│ ├── pages/
│ ├── routes/
│ ├── slices/
│ └── utils/
└── public/
```
## ⚙️ Backend (Node.js + Express)

Il backend gestisce la logica di business, l’autenticazione, la comunicazione con il database e l’esposizione delle API REST.

**Struttura principale:**

- **`src/config/`** → configurazioni server, database, autenticazione, email, chiavi RSA  
- **`src/controllers/`** → logica per le varie risorse (utenti, energia, acqua, PDF, ecc.)  
- **`src/models/`** → schemi dati (es. `userModel.js`, `energyDataModel.js`, ecc.)  
- **`src/services/`** → logica applicativa e funzioni riutilizzabili  
- **`src/routes/`** → definizione endpoint REST  
- **`src/middlewares/`** → autenticazione e controllo ruoli  
- **`src/python-scripts/`** → script Python per estrazione e analisi dei PDF  
- **`src/utils/`** → funzioni di supporto (log, date, costanti, ecc.)  
- **`src/tasks/`** → job schedulati (es. monitoraggio consumi)

---

## 💻 Frontend (React + Vite + TailwindCSS)

Il frontend fornisce un’interfaccia utente dinamica e reattiva per visualizzare, filtrare e gestire i dati energetici.

**Struttura principale:**

- **`src/components/`** → componenti UI riutilizzabili (`common/`, `dashboard/`, `form/`)  
- **`src/context/`** → gestione dello stato globale (filtri, notifiche, ecc.)  
- **`src/hooks/`** → custom hooks React per logiche comuni  
- **`src/pages/`** → pagine principali (Dashboard, Login, Report, ecc.)  
- **`src/routes/`** → definizione del routing protetto (`ProtectedRoute`, `AppRoutes`)  
- **`src/utils/`** → funzioni helper e moduli API per comunicare con il backend  
- **`src/slices/`** → stato utente con Redux Toolkit  
- **`public/`** → asset statici (loghi, immagini)

---

## 🐳 Docker e Deployment

### Esecuzione locale
```bash
docker-compose up --build
```
### Database

Il progetto utilizza un database **MongoDB** per memorizzare i dati dei consumi energetici e idrici le informazioni degli utenti.

**Struttura delle collezioni:**

- `users`: Informazioni sugli utenti (ID, username, email, credenziali, ruolo e token temporaneo per il reset della password).
- `observers`: Dati sugli utenti che hanno scelto di ricevere le notifiche via email riguardo le anomalie.
- `ElectricityProd_v2`: Dati energetici prelevati dai sensori.
- `info_meter`: Dati informativi sugli edifici e gli impianti.
- `logs`: Dati sulle anomalie rilevate dal sistema di monitoraggio (tipologia, data, messaggio).
-  `bills_water`: Dati sui consumi idrici prelevati dalle bollette che l'utente carica nel sistema. 
---

## Installazione e Configurazione

### Prerequisiti

- Node.js (v22 o superiore, potrebbero andare bene anche versioni inferiori)
- MongoDB
- npm
- Browser web
- Chocolatey su Windows/OpenSSL

### Istruzioni per l'Installazione

#### Guida alla creazione delle chiavi per i JWT

Questa guida fornisce le istruzioni per installare **OpenSSL**, generare le chiavi per la firma e verifica dei JWT necessarie per il progetto.

##### 1. Installazione di OpenSSL

Per generare i certificati necessari per il funzionamento dei JWT, è necessario avere **OpenSSL** installato sulla macchina. Segui i passaggi qui sotto per installarlo.

##### Passaggi per Windows:

1. Apri il terminale come **Amministratore**.
2. Esegui il comando per installare **OpenSSL** tramite **Chocolatey**:

   ```bash
   choco install openssl
   ```

##### 2. Generazione delle Chiavi per i JWT

Una volta che OpenSSL è stato installato, puoi generare la chiave privata per firmare i JWT e la chiave pubblica per verificarli.

###### 2.1 Generazione della Chiave Privata

La chiave privata verrà utilizzata per firmare i JWT. Esegui uno dei seguenti comandi nel terminale per generarla.

- Metodo 1: Utilizzare genpkey (Raccomandato)

  ```bash
  openssl genpkey -algorithm RSA -out ./backend/src/config/keys/private.key -pkeyopt rsa_keygen_bits:2048
  ```

- Metodo 2: Utilizzare genrsa
  ```bash
  openssl genrsa -out ./backend/src/config/keys/private.key 1024
  ```
  Entrambi i metodi generano una chiave privata e la salvano nel file private.key nella directory indicata dal parametro out, assicurarsi di fare riferimento alla stessa directory nella configurazione delle variabili d'ambiente `JWT_PRIVATE_KEY_PATH`.

###### 2.2 Generazione della Chiave Pubblica

Una volta che la chiave privata è stata generata, puoi creare la chiave pubblica per la verifica dei JWT. Esegui il seguente comando:

```bash
openssl rsa -in ./backend/src/config/keys/private.key -out ./backend/src/config/keys/public.pem -pubout -outform PEM
```

Questo comando genera la chiave pubblica e la salva nel file public.pem nella directory indicata dal parametro out, assicurarsi di fare riferimento alla stessa directory nella configurazione delle variabili d'ambiente `JWT_PUBLIC_KEY_PATH`.

#### Backend

1. Clona il repository:

   ```bash
   git clone https://github.com/Ylenia1211/CSTE_energy_monitoring_webapp.git
   cd CSTE_energy_monitoring_webapp/backend
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Configura le variabili d'ambiente:
   Crea un file `.env` con i seguenti parametri:

   ```env
   # Configurazione per il JWT (JSON Web Token)
   # Queste variabili sono necessarie per la generazione e la validazione dei token, per la generazione di queste chiavi vedi sopra.
   JWT_PRIVATE_KEY_PATH=./src/config/keys/private.key # Percorso alla chiave privata
   JWT_PUBLIC_KEY_PATH=./src/config/keys/public.pem # Percorso alla chiave pubblica
   JWT_EXPIRES_IN=1h # Durata di validità del token (in ore, minuti, secondi)
   JWT_ALGORITHM=RS256 # Algoritmo di firma per il JWT

   # Configurazione della porta del server backend
   PORT_BACKEND=5555  # Porta sulla quale il server backend ascolta

   # Configurazione per il database MongoDB
   # URL per la connessione a MongoDB (modifica anche 'nome_db' con il nome del tuo database)
   MONGO_URI=mongodb://localhost:27017/nome_db

   # Configurazione CORS (Cross-Origin Resource Sharing)
   # Imposta qui l'URL del frontend, in modo che il backend possa permettere richieste da questa origine
   ALLOWED_ORIGINS=http://localhost:5173 # URL del frontend (modifica se necessario)

   # Configurazione per l'invio di email (per notifiche, reset password, ecc.)
   # Qui inserirai le credenziali del tuo server di posta elettronica (di default Gmail, vedi sotto).
   EMAIL_USER=email@gmail.com # Il tuo indirizzo email (ad esempio Gmail)
   EMAIL_PASS=pass # La tua password o token per l'autenticazione (deve essere una password per app, leggi sotto per configurare Gmail)
   ```

   ##### Attenzione: generazione delle credenziali Gmail per il servizio email

   Per la configurazione delle credenziali per il server email con Gmail fare riferimento a questo link: https://support.google.com/mail/answer/185833?hl=it

   ##### Servizio email differente da Gmail

   Per la configurazione di un servizio di posta differente da Gmail è necessario modificare il file `backend/src/config/emailConfig.js`

   ##### Esempio:

   ```javascript
   const transporter = nodemailer.createTransport({
     service: "Gmail",
     host: "smtp.gmail.com",
     port: 465,
     secure: true, // Connessione sicura
     auth: {
       user: process.env.EMAIL_USER, // Caricato da .env
       pass: process.env.EMAIL_PASS, // Caricato da .env
     },
   });
   ```

4. Avvia il server:

   ```bash
   npm start
   ```

5. Oppure Avvia il server in modalità sviluppo:
   ```bash
   npm run dev
   ```

Il server sarà disponibile sulla porta specificata nel file `.env`, di default sarà: `http://localhost:5555`.

#### Frontend

1. Spostati nella cartella del frontend:
   ```bash
   cd ../frontend
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Configura l'endpoint API:
   Modifica o crea il file `.env` con i parametri necessari:
   In questo caso sarà necessario impostare l'indirizzo del backend
   ```env
   VITE_API_BASE_URL=http://localhost:5555
   ```
4. Avvia il server vite di sviluppo:

   ```bash
   npm run dev
   ```

   L'applicazione sarà disponibile su `http://localhost:5173`.

5. Oppure crea la build da mettere in produzione:

   ```bash
   npm run build
   ```

   Verrà creata la directory `dist` che dovrà essere servita.

6. Verificare che la build sia funzionante:

   ```bash
    npm install -g serve
   ```

   ```bash
    serve -l 5173 dist
   ```

   Questo configurerà un server sulla porta 5173 che servirà la cartella dist

---

## Aggiungere Nuove Funzionalità

### Aggiungere una nuova pagina nel menù di navigazione

1. **Aggiungi la voce nel menù nel file `/components/common/Menu.jsx`**:
   - Per aggiungere un collegamento ad una pagina `newPage`, accessibile da qualsiasi utente:
     ```javascript
     // Elementi per tutti gli utenti
     const menuItems = [
       { to: "/dashboard/home", label: "Home" },
       { to: "/dashboard/edifici", label: "Edifici" },
       { to: "/dashboard/advancedAnalysis", label: "Analisi avanzata" },
       { to: "/dashboard/logs", label: "Cronologia anomalie" },
       { to: "/dashboard/report", label: "Reportistica" },
       { to: "/dashboard/newPage", label: "Nuova Pagina" },
     ];
     ```
   - Per aggiungere un collegamento ad una pagina `newAdminPage`, accessibile solo da utenti amministratori:
     ```javascript
     // Elementi specifici per gli amministratori
     const adminMenuItems = [
       { to: "/dashboard/#bollette", label: "Bollette" },
       { to: "/dashboard/userManagement", label: "Gestione Utenti" },
       { to: "/dashboard/newAdminPage", label: "Nuova Pagina Admin" },
     ];
     ```
2. **Aggiorna il file `routes/AppRoutes.jsx`**:
   Nel file `AppRoutes.jsx`, inserisci la nuova rotta newl router, nella posizione corretta.

   - Utilizzare `ProtectedRoute` per le rotte protette di autenticazione.

   - Utilizzare `AdminProtectedRoute` per le rotte protette da privilegio amministratore

   - Utilizzare `FilterProvider` se è necessario condividere i valori dei filtri su più pannelli

   ```javascript

   import NewPage from "../pages/NewPage";

   const router = createBrowserRouter([
     {
       path: "/newAdminPage",
       element: (
         <ProtectedRoute>
           <AdminProtectedRoute>
             <NewPage />
           <AdminProtectedRoute>
         </ProtectedRoute>
       ),
     },
   ]);
   ```

---

### Aggiungere un nuovo grafico personalizzato

**Crea un nuovo componente nella cartella `/components/dashboard/charts`**:
Aggiungi il nuovo file `newCustomChart.jsx`.

1. Per creare questo file è necessario scegliere uno dei chart di base disponibili o crearne uno nuovo e importarlo nel nuovo componente.

   - BarChar: Grafico a barre
   - TimeSeriesChart: Grafico a linee (Per campi innestati getNestedField), per altri TimeSeries usare `Line`

   ```javascript
   // Grafico a barre
   import {
     BarChart,
     generateChartData,
     getChartOptions,
   } from "./base_chart/BarChart";

   // Grafico TimeSeries
   import {
     TimeSeriesChart,
     generateTimeSeriesData,
   } from "./base_chart/TimeSeriesChart";
   ```

2. Richiamare la funzione fetch che restituisce i dati necessari al grafico e trasformare i dati nel formato corretto.

   ```javascript
   const [chartData, setChartData] = useState(null);

   // Grafico a barre
   const data = await fetchData(
     startDate,
     endDate,
     filters.buildings,
     filters.impianti
   );

   const generatedData = generateChartData(data.labels, data.datasets);
   const chartOptions = getChartOptions("Consumo per edificio e sensori");

   setChartData(generatedData);
   return <BarChart data={chartData} options={chartOptions} />;

   // Grafico TimeSeries
   const rawData = await fetchData(
     fieldName,
     startDate,
     endDate,
     filters.buildings,
     filters.impianti
   );

   const transformedData = generateTimeSeriesData(rawData, fieldName);

   setChartData(transformedData);

   return (
     <TimeSeriesChart
       labels={labels}
       datasets={datasets}
       title={title}
       unit={unit}
     />
   );
   ```

3. Implementare altra logica e filtri come spiegato nella sezione
   `Creazione di un nuovo componente con gestione del filtro temporale`.

---

### Aggiungere un Nuovo Endpoint API

Il processo di creazione di un nuovo endpoint implica la creazione di nuove rotte, controller e, se necessario, modelli e servizi.

#### 1. Creazione della Rotta

Le rotte API sono definite nella cartella `src/routes/`. Ogni file di route rappresenta un gruppo di endpoint correlati. Aggiungeremo una nuova rotta in un file esistente o ne creeremo uno nuovo.

1. Vai alla cartella `src/routes/`.
2. Apri il file appropriato, ad esempio `energyDataRoutes.js` se l'endpoint riguarda i dati energetici.
3. Aggiungi la tua nuova rotta alla lista di rotte esistenti. Ad esempio:

```javascript
const express = require("express");
const energyDataRoutes = express.Router();
const energyDataController = require("../controllers/energyDataController");

//Necessari se si vogliono rotte protette
const authMiddleware = require("../middlewares/authMiddleware");
const isAdminMiddleware = require("../middlewares/isAdminMiddleware");

// Nuova rotta per ottenere i consumi energetici per un edificio
energyDataRoutes.get(
  "/consumi/:buildingId",
  energyDataController.getConsumptionsByBuilding
);

// Esempio rotta con controllo di autenticazione
energyDataRoutes.get(
  "/consumiAutenticato",
  authMiddleware,
  energyDataController.getConsumptionsByBuilding
);

// Esempio rotta con controllo di autenticazione e privilegi admin
energyDataRoutes.get(
  "/consumiAutenticatoAdmin",
  authMiddleware,
  isAdminMiddleware,
  energyDataController.getConsumptionsByBuilding
);

module.exports = energyDataRoutes;
```

4. Aggiungi il nuovo router al file `app.js` se non è già presente.

#### 2. Creazione del Service

I servizi contengono la logica di business, come la gestione delle query al database o l'esecuzione di altre operazioni.

1. Vai alla cartella `src/services/`.
2. Crea un nuovo file o modifica un file esistente per aggiungere la logica.
   Ad esempio, creiamo `energyDataService.js` se non esiste.
3. Aggiungi la logica per il nuovo endpoint:

```javascript
// Import del modello dei dati
const energyDataModel = require("../models/energyDataModel");

const getConsumptionsByBuilding = async (buildingId) => {
  try {
    //Esegue la query mongo e restituisce il risultato al controller
    const consumptions = await energyDataModel.find({ buildingId });
    return consumptions;
  } catch (error) {
    console.error(error);
    throw new Error("Errore nel recupero dei consumi.");
  }
};

// Export della funzione
module.exports = { getConsumptionsByBuilding };
```

#### 3. Creazione del Controller

I controller contengono la logica delle API, ovvero cosa succede quando un utente invia una richiesta a un determinato endpoint.

1. Vai alla cartella `src/controllers/`.
2. Crea un nuovo file o modifica un file esistente per aggiungere la logica per il nuovo endpoint.
   Ad esempio, creiamo `energyDataController.js` se non esiste.
3. Aggiungi la logica per il nuovo endpoint:

```javascript
// Importare il service
const energyDataService = require("../services/energyDataService");

const getConsumptionsByBuilding = async (req, res) => {
  try {
    //Estrarre parametri/query/body dalla richiesta del client
    const buildingId = req.params.buildingId;
    // Richiama il servizio per eseguire la logica di business
    const consumptions = await energyDataService.getConsumptionsByBuilding(
      buildingId
    );
    if (!consumptions) {
      return res
        .status(404)
        .json({ message: "Dati non trovati per questo edificio." });
    }

    //Restituire i dati al client ed eventuali errori
    res.status(200).json(consumptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore interno del server." });
  }
};
// Export della funzione
module.exports = { getConsumptionsByBuilding };
```

#### 4. Creazione del Model (se non esiste già)

Un modello rappresenta la struttura di un documento (o record) in un database MongoDB. Se il nuovo endpoint richiede un nuovo tipo di dati da memorizzare nel database, dovrai creare un modello Mongoose.

1. Vai alla cartella `src/models/`.
2. Crea un nuovo file o modifica (se devono essere aggiunti nuovi campi) un file esistente per aggiungere il modello.
   Ad esempio, creiamo `energyDataModel.js` se non esiste.

```javascript
const mongoose = require("mongoose");

const energyDataSchema = new mongoose.Schema({
  buildingId: { type: String, required: true },
  consumption: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "EnergyData",
  energyDataSchema,
  "Nome_Collection"
);
```

---

### Fetch dei dati dal frontend

1. Crea un nuovo file, ad esempio `datiAPI.js`, nella cartella `utils` oppure lavora su un file già esistente se ne esiste già uno per l'endpoint di base.

2. Importa l'instanza axios pre configurata nel file `api.js`

3. Imposta la costante `BASE_API` con l'endpoint route di base definito nel file `app.js` del backend.

4. Scrivi la funzione di fetch con i parametri, l'endpoint e il metodo corretto (get, post, delete, put) ed esportala

**Esempio datiAPI.js**

```javascript
import axiosInstance from "./api"; // Import dell'istanza preconfigurata di axios

const BASE_API = "/new-resource"; // Endpoint di base, sostituiscilo con quello corretto

// Funzione per ottenere i dati da una risorsa.
export const fetchDati = async (startDate, endDate) => {
  try {
    // Esegui la chiamata GET per ottenere i dati dal server
    const response = await axiosInstance.get(`${BASE_API}/data`, {
      params: {
        startDate,
        endDate,
      },
      withCredentials: true, // Includi credenziali, necessario per includere il cookie JWT
    });
    return response.data; // Restituisce i dati della risposta
  } catch (error) {
    throw new Error("Errore nel recupero dei dati: " + error.message); // Gestione dell'errore
  }
};
```

**Utilizzo nel componente react**

1. Importare la funzione di fetch, assicurandosi che il percorso sia corretto.

```javascript
import { fetchDati } from "./utils/datiAPI";
```

2. Richiamare la funzione di fetch passando i parametri corretti.

```javascript
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch dei dati --> in utils
      const result = await fetchDati(startDate, endDate);
      setData(result);
    } catch (err) {
      setError("Impossibile recuperare i dati.");
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

---

### Creazione di un nuovo componente con gestione del filtro temporale

Per creare un componente che necessita di un filtro su un intervallo temporale (giornaliero, settimanale, mensile o personalizzato), è possibile utilizzare:

- `TimeRangePicker`: un componente UI che gestisce la visualizzazione e selezione del range temporale.
- `useTimeRange`: un custom hook che gestisce lo stato del range temporale (date di inizio e fine, range attivo).

**Validazione delle Date nel Backend**
Le date inviate al backend devono essere validate e convertite nel formato corretto utilizzando la funzione:
`validateDateRange(start, end)`
Questa funzione verifica che le date siano valide e che la data di inizio sia antecedente a quella di fine. Se la validazione è superata, restituisce le date start e end pronte per l'elaborazione; altrimenti lancia un errore.

Un esempio del componente in react è:

```javascript
import React, { useEffect, useState } from "react";
import useTimeRange from "./hooks/useTimeRange";
import TimeRangePicker from "./TimeRangePicker";
import { fetchDati } from "./utils/datiAPI";

const DataPanel = () => {
  const { startDate, endDate, activeRange, handleSelectRange } = useTimeRange(); // Gestione del range temporale
  const [data, setData] = useState([]); // Dati da visualizzare
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch dei dati --> in utils
        const result = await fetchDati(startDate, endDate);
        setData(result);
      } catch (err) {
        setError("Impossibile recuperare i dati.");
      } finally {
        setIsLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  return (
    <div>
      <h2>Data Panel</h2>
      <TimeRangePicker
        onSelectRange={handleSelectRange}
        isLoading={isLoading}
        defaultRange={activeRange}
      />
      {isLoading ? (
        <p>Caricamento dati...</p>
      ) : data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      ) : (
        <p>Nessun dato disponibile.</p>
      )}
    </div>
  );
};

export default DataPanel;
```

Un esempio della gestione nel frontend è:

```javascript
const { validateDateRange } = require("./utils"); // Importa la funzione di validazione

const getData = async (startDate, endDate) => {
  try {
    // Validazione delle date
    const { start, end } = validateDateRange(startDate, endDate);

    // Query MongoDB
    const results = await EventsData.aggregate([
      { $match: { datetime: { $gte: start, $lte: end } } }, // Filtra per datetime nel range
    ]).exec(); // Esegui la query

    /* Elabora i dati se necessario */

    // Restituisce i dati al frontend
    return { startDate, endDate, results };
  } catch (error) {
    return { error: error.message }; // Gestione degli errori
  }
};
```

---

### Aggiungere un Nuovo Tipo Controllo sulle Anomalie

1. **Crea una nuova funzione di controllo delle anomalie**:
   Aggiungi la nuova funzione nel file `anomalyService.js`:
   Esempio:
   ```javascript
   async function checkValue(recentData, averages, checktime) {
     const anomalies = [];
     for (const data of recentData) {
       const key = `${sensor.building}-${sensor.id}`;
       const average = averages[key];
       //Controllo per rilevare se si tratta di un valore anomalo
       if (threshold && data.TotW != null && data.TotW > threshold) {
         //Aggiunta dell'anomalia rilevata, preservare la struttura dei campi `anomalia` per avere coerenza in tutto il codice
         anomalies.push({
           type: "WARN",
           date: sensor.datetime,
           building: sensor.building,
           sensor: sensor.id,
           message: `Messaggio anomalia.`,
         });
       }
     }
     //Restituisci l'array con tutte le anomalie su quel tipo di controllo
     return anomalies;
   }
   ```
2. **Aggiorna il file /tasks/monitorWorker.js**:
   Rileva le anomalie all'interno del file `monitorWorker.js`:
   Esempio:

   ```javascript
   //Richiama la funzione di controllo su quel tipo di valore
   const nuovoTipoDiAnomalia = await checkValue(
     recentData,
     averages,
     checkTime
   ); // Controlla anomalie

   // Aggiungi l'array di anomalie `nuovoTipoDiAnomalia` restituito dalla funzione di controllo, all'array di tutte le anomalie rilevate `allAnomalies`
   const allAnomalies = [
     ...missingSensorAnomalies,
     ...noDataAnomalies,
     ...totWHighAverageAnomalies,
     ...nuovoTipoDiAnomalia,
   ];
   ```

---

Rilascio web app 31/07/2025

---


---
