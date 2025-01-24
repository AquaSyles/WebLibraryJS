server = require("./server");

const port = process.env.PORT || 8000;

function startServer () {
    server.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
        console.log(`http://127.0.0.1:${port}`)
    });
};

startServer();