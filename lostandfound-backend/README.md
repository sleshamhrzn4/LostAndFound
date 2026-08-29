# Professionals API — Express.js + MongoDB Demo

A small REST API built with [Express.js](https://expressjs.com/) and
[MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
that manages a list of professionals. This project is meant for **learning** — it
shows the four basic operations of almost every backend app, often called **CRUD**:

| CRUD word  | What it means | HTTP method used here |
| ---------- | ------------- | --------------------- |
| **C**reate | Add new data  | `POST`                |
| **R**ead   | Get data      | `GET`                 |
| **U**pdate | Change data   | `PUT`                 |
| **D**elete | Remove data   | `DELETE`              |

---

## What is this app?

A **web server** that stores a list of professionals (name, title, email and
description) and lets a
client (a browser, mobile app, or a tool like Postman) view, add, update, and remove
them by sending HTTP requests.

Unlike the earlier in-memory version, the data now lives in a **MongoDB database**,
so **changes survive a server restart**. Mongoose is used to define the shape of the
data (a _schema_) and to talk to the database.

---

## Project structure

```
professionals-backend/
├── server.js              # The web server and all the API routes
├── models/
│   ├── professional.js    # The Mongoose schema/model for a professional
│   └── user.js            # The Mongoose schema/model for a login account
├── controller/
│   └── authController.js  # register + login handlers
├── test/
│   └── test-api.js        # End-to-end tests — run with `npm test`
├── .env                   # Your secrets/config — NOT committed (see .env.example)
├── .env.example           # Template for the .env file
├── package.json           # Project info and dependencies
└── README.md              # This file
```

---

## The data model

Each professional is a document that looks like this:

```json
{
  "_id": "665f1c2a4b3e2a1d9c8b4567",
  "name": "Jane Doe",
  "title": "Software Engineer",
  "email": "jane.doe@example.com",
  "description": "Jane is a software engineer with ten years of experience.",
  "createdAt": "2026-07-08T10:00:00.000Z",
  "updatedAt": "2026-07-08T10:00:00.000Z"
}
```

The schema (in [`models/professional.js`](models/professional.js)) enforces some
rules:

- **`name`** — required, trimmed, at least 3 characters.
- **`title`** — required, trimmed, at least 3 characters. Free text: any job title
  is allowed, there is no fixed list.
- **`email`** — required, trimmed, lowercased, and must look like an email address.
  Unlike a user account's email, this one does **not** have to be unique.
- **`description`** — required, trimmed, at least 20 characters.
- **`creator`** — optional. Holds the `_id` of the `User` who added this record and
  points at the `User` model, so `.populate("creator")` can fetch that user.
- **`_id`** — a MongoDB `ObjectId` string that Mongo generates automatically. This
  replaces the old numeric `id`.
- **`createdAt` / `updatedAt`** — timestamps added automatically.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your environment variables

This project reads configuration from a `.env` file, which is **not** committed to
git (it can hold secrets like a database password). Create your own from the
provided template:

```bash
cp .env.example .env
```

Then open `.env` and set these two values:

| Variable    | What it is                                          | Example                                         |
| ----------- | --------------------------------------------------- | ----------------------------------------------- |
| `MONGO_URI` | The connection string for your MongoDB database.    | `mongodb://127.0.0.1:27017/professionals`       |
| `PORT`      | The port the server listens on (optional, defaults to `3000`). | `3000`                               |

**Where do I get a `MONGO_URI`?**

- **Local MongoDB** — install MongoDB Community Edition and use
  `mongodb://127.0.0.1:27017/professionals`.
- **MongoDB Atlas (free cloud)** — create a free cluster at
  [mongodb.com/atlas](https://www.mongodb.com/atlas), then copy its connection
  string. It looks like
  `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/professionals`.

> ⚠️ Never commit your real `.env`. It's listed in `.gitignore`. Share
> `.env.example` instead so others know which variables they need.

### 3. Run the server

```bash
npm run dev     # auto-restarts when you save a file (uses nodemon)
# or
npm start       # runs once with plain node
```

You should see:

```
Server live on port 3000
Connected to MongoDB
```

The server is now running at **http://localhost:3000**.

---

## The API endpoints

An **endpoint** is a URL + HTTP method the server knows how to respond to.
Base URL: `http://localhost:3000`

> Note: ids are now MongoDB `ObjectId` strings (like `665f1c2a4b3e2a1d9c8b4567`),
> not small numbers. Copy a real `_id` from a `GET` response to use in the routes below.

### 1. Get all professionals

```
GET /api/professionals
```

Returns the full list as JSON — **`200 OK`**.

### 2. Get one professional by id

```
GET /api/professionals/:id
```

The `:id` is a **route parameter**, e.g.
`/api/professionals/665f1c2a4b3e2a1d9c8b4567`.

**If the id doesn't exist — `404 Not Found`**

```json
{ "message": "Professional not found" }
```

### 3. Add a new professional

```
POST /api/professionals
```

Send the new data as JSON in the **request body**:

```json
{
  "name": "Jane Doe",
  "title": "Software Engineer",
  "email": "jane.doe@example.com",
  "description": "Jane is a software engineer with ten years of experience."
}
```

**Response — `201 Created`** (returns the created document, including its `_id`).

**If any of the four fields is missing — `400 Bad Request`**

```json
{ "message": "Name, title, email and description are required" }
```

### 4. Update a professional

```
PUT /api/professionals/:id
```

Send the new values as JSON:

```json
{
  "name": "Jane Smith",
  "title": "Engineering Manager",
  "email": "jane.smith@example.com",
  "description": "Jane now leads the platform team and mentors new engineers."
}
```

**Response — `200 OK`** (returns the updated document). Returns `404` if the id
doesn't exist, or `400` if any of the four fields is missing.

### 5. Delete a professional

```
DELETE /api/professionals/:id
```

**Response — `200 OK`**

```json
{ "message": "Professional deleted successfully" }
```

Returns `404` if the id doesn't exist.

---

## Try it out

Once the server is running, open a **second terminal** and use `curl`:

```bash
# Get everyone
curl http://localhost:3000/api/professionals

# Add a new person (all four fields are required)
curl -X POST http://localhost:3000/api/professionals \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Doe", "title": "Software Engineer", "email": "jane.doe@example.com", "description": "Jane is a software engineer with ten years of experience." }'

# Get one person (use a real _id from the list above)
curl http://localhost:3000/api/professionals/665f1c2a4b3e2a1d9c8b4567

# Update a person
curl -X PUT http://localhost:3000/api/professionals/665f1c2a4b3e2a1d9c8b4567 \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Smith", "title": "Engineering Manager", "email": "jane.smith@example.com", "description": "Jane now leads the platform team and mentors new engineers." }'

# Delete a person
curl -X DELETE http://localhost:3000/api/professionals/665f1c2a4b3e2a1d9c8b4567
```

> Tip: You can also use a GUI tool like **Postman** or the **Thunder Client**
> VS Code extension instead of `curl`.

---

## Key concepts to understand

- **Express** — a framework that makes it simple to define routes and send responses.
- **MongoDB** — a document database that stores data as JSON-like documents.
- **Mongoose** — a library that connects to MongoDB and lets us define a **schema**
  (the shape + validation rules) and a **model** (the tool to read/write documents).
- **`.env` + dotenv** — `require("dotenv").config()` loads variables from the `.env`
  file into `process.env`, so secrets like `MONGO_URI` stay out of the code.
- **Schema validation** — rules like `required`, `minlength`, and `enum` are enforced
  by Mongoose; a save that breaks them is rejected.
- **`async` / `await`** — talking to a database takes time, so the route handlers are
  asynchronous and `await` the database calls.
- **Mongoose methods used**
  - `.find()` — get all matching documents.
  - `.findById(id)` — get one document by its `_id`.
  - `.create({...})` — insert a new document.
  - `.findByIdAndUpdate(id, data, { new: true })` — update and return the new version.
  - `.findByIdAndDelete(id)` — delete one document by its `_id`.
- **HTTP status codes** — `200 OK`, `201 Created`, `400 Bad Request`,
  `404 Not Found`, `500 Internal Server Error`.

---

## Ideas to extend this (practice exercises)

- Add filtering, e.g. `GET /api/professionals?title=Software%20Engineer`.
- Return `400` (instead of `500`) with a clear message when Mongoose **validation**
  fails (e.g. a malformed `email` or a too-short `name`).
- Handle an invalid `ObjectId` format gracefully (a malformed id currently throws).
- Protect the write routes with auth middleware: read the JWT, and set `creator`
  from the logged-in user instead of leaving it empty.
- Add `cors` so a browser app on another port can call this API.
- Add pagination or sorting to the list endpoint.
- Render the list as an HTML page (e.g. with a templating engine like EJS) — see the
  `with-ejs` branch for one way to do this.
