BEGIN TRANSACTION;
DROP TABLE IF EXISTS "scouts";
CREATE TABLE IF NOT EXISTS "scouts" (
	"atleta_id"	INTEGER NOT NULL UNIQUE,
	"rodada"	INTEGER NOT NULL,
	"ano"	INTEGER NOT NULL,
	"rb"	INTEGER,
	"g"	INTEGER,
	"a"	INTEGER,
	"fs"	REAL,
	"ff"	REAL,
	"fd"	REAL,
	"ft"	INTEGER,
	"dd"	INTEGER,
	"dp"	INTEGER,
	"gc"	INTEGER,
	"cv"	INTEGER,
	"ca"	INTEGER,
	"gs"	INTEGER,
	"pp"	INTEGER,
	"fc"	REAL,
	"i"	REAL,
	"pe"	REAL,
	FOREIGN KEY("atleta_id") REFERENCES "atletas"("id"),
	PRIMARY KEY("atleta_id","rodada","ano")
);
DROP TABLE IF EXISTS "atletas";
CREATE TABLE IF NOT EXISTS "atletas" (
	"id"	INTEGER NOT NULL UNIQUE,
	"apelido"	TEXT NOT NULL,
	"nome"	TEXT NOT NULL,
	"foto"	TEXT NOT NULL,
	"clube_id"	INTEGER NOT NULL,
	"posicao_id"	INTEGER NOT NULL,
	"status_id"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("status_id") REFERENCES "status"("id"),
	FOREIGN KEY("clube_id") REFERENCES "clubes"("id"),
	FOREIGN KEY("posicao_id") REFERENCES "posicoes"("id")
);
DROP TABLE IF EXISTS "status";
CREATE TABLE IF NOT EXISTS "status" (
	"id"	INTEGER NOT NULL,
	"nome"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "posicoes";
CREATE TABLE IF NOT EXISTS "posicoes" (
	"id"	INTEGER NOT NULL,
	"nome"	TEXT NOT NULL UNIQUE,
	"abreviacao"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "clubes";
CREATE TABLE IF NOT EXISTS "clubes" (
	"id"	INTEGER NOT NULL,
	"nome_fantasia"	TEXT NOT NULL UNIQUE,
	"abreviacao"	TEXT NOT NULL,
	"escudo30"	TEXT NOT NULL,
	"escudo45"	TEXT NOT NULL,
	"escudo60"	TEXT NOT NULL,
	PRIMARY KEY("id")
);
COMMIT;
