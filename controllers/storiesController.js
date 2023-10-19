const mongoose = require("mongoose");

//authentication
const jwt = require("jsonwebtoken");

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system:
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require("../config");
const { Story } = require("../models/story");
const { User } = require("../models/user"); //imoirting USER model:

//-----------PURE LOGIC FOR HANDLING THE REQUESTS----------------------

//INDEX
const getAllStories = async (req, res, next) => {
  // res.send('Index route showing all stories')
  console.log("reached the get all stories route");
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";
  let collectionAuthor = null;

  const stories = await Story.find();

  res.render("index", {
    stories,
    isLoggedIn,
    linkText,
    pathText,
    collectionAuthor,
  });
};

//NEW  --AUTHENTICATE!!!!!!!!!!
const sendNewStoryForm = async (req, res, next) => {
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";

  console.log(req.userId);
  const userId = req.userId;

  if (!userId) {
    console.log("no cookie found!");
    return res.redirect("/users/login");
  }

  try {
    const usr = await User.findById(userId);

    if (!usr) {
      console.log("access denied, user does not exist");
      res.redirect("/users/login");
    } else {
      if (req.cookies.access_token) {
        isLoggedIn = true;
      }

      const imagesArray = [
        "f29a69a312854026bc60cf642912d67a",
        "c8bc8ac99f084606a70c60c416265d5e",
        "68e64b0835424fef9d597191bd5cdd29",
        "c7dd3f813d054957ab85accdfd6e47fd",
        "cee0f559cae0483bb670840c7998d838",
        "b18c8a87911d439f999147735d7b0a6f",
        "e2281df20d2244d4927adde7f3328d7b",
        "26f81b24d83441ba88c7e80a52adbaaf", //cool purple one
        "875a1619d86b43a2acd90b8a7c4ca4a2",
        "3e0b5185d1f8435b993e1bad2f82928e",
        "a8a77bbafe074d62ac3d2288b02cdc29",
        "cc6c6b4b0b9c49a8816a8ba13cadd919",
        "b819181e3ca84671afb06541a6dd402d",
        "322968402fc2493da01566ea066c102f",
        "8acb8179a9db4296a32656c88bbf709e",
        "c2556d996f00436cb7649f09c8108fc5",
        "d43e69639051494e84692c2632f4278e",
        "69cf06ed2bf64980b41b6cd81b87d8ce",
        "2d981f2344624ddb89f5a622a39f3579",
        "2d53ed1bdd9640eea0c6f2085c682ebb",
        "ee237d3fe1114c04a59deef590836296",
        "6d7fc2df62e7415aae9585f258f5efb8",
        "0974de1a9bb7415d8f39ae5eaeecfb3c",
        "21b8f53ea2ec44cd87b0ee3e5b3346a4",
        "82a65a613cc14a908247b98439f3b135",
        "ed005b70429e4208b517fe425910c19f",
        "06d5a80a04fc4c5ab552759e9a97d91a",
        "71007d05039a45ffa40c74d5a2ad6ddd",
      ];
      const randomNum = Math.floor(Math.random() * imagesArray.length);

      const randomImage = imagesArray[randomNum];

      console.log("access granted, you may create a story");
      res.render("new", {
        userId,
        isLoggedIn,
        linkText,
        pathText,
        randomImage,
      });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

//SHOW
const getStoryById = async (req, res, next) => {
  // res.send(req.params.id)
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";
  let userId = null;

  const story = await Story.findById(req.params.id);
  if (req.cookies.access_token) {
    isLoggedIn = true;

    const decodedToken = jwt.verify(req.cookies.access_token, JWT_KEY_SECRET);
    userId = decodedToken.userId;
  }

  // Determine whether to show the delete and edit buttons
  const showButtons =
    userId && userId.toString() === story.author.id.toString();

  res.render("show", {
    story,
    isLoggedIn,
    linkText,
    pathText,
    userId,
    showButtons, // Pass this property to the template
  });
};

//shows user's stories
const getStoriesByUserId = async (req, res, next) => {
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";
  let userId = null;

  let collectionAuthor = "All Stories";

  console.log("getting all stories by user ID");

  // Await the promise returned by Story.find
  const stories = await Story.find({ author: req.params.id });
  console.log(stories);

  collectionAuthor =
    stories.length >= 1
      ? stories[0].author.firstName
      : "This author has no stories.. :O";

  res.render("index", {
    stories,
    isLoggedIn,
    collectionAuthor,
    linkText,
    pathText,
    userId,
  });
};

// CREATE --AUTHENTICATE!!!!!!!!!!
const createNewStory = async (req, res, next) => {
  const requiredFields = ["title", "storyText", "author"];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const errorMessage = `missing ${field} in request body`;
      console.error(errorMessage);
      return res.send(errorMessage);
    }
  }

  try {
    const createdStory = await Story.create(req.body);
    res.redirect("/stories");
  } catch (error) {
    console.error("AHHHHHHHHHHHHHHHHH", error);
    return res.send(error);
  }
};

//EDIT--AUTHENTICATE!!!!!!!!!!
const sendEditStoryForm = async (req, res, next) => {
  let isLoggedIn = !!req.cookies.access_token;
  let linkText = isLoggedIn ? "Logout" : "Login/Sign Up";
  let pathText = isLoggedIn ? "logout" : "login";

  const userId = req.userId;

  const story = await Story.findById(req.params.id);

  if (story.author.id === userId) {
    console.log("edit access aproved");
    res.render("edit", { story, isLoggedIn, linkText, pathText });
  } else {
    console.log("access denied");
    res.redirect("/stories");
  }
};

// UPDATE--AUTHENTICATE!!!!!!!!!!
const updateStoryById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const storyId = req.params.id;

    // Prepare the update data
    const updateData = {
      title: req.body.title,
      storyText: req.body.storyText,
    };

    // Find and update the story if the author's ID matches userId
    const updatedStory = await Story.findOneAndUpdate(
      { _id: storyId, author: userId }, // query condition
      { $set: updateData }, // update operation
      { new: true } // options: return the new updated document
    );

    if (updatedStory) {
      console.log("Access granted");
      console.log(updatedStory);
      res.redirect("/stories");
    } else {
      console.log("Access denied");
      res.redirect("/stories");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the story.");
  }
};

//DELETE--AUTHENTICATE!!!!!!!!!!
const deleteStoryById = (req, res, next) => {
  const userId = req.userId;

  Story.findById(req.params.id).then((story) => {
    if (story.author.id === userId) {
      console.log("you got it chief");
      Story.findByIdAndRemove(story.id, (err, data) => {
        if (err) console.log(err);
        res.redirect(`/stories/user/${userId}`);
      });
    } else {
      console.log("no can do");
      res.redirect("/stories");
    }
  });
};

module.exports = {
  getAllStories,
  sendNewStoryForm,
  getStoryById,
  getStoriesByUserId,
  createNewStory,
  sendEditStoryForm,
  updateStoryById,
  deleteStoryById,
};
