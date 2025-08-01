// app.js

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js")
main()
    .then((err) => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL)
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));





app.get('/', (req, res) => {
    res.send('Hello World');
});


const validateListings = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg= error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    }
    else{
        next();
    }
}

// listings

app.get("/listings", wrapAsync(async (req, res) => {
    const alllisting = await Listing.find({});
    res.render("listings/index.ejs", { alllisting });
}));

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
}
);

// show route 
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// create route
app.post("/listings",validateListings, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(req.body.listing);

    res.redirect("/listings");

}));

//Edit route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });

}));

//Update route
app.put("/listings/:id",validateListings, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));



//Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");

}));


// app.get("/testlisting",async  (req,res)=>{
//     let sample =new Listing({
//         title: "villa",
//         description :"BY the beach",
//         price :1200,
//         location: "Udupi",
//         country:"India",
//     });

//     await sample.save();
//     console.log("sample was saved");
//     res.send("succesful testing");

// });

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });


app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

