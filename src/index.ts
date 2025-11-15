
import express, { request, response } from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());
app.post("/api/v1/signin", async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)
        res.json({
            token
        })
    }
    else{
        res.status(403).json({
            message:"incorrect credentials"
        })
    }
})
app.post("/api/v1/signup", async(req,res)=>{
    //zod validation, hashpassw
    const username = req.body.username;
    const password = req.body.password;

    await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User signed up"
    })

})
app.post("/api/v1/content", userMiddleware, async(req,res)=>{
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        //@ts-ignore
        title: req.body.title,
        userId: req.userId,
        tags: []
    })
    res.json({
        message: " Content added"
    })
})
app.get("/api/v1/content", userMiddleware, async(req,res)=>{
 
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})
app.delete("/api/v1/content/:id", userMiddleware, async(req,res)=>{

    const id = req.params.id;

    await ContentModel.deleteOne({
        _id: id,
        userId: req.userId
    })
    res.json({
        message: "Delete content"
    })
})
app.post("/api/v1/brain/share", userMiddleware, async(req,res)=>{

    const share = req.body.share;
    if(share){
        const existingLink=await LinkModel.findOne({
            userId: req.userId
        })

        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash: hash
        })
        res.json({
        message: "/share/" + hash
    })
    } else{
        await LinkModel.deleteOne({
            userId : req.userId
        });
    }
    res.json({
        message: "Updated sharable link"
    })

})

app.get("/api/v1/brain/share/:sharelink", async(req,res)=>{
    const hash = req.params.sharelink;
    const link = await LinkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json({
            message: "sorry incorrect link"
        })
        return;
    } 
    const content = await ContentModel.find({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    if(!user){
        res.status(411).json({
            message: "Errorshould ideally not happened"
        })
    }
    res.json({
        username: user?.username,
        content: content
    })

})
app.listen(3000);