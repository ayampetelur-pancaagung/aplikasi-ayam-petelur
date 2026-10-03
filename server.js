const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname,'data');
const DATA_FILE = path.join(DATA_DIR,'data.json');
fs.mkdirSync(DATA_DIR,{recursive:true});

function hash(pw){return crypto.createHash('sha256').update(String(pw)).digest('hex');}
function makeId(){return crypto.randomBytes(12).toString('hex');}
function load(){
  if(!fs.existsSync(DATA_FILE)){
    const adminUser=process.env.ADMIN_USER||'admin';
    const adminPassword=process.env.ADMIN_PASSWORD||'ubahpassword';
    const d={users:[{id:makeId(),username:adminUser,name:'Administrator',role:'admin',passwordHash:hash(adminPassword)}],pop:[0],productions:[],sales:[],expenses:[],sessions:{}};
    fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2)); return d;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
}
let db=load();
function save(){fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2));}
function publicUser(u){return {id:u.id,username:u.username,name:u.name,role:u.role};}
function auth(req,res,next){
  const token=req.headers.authorization?.replace(/^Bearer\s+/,'')||req.cookies?.sid;
  const uid=token&&db.sessions[token];
  const u=uid&&db.users.find(x=>x.id===uid);
  if(!u)return res.status(401).json({error:'Silakan login.'});
  req.user=u; next();
}
function admin(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Akses admin diperlukan.'});next();}
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{res.setHeader('Cache-Control','no-store');next()});
app.post('/api/login',(req,res)=>{
  const {username,password}=req.body||{}; const u=db.users.find(x=>x.username===username);
  if(!u||u.passwordHash!==hash(password))return res.status(401).json({error:'Username atau password salah.'});
  const token=crypto.randomBytes(24).toString('hex'); db.sessions[token]=u.id; save();
  res.json({token,user:publicUser(u)});
});
app.post('/api/logout',auth,(req,res)=>{const token=req.headers.authorization?.replace(/^Bearer\s+/,''); if(token){delete db.sessions[token];save();} res.json({ok:true});});
app.get('/api/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));
app.get('/api/data',auth,(req,res)=>{
  const own=id=>req.user.role==='admin'||id===req.user.id;
  res.json({pop:db.pop,productions:db.productions.filter(x=>own(x.userId)),sales:db.sales.filter(x=>own(x.userId)),expenses:db.expenses.filter(x=>own(x.userId))});
});
app.post('/api/pop',auth,(req,res)=>{db.pop=[+(req.body[0]||0),+(req.body[1]||0),+(req.body[2]||0)];save();res.json({ok:true});});
for(const [route,key] of [['/api/production','productions'],['/api/sale','sales'],['/api/expense','expenses']]){
 app.post(route,auth,(req,res)=>{const item={...req.body,id:makeId(),userId:req.user.id,createdAt:new Date().toISOString()};db[key].push(item);save();res.json(item);});
}
app.delete('/api/:type/:id',auth,(req,res)=>{
 const map={production:'productions',sale:'sales',expense:'expenses'}; const key=map[req.params.type]; if(!key)return res.status(404).end();
 const i=db[key].findIndex(x=>x.id===req.params.id); if(i<0)return res.status(404).end();
 if(req.user.role!=='admin'&&db[key][i].userId!==req.user.id)return res.status(403).end(); db[key].splice(i,1);save();res.json({ok:true});
});
app.get('/api/users',auth,admin,(req,res)=>res.json(db.users.map(publicUser)));
app.post('/api/users',auth,admin,(req,res)=>{
 const {username,password,name,role}=req.body||{}; if(!username||!password||!name)return res.status(400).json({error:'Lengkapi nama, username dan password.'});
 if(db.users.some(x=>x.username===username))return res.status(409).json({error:'Username sudah digunakan.'});
 const u={id:makeId(),username,name,role:role==='admin'?'admin':'petugas',passwordHash:hash(password)};db.users.push(u);save();res.json(publicUser(u));
});
app.delete('/api/users/:id',auth,admin,(req,res)=>{if(req.params.id===req.user.id)return res.status(400).json({error:'Admin yang sedang login tidak dapat dihapus.'});db.users=db.users.filter(x=>x.id!==req.params.id);save();res.json({ok:true});});
app.get('/health',(req,res)=>res.json({ok:true,app:'manajemen-ayam-petelur'}));
app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Aplikasi berjalan pada port ${PORT}`));
