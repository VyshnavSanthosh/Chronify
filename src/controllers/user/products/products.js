export default class UserProductController {
    constructor(userProductService, wishListService) {
        this.userProductService = userProductService;
        this.wishListService = wishListService;
    }

    async renderUserProductListPage(req, res) {
        try {
            const search = req.query.search || "";
            const category = req.query.category || "All";
            const brand = req.query.brand || "All";
            const page = Number(req.query.page) || 1;
            const sort = req.query.sort || "";

            const { products, totalProducts } =
                await this.userProductService.getUserProducts(
                    search,
                    category,
                    brand,
                    page,
                    sort
                );

            const categories = await this.userProductService.getAllCategories();
            const brands = await this.userProductService.getAllBrands();

            let wishlistProductIds = [];
            if (req.user) {
                const { wishlist } = await this.wishListService.getAllItems(req.user._id);
                wishlistProductIds = wishlist.map(item => item.productId._id.toString());
            }

            return res.status(200).render("user/products/allProductsList", {
                products,
                totalProducts,
                categories,
                brands,
                page,
                search,
                category,
                brand,
                sort,
                userName: req.user ? req.user.name : "Guest",
                userRole: "User",
                wishlistProductIds,
                blocked: req.query.blocked === "true"
            });
        } catch (error) {
            console.log("Couldn't render user product list page", error);
            return res.status(500).send("Internal Server Error");
        }
    }
}
