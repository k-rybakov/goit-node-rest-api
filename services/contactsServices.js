import Contact from '../models/Contact.js';

async function listContacts(ownerId) {
  return await Contact.findAll({
    where: { owner: ownerId }
  });
}

async function getContactById(contactId, ownerId) {
  return await Contact.findOne({
    where: { id: contactId, owner: ownerId }
  });
}

async function removeContact(contactId, ownerId) {
  const contact = await Contact.findOne({
    where: { id: contactId, owner: ownerId }
  });
  if (!contact) return null;
  
  await contact.destroy();
  return contact;
}

async function addContact(name, email, phone, ownerId) {
  return await Contact.create({ name, email, phone, owner: ownerId });
}

async function updateContact(contactId, fields, ownerId) {
  const contact = await Contact.findOne({
    where: { id: contactId, owner: ownerId }
  });
  if (!contact) return null;
  
  await contact.update(fields);
  return contact;
}

async function updateStatusContact(contactId, { favorite }, ownerId) {
  const contact = await Contact.findOne({
    where: { id: contactId, owner: ownerId }
  });
  if (!contact) return null;
  
  await contact.update({ favorite });
  return contact;
}

export { 
  listContacts, 
  getContactById, 
  removeContact, 
  addContact, 
  updateContact,
  updateStatusContact 
};
