import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_KEY)
    )
  });
}

const db = admin.firestore();

export default async function handler(req,res){
  const event = req.body;

  if(event.type === "checkout.session.completed"){
    const uid = event.data.object.metadata.uid;

    await db.collection("users").doc(uid).set({
      premium:true
    },{merge:true});
  }

  res.json({ok:true});
}
