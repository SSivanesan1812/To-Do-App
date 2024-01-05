import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "posgredatabase",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];



async function getcurrentid(){
  let result=await db.query("Select * from items order by id asc");
  let currentitemid=result.rows.length+1;
  return currentitemid;
}

app.get("/", async(req, res) => {
  let data=await db.query("select * from items order by id asc" )
items=data.rows;

console.log(items)
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  let currentitemid=await getcurrentid();
  console.log(currentitemid)
  let result=await db.query("Insert into items(id,title) values($1,$2)",[currentitemid,item])
  items.push({ id:currentitemid,title: item });
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
    let updateitemid=req.body.updatedItemId;
    let editeditem=req.body.updatedItemTitle;
    let result=await db.query("update items set title=$1 where id=$2",[editeditem,updateitemid])
    items=result.rows
    res.redirect("/")
    

});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
