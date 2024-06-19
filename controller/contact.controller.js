const ContactBiz = require('../biz/contact.biz');
const Validator = require("jsonschema").Validator;
class ContactController {
    register(app) {
        app.route('/identify')
            .post(async (request, response, next) => {
                try {

                    const data = {...request.body}
                    const RequestValidator = new Validator();
                    const schema = {
                        "type": "object",
                        "properties": {
                            "email": { "type": ["string", "null"], "format": "email" },
                            "phoneNumber": { "type": ["number", "null"], "minimum": 1000000000, "maximum": 9999999999 }
                        },
                        "required": ["email", "phoneNumber"]
                    };

                    const validation = RequestValidator.validate(data, schema);

                    if (!validation.valid) {
                        throw new Error(`Schema Error: ${validation.errors}`);
                    }

                    const contactBiz = new ContactBiz();
                    const result = await contactBiz.identify(data);

                    response.json(result);
                    
                } catch (error) {
                    next(error);
                }
            });
    }
}
module.exports = ContactController;
