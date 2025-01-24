databaseController = require('./controller');

class AccountController {
    constructor() {
        this.name = 'account'
        this.databaseController = databaseController;

        this.#createTable({'id': ['INT', 'PRIMARY KEY', 'AUTO_INCREMENT'],
                            'username': ['VARCHAR(32)', 'NOT NULL', 'UNIQUE'],
                            'password': ['VARCHAR(64)', 'NOT NULL']});
    }

    delete(filter) { // async
        return this.databaseController.delete(this.name, filter)
        .then((result) => {
            return result;
        });
    }   

    update(row, filter) { // async
        return this.databaseController.update(this.name, row, filter)
        .then((result) => {
            return result;
        });
    }

    select(selector, filter) { // async
        return this.databaseController.select(this.name, selector, filter)
        .then((result) => {
            return result;
        });
    }
    
    insert(row) { // async
        return this.databaseController.insert(this.name, row)
        .then((result) => {
            return result;
        })
    }



    #createTable(columns) {
        this.databaseController.createTable(this.name, columns);
    }
};

const accountController = new AccountController();

module.exports = accountController;