import jwtServiceFile from "../service/jwtService.js";
import vendorRepositoryFile from "../repository/vendor.js";
import loginServiceFile from "../service/vendor/auth/loginService.js";
import BaseJwtMiddleware from "./baseJwt.js";
const jwtService = new jwtServiceFile();
const vendorRepository = new vendorRepositoryFile();
const loginService = new loginServiceFile(vendorRepository, jwtService);
export default class UserJwtMiddleware extends BaseJwtMiddleware{
    constructor(){
        super(
            jwtService,
            vendorRepository,
            loginService,
            "vendorAccessToken",
            "vendorRefreshToken",
            "/vendor/auth/login",
            "vendor",
            "Account blocked. Contact support."
        )
    }

}


