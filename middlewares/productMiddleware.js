const Joi = require("joi")

const validatingProductCreated = async function (req, res, next){
    const requestBody = req.body;
    const schema = Joi.object({
        name: Joi.string().required().min(5).max(100),
        modelNumber: Joi.string().required().min(4).max(15),
        picture: Joi.string(),
        stock: Joi.number().required(),
        status: Joi.string().required(),
        description: Joi.string().required().min(10).max(250),
        price: Joi.string(),
        category: Joi.string().required(),
        supplier: Joi.string().required()
    })

    const valid = await schema.validate(requestBody)
    if (valid.error){
        res.status(422).json({
            message: valid.error.message
        }) 
    }

    next()
}

module.exports = {
    validatingProductCreated
}