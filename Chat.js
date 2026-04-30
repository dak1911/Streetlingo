import OpenAI from "openai";
import admin from "firebase-admin";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_KEY)
    )
  });
}

const db = admin.firestore();

export default async function handler(req,res){
  const { uid, message, language } = req.body;

  if(!uid) return res.status(401).json({error:"No UID"});

  const ref = db.collection("users").doc(uid);
  const doc = await ref.get();

  let user = doc.exists ? doc.data() : {
    xp:0,
    level:1,
    premium:false,
    mistakes:[]
  };

  if(!user.premium && user.xp > 200){
    return res.json({reply:"Upgrade to Pro to continue learning."});
  }

  const prompt = `
You are an AI language tutor.
Be strict but helpful.
Correct mistakes.
Language: ${language}
User level: ${user.level}
`;

  const ai = await client.chat.completions.create({
    model:"gpt-4o-mini",
    messages:[
      {role:"system",content:prompt},
      {role:"user",content:message}
    ]
  });

  const reply = ai.choices[0].message.content;

  user.xp += 10;
  user.level = Math.floor(user.xp/100)+1;

  await ref.set(user,{merge:true});

  res.json({reply,user});
}
