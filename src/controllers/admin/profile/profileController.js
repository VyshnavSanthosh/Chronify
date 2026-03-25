export default class ProfileController {
    constructor(profileService) {
        this.profileService = profileService
    }

    async renderProfilePage(req,res){
        try {
            const {email} = req.user 
            const user = await this.profileService.findUser(email)            
            
            return res.render("admin/profile/profile",{
                user
            })
        } catch (error) {
            console.log("Couldn't load profile page")
            
        }
    }
}