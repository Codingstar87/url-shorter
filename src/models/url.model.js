import mongoose from "mongoose";


const shortUrlSchema = new mongoose.Schema({
    longUrl: { 
        type: String, 
        required: true 
    },
    shortUrl: { 
        type: String, 
        required : true,
        unique: true 
    },
    alias : {
        type : String ,
        unique : true ,
        required : true 
    },
    customAlias: { 
        type: String 
    },
    topic: { 
        type: String 
    },
    createdAt: { type: Date, default: Date.now }
  },{
    timestamps : true ,
  }
);

export  const Url = mongoose.model('Url', shortUrlSchema);
  