const express=require('express')
const bodyparser=require('body-parser')
const _=require('lodash')

const mongoose=require('mongoose')
const date = require(__dirname + "/date.js");


const app=express()
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended:true}))
app.set("view engine", "ejs")


//Database
// mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
mongoose.connect("mongodb+srv://todolistdbatlas:todolistdbatlas@cluster0.25aztjo.mongodb.net/?retryWrites=true&w=majority")    // Connected With Atlas DB
const itemschema=mongoose.Schema({
    name:String
})
const Item=mongoose.model('Item',itemschema)

const item1=new Item({
    name:"Buy Food"
})
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});

const dbdata=[item1,item2,item3]

//***New List Schema***//
const listSchema={
  name:String,
  items:[itemschema]
}
const List=mongoose.model('List',listSchema)


//Routes

app.get('/',(req,res)=>{
const day = date.getDate();


    Item.find()
      .then((data) =>{
        if(data.length===0){
              Item.insertMany(dbdata)
              .then(() => {
                console.log("Successfully Inserted Data")
                res.redirect('/')
              })
              .catch((err) => console.log(err)) 
        }else{
          res.render("list", { listTitle:"Today",newitemlist: data })
        }})
      .catch((err) => console.log(err));

      
  })
 
app.post('/',(req,res)=>{
  const useritem = req.body.newItem;
  const listname=req.body.list

  const item = new Item({
    name: useritem,
  })

  if(listname === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listname })
    .then((data)=>{
      data.items.push(item)
      data.save()
      res.redirect('/'+listname)
    }).catch((err)=>console.log(err))
  }


})


app.post("/delete", (req, res) => {
  const checkeditem = req.body.checkbox
  const listName    = req.body.listname

  if(listName === "Today"){
    Item.findByIdAndRemove(checkeditem)
      .then((docs) => {
        console.log("Removed User : ", docs);
        res.redirect("/");
      })
      .catch((err) => console.log(err))
  }else{
    List.findOneAndUpdate({ name: listName },{ $pull:{items:{ _id: checkeditem }}})
    .then((data) => {
      console.log("Removed User : ", data)
      res.redirect('/'+listName)
    }).catch((err)=>console.log(err))
      
  }


});


app.get('/:customlistname',(req,res)=>{
  const cusListName = _.capitalize(req.params.customlistname)

  List.findOne({ name: cusListName })
  .then((data)=>{
      if(!data){
        const list = new List({
        name: cusListName,
        items: dbdata,
        });
        list.save();
        res.redirect("/" + cusListName);
     }else{
      res.render("list", { listTitle: data.name, newitemlist: data.items })
     }
  }).catch((err)=>console.log(err))





})

app.listen(3000,()=>console.log('Server Run on 3000 Port'))