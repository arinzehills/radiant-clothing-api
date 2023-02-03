const ShipRocketOrder = require("../models/shiprocket_order.model");

const { default: fetch } = require("node-fetch");
const moment = require("moment/moment");

 function headers (token) {
    
    var headers= {
        "Content-Type": "application/json",
        "Authorization":`Bearer ${token}`, 
      }
    return headers
}
const authShiprocket=async ()=>{
    var res= await  fetch('https://apiv2.shiprocket.in/v1/external/auth/login',{
       headers: {
         "Content-Type": "application/json",
       },
       method: "POST",
       body:JSON.stringify({
         "email":  process.env.SHIP_ROCKET_EMAIL,
         "password":  process.env.SHIP_ROCKET_PASS
       })})
         const json = await res.json();
         
         return json;
   }

const createShiprocketOrder=async (data)=>{
    console.log('data bef0re order')
    console.log(data)
  let total_discount=0;
   for(product of  data.products){
    product.name=product.product_name
    product.selling_price=product.price
    product.sku=product.product_name+product.price
    product.discount=product.discount_price
    product.units=product.discount_price
    product.tax=product.gst
    total_discount += (product.price-product.discount_price)
  
    
    }
  
    const {token}=await authShiprocket()
    var res= await  fetch('https://apiv2.shiprocket.in/v1/external/shipments/create/forward-shipment',{
      headers: {
        "Content-Type": "application/json",
        "Authorization":`Bearer ${token}`, 
      },
      method: "POST",
      body:JSON.stringify({
        "order_id": data.order_id ,
        // "order_id": "224-447",
        "order_date": moment().format("MM/DD/YYYY hh:mm:ss"),
        "channel_id": "",
        "payment_method":"card",
        "billing_customer_name": data.billing_address.fullname,
        "billing_last_name": data.billing_address.fullname,
        "billing_email": data.billing_address.email,
        "billing_phone": data.billing_address.phoneNumber,
        "billing_address": data.billing_address.addressLine1,
        "billing_address_2": data.billing_address.addressLine2,
        "billing_pincode": data.billing_address.postalCode,
        "billing_city": data.billing_address.city,
        "billing_state": data.billing_address.state,
        "billing_country": data.billing_address.country,
        "pickup_location": "Primary",
        "shipping_is_billing": true,
        "order_items":data.products,
        "shipping_charges": 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": total_discount,
        "sub_total": data.sub_total,
        "length": 10,
        "breadth": 15,
        "height": 20,
        "weight": 2.5
      })})
        const json = await res.json();
        console.log('ship rocket order has been created')
        console.log(json)
        const order = await ShipRocketOrder({main_order_id:data.order_id,
            ...json}).save();
        // await createShipment(json)
        return json;
  }
const returnShipment=async (data)=>{
    const {token}=await authShiprocket()
    var res= await  fetch('https://apiv2.shiprocket.in/v1/external/shipments/create/return-shipment',{
        headers: headers(token),
        method: "POST",
        body:JSON.stringify(data)   
    })

   const json = await res.json();
        console.log('ship rocket shipment has been created')
        console.log(json)
}
const getShipment=async (data)=>{
    const {token}=await authShiprocket()
    var res= await  fetch('https://apiv2.shiprocket.in/v1/external/shipments'+data.shipment_id,{
        headers: headers(token),
    })

   const json = await res.json();
        console.log('ship rocket shipment has been retrived')
        console.log(json)
}
const trackShipment=async (data)=>{
    const {token}=await authShiprocket()
    var res= await  fetch('https://apiv2.shiprocket.in/v1/external/courier/track/shipment/'+data.shipment_id,{
        headers: headers(token),
        method: "GET",
    })

   const json = await res.json();
        console.log('ship rocket shipment tracking details')
        console.log(json)
        return json
}
  module.exports = { createShiprocketOrder,returnShipment,getShipment,trackShipment, authShiprocket };