class HealthBiz {
    constructor() { }

    stats() {
        return new Promise(async (resolve, reject) => {
            try {

                const result = {data: "APIs Server is running"};

                resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

module.exports = HealthBiz;