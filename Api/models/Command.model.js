const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Command = new Schema({
    comment: {
        type: String,
    },
    priceLivraison: {
        type: String,
        required: false,
    },
    optionLivraison: {
        type: String,
        required: false,
        enum: ['behind_the_door', 'on_the_door', 'out'],
    },
    appartement: {
        type: String,
        required: false,
        default: 'néant',
    },
    codeAppartement: {
        type: String,
        required: false,
        default: 'néant',
    },
    etage: {
        type: Number,
        required: false,
    },
    relatedUser: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    code: {
        type: Number,
        required: true,
    },
    customer: {
        name: String,
        email: String,
        address: String,
        phoneNumber: String,
    },
    commandType: {
        type: String,
        required: true,
        enum: ['delivery', 'on_site', 'takeaway'],
    },
    shippingAddress: {
        type: String,
    },
    shippingTime: {
        type: Number,
    },
    shipAsSoonAsPossible: {
        type: Boolean,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    payed: {
        status: {
            type: Boolean,
            default: false,
        },
        paymentIntentId: String,
        paymentChargeId: String,
    },
    validated: {
        type: Boolean,
        default: false,
    },
    paiementLivraison: {
        type: Boolean,
        default: false,
    },
    revoked: {
        type: Boolean,
        default: false,
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
    },
    menus: [{
        quantity: Number,
        item: { type: Schema.Types.ObjectId, ref: 'Menu' },
        comment: String,
        foods: [{
            food: {
                type: Schema.Types.ObjectId,
                ref: 'Food',
            },
            options: [{
                title: String,
                maxOptions: Number,
                items: [{
                    item: { type: Schema.Types.ObjectId, ref: 'Accompaniment' },
                    quantity: Number,
                }, ],
            }, ],
        }, ],
    }, ],
    items: [{
        quantity: Number,
        item: { type: Schema.Types.ObjectId, ref: 'Food' },
        comment: String,
        options: [{
            title: String,
            maxOptions: Number,
            items: [{
                item: { type: Schema.Types.ObjectId, ref: 'Accompaniment' },
                quantity: Number,
            }, ],
        }, ],
    }, ],
    priceless: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: {
        updatedAt: 'updatedAt',
    },
}, );

module.exports = mongoose.model('Command', Command);