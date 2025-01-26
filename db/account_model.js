Orm = require('./controller');

class AccountController extends Orm {
    constructor(table) {
        super(table);
        this.createTable({'id': ['INT', 'PRIMARY KEY', 'AUTO_INCREMENT'],
                            'username': ['VARCHAR(32)', 'NOT NULL', 'UNIQUE'],
                            'password': ['VARCHAR(64)', 'NOT NULL']});

    }
};

const accountController = new AccountController('account');

module.exports = accountController;