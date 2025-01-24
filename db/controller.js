mysql = require("mysql2");

DATABASE_HOST = process.env.DATABASE_HOST
DATABASE_USER = process.env.DATABASE_USER
DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
DATABASE_NAME = process.env.DATABASE_NAME

class DatabaseController {
    constructor() {
        this.database = mysql.createConnection({
            host: DATABASE_HOST,
            user: DATABASE_USER,
            password: DATABASE_PASSWORD,
            database: DATABASE_NAME
        })

        this.database.connect();
    }

    async delete(tableName, filter) {
        let query = `DELETE FROM ${tableName} ${this.#formatWhere(filter)}`

        return new Promise((resolve) => {
            this.database.query(query, (err) => {
            if (err) {
                console.log("Error:", err.sqlMessage);
                resolve(0);
            }

            else {
                resolve(1);
            }
            });
        });
    }

    async update(tableName, row, filter) {
        let [columns, values] = this.#formatSqlRow(row);
        columns = columns.split(', ');

        let query = `UPDATE ${tableName} SET `;
        let counter = 1;
        const end = columns.length;
        for (let i = 0; i < columns.length; i++) {
            query += columns[i] + ' = ' + values[i];
            if (counter !== end) {
                query += ', ';
            }
            counter++;
        }

        query += ' ' + this.#formatWhere(filter);

        return new Promise((resolve) => {
            this.database.query(query, (err, results) => {
                if (err) {
                    console.log(err.sqlMessage);
                    resolve(0);
                }

                else {
                    resolve(1);
                }
            });
        });

    }

    async select(tableName, selector=['*'], filter=null, customQuery=null) {
        let query;
        if (customQuery) {
            query = customQuery;
        }
        else {
            query = `SELECT ${selector} FROM ${tableName}`;
            if (filter) {
                const where = this.#formatWhere(filter);
                query += ' ' + where;
            }
        }

        return new Promise((resolve) => {
            this.database.query(query, (err, results) => {
                if (err) {
                    console.log(err.sqlMessage);
                    resolve(0);
                }

                else if (results.length === 0) {
                    resolve(0);
                }

                else {
                    resolve(results);
                }
            });
        });
    }

    async insert(tableName, row) {
        const [columns, values] = this.#formatSqlRow(row);
        const valueMarkers = this.#getValueMarkers(values);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${valueMarkers})`;
        return new Promise((resolve) => {
            this.database.query(query, values, (err, results) => {
                if (err) {
                    console.log(err.sqlMessage);
                    resolve(0);
                }
                
                else {
                    resolve(1);
                }
            });
        });
    }

    createTable(tableName, columns) {
        const parsedColumns = this.#columnParser(columns);
        let query = `CREATE TABLE IF NOT EXISTS ${tableName} (${parsedColumns})`

        this.database.query(query);
    }

    #formatWhere(filter) {
        let where = "WHERE ";
        const filterObj = Object.entries(filter);

        let counter = 1;
        const end = filterObj.length;
        for (const column of filterObj) {
            let columnName = column[0];
            const columnValue = column[1];

            if (columnName.endsWith('<') || columnName.endsWith('>') || columnName.endsWith('~') || columnName.endsWith('=')){
                const operator = ' ' + columnName.charAt(columnName.length - 1) + ' ';
                columnName = columnName.slice(0, -1);

                if (operator == ' ~ ') {
                    where += columnName + ' like ' + '"' + columnValue + '"';
                }

                else {
                    where += columnName + operator + columnValue;
                }
            }
            
            else {
                where += columnName + ' = ' + columnValue;
            }
            
            if (counter !== end) {
                where += ' AND ';
            }
            counter++;
        }
        return where;
    }

    #formatSqlRow(row) {
        let columns = "";
        let values = [];

        let counter = 1;
        let end = Object.entries(row).length;
        for (const [column, columnValue] of Object.entries(row)) {
            columns += column;
            values.push(columnValue);

            if (counter !== end) {
                columns += ', ';
            }

            counter++;
        }

        return [columns, values];
    }

    #getValueMarkers(values) {
        let valueMarkers = "";

        let counter = 1;
        let end = values.length;
        for (const value of values) {
            valueMarkers += '?';

            if (counter !== end) {
                valueMarkers += ', ';
            }

            counter++;
        }

        return valueMarkers;
    }

    #columnParser(columns) {
        let parsedColumns = "";

        const columnsObject = Object.entries(columns);

        let keyCounter = 1;
        const keyEnd = columnsObject.length;
        for (const [key, values] of columnsObject) {
            parsedColumns += key + ' ';

            let counter = 1;
            let end = values.length;
            for (const value of values) {
                parsedColumns += value;

                if (keyCounter !== keyEnd) {
                    parsedColumns += counter == end ? ', ' : '';
                }

                if (counter !== end) {
                    parsedColumns += ' ';
                }

                counter++;
            }
            keyCounter++;
        }

        return parsedColumns;
    }

    // create table
    // select
    // insert
    // delete
    // update
};

//databaseController = new DatabaseController(DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME);
const databaseController = new DatabaseController();

module.exports = databaseController;