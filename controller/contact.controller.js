const ContactBiz = require('../biz/contact.biz');
const Validator = require("jsonschema").Validator;
class ContactController {
    register(app) {
        app.route('/identify')
            .post(async (request, response, next) => {
                try {
                    const RequestValidator = new Validator();
                    const schema = {
                        "type": "object",
                        "properties": {
                            "email": { "type": "string", "format": "email" },
                            "phoneNumber": { "type": "number", "minimum": 1000000000, "maximum": 9999999999 }
                        },
                        "required": ["email", "phoneNumber"]
                    };

                    const validation = RequestValidator.validate(request.body, schema);

                    if (!validation.valid) {
                        throw new Error(`Schema Error: ${validation.errors}`);
                    }

                    const contactBiz = new ContactBiz();
                    const result = await contactBiz.identify(request.body);

                    response.json(result);
                    
                } catch (error) {
                    next(error);
                }
            });
    }
}
module.exports = ContactController;
