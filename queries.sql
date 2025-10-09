-- In the book_notes db --

-- books table --
CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title TEXT,
	author VARCHAR(100),
	year INT,
	genre VARCHAR(20),
	isbn VARCHAR(17)
);

-- notes table --
CREATE TABLE book_notes (
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES books(id),
    summary TEXT,
    date_read VARCHAR(10),
    rating NUMERIC(2, 1),
    notes TEXT
);

-- users table --
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	note_id INT REFERENCES book_notes(id),
    username VARCHAR(50) UNIQUE,
    password VARCHAR(50)
);

-- adding an image column --
ALTER TABLE books
    ADD cover TEXT;

-- dropping the genre column --
ALTER TABLE books DROP COLUMN genre;

-- dropping the note_id column --
ALTER TABLE users DROP note_id;

-- adding the user_id column in the book_notes table
ALTER TABLE book_notes ADD COLUMN user_id TYPE INT REFERENCES users(id);

-- dropping the isbn column, since I will use the cover id, not isbn--
ALTER TABLE books DROP COLUMN isbn;