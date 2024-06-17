const HealthBiz = require('../biz/health.biz');
class HealthController {

    register(app) {

        app.route('/init')

            .get(async (request, response, next) => {

                try {

                    const healthBiz = new HealthBiz();

                    const result = await healthBiz.stats();

                    response.json({
                        result,
                    });
                } catch (error) {
                    next(error);
                }
            });
    }
}
module.exports = HealthController;