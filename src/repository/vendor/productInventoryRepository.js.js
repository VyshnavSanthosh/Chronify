import Product from "../../models/vendor/productSchema.js";
export default class ProductInventoryRepository {
    async reserveStock(products) {        
        for (const product of products) {
            let qty = Number(product.qty);
            const updated = await Product.findOneAndUpdate(
                {
                    _id: product.id,
                    variants: {
                        $elemMatch: {
                            sku: product.sku,
                            quantity: { $gte: qty }
                        }
                    }
                },
                {
                    $inc: { "variants.$.quantity": -qty }
                },
                { new: true }
            );

            if (!updated) {
                throw new Error(`Insufficient stock for SKU: ${product.sku}`)
            }
        }
    }
    async releaseStock(products) {

        try {
            for (const product of products) {
                let qty = Number(product.qty);
                const updated = await Product.findOneAndUpdate(
                    {
                        _id: product.id,
                        "variants.sku": product.sku,
                    },
                    { $inc: { "variants.$.quantity": qty } },
                    { new: true }

                )
                if (!updated) {
                    throw new Error(`Couldn't update stock for SKU: ${product.sku}`,)
                }
            }
        } catch (error) {
            console.log(error)

        }

    }

    async deductStock(products) {
        const results = []
        for (const product of products) {
            let qty = Number(product.qty);
            const updated = await Product.findOneAndUpdate(
                {
                    _id: product.id,
                    "variants.sku": product.sku,
                    "variants.quantity": { $gte: qty }
                },
                { $inc: { "variants.$.quantity": -qty } },
                { new: true }

            )
            if (!updated) {
                throw new Error(`Insufficient stock for SKU: ${product.sku}`)
            }

            results.push(updated)
        }
        return results
    }
}