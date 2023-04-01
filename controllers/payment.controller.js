const Order = require("../models/Order.model");
const shortid = require("shortid");

const { default: fetch } = require("node-fetch");
const moment = require("moment/moment");

function headers(token) {
  var headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  return headers;
}
const authShiprocket = async () => {
  var res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email: process.env.SHIP_ROCKET_EMAIL,
      password: process.env.SHIP_ROCKET_PASS,
    }),
  });
  const json = await res.json();

  return json;
};

const createShiprocketOrder = async (data) => {
  let total_discount = 0;
  let total_length = 0;
  let total_breadth = 0;
  let total_height = 0;
  let total_weight = 0;
  for (product of data.products) {
    product.name = product.product_name;
    product.selling_price = product.price;
    product.sku = product.product_name + product.price;
    product.discount = product.discount_price;
    product.units = product.quantityToBuy;
    product.tax = product.gst;
    total_discount += product.price - product.discount_price;
    total_length += total_length + eval(product.length);
    total_breadth += total_breadth + eval(product.breadth);
    total_height += total_height + eval(product.height);
    total_weight += total_weight + eval(product.weight);
  }
  const { token } = await authShiprocket();
  var res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        order_id: data.order_id,
        // "order_id": "224-447",
        order_date: moment().format("MM/DD/YYYY hh:mm:ss"),
        channel_id: "679824",
        payment_method: "card",
        billing_customer_name: data.billing_address.fullname ?? "Jon",
        billing_last_name: data.billing_address.fullname ?? "Jon",
        billing_email: data.billing_address.email,
        billing_phone: data.billing_address.phoneNumber,
        billing_address: data.billing_address.addressLine1,
        billing_address_2: data.billing_address.addressLine2,
        billing_pincode: data.billing_address.postalCode,
        billing_city: data.billing_address.city,
        billing_state: data.billing_address.state,
        billing_country: data.billing_address.country,
        pickup_location: "Shavez 3",
        payment_method: data.cod == 0 ? "Prepaid" : "COD",
        shipping_is_billing: true,
        order_items: data.products,
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: data.sub_total,
        length: total_length,
        breadth: total_breadth,
        height: total_height,
        weight: total_weight,
      }),
    }
  );
  const json = await res.json();
  console.log("ship rocket order has been created");
  // console.log(json);
  // const order = await ShipRocketOrder({main_order_id:data.order_id,
  //     ...json}).save();
  // await createShipment(json)
  return json;
};
const returnShiprocketOrder = async (data) => {
  let total_discount = 0;
  let total_length = 0;
  let total_breadth = 0;
  let total_height = 0;
  let total_weight = 0;
  for (product of data.products) {
    product.name = product.product_name;
    product.selling_price = product.price;
    product.sku = product.product_name + product.price;
    product.discount = product.discount_price;
    product.units = product.quantityToBuy;
    product.tax = product.gst;
    total_discount += product.price - product.discount_price;
    total_length += total_length + eval(product.length);
    total_breadth += total_breadth + eval(product.breadth);
    total_height += total_height + eval(product.height);
    total_weight += total_weight + eval(product.weight);
  }
  const { token } = await authShiprocket();
  var res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/return",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        order_id: data.order_id,
        // "order_id": "224-447",
        order_date: data.order_date,
        channel_id: "679824",
        shipping_customer_name: data.billing_address.fullname ?? "Jon",
        shipping_last_name: data.billing_address.fullname ?? "Jon",
        shipping_email: data.billing_address.email,
        shipping_phone: data.billing_address.phoneNumber,
        shipping_address: data.billing_address.addressLine1,
        shipping_address_2: data.billing_address.addressLine2,
        shipping_pincode: data.billing_address.postalCode,
        shipping_city: data.billing_address.city,
        shipping_state: data.billing_address.state,
        shipping_country: data.billing_address.country,
        pickup_location: "Shavez 3",
        pickup_customer_name: data.billing_address.fullname ?? "Jon",
        pickup_phone: data.billing_address.phoneNumber,
        pickup_address: data.billing_address.addressLine1,
        pickup_pincode: data.billing_address.postalCode,
        pickup_city: data.billing_address.city,
        pickup_state: data.billing_address.state,
        pickup_country: data.billing_address.country,
        payment_method: data.payment_method,
        order_items: data.products,
        sub_total: data.sub_total,
        length: total_length,
        breadth: total_breadth,
        height: total_height,
        weight: total_weight,
      }),
    }
  );
  const json = await res.json();
  console.log("ship rocket order has been returned");
  console.log(json);
  // const order = await ShipRocketOrder({main_order_id:data.order_id,
  //     ...json}).save();
  // await createShipment(json)
  return json;
};
const getLowestFreightCharge = (available_courier_companies) => {
  let maps = available_courier_companies;
  let lowestCharge = maps[0];
  // Iterate through the rest of the maps in the array
  for (let i = 1; i < maps.length; i++) {
    // Check if the current map has lower freight charges than the current lowestCharge
    if (maps[i].freight_charges < lowestCharge.freight_charges) {
      // If so, update the lowestCharge to be the current map
      lowestCharge = maps[i];
    }
  }
  return lowestCharge;
};

const createOrder = async (data) => {
  let phone = data.billing_address.phoneNumber.replace(/ +/g, "");
  console.log(phone.length > 10);
  if (phone.length > 10) {
    data.billing_address.phoneNumber = parseInt(phone.slice(3));
  }

  let shiprocketOrder = await createShiprocketOrder({
    order_id: shortid(),
    sub_total: data.sub_total,
    products: data.products,
    billing_address: data.billing_address,
    cod: data.cod,
  });
  if (shiprocketOrder.status_code != 1) {
    shiprocketOrder.status = shiprocketOrder.status_code;
    console.log(shiprocketOrder);
    return res.status(200).json(shiprocketOrder);
  }
  const order = await Order({
    isPaid: true,
    user_id: data.user_id,
    amount: data.amount,
    order_id: shiprocketOrder.order_id,
    shipment_id: shiprocketOrder.shipment_id,
    products: data.products,
    billing_address: data.billing_address,
    sub_total: data.sub_total,
    payment_method: (data.cod = 1 ? "COD" : "Prepaid"),
    razorpay: {
      orderId: (data.cod = 1 ? "" : razorpay_order_id),
      paymentId: (data.cod = 1 ? "" : razorpay_payment_id),
      signature: (data.cod = 1 ? "" : razorpay_signature),
    },
  }).save();

  return order;
};
const returnOrder = async (order) => {
  console.log("return orderhitted");
  order.order_date = moment(order.createdAt).format("YYYY-MM-DD");
  console.log(moment(order.createdAt).format("YYYY-MM-DD"));
  // console.log(order);
  let shiprocketOrder = await returnShiprocketOrder(order);
  // if (shiprocketOrder.status_code != 1) {
  //   shiprocketOrder.status = shiprocketOrder.status_code;
  //   console.log(shiprocketOrder);
  //   return res.status(200).json(shiprocketOrder);
  // }

  return shiprocketOrder;
};
const trackShipment = async (data) => {
  const { token } = await authShiprocket();
  var res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/courier/track/shipment/" +
      data.shipment_id,
    {
      headers: headers(token),
      method: "GET",
    }
  );

  const json = await res.json();
  // console.log("ship rocket shipment tracking details");
  // console.log(json);
  return json;
};
module.exports = {
  createShiprocketOrder,
  returnOrder,
  createOrder,
  trackShipment,
  authShiprocket,
  getLowestFreightCharge,
};
