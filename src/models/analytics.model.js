import mongoose from "mongoose";
import { Url } from "./url.model.js";

// Define the Analystic schema
const analysticSchema = new mongoose.Schema({
    url: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: Url, 
        required: true 
    },
    totalClicks: {
        type: Number,
        default: 0
    },
    uniqueUsers: {
        type: Array,
        default: [] ,
        required : true
    },
    clickByDate: [{
        date: {
            type: Date 
        },
        clicks: {
            type: Number,
            default: 0 
        }
    }],
    osType: [{
        osName: {
            type: String
        },
        uniqueClick: {
            type: Number,
            default: 0
        },
        uniqueUsers: {
            type: Array,
            default: [] ,
            required : true
        }
    }],
    deviceType: [{
        deviceName: {
            type: String
        },
        uniqueClick: {
            type: Number,
            default: 0
        },
        uniqueUsers: {
            type: Array,
            default: [] ,
        }
    }]
}, { timestamps: true });

// Export the Analystic model
export const Analystic = mongoose.model("Analystic", analysticSchema);
