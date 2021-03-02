BEGIN;

/* WIPE OUT ALL PRE-EXISTING TABLES */
DROP TABLE IF EXISTS USERAUTH, USERMSGS, USERINFO, PRJINFOS, NDSINFOS, USERS_FOLLOW_USERS;

/* Define User authentification table */
CREATE TABLE USERAUTH (
    id_auth INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

/* Define User messages table */
CREATE TABLE USERMSGS (
    id_msg INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_from INT REFERENCES USERAUTH(id_auth) ON DELETE CASCADE
);

/* Define User informations table */
CREATE TABLE USERINFO (
    id_info INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pseudo TEXT NOT NULL,
    description TEXT NOT NULL,
    id_user INT REFERENCES USERAUTH(id_auth) ON DELETE CASCADE
);

/* Define Project informations table */
CREATE TABLE PRJINFOS (
    id_project INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT NOT NULL,
    id_author INT REFERENCES USERAUTH(id_auth) ON DELETE CASCADE
);

/* Define Project needs informations table */
CREATE TABLE NDSINFOS (
    id_need INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    state TEXT NOT NULL,
    id_project INT REFERENCES PRJINFOS(id_project) ON DELETE CASCADE
);

/* Define Followers table */
CREATE TABLE USERS_FOLLOW_USERS (
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_user_from INT REFERENCES USERAUTH(id_auth) ON DELETE CASCADE,
  id_user_to INT REFERENCES USERAUTH(id_auth) ON DELETE CASCADE,
  PRIMARY KEY (id_user_from, id_user_to)
);

/* INSERT INTO users (name, email, password) VALUES
('Michel','michel@michel', crypt('password1', gen_salt('md5'))),
('Bruce Reynolds','bruce@reynolds', crypt('password1', gen_salt('md5'))),
('Johann Kehl','johannkehl@oclock.com', crypt('password1', gen_salt('md5'))),
('Johanna Rolland','johannarolland@oclock.com', crypt('password1', gen_salt('md5'))); */

COMMIT;