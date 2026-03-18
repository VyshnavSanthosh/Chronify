import jwtServiceFile from "../service/jwtService.js";
import userRepositoryFile from "../repository/user.js";
import loginServiceFile from "../service/user/auth/loginService.js";
import BaseJwtMiddleware from "./baseJwt.js";
const jwtService = new jwtServiceFile();
const userRepository = new userRepositoryFile();
const loginService = new loginServiceFile(userRepository, jwtService);
export default class UserJwtMiddleware extends BaseJwtMiddleware{
    constructor(){
        super(
            jwtService,
            userRepository,
            loginService,
            "userAccessToken",
            "userRefreshToken",
            "/auth/login",
            "customer",
            "Account blocked. Contact support."
        )
    }

}


