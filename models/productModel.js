const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true
    },
    modelNumber: { 
        type: String, 
        required: true, 
        unique: true
    },

    picture: { 
        type: String
    },

    stock: { 
        type: Number, 
        required: true
    },

    status: { 
        type: String, 
        required: true, 
        enum: ["In Stock", "Low Stock", "Out of Stock"],
        //default: "Out of Stock"
    },

    description: { 
        type: String 
    },

    price: { 
        type: String
    },

    category: { 
        type: String, 
        required: true,
        enum: ["Electronics", "Bakery, Catering and Kitchen Equipments", "Hotel"]
    },

    supplier: { 
        type: String, 
        required: true,
        enum: ["Fouani Nig Ltd", "Somotex Nig Ltd", "Guangzhou Wei Ge Machinery China"]
        
    },

    createdBy : { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'user' 
    },


    createdAt: { 
        type: Date,
        default: Date.now() 
    } 

},  {timestamps: true}
)


ProductSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model( 'product', ProductSchema);
module.exports = ProductModel;