import fetchFromSheets from "../fetch/fetchFromSheets.js";

import formatMediaSheet from "../util/sheet.js";
export { formatMediaSheet };

class BaseModel {
    confirmConfig(configFields, entityField) {
        // Checks if a field was passed as a field with custom configs, like 'split' or 'bool'.
        return (configFields && Array.isArray(configFields) && configFields.includes(entityField));
    }

    constructor(
        object = {}, 
        fields = [], 
        config = {split: undefined, bool: undefined}
        ) {

        const splitFields = config['split'];
        const boolFields = config['bool'];
        // The order of 'sheet' fields is important. Defines the sequence of collected data from table.
        
        fields.forEach((field) => {
            const isSplit = this.confirmConfig(splitFields, field);
            const isBool = this.confirmConfig(boolFields, field);

            let value = object[field];
            if (value) {
                if (isSplit) value = this.splitData(value);
                if (isBool) value = this.validateBool(value);
                this[field] = value;
            }
        });
    }

    // Converts the instance to json object
    toJson() {
        return { ...this };
    }

    static fromRow(row = [], fields = [], config = {}) {
        const newObj = {}
        fields.forEach((field, i) => {
            const value = i < row.length? row[i] : undefined;
            if (value) newObj[field] = value;
        });
        return new this(newObj, fields, config);
    }

    static fromRows(rows = [], fields = [], config = {}) {
        return rows.map((row) => this.fromRow(row, fields, config));
    }

    static fromCombinedRows(rows = [], fields = [], config = {joinAt: []}, ...listsToCombine) {
        // Use the "joinAt" prop. of config to set how many fields should be combined.

        // Accepts only array
        if (listsToCombine.find((elm) => !Array.isArray(elm))){
            throw("Error: 'listsToCombine' hasn't only arrays.");
        }
        
        let list = 0;
        fields.forEach((field, i) => {
            if (config.joinAt.includes(field)) {
                console.log('Combining: ' + field + '/' + i)
                rows.forEach((row, rx) => row[i] = listsToCombine[list][rx]);
                list++;
            }
        });

        console.log(rows)

        return this.fromRows(rows, fields, config);
    }

    // Get the data from the google sheets
    static async fromSheet(sheetID = "", sheets = []) {
        return await fetchFromSheets(sheetID, sheets);
    }

    //  ========================
    //  Validation
    //  =======================

    // Separates a data string in ',' and ';'
    splitData(dataStr = '') {
        return dataStr.replaceAll(';',',').split(',').map((v) => v.trim());
    }

    // Validates a bool value
    validateBool(value = '') {
        return (
            value.toString().toLowerCase().trim() === 'sim'  || 
            value.toString().toLowerCase().trim() === '1'    ||
            value.toString().toLowerCase().trim() === 'true' ||
            value === true  ||
            value === 1     
        );
    }

    //  ========================
    //  Util
    //  ========================


}

export default BaseModel;