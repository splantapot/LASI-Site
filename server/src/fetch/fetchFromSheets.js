import { google } from "googleapis";
import { WEB_REQUEST_TIMEOUT } from "../../config.js";

// Direct download link
// https://docs.google.com/uc?export=download&id=

// Demo Query

const GOOGLE_CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const GOOGLE_AUTH = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function fetchFromSheets(sheetID = "", sheetsToRead = []) {
    // SheetID: ID to the sheet file
    // SheetsToRead: List of str with the name of the sheets to read
    const SHEETS = google.sheets({ version: "v4", auth: GOOGLE_AUTH });
    const processedData = [];

    try {
        const response = await SHEETS.spreadsheets.get({
            spreadsheetId: sheetID,
            ranges: sheetsToRead,
            // includeGridData: true,
            // fields: "sheets.properties(title,gridProperties)"
            // fields: "sheets.data(rowData(values(formattedValue,hyperlink,chipRuns(chip(richLinkProperties)))))"
            fields: "sheets.data(rowData(values(formattedValue,hyperlink,chipRuns(chip(richLinkProperties)))))"
        }, { timeout: WEB_REQUEST_TIMEOUT });

        // API (simplificated): 
        // sheets -> data_blocks [for multiple reads] -> rows -> cells

        const sheets = response.data?.sheets || [];
        sheets.forEach((sheet, sh_ix) => {
            processedData.push([]); // Adds a new sheet in response list

            const dataGroups = sheet?.data || [];
            dataGroups.forEach((dataGroup) => {
                const rows = dataGroup?.rowData || [];
                rows.forEach((row, row_ix) => {                    
                    const row_value = [];
                    const cells = row?.values || [];
                    cells.forEach((cell) => {
                        const cellValue = (cell.chipRuns)?
                            cell.chipRuns[0].chip.richLinkProperties.uri  :
                            cell.formattedValue
                        row_value.push(cellValue);
                    });

                    processedData[sh_ix].push(row_value);
                });
            });
        });

    } catch (err) {
        console.error("Erro ao ler a planilha:", err);
    } finally {
        return processedData;
    }
}

export default fetchFromSheets;