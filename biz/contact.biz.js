const { Contact, sequelize } = require('../models/contact.model');

class ContactBiz {
    constructor() {
        this.primaryContactId = null;
        this.emails = [];
        this.phoneNumbers = [];
        this.secondaryContactIds = [];
    }

    identify(data) {
        return new Promise(async (resolve, reject) => {
            try {

                const { email, phoneNumber } = data;

                //! find all the records with the email and phoneNumber
                const query = `SELECT * FROM Contacts WHERE email = "${email}" OR phoneNumber = "${phoneNumber}" ORDER BY id ASC`;
                const contacts = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

                //! if the contacts array is empty then create a primary contact
                let is_new_data = true;
                if (!contacts.length) {
                    const payload = {
                        email: email,
                        phoneNumber: phoneNumber,
                        linkedId: null,
                        linkPrecedence: "primary"
                    }
                    const newContact = await Contact.create(payload);
                    is_new_data = false;
                    this.primaryContact = newContact.id;
                    this.emails.push(email);
                    this.phoneNumbers.push(phoneNumber);
                }
                else {
                    //! find or create the primary contact 
                    let primaryContact = contacts.find((doc) => doc.linkPrecedence === "primary");
                    if (!primaryContact) {
                        primaryContact = contacts[0];
                        primaryContact.linkPrecedence = 'primary';
                        await Contact.update({ linkPrecedence: 'primary' }, { where: { id: primaryContact.id } });
                    }
                    this.primaryContatctId = primaryContact.id;

                    for (const element of contacts) {
                        if(element.email == email && element.phoneNumber == phoneNumber ) is_new_data = false;
                        if (element.email) this.emails.push(element.email);
                        if (element.phoneNumber) this.phoneNumbers.push(element.phoneNumber);
                        if (element.linkPrecedence === "secondary") this.secondaryContactIds.push(element.id);
                        if (element.linkPrecedence === "primary" && element.id != this.primaryContactId) {
                            //make that element to be secondary
                            element.linkPrecedence = 'secondary';
                            element.linkedId = this.primaryContactId;
                            await Contact.update({ linkPrecedence: 'secondary', linkedId: this.primaryContactId }, { where: { id: element.id } });
                        }
                    }
                }

                if (is_new_data) {
                    const payload = {
                        email: email,
                        phoneNumber: phoneNumber,
                        linkedId: null,
                        linkPrecedence: "secondary"
                    }
                    const newContact = await Contact.create(payload);
                    this.primaryContact = newContact.id;
                    this.emails.push(email);
                    this.phoneNumbers.push(phoneNumber);
                    this.secondaryContactIds.push(newContact.id)
                }

                const result = await this.decorateResponse();
                resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }


    async decorateResponse() {
        const result = {
            contact: {
                primaryContatctId: this.primaryContact,
                emails: this.emails,
                phoneNumbers: this.phoneNumbers,
                secondaryContactIds: this.secondaryContactIds
            }
        }
        return result
    }
}

module.exports = ContactBiz;