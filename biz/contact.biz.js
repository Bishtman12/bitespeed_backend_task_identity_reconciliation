const { Contact, sequelize } = require('../models/contact.model');

class ContactBiz {

    identify(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let request_email = data?.email ?? null;
                let request_phone = data?.phoneNumber ? String(data.phoneNumber) : null;

                //! find all the records with the email and phoneNumber
                const query = `SELECT * FROM Contacts WHERE (email = ${request_email ? `'${request_email}'` : 'NULL'} OR phoneNumber = ${request_phone ? `'${request_phone}'` : 'NULL'}) ORDER BY id ASC`;
                const contacts = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

                let primaryContactId;
                let emails = [];
                let phoneNumbers = [];
                let secondaryContactIds = [];

                if (contacts.length == 0) {
                    const payload = {
                        email: request_email,
                        phoneNumber: request_phone,
                        linkPrecedence: "primary"
                    }
                    const only_contact = await Contact.create(payload);
                    primaryContactId = only_contact.id
                    if (request_email) emails.push(request_email);
                    if (request_phone) phoneNumbers.push(request_phone);
                }

                else {
                    // find the primary contact first if no primary then make the first to be primary and make the first only to be primary 
                    let primary_contact;
                    let is_new_data = true;
                    for (const element of contacts) {
                        if (element.linkPrecedence === "primary") {
                            primary_contact = element;
                            break
                        }
                    }
                    if (!primary_contact) {
                        primary_contact = contacts[0];
                        await Contact.update({ linkPrecedence: 'primary' }, { where: { id: primary_contact.id } });
                    }
                    primaryContactId = primary_contact.id

                    // Update the primary contacts to secondary if they exist and push it in the response
                    for (const element of contacts) {

                        if (element.email == request_email && element.phoneNumber == request_phone) is_new_data = false;
                        if (element.email && !emails.includes(element.email)) emails.push(element.email);
                        if (element.phoneNumber && !phoneNumbers.includes(element.phoneNumber)) phoneNumbers.push(element.phoneNumber);
                        if (element.linkPrecedence === "secondary" && !secondaryContactIds.includes(element.id)) secondaryContactIds.push(element.id);
                        if (element.linkPrecedence === "primary" && element.id != primaryContactId) {
                            //make that element to be secondary
                            element.linkPrecedence = 'secondary';
                            element.linkedId = primaryContactId;
                            await Contact.update({ linkPrecedence: 'secondary', linkedId: primaryContactId }, { where: { id: element.id } });
                        }
                    }

                    if (is_new_data) {
                        const payload = {
                            email: request_email,
                            phoneNumber: request_phone,
                            linkPrecedence: "secondary"
                        }
                        const new_contact = await Contact.create(payload);
                        primaryContactId = new_contact.id
                        if (element.email && !emails.includes(element.email)) emails.push(element.email);
                        if (element.phoneNumber && !phoneNumbers.includes(element.phoneNumber)) phoneNumbers.push(element.phoneNumber);
                        secondaryContactIds.push(new_contact.id)
                    }
                }
                
                resolve({
                    contact: {
                        primaryContactId,
                        emails,
                        phoneNumbers,
                        secondaryContactIds
                    }
                });
            }
            catch (error) {
                return reject(error);
            }
        });
    }
}

module.exports = ContactBiz;