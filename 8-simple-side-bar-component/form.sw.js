self.addEventListener("fetch",(e=>{"/api/endpoint1"===new URL(e.request.url).pathname&&e.respondWith(async function(e){await new Promise((e=>setTimeout(e,2e3)));let s=null;["POST","PUT","PATCH"].includes(e.method)&&(s=await e.clone().json().catch((()=>null)));let a=null;switch(e.method){case"GET":a={message:"Mock GET response"};break;case"POST":a={message:"Mock POST response",data:s};break;case"PUT":a={message:"Mock PUT response",data:s};break;case"PATCH":a={message:"Mock PATCH response",data:s};break;case"DELETE":a={message:"Mock DELETE response"};break;default:return new Response("Method Not Allowed",{status:405})}return new Response(JSON.stringify(a),{headers:{"Content-Type":"application/json"},status:200})}(e.request))})),te;
