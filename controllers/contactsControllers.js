import * as contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res) => {
  try {
    const { id: ownerId } = req.user;
    const contacts = await contactsService.listContacts(ownerId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOneContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const contact = await contactsService.getContactById(id, ownerId);

    if (!contact) {
      throw HttpError(404, "Not found");
    }

    res.json(contact);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const contact = await contactsService.removeContact(id, ownerId);

    if (!contact) {
      throw HttpError(404, "Not found");
    }

    res.json(contact);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { name, email, phone } = req.body;
    const { id: ownerId } = req.user;
    const contact = await contactsService.addContact(name, email, phone, ownerId);

    res.status(201).json(contact);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;

    if (!req.body || Object.keys(req.body).length === 0) {
      throw HttpError(400, "Body must have at least one field");
    }

    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const contact = await contactsService.updateContact(id, req.body, ownerId);

    if (!contact) {
      throw HttpError(404, "Not found");
    }

    res.json(contact);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateStatusContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    const { id: ownerId } = req.user;

    if (favorite === undefined) {
      throw HttpError(400, "Missing field favorite");
    }

    const contact = await contactsService.updateStatusContact(id, { favorite }, ownerId);
    
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    
    res.json(contact);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
