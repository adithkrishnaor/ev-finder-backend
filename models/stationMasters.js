const mongoose = require('mongoose');

const stationMasterSchema = new mongoose.Schema({
    "fullName": { 
        type: String, 
        required: true 
    },
  "email": { 
    type: String, 
    required: true, 
    unique: true 
},
"password": { 
    type: String, 
    required: true 
},
  
  "phoneNumber": { 
    type: Number, 
    required: true },
  "address": { 
    type: String, 
    required: true },
  "companyName": { 
    type: String, 
    required: true },
  "role": { 
    type: String, 
    default: 'stationMaster' },
  "createdAt": { type: Date, 
    default: Date.now },
  "updatedAt": { type: Date, 
    default: Date.now }
});

var stationMasterModel = mongoose.model("StationMasters",stationMasterSchema)
module.exports = stationMasterModel