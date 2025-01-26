mysql = require("mysql2");

DATABASE_HOST = process.env.DATABASE_HOST
DATABASE_USER = process.env.DATABASE_USER
DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
DATABASE_NAME = process.env.DATABASE_NAME

class QueryObject {
    constructor(query, database, values = []) {
        this.query = query;
        this.queryValues = values;
        this.database = database;
        this.conditional = false;
    }

    queryWrapper() {
        return new Promise((resolve) => {
            this.database.query(this.query, this.queryValues, (error, result) => {
                if (error) {
                    console.log(error.sqlMessage)
                    resolve(0);
                }
                resolve(result);
            });
        });
    }

    result() {
        //console.log(this.query, this.queryValues);
        return this.queryWrapper()
        .then(result => {
            //console.log("Affected Rows:", result.affectedRows, "Insert ID:", result.insertId);
            return result.length || result.affectedRows || result.insertId ? 1 : 0;
        })
    }

    all() {
        return new Promise((resolve) => {
            this.database.query(this.query, this.queryValues, (error, results) => {
                if (error) {
                    console.log(error.sqlMessage)
                    resolve([]);
                }
                resolve(results);
            });
        });
    }

    one() {
        return new Promise((resolve) => {
            console.log(this.query, this.queryValues);
            this.database.query(this.query, this.queryValues, (error, results) => {
                if (error) {
                    console.log(error.sqlMessage)
                    resolve([]);
                }
                resolve(results[0]);
            });
        });
    }

    where(column, operator, value) {
        this.query = this.conditional ? this.query : this.query + ' WHERE'; // Only adds WHERE if no conditions are before it
        this.query += ` ${column} ${operator} ?`;
        value = isNaN(value) ? value : parseInt(value); // if value is a number it's converted to an integer
        this.queryValues.push(value);
        return this;
    }

    and() {
        this.query += ' AND';
        this.conditional = true;
        return this;
    }

    or() {
        this.query += ' OR';
        this.conditional = true;
        return this;
    }
}

class Orm {
    constructor(table) {
        this.table = table;

        this.database = mysql.createConnection({
            host: DATABASE_HOST,
            user: DATABASE_USER,
            password: DATABASE_PASSWORD,
            database: DATABASE_NAME
        })

        this.database.connect();
    }

    select(...selectors) { // Query Result: select ??, ?? from ??(TABLE)
        let selectorMarks = selectors.length === 0 ? ['*'] : selectors.map(() => '??').join(', '); // generates ?? for the selectors and joins the array for when adding to the query

        selectors.push(this.table) // doing this after generating the marks due to adding it manually in the query below

        let query = `SELECT ${selectorMarks} FROM ??`;

        return new QueryObject(query, this.database, selectors);
    }

    delete() { // Query Result: DELETE FROM ??(TABLE)
        let query = `DELETE FROM ??`

        return new QueryObject(query, this.database, [this.table]);
    }

    update(row) { // Query Result: UPDATE ??(TABLE) SET ??=?, ??=?
        let rowArray = [];
        let rowArrayMarkers = []

        for (const columnValue of Object.entries(row)) {
            let key = columnValue[0];
            let value = isNaN(columnValue[1]) ? columnValue[1] : parseInt(columnValue[1]);
            rowArray.push(key, value); // if value is a number it's converted to an integer, and if it's a string we add ''
            rowArrayMarkers.push('??' + ' = ' + '?');
        }
        rowArray.unshift(this.table)

        rowArrayMarkers = rowArrayMarkers.join(', '); // makes it look nicer

        let query = `UPDATE ?? SET ${rowArrayMarkers}`;
        return new QueryObject(query, this.database, rowArray);
    }

    insert(row) { // Query Result: INSERT INTO ??(TABLE) (??, ??) VALUES (?, ?)
        let columnValues = [];

        let columnMarkers = [];
        let valueMarkers = [];

        for (const column of Object.keys(row)) {
            columnValues.push(column);
            columnMarkers.push('??');
        }

        for (const value of Object.values(row)) {
            columnValues.push(isNaN(value) ? value : parseInt(value)); // if value is a number it's converted to an integer, and if it's a string we add ''
            valueMarkers.push('?');
        }
        columnValues.unshift(this.table)

        columnMarkers = columnMarkers.join(', '); // makes it look nicer
        valueMarkers = valueMarkers.join(', ');

        let query = `INSERT INTO ?? (${columnMarkers}) VALUES (${valueMarkers})`;

        return new QueryObject(query, this.database, columnValues);
    }

    createTable(columns) { // CREATE TABLE IF NOT EXISTS ??(TABLE) (COLUMN VALUES CONTRAINTS...)
        let parsedColumns = '';
        Object.entries(columns).forEach(([column, value], index) => {
            if (index !== 0) {parsedColumns += ', '};
            parsedColumns += column + ' ' + value.join(' ');
        })

        let query = `CREATE TABLE IF NOT EXISTS ?? (${parsedColumns})`

        this.database.query(query, [this.table]);
    }
};

module.exports = Orm;