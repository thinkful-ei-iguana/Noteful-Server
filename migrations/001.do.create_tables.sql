CREATE TABLE notes
(
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name TEXT NOT NULL,
  content TEXT NOT NULL,
  date_modified DATE,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE folders 
(
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  folder_name TEXT NOT NULL,
  date_modified DATE
);