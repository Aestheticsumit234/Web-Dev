import e, { json } from "express";
import express from "express";

function block_1_Server(){
    return new Promise((resolve, reject) => {
        try {
            const app = express();
            app.use(express.json());

            app.get("/menu", (req, res) => {
                res.json({
                    items: [
                        {
                            id: 1,
                            name: "Chai",
                            price: 10
                        },
                        {
                            id: 2,
                            name: "Coffee",
                            price: 20
                        },
                        {
                            id: 3,
                            name: "Tea",
                            price: 15
                        }
                    ]
                })
            });

            app.get("/search", (req, res) => {
                    const { q, limit,page } = req.query;
                res.json({ 
                    Limit : limit,
                    Page : page,
                    Query : q
                });
            })

            app.get("/menu/:id", (req, res) => {
                const { id } = req.params;
                res.json({ 
                    itemId : id,
                    itemName : "Chai",
                    itemPrice : 10,
                    itemDescription : "This is a description of the item"
                 });
            })


            app.post("/menu", (req, res) => {
                const { name, price, description , category} = req.body;
                res.status(201).json({ 
                    itemName : name.toUpperCase(),
                    itemPrice : price,
                    itemDescription : description,
                    itemCategory : category.toUpperCase()
                });
            })

            const server = app.listen(3000, async () => {
                console.log("Server is running on port 3000")


                try {

                    const menu = await fetch("http://localhost:3000/menu");
                    const MenuData = await menu.json();
                    console.log(JSON.stringify(MenuData));

                    console.log(`_________________________________________ MENU ______________________________________________`)

                    const search = await fetch("http://localhost:3000/search?q=chai&limit=10&page=1")
                    const SearchData = await search.json()
                    console.log(SearchData);
                    console.log(`_________________________________________ SEARCH ______________________________________________`)


                    const menuId = await fetch("http://localhost:3000/menu/1");
                    const MenuIdData = await menuId.json()
                    console.log(JSON.stringify("Its Me MenuIdData -->",MenuIdData));

                    console.log(`_________________________________________ MENU ID ______________________________________________`)


                    const postMenu = await fetch("http://localhost:3000/menu", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ name: "Chai", price: 10, description: "This is a description of the item", category: "Drink" })
                    })
                    const PostMenuData = await postMenu.json()
                    console.log(JSON.stringify(PostMenuData));

                    console.log(`_________________________________________ POST MENU ______________________________________________`)

                } catch (error) {
                    console.log(error.message)
                }

                server.close(()=>{
                    console.log("Server end..............")
                    resolve()
                })

            });
        } catch (error) {
            reject(error);
        }
    });
}

function block_2_Server(){

    return new Promise((resolve)=>{
        const app = express()



        app.get("/text",(req,res)=>{
            res.send(
            "this is Data"
            )
        })


        app.get("/json", (req,res)=>{
            json.res({
                freamWork : "21.45.5",
                item:"this is Good"
            })
        })

        app.get("/not-found", (req,res)=>{
            res.status(201).json({
                error :  "page is not find"
            })
        })
        app.get("/helth", (req,res)=>{
            res.status(201)
        })



        app.get("/re-rendring", (req,res)=>{
            // add entery to db to see how many user are still visiting the old Clas
            res.redirect(301, "/sumit-Ai")
        })

        app.get("/xml-data",(res , req )=>{
            res.type("aplication/xml").send(`<div>  Hello Javascript</div>`)
        })

        app.get('/custom-header',(req , res)=>{ 
            res.set('X-powered-by', "Sumit sharma")
            res.set('X-Request-Id', "Sumit Kumar")
            res.json({
                message  : 'Custom header'
            })
        })
        // use of this custom header =>  course tracing ratelimiting, CORS
    })

}
async function main(){
    // await block_1_Server()
    await block_2_Server()
    // process.exit(0)
}

main().catch(console.error);
