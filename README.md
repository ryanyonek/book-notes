# Book Notes
Create and edit book notes, powered by the [Open Library APIs](https://openlibrary.org/developers/api).

## Usage
This project is available for local hosting only.
### Clone the Repository
In the shell:
- git clone https://github.com/ryanyonek/book-notes.git
- cd book-notes

### Node
This project uses Node.
- Install: https://nodejs.org/en/download

### Database
I used pgAdmin 4 to create the PostgreSQL database to store the user data.
In order to run this program locally, you must create the book_notes database on your own system and modify the environment variables with your own information.
Use the queries in the [queries.sql](./queries.sql) file to set up the tables in your database.

### Run
In the shell:

Install node modules:
- npm i

Run using node:
- node index.js

## Screenshot of Explore Page
[book notes explore page](./public/images/book_notes_read_me.png)
