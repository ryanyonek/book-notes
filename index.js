import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: "Ry472945?",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUser = null;
let error = null;
let user = null;
let bookNotes = [];

async function getUser() {
    try {
        const response = await db.query("SELECT * FROM users WHERE id = $1", [currentUser]);
        console.log(response.rows);
        user = {id: response.rows[0].id, username: response.rows[0].username, password: response.rows[0].password}
    }
    catch (err) {
        console.log(err);
        user = null;
    }
}

async function getBookNotes(sort) {
    try {
        bookNotes = [];
        const result = await db.query("SELECT book_notes.id, book_notes.book_id, book_notes.summary, book_notes.date_read, book_notes.rating, book_notes.user_id, books.title, books.author, books.year, books.cover, users.username FROM book_notes INNER JOIN books ON books.id = book_notes.book_id INNER JOIN users ON users.id = book_notes.user_id ORDER BY $1 DESC", [sort]);
        result.rows.forEach((note) => {
            bookNotes.push({id: note.id, bookId: note.book_id, summary: note.summary, date: note.date_read, rating: note.rating, userId: note.user_id, title: note.title, author: note.author, year: note.year, cover: note.cover, username: note.username});
        });
    }
    catch (err) {
        console.log(err);
        bookNotes = [];
    }
}

app.get("/", async (req, res) => {
    let sort = "rating";
    if (req.body && req.body.action === "Most Recent") {
        sort = "date_read";
    }
    if (currentUser) {
        await getUser();
    }
    await getBookNotes(sort);
    res.render("home.ejs", {
        user: user,
        bookNotes: bookNotes,
    });
});

app.get("/create-note", async (req, res) => {
    if (!user) {
        res.redirect("/login");
    }
    else {
        await getUser();
        res.render("create-note.ejs", {
        user: user,
        });
    }

});

app.get("/login", (req, res) => {
    res.render("login.ejs", {
        user: user,
    });
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up.ejs", {
        user: user,
    });
});

app.get("/user", async (req, res) => {
    if (!user) {
        res.redirect("/login");
    }
    else {
        await getUser();
        let userNotes = [];
        const response = await db.query("SELECT book_notes.id, book_notes.book_id, book_notes.summary, book_notes.notes, book_notes.date_read, book_notes.rating, book_notes.user_id, books.title, books.author, books.year, books.cover, users.username FROM book_notes INNER JOIN books ON books.id = book_notes.book_id INNER JOIN users ON users.id = book_notes.user_id WHERE book_notes.user_id = $1;", [currentUser]);

        response.rows.forEach((note) => {
            userNotes.push({id: note.id, bookId: note.book_id, summary: note.summary, date: note.date_read, rating: note.rating, userId: note.user_id, title: note.title, author: note.author, year: note.year, cover: note.cover, username: note.username});
        });

        res.render("user.ejs", {
            user: user,
            bookNotes: userNotes,
        });
    }
});

app.post("/view-note", async (req, res) => {
    const id = req.body.id;

    const response = await db.query("SELECT book_notes.id, book_notes.book_id, book_notes.summary, book_notes.notes, book_notes.date_read, book_notes.rating, book_notes.user_id, books.title, books.author, books.year, books.cover, users.username FROM book_notes INNER JOIN books ON books.id = book_notes.book_id INNER JOIN users ON users.id = book_notes.user_id WHERE book_notes.id = $1", [id]);

    console.log(response.rows[0]);

    const bookNote = {id: response.rows[0].id, bookId: response.rows[0].book_id, summary: response.rows[0].summary, notes: response.rows[0].notes, date: response.rows[0].date_read, rating: response.rows[0].rating, userId: response.rows[0].user_id, title: response.rows[0].title, author: response.rows[0].author, year: response.rows[0].year, cover: response.rows[0].cover, username: response.rows[0].username};

    console.log(bookNote);

    res.render("view-note.ejs", {
        user: user,
        bookNote: bookNote,
    });
});

app.post("/edit-note", async (req, res) => {
    const id = req.body.id;

    const response = await db.query("SELECT book_notes.id, book_notes.book_id, book_notes.summary, book_notes.notes, book_notes.date_read, book_notes.rating, book_notes.user_id, books.title, books.author, books.year, books.cover, users.username FROM book_notes INNER JOIN books ON books.id = book_notes.book_id INNER JOIN users ON users.id = book_notes.user_id WHERE book_notes.id = $1", [id]);

    console.log(response.rows[0]);

    const bookNote = {id: response.rows[0].id, bookId: response.rows[0].book_id, summary: response.rows[0].summary, notes: response.rows[0].notes, date: response.rows[0].date_read, rating: response.rows[0].rating, userId: response.rows[0].user_id, title: response.rows[0].title, author: response.rows[0].author, year: response.rows[0].year, cover: response.rows[0].cover, username: response.rows[0].username};

    console.log(bookNote);

    res.render("edit-your-note.ejs", {
        user: user,
        bookNote: bookNote,
    });
});

app.post("/find-book", async (req, res) => {
    var search = req.body.query;
    const query = search.replaceAll(" ", "+")
    console.log(query);
    const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
    const title = (response.data.docs[0].title);
    const author = (response.data.docs[0].author_name[0]);
    const year = (response.data.docs[0].first_publish_year);
    const cover = (response.data.docs[0].cover_edition_key);
    console.log(`title: ${title}, author: ${author}, year: ${year}, cover: ${cover}`);

    try {
        await db.query("INSERT INTO books (title, author, year, cover) VALUES ($1, $2, $3, $4)",[title, author, year, cover]);
    }

    catch (err) {

    }
    res.render("create-note.ejs", {
        title: title,
        author: author,
        year: year,
        cover: cover,
        user: currentUser,
    });
});

app.post("/create-note", async (req, res) => {
    const id = await db.query("SELECT * FROM books WHERE title = $1", [req.body.title]);

    // Add book_note to book_notes db
    const bookId = id.rows[0].id;
    const rating = req.body.rating;
    const date = req.body.date;
    const summary = req.body.summary;
    const note = req.body.note;

    console.log(bookId + rating + date + summary + note + currentUser);

    try {
        await db.query("INSERT INTO book_notes (book_id, summary, date_read, rating, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [bookId, summary, date, rating, note, currentUser]);
    }
    catch (err) {

    }
    res.redirect("/");
});

app.post("/sign-up", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const id = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
            [username, password]
        );
        currentUser = id.rows[0].id;
        console.log(`Current user: ${currentUser}`);
    }
    catch(err) {
        console.log(err);
        error = "Username already exists.";
    }
    res.redirect("/");
});

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const response = await db.query("SELECT id FROM users WHERE username = $1 AND password = $2", [username, password]);
        currentUser = response.rows[0].id;
        console.log(`Current user: ${currentUser}`);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.redirect("/login");
    }
    
});

app.get("/sign-out", async (req, res) => {
    currentUser = null;
    user = null;
    res.redirect("/");
});

app.post("/patch-note", async (req, res) => {
    const id = req.body.id;
    if (req.body.action === "Delete Note") {
        await db.query("DELETE FROM book_notes WHERE id = $1;",[id]);
        res.redirect("/user");
    }
    const rating = req.body.rating;
    const date = req.body.date;
    const summary = req.body.summary;
    const notes = req.body.note;
    

    await db.query("UPDATE book_notes SET summary = $1, date_read = $2, rating = $3, notes = $4 WHERE id = $5;",
        [summary, date, rating, notes, id]
    );

    const response = await db.query("SELECT book_notes.id, book_notes.book_id, book_notes.summary, book_notes.notes, book_notes.date_read, book_notes.rating, book_notes.user_id, books.title, books.author, books.year, books.cover, users.username FROM book_notes INNER JOIN books ON books.id = book_notes.book_id INNER JOIN users ON users.id = book_notes.user_id WHERE book_notes.id = $1", [id]);

    const bookNote = {id: response.rows[0].id, bookId: response.rows[0].book_id, summary: response.rows[0].summary, notes: response.rows[0].notes, date: response.rows[0].date_read, rating: response.rows[0].rating, userId: response.rows[0].user_id, title: response.rows[0].title, author: response.rows[0].author, year: response.rows[0].year, cover: response.rows[0].cover, username: response.rows[0].username};

    console.log(bookNote);

    res.render("view-note.ejs", {
        user: user,
        bookNote: bookNote,
    });

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});