const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const KIE_BASE = 'https://kie.ai/api/v1';
app.use(cors({origin:'*',methods:['GET','POST','PUT','DELETE','OPTIONS'],allowedHeaders:['*']}));
app.use(express.json({limit:'50mb'}));
app.get('/',(req,res)=>{res.json({status:'OK',message:'Proxy Working!'});});
app.all('/*',async(req,res)=>{
  try{
    const kieUrl=KIE_BASE+req.path;
    console.log(`${req.method} ${kieUrl}`);
    const headers={'Content-Type':'application/json'};
    const auth=req.headers['authorization'];
    if(auth) headers['Authorization']=auth;
    const options={method:req.method,headers:headers};
    if(req.method!=='GET'&&req.method!=='HEAD'){
      options.body=JSON.stringify(req.body);
    }
    const response=await fetch(kieUrl,options);
    const data=await response.text();
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Content-Type','application/json');
    res.status(response.status).send(data);
  }catch(error){
    res.status(500).json({error:error.message});
  }
});
app.listen(PORT,()=>console.log(`Proxy on port ${PORT}`));
