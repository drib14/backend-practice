const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    default: 5.00,
  },
  status: {
    type: String,
    default: 'Paid',
  },
  paymentDetails: {
    cardholderName: {
      type: String,
      required: true,
    },
    cardNumberMasked: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      default: 'PayMongo',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
