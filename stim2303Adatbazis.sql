CREATE DATABASE filmek;

USE filmek;

CREATE TABLE films (
    filmID INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(128) NOT NULL,
	releaseYear INT NOT NULL,
	description NVARCHAR(1024),
	genre NVARCHAR(64),
	coverImage NVARCHAR(256),
	ownerID INT
);

CREATE TABLE reviews (
	ratingID INT IDENTITY(1,1) PRIMARY KEY,
	filmID INT FOREIGN KEY REFERENCES films,
	rating INT NOT NULL,
	review NVARCHAR(1024)
);

CREATE TABLE users (
    userID INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(64) NOT NULL UNIQUE,
    password NVARCHAR(256) NOT NULL,
);

CREATE TABLE owners (
	filmID INT FOREIGN KEY REFERENCES films,
	userID INT FOREIGN KEY REFERENCES users
);

CREATE TABLE reviewowners (
	userID INT FOREIGN KEY REFERENCES users,
	ratingID INT FOREIGN KEY REFERENCES reviews
);

SELECT * FROM films
SELECT * FROM reviews
SELECT * FROM users
SELECT * FROM owners
SELECT * FROM reviewowners

SELECT ratingID FROM reviewowners WHERE userID = @userID

/*
DELETE FROM films;
DELETE FROM reviews;
DELETE FROM users
DELETE FROM owners
DELETE FROM reviewowners

DROP TABLE films;
DROP TABLE reviews;
DROP TABLE users
DROP TABLE owners
DROP TABLE reviewowners
*/
