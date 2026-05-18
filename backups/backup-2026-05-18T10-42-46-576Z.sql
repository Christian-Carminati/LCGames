--
-- PostgreSQL database dump
--

\restrict BIsxnHrbIgDE3celfgfr8WAeUTTc8UG8SS9la8ui6ZNrtFkt1jwwOeA5vozXhoh

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: prisma_postgres; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS prisma_postgres WITH SCHEMA public;


--
-- Name: EXTENSION prisma_postgres; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION prisma_postgres IS 'prisma_postgres';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO prisma_migration;

--
-- Name: Game; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Game" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    platform text NOT NULL,
    genre text,
    "imageUrl" text,
    url text,
    "romPath" text,
    "scoreConfig" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "youtubeUrl" text,
    "difficultyConfig" jsonb,
    "palNtscConfig" jsonb,
    published boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Game" OWNER TO prisma_migration;

--
-- Name: Score; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Score" (
    id text NOT NULL,
    value integer NOT NULL,
    "userId" text NOT NULL,
    "gameSlug" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    difficulty integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Score" OWNER TO prisma_migration;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO prisma_migration;

--
-- Name: User; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO prisma_migration;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO prisma_migration;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO prisma_migration;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Game" (id, slug, title, description, platform, genre, "imageUrl", url, "romPath", "scoreConfig", "createdAt", "updatedAt", "youtubeUrl", "difficultyConfig", "palNtscConfig", published) FROM stdin;
cmo1wflq50000fj4kzvvzbqx2	testprg	TestPRG		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/heroisback-L6nJdPYNRNr6iWslywlxZ5ytBzEiAT.prg	{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-04-16 19:55:28.062	2026-04-17 16:53:06.902	\N	null	null	f
cml6h0avv000f5ii0l9iavuq3	bagman-strikes-back-c64	Bagman Strikes Back (C64)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982. It is also the sequel to Bagman Comes Back.	C64 LC-Games	Platformer	https://img.itch.zone/aW1nLzgzMTc0NDIucG5n/315x250%23c/%2FD4cFR.png	https://lowcarb.itch.io/bagman-strikes-back-c64	/roms/bagmanstrikesback.d64	{"type": "bcd", "length": 3, "address": "0x0aa7", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.803	2026-04-19 07:51:00.224	\N	{"address": "0x4000", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD"]}	{"address": "0x4001", "baseOffset": "0x4f9eb0", "numStandards": 2}	t
cmnta7p580000d2gprm5wiq9w	commando-c64	Commando (C64)	Released in 1985 and ported by Elite Systems, Commando is one of the most iconic run-and-gun vertical shooters for the C64	C64 Arcade	Arcade	https://www.lemon64.com/assets/images/games/screens/commando/commando_03.png	https://www.lemon64.com/game/commando	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Commando-mcyCLO6RsxxBgZjwXFDAfISbukzIM4.crt	{"type": "bcd", "length": 3, "address": "0x04F7", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-10 19:11:18.284	2026-05-06 20:09:45.677	\N	null	null	t
cml6h0awj000g5ii0nz5u27m0	tutankham-c64	Tutankham (C64)	This game is a C64 conversion of Tutankham, an arcade game developed by Konami in 1982.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzgyMDg0NjcucG5n/315x250%23c/rwtb72.png	https://lowcarb.itch.io/tutankham-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Tutankham-HXPHjXvulmBD5ki4nzn5FWhaC4TNYo.d64	{"type": "bcd", "length": 3, "address": "0x14df", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.826	2026-04-08 09:03:28.197	\N	{"address": "0x805D", "numLevels": 4, "baseOffset": "0x4f9eb0", "levelNames": ["NOVICE", "MEDIUM", "HARD", "EXPERT"]}	null	t
cml6h0at6000b5ii0dooxbgjn	scout-the-stray-c64	Scout The Stray (C64)	The character that the player will have to control is Scout, a stray dog, who has to go through different mazes munching on the bones scattered in them and avoiding being captured by the dog catchers who are chasing him.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzEwNzI1Nzc1LnBuZw==/315x250%23c/G5bYwG.png	https://lowcarb.itch.io/scout-the-stray-c64	/roms/ScoutTheStray.d64	{"type": "bcd", "length": 3, "address": "0x1e29", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.706	2026-04-08 09:06:16.928	\N	{"address": "0x2AB1", "numLevels": 4, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT"]}	null	t
cml6h0ako00015ii0sxmleugi	space-invaders-one-button-c64	Space Invaders One Button (C64)	This game is a C64 conversion of Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	C64 LC-Games	Shooter	https://img.itch.zone/aW1nLzIxMTM2OTM5LnBuZw==/315x250%23c/HLjg%2FB.png	https://lowcarb.itch.io/space-invaders-one-button-c64	/roms/SpaceInvadersOneButton.d64	{"type": "bcd", "length": 3, "address": "0x0c96", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.4	2026-04-08 09:04:26	\N	null	null	t
cml6h0aqs00085ii0b81nj396	dig-dug-revival-c64	Dig Dug Revival (C64)	This game is a homage to Dig Dug, an arcade game developed by Namco in 1982.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzE0NTYzODQ5LnBuZw==/315x250%23c/BOc2V2.png	https://lowcarb.itch.io/dig-dug-revival-c64	/roms/DigDugRevival.d64	{"type": "bcd", "length": 3, "address": "0x12cf", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.62	2026-04-08 08:45:06.086	\N	{"address": "0x2299", "numLevels": 5, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT", "MASTER"]}	{"address": "0x229A", "baseOffset": "0x4f9eb0", "numStandards": 2}	t
cml6h0alu00025ii0bnoaekwa	space-invaders-c64	Space Invaders (C64)	This game is a C64 conversion of Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	C64 LC-Games	Shooter	https://img.itch.zone/aW1nLzIwNjk0NDQxLnBuZw==/315x250%23c/GXcYtk.png	https://lowcarb.itch.io/space-invaders-c64	/roms/SpaceInvaders.d64	{"type": "bcd", "length": 3, "address": "0x0c78", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.442	2026-04-08 09:04:56.994	\N	{"address": "0x1CF4", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["NOVICE", "MEDIUM", "ARCADE"]}	null	t
cml6h0axx000i5ii0vtuhojjz	lady-pac	Lady Pac (PC)	Lady Pac is a homage to Ms. Pac-Man, an arcade game published by Midway in 1982.	PC	Action	https://img.itch.zone/aW1nLzY3MDkwMzcucG5n/315x250%23c/hJMKw7.png	https://lowcarb.itch.io/lady-pac-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-03 10:43:23.876	2026-02-11 14:17:28.25	https://www.youtube.com/watch?v=aiqsij1pmGU	null	\N	t
cml6h0av9000e5ii0eur7lfa0	tutankham-returns-c64	Tutankham Returns (C64)	This game is a tribute to Tutankham, an arcade game developed by Konami in 1982.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzg0ODM5NzkucG5n/315x250%23c/E1jWJ6.png	https://lowcarb.itch.io/tutankham-returns-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/TutankhamReturns-sBPUWI61mUBInzE5Dmsds0YibcJs4w.d64	{"type": "bcd", "length": 3, "address": "0x14df", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.781	2026-04-08 09:02:51.818	\N	{"address": "0x848B", "numLevels": 4, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT"]}	null	t
cml6h0ap300065ii09a1dnnps	dig-dug-c64	Dig Dug (C64)	This game is a C64 conversion of Dig Dug, an arcade game developed by Namco in 1982.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzE0NTUzNDk3LnBuZw==/315x250%23c/Wymflj.png	https://lowcarb.itch.io/dig-dug-c64	/roms/digdug.d64	{"type": "bcd", "length": 3, "address": "0x1295", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.559	2026-04-08 08:43:51.536	\N	{"address": "0x20F8", "numLevels": 5, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT", "MASTER"]}	null	t
cmoep8gj60000fgmdh9onx0f8	international-karate-c64	International Karate (C64)	International Karate simulates a Karate competition in which 2 fighters compete against each other in every round	C64 Arcade	Fighting	https://www.lemon64.com/uploads/c64/images/games/screens/international_karate/international_karate_08.png	https://www.c64-wiki.com/wiki/International_Karate	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/International_Karate-XLPc1QcIb6OxYFzl6K2YQ4xWLkBtiy.d64	{"type": "bcd", "length": 3, "address": "0x0074", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-25 18:54:57.715	2026-04-25 18:54:57.715	\N	null	null	t
cmohkousf0000y0hhwvoi8jd3	missile-defence-c64	Missile Defence (C64)	Your mission is to protect six major cities against a global nuclear attack, else perish with them.	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvMTk5NDk3OC8xMTcyNzY2MS5wbmc=/794x1000/7UbX1C.png	https://drmortalwombat.itch.io/missile-defence	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/missiledefence-PgYRfiE8vb2dF1mH4O8lG9H8ms8PMB.prg	{"type": "string", "length": 8, "address": "0xc801", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-27 19:11:03.135	2026-04-27 19:11:03.135	\N	null	null	t
cmo4tpuuo00008y2oc24drlxs	ghosts-n-goblins-c64	Ghosts'n Goblins (C64)	Ghosts 'n' Goblins is the authentic home computer version of the classic coin-operated arcade game from Capcom, authors of the best sellers including the world beating Commando and 1942.	C64 Arcade	Arcade	https://www.lemon64.com/assets/images/games/screens/ghosts_n_goblins/ghosts_n_goblins_03.png	https://www.lemon64.com/game/ghosts-n-goblins	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Ghosts_n_Goblins-D4yogot4Exg5ywQtaJYfpriqu7fX3w.d64	{"type": "bcd", "length": 2, "address": "0x3598", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 100}	2026-04-18 21:02:46.128	2026-04-18 21:02:46.128	\N	null	null	t
cml6h0azu000l5ii0zu11a1et	bagman-comes-back	Bagman Comes Back (PC)	This game is a homage to Bagman, an arcade game released by Valadon Automation in 1982.	PC	Platformer	https://img.itch.zone/aW1nLzUwNzkyOTgucG5n/315x250%23c/YMRGlq.png	https://lowcarb.itch.io/bagman-comes-back		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.946	2026-02-11 14:15:17.153	https://www.youtube.com/watch?v=HVzHGuLwRXA	null	\N	t
cmo8zl4x90000rk6koyrrpxke	gyruss-c64	Gyruss (C64)	Gyruss (a brilliant Konami arcade conversion) for the C64 – recovered thanks to preservationist Ken Van Mersbergen.\n\n	C64 Arcade	Arcade	https://www.c64-wiki.com/images/thumb/9/95/Gyruss05.jpg/450px-Gyruss05.jpg	https://www.c64-wiki.com/wiki/Gyruss	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/gyruss-LTv3DtlLgTdSOQFuRLYu09joVSPHEp.t64	{"type": "string", "length": 6, "address": "0x042a", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-21 18:58:08.301	2026-04-21 19:00:56.756	\N	null	null	t
cml6h0atv000c5ii0pf14d12k	bagman-strikes-back	Bagman Strikes Back (PC)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982. It is also the sequel to Bagman Comes Back.	PC	Platformer	https://img.itch.zone/aW1nLzk3ODk4OTkucG5n/315x250%23c/wOKM4e.png	https://lowcarb.itch.io/bagman-strikes-back-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-03 10:43:23.731	2026-02-11 14:16:40.627	https://www.youtube.com/watch?v=H06rj4o-v78	null	\N	t
cml6h0b2i000p5ii0pt91pgjo	divoc-91	Divoc-91 (PC)	This game is inspired by Gyruss, an arcade game designed by Yoshiki Okamoto and released by Konami in 1983.	PC	Shooter	https://img.itch.zone/aW1nLzQ0NjYzNjAucG5n/315x250%23c/DGfSxL.png	https://lowcarb.itch.io/divoc-91		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.041	2026-02-11 14:17:11.026	https://www.youtube.com/watch?v=3ysukAcDHTM	null	\N	t
cmle8cz2o000004l1jqrk63ja	hyper-viper-amiga	Hyper Viper (Amiga)		Amiga	Arcade	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODUucG5n/794x1000/DmoAry.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": ""}	2026-02-08 21:03:27.888	2026-02-14 20:09:14.848	https://www.youtube.com/watch?v=qklVnnpDSsg	null	\N	t
cml6h0b6h000v5ii0v6hhjrjm	randompac	RandomPac (PC)	RandomPac is a tribute to Pac-Man (Pakkuman), an arcade game released by Namco in 1980.	PC	Action	https://img.itch.zone/aW1nLzMyNDAwMzcucG5n/315x250%23c/DQb5oV.png	https://lowcarb.itch.io/randompac		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.185	2026-02-11 14:18:22.803	https://www.youtube.com/watch?v=dMDR9rEJNeA&t=1s	null	\N	t
cml6h0b0j000m5ii01rfty9cy	space-invaders	Space Invaders (PC)	This game is a tribute to Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	PC	Shooter	https://img.itch.zone/aW1nLzQ4MjU5MTIucG5n/315x250%23c/kn0shr.png	https://lowcarb.itch.io/space-invaders	/roms/SpaceInvaders.d64	{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.971	2026-02-11 14:18:41	https://www.youtube.com/watch?v=iuBUGMH_jXo	null	\N	t
cml6h0b4j000s5ii0xycxm5j1	tutankham-returns	Tutankham Returns (PC)	This game is a homage to Tutankham, an arcade game developed by Konami in 1982.	PC	Action	https://img.itch.zone/aW1nLzM3MzE0MjcucG5n/315x250%23c/rJZufH.png	https://lowcarb.itch.io/tutankham-returns		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.115	2026-02-11 14:18:56.829	https://www.youtube.com/watch?v=HgkxAKum8i8	null	\N	t
cml6h0ams00035ii0zh8m2be5	mike-mech-2-c64	Mike Mech 2 (C64)	The game is set inside a cargo spaceship which, during one of the countless journeys to transport minerals to the home planet Gravion, was invaded by alien entities. The aim is to guide Mike, the on-board mechanic, inside the various cargo holds (four in total) and activate all the levers present in them.	C64 LC-Games	Platformer	https://img.itch.zone/aW1nLzE5NzA0NjE5LnBuZw==/315x250%23c/nUGY6u.png	https://lowcarb.itch.io/mike-mech-2-c64	/roms/mikemech2.d64	{"type": "bcd", "length": 3, "address": "0x14d1", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.476	2026-04-08 09:07:55.176	\N	null	null	t
cml6h0b36000q5ii0qselshxr	pac-mazing	Pac-Mazing (PC)	Pac-Mazing is a homage to Pac-Mania, an arcade game developed by Namco in 1987.	PC	Action	https://img.itch.zone/aW1nLzQwMTY5MDQucG5n/315x250%23c/yKCGaV.png	https://lowcarb.itch.io/pac-mazing		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.066	2026-02-11 14:18:06.052	https://www.youtube.com/watch?v=qm2hCy934uw	null	\N	t
cml6h0b17000n5ii0can5bu03	amiga-games-pack	Amiga games pack	These are the games I programmed in the years 1995/1998 for the Commodore Amiga.	Amiga	Retro	https://img.itch.zone/aW1nLzQ2NDQzODEucG5n/315x250%23c/4Z0T%2FY.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.995	2026-02-14 20:08:43.275	https://www.youtube.com/watch?v=qklVnnpDSsg	null	\N	t
cmlmq3bjb000004l48xyn7hrf	marietto-amiga	Marietto (Amiga)	This game is the conversion of the original Marietto game I programmed for the Commodore Amiga in 1997.	Amiga	Action	https://img.itch.zone/aW1nLzMyNTgwOTEucG5n/315x250%23c/YTUeul.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 19:41:59.975	2026-02-14 20:09:43.501	https://www.youtube.com/watch?v=qklVnnpDSsg	null	\N	t
cmnw64agz0000esikuboj4htu	burger-time-c64	Burger Time (C64)	is a 1982 Japanese arcade platform video game created by Data East Corporation for the DECO Cassette System	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvMjMzNzc1NS8xMzg0OTIyNy5wbmc=/794x1000/qQjX8v.png	https://arlagames.itch.io/burger-time	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/burger_104_FH-tqeqdAVgDuck7BNDBZV49op64aAwTq.d64	{"type": "bcd", "length": 3, "address": "0x3FEE", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-12 19:39:59.364	2026-04-17 16:53:16.391	\N	null	null	t
cmlr05323000004jsqabiv383	dig-dug-revival-pc	Dig Dug Revival (PC)	This game is a homage to Dig Dug, an arcade game developed by Namco in 1982.	PC	Action	https://img.itch.zone/aW1nLzU1MDc5OTMucG5n/315x250%23c/LT%2FPty.png	https://lowcarb.itch.io/dig-dug-revival		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-17 19:34:23.163	2026-02-17 19:34:23.163	https://www.youtube.com/watch?v=-OHMLXBxPAg	null	\N	t
cmm12ds37000004jlleweq79i	croins-amiga	Croins (Amiga)	Destroy all the Croin Asteroids and eliminate the enemy ships you will meet within them. Every four stages or so you'll have to face and destroy an enemy mother-ship. In the subsequent stage you will need to pick up as many diamonds as possible before time runs out.	Amiga	Shoot'em Up	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODQucG5n/794x1000/3JjZc1.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-24 20:34:49.843	2026-02-24 20:34:49.843	https://www.youtube.com/watch?v=qklVnnpDSsg	null	\N	t
cmo4q38o90000wjrsc2662fy9	yoomp-c64	Yoomp! (C64)	YOOMP! 64 is a Commodore 64 port of the classic Atari XE/XL indie arcade game	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvMjg2NTMxLzEzOTU1MTYucG5n/794x1000/MGaNto.png	https://rgcddev.itch.io/yoomp-64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/yoomp64-7V1j5A8IK1yhHC06pDaT7ILW9Ul1Fz.d64	{"type": "bcd", "length": 3, "address": "0x006d", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-18 19:21:12.105	2026-04-18 19:21:12.105	\N	null	null	t
cmoags4b70000bjloandi6cpi	space-station-23-c64	Space Station 23 (C64)	Space Station 23 has been hit by an asteroid and it's partly destroyed.\n\nThe space station is also invaded by a nasty species of aliens.\n\nJoe Phoenix is back from the jungle and is now sent to the rescue. His mission is to collect resources to restore the full power of the space station and evict and kill all the aliens. 	C64 Arcade	Adventure, Miscellaneous	https://img.itch.zone/aW1hZ2UvMTk1MjU2My8xMTQ5MTcwMi5wbmc=/794x1000/wCH6k7.png	https://vector5games.itch.io/space-station-23	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/space23_v2-y769Y0Gy3thBxYagjGjYsyzyeTxrL1.d64	{"type": "string", "length": 6, "address": "0x0495", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-22 19:47:13.747	2026-04-22 19:47:13.747	\N	null	null	t
cmo5zqtvd0000141ffbs0e62d	arkanoid-c64	Arkanoid (C64)	Arkanoid is a block breaker video game. Its plot involves the starship Arkanoid being attacked by a mysterious entity from space named DOH	C64 Arcade	Arcade	https://www.lemon64.com/assets/images/games/screens/arkanoid/arkanoid_03.png	https://www.lemon64.com/game/arkanoid	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Arkanoid__J1_-bYI6kahyPrSgOR4dHkGfABlSNVGNSr.crt	{"type": "bcd", "length": 3, "address": "0x0927", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-04-19 16:39:15.385	2026-05-09 19:01:07.209	\N	null	null	t
cml6h0anm00045ii0g2w5dwxi	randompac-c64	RandomPac (C64)	RandomPac is a tribute to Pac-Man, an arcade game released by Namco in 1980.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzIzNzE3NjU0LnBuZw==/315x250%23c/HqJDzf.png	https://lowcarb.itch.io/randompac-c64	/roms/RandomPac.d64	{"type": "bcd", "length": 3, "address": "0x0f09", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.506	2026-04-08 09:07:12.59	\N	{"address": "0x261A", "numLevels": 4, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT"]}	null	t
cml6h0ax9000h5ii02xfch0e6	bagman-comes-back-c64	Bagman Comes Back (C64)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982.	C64 LC-Games	Platformer	https://img.itch.zone/aW1nLzc0OTc2MTgucG5n/315x250%23c/AR8XCY.png	https://lowcarb.itch.io/bagman-comes-back-c64-version	/roms/bagmancomesback.d64	{"type": "bcd", "length": 3, "address": "0x0e85", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.853	2026-04-08 08:41:35.58	\N	{"address": "0x167C", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD"]}	{"address": "0x167D", "baseOffset": "0x4f9eb0", "numStandards": 2}	t
cmmyrxwaa0004b4mfu2vv0xtb	prova	Mike Mech (Amiga)	The game is set inside a spaceship invaded by alien entities who have disabled the power batteries needed to operate the rockets. The aim is to guide Mike, the mechanic on board, inside the various power rooms and reactivate the batteries.	Amiga	Platformer	https://img.itch.zone/aW1hZ2UvNDM4MDM2MS8yNjE0NDg0Mi5wbmc=/794x1000/OCdiIH.png	https://lowcarb.itch.io/mike-mech-amiga		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-03-20 10:46:42.61	2026-03-20 20:10:02.982	https://www.youtube.com/watch?v=7hmnsj8CwrM	null	null	t
cmlmqshdw000004jywq4w8two	kangy	Kangy (Amiga)	The likeable Kangy, a cute kangaroo, has to make his way around screen after screen of platforms littered with fruit and populated with nasty creatures. The fruit must be collected and deposited in wooden boxes in order for Kangy to progress to the next screen.	Amiga	Platform	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODYucG5n/794x1000/QFPZOO.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 20:01:33.956	2026-03-20 20:34:44.161	https://www.youtube.com/watch?v=qklVnnpDSsg	null	null	t
cmlmr1a27000104jycalcg57z	slalom-speciale	Slalom speciale (Amiga)	In it you ski around the flags on the way to the finish line and try to get the best time possible, with penalties for missed flags, it supports up to 8 players.	Amiga	Sports	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODcucG5n/794x1000/J6809B.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 20:08:24.367	2026-03-20 20:35:22.876	https://www.youtube.com/watch?v=qklVnnpDSsg	null	null	t
cmmzdboli00053kghf8r09xd8	mike-mech-pc	Mike Mech (PC)	The game is set inside a spaceship invaded by alien entities who have disabled the power batteries needed to operate the rockets. The aim is to guide Mike, the mechanic on board, inside the various power rooms and reactivate the batteries.	PC	Platformer	https://img.itch.zone/aW1nLzEwODY4NjgxLnBuZw==/315x250%23c/h1JzAT.png	https://lowcarb.itch.io/mike-mech-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-03-20 20:45:17.766	2026-03-20 20:45:17.766	https://www.youtube.com/watch?v=ofCXmeJQRxQ	null	null	t
cmo67xp9q0000i6240xxhksdx	bubble-bobble-remastered-c64	Bubble Bobble Remastered (C64)	Bubble Bobble C64 Remastered is a fan-made radical enhancement—with all-new graphics—of the Commodore 64 version of Taito's Bubble Bobble, originally developed by Software Creations and published by Firebird in 1987. 	C64 Arcade	Arcade	https://www.lemon64.com/assets/images/games/screens/bubble_bobble_remastered/bubble_bobble_remastered_04.png	https://daves-retro-forge.itch.io/bubble-bobble-c64-remastered	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Bubble_Bobble_Remastered_1.1b-mFH7fzt17ZhBIw58i1XcVw2Qm8hFqB.prg	{"type": "bcd", "length": 3, "address": "0x0400", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 10}	2026-04-19 20:28:32.943	2026-04-19 20:30:24.599	\N	null	null	t
cmnm6s2qk000013ecmn4d144d	galaga-c64	Galaga (C64)	The player controls a spacecraft at the bottom of the screen and must destroy waves of insect-like aliens arriving from above.	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvMTExMTQ4Ni83MDU2MjQ3LnBuZw==/794x1000/bmpDyG.png	https://arlagames.itch.io/galaga-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/galagaV106_FH-z8fV3GgzXjUyHC1b2bAz8F5TacdPJo.d64	{"type": "bcd", "length": 3, "address": "0x8158", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-05 20:00:47.324	2026-04-17 16:53:38.545	\N	null	null	t
cmo04ktwf000011sjrvcns33q	testtap	TestTap		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Hyper_Sports-wNanTXoSnYznsfWmapW7fp6L6EDevQ.tap	{"type": "bcd", "length": 4, "address": "0x0054", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-15 14:07:56.512	2026-04-28 20:11:28.163	\N	null	null	f
cmnptxhkd0000ixx9emji6r97	galaxian-c64	Galaxian (C64)	The aim is to clear each swarm of aliens while maximising your score	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvMTI0MTcyNS83MjQzNTM3LnBuZw==/794x1000/K00Cqi.png	https://arlagames.itch.io/galaxian-dx-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/galaxian_FH-DImczejcn1fohGkfsZACP8MOnlUZ8F.d64	{"type": "bcd", "length": 3, "address": "0x8158", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-08 09:12:09.517	2026-04-17 16:53:46.882	\N	null	null	t
cmo4rpgn30000drxvj0yi8zok	testd64	TestD64		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Hyper_Sports-eU1ATRaapBMSNVM2qi4C0m7fAGtBSg.d64	{"type": "byte", "length": 0, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-04-18 20:06:28.48	2026-04-28 20:11:47.397	\N	null	null	f
cmobv8nu80000t5sgzhux8egz	superstar-chefs-c64	Superstar Chefs (C64)	The secret recipes have been stolen and scattered all across Cocktail Land. Help the Superstar Chefs recover them in a vibrant world filled with cartoon-style creatures, fruit, and hidden treasures.	C64 Arcade	Platformer	https://donut80.com/img/C64SuperstarChefs2.png	https://donut80.com/c64.html	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/superstarchefs-O5uZsAuxYWpqWBPIjumznMpz70MgEo.prg	{"type": "bcd", "length": 3, "address": "0x1b63", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-23 19:19:46.353	2026-04-23 19:20:47.203	\N	null	null	t
cmnpu7rag0001ixx9v59gel8q	h-e-r-o-is-back-c64	H.E.R.O. Is Back (C64)	This game is a homage to H.E.R.O. from John Van Ryzin, published by Activision in 1984.	C64 LC-Games	Platformer	https://img.itch.zone/aW1nLzIyNDIzNzU2LnBuZw==/315x250%23c/gH8igG.png	https://lowcarb.itch.io/hero-is-back-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/HeroIsBack-U2riY6a3NdXBKJacdO8Hq0hAFHkwIE.d64	{"type": "bcd", "length": 3, "address": "0x1e37", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-08 09:20:08.681	2026-04-08 09:20:08.681	\N	null	null	t
cmmi9lox40000y9xoyeu9uwl9	mike-mech-c64	Mike Mech (C64)	The game is set inside a spaceship invaded by alien entities who have disabled the power batteries needed to operate the rockets. The aim is to guide Mike, the mechanic on board, inside the various power rooms and reactivate the batteries.	C64 LC-Games	Platformer	https://img.itch.zone/aW1nLzk3NDI2ODMucG5n/315x250%23c/RwkyeI.png	https://lowcarb.itch.io/mike-mech-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/mikemech-I26Yc05UVQee21aFHREKKdy2Mh9HsE.d64	{"type": "bcd", "length": 3, "address": "0x1df6", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-03-08 21:29:01.122	2026-04-08 09:08:27.586	\N	{"address": "0x8743", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["LAYOUT A", "LAYOUT B", "LAYOUT A+B"]}	{"address": "0x8744", "baseOffset": "0x4f9eb0", "numStandards": 2}	t
cml6h0ari00095ii0lxek0i08	the-last-defender-c64	The Last Defender (C64)	The year is 2073. A hostile alien race has arrived on earth, after crossing countless star systems, with the aim of taking over the planet. Initially taken by surprise, humanity managed to react and organize a resistance that made it possible to fend off various enemy attacks. However, this was not enough to repel the alien invader who is now about to carry out his plans for conquest. Only one last brave hero is left to fight. The entire human species is now counting on him to defeat the enemy and regain their freedom.	C64 LC-Games	Shooter	https://img.itch.zone/aW1nLzEyMDczMjQ3LnBuZw==/315x250%23c/Oc6AWY.png	https://lowcarb.itch.io/the-last-defender-c64	/roms/thelastdefender.d64	{"type": "bcd", "length": 3, "address": "0x0f69", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.646	2026-04-08 09:03:56.544	\N	{"address": "0x2DB6", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["RECRUIT", "VETERAN", "CHAMPION"]}	null	t
cml6h0ayj000j5ii0aqbrbujp	lady-pac-c64	Lady Pac (C64)	Lady Pac is a homage to Ms. Pac-Man, an arcade game published by Midway in 1982.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzYzNzExMjAucG5n/315x250%23c/p0Mx3W.png	https://lowcarb.itch.io/lady-pac	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/LadyPac-L0pBz5L0TKJKLouQRsgGyAKQZuVB28.d64	{"type": "bcd", "length": 3, "address": "0x0a7e", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.899	2026-04-08 09:20:38.175	\N	{"address": "0x1adf", "numLevels": 48, "baseOffset": "0x4f9eb0", "levelNames": ["EASY - 3 LIVES - 4 GHOSTS - PAL SPEED", "EASY - 3 LIVES - 4 GHOSTS - NTSC SPEED", "EASY - 3 LIVES - 5 GHOSTS - PAL SPEED", "EASY - 3 LIVES - 5 GHOSTS - NTSC SPEED", "EASY - 4 LIVES - 4 GHOSTS - PAL SPEED", "EASY - 4 LIVES - 4 GHOSTS - NTSC SPEED", "EASY - 4 LIVES - 5 GHOSTS - PAL SPEED", "EASY - 4 LIVES - 5 GHOSTS - NTSC SPEED", "EASY - 5 LIVES - 4 GHOSTS - PAL SPEED", "EASY - 5 LIVES - 4 GHOSTS - NTSC SPEED", "EASY - 5 LIVES - 5 GHOSTS - PAL SPEED", "EASY - 5 LIVES - 5 GHOSTS - NTSC SPEED", "NORMAL - 3 LIVES - 4 GHOSTS - PAL SPEED", "NORMAL - 3 LIVES - 4 GHOSTS - NTSC SPEED", "NORMAL - 3 LIVES - 5 GHOSTS - PAL SPEED", "NORMAL - 3 LIVES - 5 GHOSTS - NTSC SPEED", "NORMAL - 4 LIVES - 4 GHOSTS - PAL SPEED", "NORMAL - 4 LIVES - 4 GHOSTS - NTSC SPEED", "NORMAL - 4 LIVES - 5 GHOSTS - PAL SPEED", "NORMAL - 4 LIVES - 5 GHOSTS - NTSC SPEED", "NORMAL - 5 LIVES - 4 GHOSTS - PAL SPEED", "NORMAL - 5 LIVES - 4 GHOSTS - NTSC SPEED", "NORMAL - 5 LIVES - 5 GHOSTS - PAL SPEED", "NORMAL - 5 LIVES - 5 GHOSTS - NTSC SPEED", "HARD - 3 LIVES - 4 GHOSTS - PAL SPEED", "HARD - 3 LIVES - 4 GHOSTS - NTSC SPEED", "HARD - 3 LIVES - 5 GHOSTS - PAL SPEED", "HARD - 3 LIVES - 5 GHOSTS - NTSC SPEED", "HARD - 4 LIVES - 4 GHOSTS - PAL SPEED", "HARD - 4 LIVES - 4 GHOSTS - NTSC SPEED", "HARD - 4 LIVES - 5 GHOSTS - PAL SPEED", "HARD - 4 LIVES - 5 GHOSTS - NTSC SPEED", "HARD - 5 LIVES - 4 GHOSTS - PAL SPEED", "HARD - 5 LIVES - 4 GHOSTS - NTSC SPEED", "HARD - 5 LIVES - 5 GHOSTS - PAL SPEED", "HARD - 5 LIVES - 5 GHOSTS - NTSC SPEED", "EXPERT - 3 LIVES - 4 GHOSTS - PAL SPEED", "EXPERT - 3 LIVES - 4 GHOSTS - NTSC SPEED", "EXPERT - 3 LIVES - 5 GHOSTS - PAL SPEED", "EXPERT - 3 LIVES - 5 GHOSTS - NTSC SPEED", "EXPERT - 4 LIVES - 4 GHOSTS - PAL SPEED", "EXPERT - 4 LIVES - 4 GHOSTS - NTSC SPEED", "EXPERT - 4 LIVES - 5 GHOSTS - PAL SPEED", "EXPERT - 4 LIVES - 5 GHOSTS - NTSC SPEED", "EXPERT - 5 LIVES - 4 GHOSTS - PAL SPEED", "EXPERT - 5 LIVES - 4 GHOSTS - NTSC SPEED", "EXPERT - 5 LIVES - 5 GHOSTS - PAL SPEED", "EXPERT - 5 LIVES - 5 GHOSTS - NTSC SPEED"]}	null	t
cmnpubg2j0002ixx9wj5tmz75	lock-n-chase-c64	Lock'n'Chase (C64)	This game is a C64 conversion of Lock'n'Chase, an arcade game developed by DECO in 1981.	C64 LC-Games	Action	https://img.itch.zone/aW1nLzE1MDQyNDEzLnBuZw==/315x250%23c/k5lSfq.png	https://lowcarb.itch.io/locknchase-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Lock_n_Chase-K1gT32vqZGF1YOAj2C7sorNQ2t5vVH.d64	{"type": "bcd", "length": 3, "address": "0x1354", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-04-08 09:23:00.764	2026-04-08 09:23:00.764	\N	{"address": "0x1E4E", "numLevels": 4, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "HARD", "EXPERT"]}	null	t
cmnpuo80t0003ixx9mmer8qaa	santa-s-troubles-c64	Santa's Troubles (C64)	The aim of the game is to help Santa Claus recover all the gift packages stolen by the criminals.	C64 LC-Games	Platformer	https://img.itch.zone/aW1hZ2UvMjQxMzEzNC8xNDI4MjI0OC5wbmc=/794x1000/YWsSD4.png	https://lowcarb.itch.io/santastroubles	/roms/santa'stroubles.d64	{"type": "bcd", "length": 3, "address": "0x0cd1", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-08 09:32:56.861	2026-04-08 09:32:56.861	\N	{"address": "0x249E", "numLevels": 3, "baseOffset": "0x4f9eb0", "levelNames": ["EASY", "NORMAL", "EXPERT"]}	{"address": "0x249F", "baseOffset": "0x4f9eb0", "numStandards": 2}	t
cmoltw7gd0000po2dng3tsn81	hyper-sports-c64	Hyper Sports (C64)	Is a sports game which consists of several disciplines, similar to Summer Games.	C64 Arcade	Sports	https://www.lemon64.com/uploads/c64/images/games/screens/hyper_sports/hyper_sports_01.png	https://www.lemon64.com/game/hyper-sports	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Hyper_Sports-hfKyJ6UJZmE0Kkkzemffw2WWr4LxU3.d64	{"type": "bcd", "length": 3, "address": "0x0380", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-30 18:39:47.389	2026-04-30 18:39:47.389	\N	null	null	t
cmon95igi00004jxzhp8tuein	lode-runner-c64	Lode Runner (C64)	Is an outstanding platform game, where gold treasures need to be collected in 150 levels.	C64 Arcade	Platformer	https://www.lemon64.com/uploads/c64/images/games/screens/lode_runner/lode_runner_02.png	https://www.c64-wiki.com/wiki/Lode_Runner	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Lode_Runner-5uclfjYb2RLsj5Nd389fa8f55NoZJs.d64	{"type": "bcd", "length": 4, "address": "0x0077", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-05-01 18:34:41.97	2026-05-01 18:34:41.97	\N	null	null	t
cmo0i2etq0000eqv0fwjhgi0d	testt64	TestT64		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/gyruss-YmLmRBsNRYwleatBoxm1R0R1vqa90h.t64	{"type": "string", "length": 6, "address": "0x042a", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-15 20:25:31.79	2026-04-22 19:43:26.165	\N	null	null	f
cmog5pr3t00009bbpme0af0az	the-great-giana-sisters-c64	The Great Giana Sisters (C64)	The game The Great Giana Sisters, is a fantastic jump and run game from the year 1987.	C64 Arcade	Platformer	https://www.c64-wiki.com/images/8/82/GianaSisters_Warp03.png	https://www.c64-wiki.com/wiki/The_Great_Giana_Sisters	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Great_Giana_Sisters_The-p3JDI2nu9YMgFeTUYCpXmgs8AJGWDw.crt	{"type": "bcd", "length": 3, "address": "0x0435", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-26 19:24:04.602	2026-04-26 19:25:22.714	\N	null	null	t
cmo7ksvvj0000ky361bmivis3	lost-cave-c64	Lost Cave (C64)	Bubble Bobble: Lost Cave brings the legendary fan-made arcade hack Lost Cave from 2012 to the C64, featuring 100 brand-new levels originally designed by TAITO as extra content for the console versions — now carefully adapted for Commodore’s beloved 8-bit machine.	C64 Arcade	Arcade	https://img.itch.zone/aW1hZ2UvNDA2OTEyOC8yNTE2MjU0OC5wbmc=/794x1000/le1skK.png	https://daves-retro-forge.itch.io/bubble-bobble-lost-cave-c64	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Lost_Cave_1.0a-dxuNxkw3NSeDHgtQ5zYWGJOQCG9Bui.prg	{"type": "bcd", "length": 3, "address": "0x0400", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 10}	2026-04-20 19:16:29.408	2026-04-20 19:16:29.408	\N	null	null	t
cmoda2rag0000euyx3fxnkwcz	bounder-c64	Bounder (C64)	Control Bounder, a tennis ball, as you bounce through each level, bouncing only on the grey slabs. If you miss, Bounder falls to his death.	C64 Arcade	Arcade	https://www.lemon64.com/uploads/c64/images/games/screens/bounder/bounder_02.png	https://www.lemon64.com/game/bounder	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Bounder_on_the_Rebound-napY4ZQA7UK5CKoYkr5fc4qC4kejrL.crt	{"type": "string", "length": 8, "address": "0x4773", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-24 19:02:51.304	2026-05-03 20:41:57.415	\N	null	null	f
cmoiznm350000kygor08242mt	uridium-c64	Uridium (C64)	15 carrier spaceships have garrisoned your galaxy and each of these ships tries to steal a valuable metal. Destroy the defending forces of each ship and land on them, to accomplish the mission. 	C64 Arcade	Arcade	https://www.lemon64.com/uploads/c64/images/games/screens/uridium/uridium_03.png	https://www.lemon64.com/game/uridium	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Uridium-oVAte5PQYspDTLaQwc6A5Kh9xq7JuN.crt	{"type": "bcd", "length": 3, "address": "0x0021", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-28 18:57:45.618	2026-05-11 18:47:52.892	\N	null	null	t
cmpa6ni37000010pjp1gzfe1d	testdigits	TestDigits		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/corescape-5nfFslhWgTFYp7u9WmsPTa21TGP7MW.prg	{"type": "digits", "length": 6, "address": "0x00c5", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-17 19:43:24.5	2026-05-17 20:38:53.346	\N	null	null	t
cmpa8258x0000v9ds4ia096zs	testbcd-little-endian	TestBCD Little Endian		C64 Arcade		\N	\N	/roms/bagmanstrikesback.d64	{"type": "bcd", "length": 3, "address": "0x0aa7", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-05-17 20:22:47.313	2026-05-17 20:23:50.874	\N	null	null	f
cmoo9q72s0000vckf15yn8r3d	rainbow-islands	Rainbow Islands	Our hero is sent on exploration tour through the rainbow country. The task that awaits him here is: Up to the sky!	C64 Arcade	Platformer	https://www.lemon64.com/uploads/c64/images/games/screens/rainbow_islands/rainbow_islands_03.png	https://www.c64-wiki.com/wiki/Rainbow_Islands	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Rainbow_Islands-fl1rdcMWoPAlzm0qrOukIpoLudB32l.crt	{"type": "bcd", "length": 3, "address": "0x115c", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-02 11:38:33.172	2026-05-02 11:38:33.172	\N	null	null	t
cmoop7a4100004kptsrpazy31	night-knight-c64	Night Knight (C64)	This is a C64 port of the amazing MSX game Night Knight.	C64 Arcade	Platformer	https://img.itch.zone/aW1hZ2UvMTE5MzgyOS82OTcxMjg5LnBuZw==/794x1000/WoXQrV.png	https://aris-soft.itch.io/night-knight	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/nightk-qus6l83wZXoyZWsnvIkqqCN46yHmFn.prg	{"type": "string", "length": 5, "address": "0x08c2", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-02 18:51:44.497	2026-05-02 18:51:44.497	\N	null	null	t
cmoq6km9r0000hpfkc4j728ia	wolfling-c64	Wolfling (C64)	Ling awakes in Baron Baranov's dungeon. The baron fears all creatures of the\nnight and Ling knows that her dark heritage is the reason for her\nimprisonment. Can she escape from the dungeon? Can she break her curse?	C64 Arcade	Platformer	https://img.itch.zone/aW1hZ2UvMzQ5MzMyLzE3NjU3NDYuZ2lm/original/QOqU%2Fn.gif	https://lazycow.itch.io/wolfling	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/wolfling14-EbSh139UYi3ej13xOsKdizOBqHvfsp.prg	{"type": "string", "length": 6, "address": "0xb0ce", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-03 19:45:46.432	2026-05-03 19:45:46.432	\N	null	null	t
cmokiqejn0000sfmknwfi4fd7	nebulus	Nebulus	There is something fishy on the planet NEBULUS. Somebody has started to build huge towers in the sea without having a building permission from the responsible authority. 	C64 Arcade	Arcade	https://www.c64-wiki.com/images/0/08/Nebulus-4wait.png	https://www.c64-wiki.com/wiki/Nebulus	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Nebulus-8K6a8UY2X4vddDaWSDTkToWgx01Yli.crt	{"type": "bcd", "length": 4, "address": "0x0054", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-04-29 20:39:34.691	2026-05-03 20:30:45.778	\N	null	null	t
cmorjiplr0000vlicvpn13ehb	scramble	Scramble	Is an early horizontally scrolling shoot'em up game, which was released in 1983.	C64 Arcade	Shoot'em Up	https://www.lemon64.com/uploads/c64/images/games/screens/scramble/scramble_02.png	https://www.lemon64.com/game/scramble	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Scramble-lZEse1IvpFet9SLBRlmukXnKXOP7M2.prg	{"type": "bcd", "length": 3, "address": "0x74d1", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-04 18:35:58.623	2026-05-04 18:35:58.623	\N	null	null	t
cmoszva750000ozx0eexhad7z	rodland-c64	Rodland (C64)	The game consists of 32 levels and some additional bonus levels.	C64 Arcade	Platformer	https://www.lemon64.com/uploads/c64/images/games/screens/rodland/rodland_04.png	https://www.c64-wiki.com/wiki/Rodland	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Rodland-BMxaZ0YSYNTgjj2aa7PVioQk9n303X.crt	{"type": "string", "length": 8, "address": "0xc02e", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-05 19:01:25.217	2026-05-05 19:01:25.217	\N	null	null	t
cmoufboyq00009nii2acnntka	qix-taito-c64	Qix Taito (C64)	Is a Commodore 64 Qix arcade game released in 1983. 	C64 Arcade	Arcade	https://www.lemon64.com/uploads/c64/images/games/screens/qix_(taito)/qix_(taito)_03.png	https://www.lemon64.com/game/qix-taito	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Qix-C0KaZP5Db3MWhjc9x1TWTgJbXUVgJH.crt	{"type": "int", "length": 3, "address": "0x1560", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-06 19:01:51.267	2026-05-06 19:01:51.267	\N	null	null	t
cmovw74y900004id5g4z90psk	batman-the-movie-c64	Batman - The Movie (C64)	It was released on 11 September 1989 for the Commodore 64	C64 Arcade	Action	https://www.c64-wiki.de/images/4/44/BatmanTM_6.png	https://www.c64-wiki.de/wiki/Batman_-_The_Movie	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Batman_The_Movie-sqOjUGKAcoBt8kjej08Zxl918xG7DX.crt	{"type": "string", "length": 7, "address": "0x4034", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-07 19:41:58.353	2026-05-07 19:41:58.353	\N	null	null	t
cmoxcpjsx0000g3vwia0e36et	dropzone-c64	Dropzone (C64)	It is the year 2085, the earth is widely destroyed and only a few humans have survived the robot wars.	C64 Arcade	Shoot'em Up	https://www.lemon64.com/uploads/c64/images/games/screens/dropzone/dropzone_03.png	https://www.c64-wiki.com/wiki/Dropzone	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Dropzone-ftRapuxN26KTKBxIrmP67bM0V8pgAg.crt	{"type": "bcd", "length": 3, "address": "0xb82a", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-08 20:11:57.442	2026-05-08 20:11:57.442	\N	null	null	t
cmozwntuf0000niu4muo1zzc5	pang-c64	Pang (C64)	Released in 1990 and published by Ocean Software, is a celebrated arcade conversion for the Commodore 64.	C64 Arcade	Shoot'em Up	https://www.lemon64.com/uploads/c64/images/games/screens/pang/pang_02.png	https://www.lemon64.com/game/pang	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Pang-iALOOC2cJctUhehUS8y1VOPwdblhPn.crt	{"type": "bcd", "length": 3, "address": "0x0004", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-10 15:06:01.815	2026-05-10 15:06:01.815	\N	null	null	t
cmp1kfti00001ugv8w4dmuapc	zynaps-c64	Zynaps (C64)	Is a horizontally scrolling shooter by Hewson Consultants Ltd. from 1987.	C64 Arcade	Shoot'em Up	https://www.lemon64.com/uploads/c64/images/games/screens/zynaps/zynaps_03.png	https://www.c64-wiki.com/wiki/Zynaps	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Zynaps-tFYah8t4DpEbKsLmZQZjIqBtAa5wu9.crt	{"type": "bcd", "length": 4, "address": "0xb915", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-11 18:59:25.081	2026-05-11 18:59:25.081	\N	null	null	t
cmp30g0x60000uw9ly8jmpt5w	ikari-warriors-c64	Ikari Warriors (C64)	Their mission is to infiltrate the jungle, fight through massive enemy forces, and rescue their commanding officer.	C64 Arcade	Shoot'em Up	https://www.c64-wiki.de/images/4/49/WIKIIKARI02x.jpg	https://www.c64-wiki.de/wiki/Ikari_Warriors_(Elite)	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Ikari_Warriors__Elite_-JU6GuxRi49nEfpZdTlng4rrQRLRYou.crt	{"type": "bcd", "length": 3, "address": "0x0086", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-12 19:15:14.731	2026-05-12 19:15:14.731	\N	null	null	t
cmp4f8cud000093jq7vxpu2ie	navy-seals-c64	Navy Seals (C64)	Navy Seal is a Commodore 64 miscellaneous arcade game released in 1989 by Cosmi.	C64 Arcade	Shoot'em Up	https://www.lemon64.com/uploads/c64/images/games/screens/navy_seals/navy_seals_03.png	https://www.lemon64.com/game/navy-seals	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Navy_Seals-OgH0ETvDbzq3qyiz25dSGCzL1q6nHl.crt	{"type": "bcd", "length": 3, "address": "0x827d", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-13 18:56:57.35	2026-05-13 18:56:57.35	\N	null	null	t
cmp5vwnag0000l8a3itmhqe6d	bc-ii-grog-s-revenge-c64	BC II: Grog's Revenge (C64)	The legend also speaks of a hairy monster that collects "clams" (Stone Age currency), whose primal scream knocks even the strongest cave man from the unicycle, and of a moneygrubbing bridge attendant named Peter, that should guard the bridges between the mountains and takes plenty of clams from you to let you pass.	C64 Arcade	Arcade	https://www.lemon64.com/uploads/c64/images/games/screens/grogs_revenge/grogs_revenge_03.png	https://www.c64-wiki.com/wiki/B.C._II_-_Grog%27s_Revenge	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/BC_II_-_Grog_s_Revenge-L7opvpVnkHUvGrNTdRcBcmnKOaLL4X.crt	{"type": "bcd", "length": 3, "address": "0x33c2", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-05-14 19:31:30.665	2026-05-14 19:31:30.665	\N	null	null	t
cmp8c89nv0000rxoopwx2zpk7	puzzle-bobble-c64	Puzzle Bobble (C64)	Puzzle Bobble is an arcade puzzle game released in 1994 by Taito for arcade machines and some 16-bit consoles.	C64 Arcade	Arcade	https://www.c64-wiki.com/images/6/6f/puzzlebobble_04_level1.png	https://www.c64-wiki.com/wiki/Puzzle_Bobble	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Puzzle_Bobble__kr_-S2rk8Ltci0ei7WuCV1E3SZYsgHUuvk.crt	{"type": "bcd", "length": 4, "address": "0x0080", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-16 12:43:59.083	2026-05-16 12:43:59.083	\N	null	null	t
cmp8r1moo0000gks2e0wt6d5x	bruce-lee-c64	Bruce Lee (C64)	Bruce Lee is searching for the evil sorcerer, to defeat him. Different traps and two enemies give Bruce a hard time.	C64 Arcade	Arcade	https://www.lemon64.com/uploads/c64/images/games/screens/bruce_lee/bruce_lee_03.png	https://www.lemon64.com/game/bruce-lee	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Bruce_Lee__J1_-aWl3RbiAbkFifpxwgqQNygd3hwGWVI.crt	{"type": "bcd", "length": 3, "address": "0x4389", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-16 19:38:43.608	2026-05-16 19:38:43.608	\N	null	null	t
cmo3clkct0000w06wsavlaxfx	testcrt	TestCRT		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Tapper-85keC6SH3XgNggoRVxwNJJH9nQVXMF.crt	{"type": "digits", "length": 4, "address": "0x0804", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-04-17 20:15:46.254	2026-05-17 19:43:41.642	\N	null	null	f
cmpa85ygv0001v9dsk33ksjq6	testbcd-big-endian	TestBCD Big Endian		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Bubble_Bobble_Remastered_1.1b-mFH7fzt17ZhBIw58i1XcVw2Qm8hFqB.prg	{"type": "bcd", "length": 3, "address": "0x0400", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 10}	2026-05-17 20:25:45.152	2026-05-17 20:27:12.792	\N	null	null	f
cmpa8aq1e0002v9ds2kou84ld	teststring	TestString		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/gyruss-LTv3DtlLgTdSOQFuRLYu09joVSPHEp.t64	{"type": "string", "length": 6, "address": "0x042a", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-17 20:29:27.506	2026-05-17 20:30:46.341	\N	null	null	f
cmpa8fv7t0003v9dsmmr6uqxw	testint	TestInt		C64 Arcade		\N	\N	https://pydlpsnafqhe1ivb.public.blob.vercel-storage.com/roms/Qix-C0KaZP5Db3MWhjc9x1TWTgJbXUVgJH.crt	{"type": "int", "length": 3, "address": "0x1560", "baseOffset": "0x4f9eb0", "endianness": "big", "multiplier": 1}	2026-05-17 20:33:27.497	2026-05-17 20:38:26.089	\N	null	null	f
\.


--
-- Data for Name: Score; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Score" (id, value, "userId", "gameSlug", "createdAt", "updatedAt", difficulty) FROM stdin;
cmolxne960002145x66son4yb	10475	cmnymyvbb0000uo0jmfl1egtu	burger-time-c64	2026-04-30 20:24:54.763	2026-04-30 20:24:54.763	0
cmo8zulcq0003rk6ktcxa1df7	35650	cmnymyvbb0000uo0jmfl1egtu	gyruss-c64	2026-04-21 19:05:29.498	2026-04-21 19:05:29.498	0
cmoagzur1000235fonoj2t8vh	30700	cmnymyvbb0000uo0jmfl1egtu	space-station-23-c64	2026-04-22 19:53:14.606	2026-04-22 19:53:14.606	0
cmoda8hyw0003euyx0eskx8ej	43618	cmnymyvbb0000uo0jmfl1egtu	bounder-c64	2026-04-24 19:07:19.161	2026-04-24 19:07:19.161	0
cmo6tx3qe0002mphszdd8m79h	115610	cmnymyvbb0000uo0jmfl1egtu	bubble-bobble-remastered-c64	2026-04-20 06:43:56.583	2026-04-30 20:51:55.487	0
cmokivej40003sfmk7li0li8v	7285	cmnymyvbb0000uo0jmfl1egtu	nebulus	2026-04-29 20:43:27.952	2026-05-06 12:25:54.992	0
cmofywz320002841xxyobo4ra	7950	cmnymyvbb0000uo0jmfl1egtu	bagman-strikes-back-c64	2026-04-26 16:13:44.222	2026-04-26 16:13:44.222	5
cmog5tezj00039bbp70ctqkwi	475	cmnymyvbb0000uo0jmfl1egtu	the-great-giana-sisters-c64	2026-04-26 19:26:55.52	2026-04-26 19:26:55.52	0
cmohkt0ij0003y0hh60l3x566	13240	cmnymyvbb0000uo0jmfl1egtu	missile-defence-c64	2026-04-27 19:14:17.179	2026-05-01 12:57:16.898	0
cmoepe2af0003fgmd0sth4w51	9800	cmnymyvbb0000uo0jmfl1egtu	international-karate-c64	2026-04-25 18:59:19.192	2026-04-27 13:36:58.666	0
cmm15ukyt000104i245fh1euj	5720	cmm15ujmy000004i2y63qrl8h	dig-dug-revival-c64	2026-02-24 22:11:52.613	2026-03-27 17:03:00.078	2
cmn9bl5bp0002f9hd47dugtfs	17240	cmldv9ajt000004jsu6myau9h	mike-mech-c64	2026-03-27 19:54:21.878	2026-03-27 19:54:21.878	4
cmohjcgof0002i4ylfbynhp0v	28800	cmnymyvbb0000uo0jmfl1egtu	santa-s-troubles-c64	2026-04-27 18:33:25.359	2026-04-27 18:33:25.359	5
cmo9vm4m60002svxsu3a9c2al	25610	cmnymyvbb0000uo0jmfl1egtu	galaga-c64	2026-04-22 09:54:42.271	2026-05-06 13:41:15.082	0
cmnassmwy0002pyq2liwf8c80	30430	cmldv9ajt000004jsu6myau9h	randompac-c64	2026-03-28 20:43:50.914	2026-03-28 20:43:50.914	3
cmoilz1w00002p4zawsxkkc9s	2720	cmnymyvbb0000uo0jmfl1egtu	space-invaders-c64	2026-04-28 12:34:44.688	2026-04-28 12:34:44.688	2
cmnj8x6ag0002howdwyls4kl7	17630	cmldv9ajt000004jsu6myau9h	lady-pac-c64	2026-04-03 18:37:25.912	2026-04-03 18:37:25.912	37
cmolu1a3d0003po2d9rqw0414	12612	cmnymyvbb0000uo0jmfl1egtu	hyper-sports-c64	2026-04-30 18:43:44.089	2026-04-30 18:43:44.089	0
cmndlldhq0002hrvlrl7j19el	20200	cmldv9ajt000004jsu6myau9h	the-last-defender-c64	2026-03-30 19:45:33.326	2026-03-30 19:54:33.287	2
cmouh4nxh0002g8c6lxc6e520	69642	cmnymyvbb0000uo0jmfl1egtu	qix-taito-c64	2026-05-06 19:52:22.566	2026-05-06 19:52:22.566	0
cmnkoj3qr00021hvtc9y5hzm3	10710	cmldv9ajt000004jsu6myau9h	mike-mech-2-c64	2026-04-04 18:42:09.459	2026-04-04 18:42:09.459	0
cmoo9xpf30002gjafe4b3rq15	84270	cmnymyvbb0000uo0jmfl1egtu	rainbow-islands	2026-05-02 11:44:23.535	2026-05-02 11:44:23.535	0
cmoopdcso00034kpt64wnl7bo	459	cmnymyvbb0000uo0jmfl1egtu	night-knight-c64	2026-05-02 18:56:27.912	2026-05-02 18:56:27.912	0
cmo4q6qam0003wjrsc3jlqpoq	1885	cmnymyvbb0000uo0jmfl1egtu	yoomp-c64	2026-04-18 19:23:54.911	2026-05-02 20:02:47.783	0
cmoq6p8r40003hpfkks7mhb8i	300	cmnymyvbb0000uo0jmfl1egtu	wolfling-c64	2026-05-03 19:49:22.192	2026-05-03 19:49:22.192	0
cmo39gvm80002j4xjxyi9wrpc	45300	cmnymyvbb0000uo0jmfl1egtu	commando-c64	2026-04-17 18:48:08.72	2026-05-06 20:15:03.16	0
cmorjn7w00003vlicyb4g3qww	10900	cmnymyvbb0000uo0jmfl1egtu	scramble	2026-05-04 18:39:28.944	2026-05-04 18:39:28.944	0
cmnf0y37q00021026rqgo9wkp	46520	cmldv9ajt000004jsu6myau9h	tutankham-c64	2026-03-31 19:43:06.951	2026-03-31 19:43:06.951	3
cmnnjkc7e0002mef35fxad3oo	16760	cmldv9ajt000004jsu6myau9h	scout-the-stray-c64	2026-04-06 18:46:27.531	2026-04-06 18:46:27.531	3
cmnoz8fsf0002wjq40bq6f8ol	38400	cmldv9ajt000004jsu6myau9h	bagman-comes-back-c64	2026-04-07 18:52:52.336	2026-04-07 18:52:52.336	5
cmobvf61l0003t5sgeghz53um	5750	cmnymyvbb0000uo0jmfl1egtu	superstar-chefs-c64	2026-04-23 19:24:49.881	2026-05-05 14:28:51.24	0
cmoszyb4q0003ozx0ux6kg7u4	17500	cmnymyvbb0000uo0jmfl1egtu	rodland-c64	2026-05-05 19:03:46.395	2026-05-05 19:03:46.395	0
cmovwbmlf00034id5zrmyinjw	2200	cmnymyvbb0000uo0jmfl1egtu	batman-the-movie-c64	2026-05-07 19:45:27.844	2026-05-07 19:45:27.844	0
cmon985qa00034jxzzivoji62	37875	cmnymyvbb0000uo0jmfl1egtu	lode-runner-c64	2026-05-01 18:36:45.442	2026-05-08 11:44:45.754	0
cmoypuqm60002hsmw559t7dkd	26830	cmnymyvbb0000uo0jmfl1egtu	arkanoid-c64	2026-05-09 19:07:40.735	2026-05-09 19:07:40.735	0
cmnymyvm00002uo0jalx0t2ru	340250	cmnymyvbb0000uo0jmfl1egtu	dig-dug-revival-c64	2026-04-14 13:07:12.648	2026-05-09 21:13:29.283	9
cmoizqx930003kygo9gubfvsa	7770	cmnymyvbb0000uo0jmfl1egtu	uridium-c64	2026-04-28 19:00:20.055	2026-05-11 18:53:41.257	0
cmp1kjads0004ugv8r30i2ww7	5425	cmnymyvbb0000uo0jmfl1egtu	zynaps-c64	2026-05-11 19:02:06.928	2026-05-12 09:22:26.495	0
cmp2n64pf0002gae1kap4f7jk	4500	cmnymyvbb0000uo0jmfl1egtu	galaxian-c64	2026-05-12 13:03:38.067	2026-05-12 13:03:38.067	0
cmp30n9xj0002k5vdycpp2dd3	19600	cmnymyvbb0000uo0jmfl1egtu	ikari-warriors-c64	2026-05-12 19:20:53	2026-05-12 19:20:53	0
cmoxcrwwm0003g3vwvzrk2g79	4430	cmnymyvbb0000uo0jmfl1egtu	dropzone-c64	2026-05-08 20:13:47.734	2026-05-13 14:16:14.984	0
cmp4fb5uj000393jqdt4tj0cr	800	cmnymyvbb0000uo0jmfl1egtu	navy-seals-c64	2026-05-13 18:59:08.252	2026-05-14 07:59:39.73	0
cmo4tuy5600038y2o1ou6zlsa	10700	cmnymyvbb0000uo0jmfl1egtu	ghosts-n-goblins-c64	2026-04-18 21:06:43.674	2026-04-19 08:12:54.732	0
cmp5w1om30003l8a30z5x3v01	1090	cmnymyvbb0000uo0jmfl1egtu	bc-ii-grog-s-revenge-c64	2026-05-14 19:35:25.66	2026-05-14 19:35:25.66	0
cmp8cfwrk0002c9kv7zy3743h	148880	cmnymyvbb0000uo0jmfl1egtu	puzzle-bobble-c64	2026-05-16 12:49:55.616	2026-05-16 12:49:55.616	0
cmp8reeub0002fexfli843unc	19200	cmnymyvbb0000uo0jmfl1egtu	bruce-lee-c64	2026-05-16 19:48:39.972	2026-05-16 19:48:39.972	0
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."User" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") FROM stdin;
cmlglfn80000004jrrnaxl2nv	Stefano Carminati	stmscarminati@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIY1tl-7OF6XcCHu7LtynKlmcBLrPRhSrg0RcR-3FkP5DnthA=s96-c	2026-02-10 12:44:59.855	2026-04-14 13:18:51.067
cml6jh92s000004jo4swszcwv	Christian Carminati	03chriscar@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocKce4TYhvGRb7rR6hyOHTBVjxSTcuuG3a_d32LIuzPhUDhbxg=s96-c	2026-02-03 11:52:33.844	2026-04-26 14:19:04.717
cmnymyvbb0000uo0jmfl1egtu	Stefano Carminati	carminati.poste99@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocJHz8kG9ZC-tPdXTMfZV15Bcw3ymLnEdGFqfMqmqGpmr482zfM=s96-c	2026-04-14 13:07:12.26	2026-05-16 19:48:39.369
cmm15ujmy000004i2y63qrl8h	daniela mombelli	d.mombelli69@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocLWX2CaE2zPr8KfA8iX8z-eEVrbLSLpBFlodOPrVgLmfJvbIUM=s96-c	2026-02-24 22:11:50.89	2026-02-24 22:11:50.89
cmlfkiu9e000004lberwxslcj	Luca Carminati	lucacarminati1967@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocK18CYWh1a9HyRUK_WX5Ad6F8ou5YkpVipCVRn7yqVO3sNHUg=s96-c	2026-02-09 19:31:43.154	2026-03-23 17:27:24.167
cmmq41zra0000r5ybf4tjcaz2	Giuliano Mombelli	g.mombelli41@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIsgtvW_NYtBnzKKvnP7uWqzZZc4a3eLIDMKAfZZYLRdrAFqw=s96-c	2026-03-14 09:15:53.379	2026-03-14 09:15:53.379
cmlpevvo5000004lapkhmf6qq	Massimo Carminati	max.carminati99@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocJCPhIAf-G2KKlqdeRMp8TCvlK7q__bJ1hD-dM93OklumpjbA=s96-c	2026-02-16 16:51:35.573	2026-02-16 16:51:35.573
cmldv9ajt000004jsu6myau9h	Stefano CAR	scarminati458@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIjCE8oN6B0OaWknnDb7dGAaXvwQ5u-NfUfrI46WfQIi37-HpI=s96-c	2026-02-08 14:56:41.128	2026-04-12 19:46:31.498
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d66f462c-63b8-451d-851e-d500bd497a1b	0ad34f51688573ac200f904b498d50aae70d455eb5dc95efada8671c96a841c3	2026-04-08 08:12:05.179547+00	20260408000000_add_published_to_game		\N	2026-04-08 08:12:05.179547+00	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: Score Score_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Game_slug_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Game_slug_key" ON public."Game" USING btree (slug);


--
-- Name: Score_userId_gameSlug_difficulty_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Score_userId_gameSlug_difficulty_key" ON public."Score" USING btree ("userId", "gameSlug", difficulty);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Score Score_gameSlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_gameSlug_fkey" FOREIGN KEY ("gameSlug") REFERENCES public."Game"(slug) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Score Score_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BIsxnHrbIgDE3celfgfr8WAeUTTc8UG8SS9la8ui6ZNrtFkt1jwwOeA5vozXhoh

