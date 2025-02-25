const Joi = require("joi")

const validatingProductCreated = async function (req, res, next){
    const requestBody = req.body;
    const schema = Joi.object({
        title: Joi.string().required().min(5).max(100),
        description: Joi.string().required().min(10).max(250),
        body: Joi.string().required().min(50),
        author: Joi.string().required(),
        tags: Joi.array()
                .items(Joi.string().min(2).max(30))
                .max(10)
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