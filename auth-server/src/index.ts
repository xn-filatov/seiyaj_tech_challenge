import express from "express";
import cors from "cors";
import env from "./environment";
import { authenticateToken } from "./middlewares";
import { generateAccessToken } from "./utils";

const app = express();
const port = env.PORT || 3000;

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type User = {
  email: string;
  password: string;
  address?: string;
  name?: string;
};

const Users: User[] = [];

app.get("/users/checkToken", authenticateToken, async (req, res) => {
  res.sendStatus(200);
});

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || email == "")
      return res.status(403).send("Please provide user email");

    if (!password || password == "")
      return res.status(403).send("Please provide user password");

    if (Users.find((x) => x.email == email))
      return res.status(403).send("User with this name already exists");

    const user = { email, password, name };
    Users.push(user);

    res.send({ user, token: generateAccessToken(email) });
  } catch (error) {
    res.status(500).send("Internal error");
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = Users.find((x) => x.email == email);

    if (!user || user.password != password) {
      return res.status(403).send("Wrong username / password");
    }

    res.send({ user, token: generateAccessToken(email) });
  } catch (error) {
    res.status(500).send("Internal error");
    console.log(error);
  }
});

// app.post("/logout", authenticateToken, async (req, res) => {
//   const { address } = req.body;

//   try {
//     const user = Users.find((x) => x.address == address);
//     console.log({ user });
//   } catch (error) {
//     res.status(500).send("Internal error");
//     console.log(error);
//   }
// });

app.get("/", async (req, res) => {
  try {
    res.send(Users);
  } catch (error) {
    res.status(500).send("Internal error");
    console.log(error);
  }
});

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});