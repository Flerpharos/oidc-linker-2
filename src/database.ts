import sqlite3 from 'better-sqlite3';

const db = sqlite3("linkt.sqlite");
db.pragma("journal_mode=WAL");

db.exec(
  "CREATE TABLE IF NOT EXISTS links(id int rowid, name string not null, description string not null, destination string not null, path string unique not null, owner string not null, expiration int not null, primary key (id, owner))"
);
// db.exec(
//   "CREATE TABLE IF NOT EXISTS named_inks(id int rowid, name string not null, description string not null, destination string not null, path string not null, owner string not null, expiration int not null, primary key (id, owner), unique(path, owner))"
// );

const query_getAllLink = db.prepare(
  "SELECT rowid as id, name, description, destination, path, expiration FROM links WHERE owner=? ORDER BY name ASC"
);

const query_getOneLink = db.prepare(
  "SELECT rowid as id, name, description, destination, path, expiration FROM links WHERE owner=? AND rowid=? LIMIT 1"
);

const query_setLink = db.prepare(
  "INSERT OR IGNORE INTO links(name, description, destination, path, expiration, owner) VALUES (?, ?, ?, ?, ?, ?) "
);

const query_updateLink = db.prepare(
  "UPDATE links SET name=?, description=?, expiration=? WHERE owner=? AND rowid=? LIMIT 1"
);

const query_updateLinkNoExpire = db.prepare(
  "UPDATE links SET name=?, description=? WHERE owner=? AND id=? LIMIT 1"
);

const query_delLink = db.prepare(
  "DELETE from links WHERE owner=? AND rowid=? LIMIT 1"
);

const query_redirect = db.prepare(
  "SELECT destination FROM links WHERE path=? AND (expiration = 0 OR expiration>?) ORDER BY name ASC LIMIT 1"
);

export default db;
export const queries = {
  link: {
    all: query_getAllLink,
    one: query_getOneLink,
    set: query_setLink,
    del: query_delLink,
    update: {
      expires: query_updateLink,
      permanent: query_updateLinkNoExpire
    }
  },
  redirect: query_redirect
}