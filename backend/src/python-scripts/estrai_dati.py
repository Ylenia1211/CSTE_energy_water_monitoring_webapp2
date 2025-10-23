import sys
import pdfplumber
import fitz  # PyMuPDF
import re
import pandas as pd
import json

def estrai_totale_da_pdf(percorso_pdf):
    doc = fitz.open(percorso_pdf)
    testo_completo = ""
    for pagina in doc:
        testo_completo += pagina.get_text()

    match = re.search(r"totale fattura.*?([\d.,]+)", testo_completo, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

def estrai_indirizzo_fornitura_preciso(pdf_path):
    chiavi = ["indirizzo di fornitura", "erogati presso"]
    parole_fine = ["totale", "importo", "fattura", "pagare", "€"]

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            testo = page.extract_text()
            if not testo:
                continue
            righe = testo.split("\n")
            for i, riga in enumerate(righe):
                riga_lower = riga.lower()
                for chiave in chiavi:
                    if chiave in riga_lower:
                        if i + 1 < len(righe):
                            possibile_valore = righe[i + 1].strip()
                            for parola in parole_fine:
                                index = possibile_valore.lower().find(parola)
                                if index != -1:
                                    possibile_valore = possibile_valore[:index]
                            return possibile_valore.strip()
    return None

def estrai_tabella_lettura(pdf_path):
    tutte_letture = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            for table in tables:
                for i, row in enumerate(table):
                    if row and any("lettura" in str(cell).lower() for cell in row if cell):
                        intestazione = [cell.strip().lower() if cell else "" for cell in row]
                        for riga_dati in table[i + 1:]:
                            if any(riga_dati):
                                tutte_letture.append(dict(zip(intestazione, riga_dati)))
                        break
    return pd.DataFrame(tutte_letture)

def main():
    if len(sys.argv) < 2:
        print("Usage: python estrai_dati.py path_to_pdf", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]

    
    # Estrazioni
    totale = estrai_totale_da_pdf(pdf_path)
    indirizzo = estrai_indirizzo_fornitura_preciso(pdf_path)
    df_letture = estrai_tabella_lettura(pdf_path)

    # Uniforma e completa il DataFrame
    df_letture["indirizzo"] = indirizzo
    df_letture["totale"] = totale

    # Riordina le colonne se esistono
    colonne_finali = ["indirizzo", "totale", "data", "contatore", "lettura", "consumo", "tipo lettura"]
    #print(df_letture.columns)
    # Rinomina flessibile (es. gestisce anche spazi o newline)
    # Rinomina colonne "sporche"
    df_letture.rename(columns={
        'matricola\ncontatore': 'contatore',
        'cons.': 'consumo'
    }, inplace=True)
    #print(df_letture)
    colonne_presenti = [col for col in colonne_finali if col in df_letture.columns]
    df_letture = df_letture[colonne_presenti]

    # Mostra risultato
    df_letture = df_letture[:2]

    #df_letture.to_csv("estrazione_fattura.csv", index=False)
    # Serializza come JSON per inviarlo al frontend
    output = {
        "totale": totale,
        "indirizzo": indirizzo,
        "letture": df_letture.to_dict(orient="records")
    }

    print(json.dumps(output, ensure_ascii=False))

if __name__ == "__main__":
    main()
