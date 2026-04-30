const uid = localStorage.getItem("uid") || crypto.randomUUID();
localStorage.setItem("uid", uid);

function add(text, cls){
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  document.getElementById("chat").appendChild(d);
}

async function send(){
  const input = document.getElementById("input");
  const text = input.value;
  if(!text) return;

  add(text, "user");

  const res = await fetch("/api/chat", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      uid,
      message:text,
      language:"Spanish"
    })
  });

  const data = await res.json();

  add(data.reply, "ai");
  speak(data.reply);

  input.value="";
}

function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

function voice(){
  const r = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  r.lang="en-US";

  r.onresult = (e)=>{
    document.getElementById("input").value =
      e.results[0][0].transcript;
    send();
  };

  r.start();
}

async function upgrade(){
  const res = await fetch("/api/create-checkout", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({uid})
  });

  const data = await res.json();
  window.location.href = data.url;
}
