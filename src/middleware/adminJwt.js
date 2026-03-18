import jwtServiceFile from "../service/jwtService.js";
import userRepositoryFile from "../repository/user.js";
import loginServiceFile from "../service/admin/auth/loginService.js";
import BaseJwtMiddleware from "./baseJwt.js";
const jwtService = new jwtServiceFile();
const userRepository = new userRepositoryFile();
const loginService = new loginServiceFile(jwtService, userRepository);
export default class AdminJwtMiddleware extends BaseJwtMiddleware {
    constructor() {
        super(
            jwtService,
            userRepository,
            loginService,
            "adminAccessToken",
            "adminRefreshToken",
            "/admin/auth/login",
            "admin",
            "Account blocked. Contact support."
        )
    }

}


