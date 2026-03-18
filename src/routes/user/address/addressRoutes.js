import express from "express";
const router = express.Router()

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
import validator from "../../../utils/validators/validator.js";
import joi_address from "../../../utils/validators/joi_address.js";
// Controllers
import addressControllerFile from "../../../controllers/user/address/addressControler.js";

// Service
import addressServiceFile from "../../../service/user/address/addressService.js";
// Repository
import addressRepositoryFile from "../../../repository/user/addressRepository.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";

// Dependency Injection
const addressRepository = new addressRepositoryFile()
const addressService = new addressServiceFile(addressRepository)
const userJwtMiddleware = new userJwtMiddlewareFile();
const addressControler = new addressControllerFile(validator, joi_address, addressService);

// Routes
router.route("/address/add")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.renderAddAddressPage.bind(addressControler))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.handleAddAddress.bind(addressControler))

router.route("/address")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.renderAddressPage.bind(addressControler))

router.route("/address/edit/:id")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.renderEditAddressPage.bind(addressControler))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.handleEditAddress.bind(addressControler))

router.route("/address/delete/:id")
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), addressControler.handleDeleteAddress.bind(addressControler))

export default router;