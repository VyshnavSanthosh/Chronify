// this creates an interface between controller and joi , instead of tightly coupling toi to controller (dependency inversion)

module.exports = { 
    validate(schema, data) {
        return schema.validate(data, { abortEarly: false });
    }
};