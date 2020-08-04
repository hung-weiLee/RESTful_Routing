const express          = require('express'),
      app              = express(),
      port             = process.env.port || 3000,
      methodOverride   = require("method-override"),
      expressSanitizer = require("express-sanitizer"),
      mongoose         = require('mongoose'),
      bodyParser       = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

mongoose.connect('mongodb://localhost:27017/restful_blogapp', { // connect to db restful_blogapp !!!
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

const blogSchema = new mongoose.Schema({ // Schema
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()} 
});

const Blog = mongoose.model("Blog", blogSchema); // model


/*****************************(RESTful Routes)*****************************/


app.get("/", function(req, res){
    res.redirect("/blogs"); /* redirect會先返回到前端，再http request到指定的後端Route !!!!!!!! */
});


// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR !");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});


// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});


// CREATE ROUTE
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // create blog
    /* whole attributes include: (title, image, body) are all in req.body.blog object !!! */
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            // then redirect to the INDEX ROUTE
            res.redirect("/blogs"); // default as GET 
        }
    });
});


// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});


// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});


// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // update blog
    /*                     findById       AndUpdate                    回傳 update 過後的 object  !!! */
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            // then redirect to the SHOW ROUTE
            res.redirect("/blogs/" + updatedBlog._id);
        }
    });
});


// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            // then redirect to the INDEX ROUTE
            res.redirect("/blogs");
        }
    });
});


/**************************************************************************/


// Tell Express to listen for request (start server) !!!
app.listen(port, function() { 
    console.log('Server listening on port 3000'); 
  });