--
-- PostgreSQL database dump
--

\restrict 1W2cgQFuEjdCSGFHgRYGHaBzpc2YIJLkl50TPNaNrKu8sJeH5o7pVqQjyJbjADg

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.1

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
    "difficultyConfig" jsonb
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
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Game" (id, slug, title, description, platform, genre, "imageUrl", url, "romPath", "scoreConfig", "createdAt", "updatedAt", "youtubeUrl", "difficultyConfig") FROM stdin;
cml6h0ax9000h5ii02xfch0e6	bagman-comes-back-c64	Bagman Comes Back (C64)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982.	C64	Platformer	https://img.itch.zone/aW1nLzc0OTc2MTgucG5n/315x250%23c/AR8XCY.png	https://lowcarb.itch.io/bagman-comes-back-c64-version	/roms/bagmancomesback.d64	{"type": "bcd", "length": 3, "address": "0x0e85", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.853	2026-02-09 20:50:13.555	\N	\N
cml6h0awj000g5ii0nz5u27m0	tutankham-c64	Tutankham (C64)	This game is a C64 conversion of Tutankham, an arcade game developed by Konami in 1982.	C64	Action	https://img.itch.zone/aW1nLzgyMDg0NjcucG5n/315x250%23c/rwtb72.png	https://lowcarb.itch.io/tutankham-c64	/roms/tutankham.d64	{"type": "bcd", "length": 3, "address": "0x00c0", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.826	2026-02-13 19:35:10.257	\N	null
cml6h0av9000e5ii0eur7lfa0	tutankham-returns-c64	Tutankham Returns (C64)	This game is a tribute to Tutankham, an arcade game developed by Konami in 1982.	C64	Action	https://img.itch.zone/aW1nLzg0ODM5NzkucG5n/315x250%23c/E1jWJ6.png	https://lowcarb.itch.io/tutankham-returns-c64	/roms/tutankhamreturns.d64	{"type": "bcd", "length": 3, "address": "0x00c0", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.781	2026-02-13 19:45:42.596	\N	null
cml6h0ako00015ii0sxmleugi	space-invaders-one-button-c64	Space Invaders One Button (C64)	This game is a C64 conversion of Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	C64	Shooter	https://img.itch.zone/aW1nLzIxMTM2OTM5LnBuZw==/315x250%23c/HLjg%2FB.png	https://lowcarb.itch.io/space-invaders-one-button-c64	/roms/SpaceInvadersOneButton.d64	{"type": "bcd", "length": 3, "address": "0x0c96", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.4	2026-02-12 19:41:04.984	\N	null
cml6h0anm00045ii0g2w5dwxi	randompac-c64	RandomPac (C64)	RandomPac is a tribute to Pac-Man, an arcade game released by Namco in 1980.	C64	Action	https://img.itch.zone/aW1nLzIzNzE3NjU0LnBuZw==/315x250%23c/HqJDzf.png	https://lowcarb.itch.io/randompac-c64	/roms/RandomPac.d64	{"type": "bcd", "length": 3, "address": "0x0f09", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.506	2026-02-11 20:43:42.473	\N	null
cml6h0at6000b5ii0dooxbgjn	scout-the-stray-c64	Scout The Stray (C64)	This game runs perfectly on both PAL and NTSC models of the Commodore 64.	C64	Action	https://img.itch.zone/aW1nLzEwNzI1Nzc1LnBuZw==/315x250%23c/G5bYwG.png	https://lowcarb.itch.io/scout-the-stray-c64	/roms/ScoutTheStray.d64	{"type": "bcd", "length": 3, "address": "0x1e29", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.706	2026-02-12 19:26:22.805	\N	null
cml6h0auj000d5ii0acuvoagw	mike-mech-c64	Mike Mech (C64)	This game runs perfectly on both PAL and NTSC models of the Commodore 64.	C64	Platformer	https://img.itch.zone/aW1nLzk3NDI2ODMucG5n/315x250%23c/RwkyeI.png	https://lowcarb.itch.io/mike-mech-c64	/roms/mikemech.d64	{"type": "bcd", "length": 3, "address": "0x1df6", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.755	2026-02-11 20:12:36.739	\N	null
cml6h0axx000i5ii0vtuhojjz	lady-pac	Lady Pac (PC)	Lady Pac is a homage to Ms. Pac-Man, an arcade game published by Midway in 1982.	PC	Action	https://img.itch.zone/aW1nLzY3MDkwMzcucG5n/315x250%23c/hJMKw7.png	https://lowcarb.itch.io/lady-pac-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-03 10:43:23.876	2026-02-11 14:17:28.25	https://www.youtube.com/watch?v=aiqsij1pmGU	null
cml6h0alu00025ii0bnoaekwa	space-invaders-c64	Space Invaders (C64)	This game is a C64 conversion of Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	C64	Shooter	https://img.itch.zone/aW1nLzIwNjk0NDQxLnBuZw==/315x250%23c/GXcYtk.png	https://lowcarb.itch.io/space-invaders-c64	/roms/SpaceInvaders.d64	{"type": "bcd", "length": 3, "address": "0x0c78", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.442	2026-02-12 19:35:00.232	\N	null
cml6h0asd000a5ii09ahfa6ll	mike-mech	Mike Mech (PC)	Gameplay	PC	Platformer	https://img.itch.zone/aW1nLzEwODY4NjgxLnBuZw==/315x250%23c/h1JzAT.png	https://lowcarb.itch.io/mike-mech-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-03 10:43:23.677	2026-02-11 14:17:44.62	https://www.youtube.com/watch?v=ofCXmeJQRxQ	null
cml6h0az6000k5ii0oxuf6xog	dig-dug-revival	Dig Dug Revival (PC)	This game is a homage to Dig Dug, an arcade game developed by Namco in 1982.	PC	Action	https://img.itch.zone/aW1nLzU1MDc5OTMucG5n/315x250%23c/LT%2FPty.png	https://lowcarb.itch.io/dig-dug-revival	/roms/DigDugRevival.d64	{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.922	2026-02-11 14:16:54.357	https://www.youtube.com/watch?v=-OHMLXBxPAg	null
cml6h0ap300065ii09a1dnnps	dig-dug-c64	Dig Dug (C64)	This game is a C64 conversion of Dig Dug, an arcade game developed by Namco in 1982.	C64	Action	https://img.itch.zone/aW1nLzE0NTUzNDk3LnBuZw==/315x250%23c/Wymflj.png	https://lowcarb.itch.io/dig-dug-c64	/roms/digdug.d64	{"type": "bcd", "length": 3, "address": "0x1295", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.559	2026-02-10 19:43:34.332	\N	null
cml6h0avv000f5ii0l9iavuq3	bagman-strikes-back-c64	Bagman Strikes Back (C64)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982. It is also the sequel to Bagman Comes Back.	C64	Platformer	https://img.itch.zone/aW1nLzgzMTc0NDIucG5n/315x250%23c/%2FD4cFR.png	https://lowcarb.itch.io/bagman-strikes-back-c64	/roms/bagmanstrikesback.d64	{"type": "bcd", "length": 3, "address": "0x0aa7", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.803	2026-02-09 20:33:34.382	\N	\N
cml6h0ayj000j5ii0aqbrbujp	lady-pac-c64	Lady Pac (C64)	Lady Pac is a homage to Ms. Pac-Man, an arcade game published by Midway in 1982.	C64	Action	https://img.itch.zone/aW1nLzYzNzExMjAucG5n/315x250%23c/p0Mx3W.png	https://lowcarb.itch.io/lady-pac	/roms/LadyPac.d64	{"type": "bcd", "length": 3, "address": "0x0a7e", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.899	2026-02-10 20:00:10.3	\N	null
cml6h0aqs00085ii0b81nj396	dig-dug-revival-c64	Dig Dug Revival (C64)	This game is a homage to Dig Dug, an arcade game developed by Namco in 1982.	C64	Action	https://img.itch.zone/aW1nLzE0NTYzODQ5LnBuZw==/315x250%23c/BOc2V2.png	https://lowcarb.itch.io/dig-dug-revival-c64	/roms/DigDugRevival.d64	{"type": "bcd", "length": 3, "address": "0x12cf", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.62	2026-02-09 13:59:43.83	\N	\N
cmli1og9n000104l52f978rn3	h-e-r-o-is-back-c64	H.E.R.O. Is Back (C64)	The hardworking miners of Mount Leone have been locked in the cave system through sudden volcanic activities. Our hero Roderick Hero now starts for the search of the missing persons with his special equipment (backpack helicopter, integrated helmet laser and dynamite). After a successful rescue, the player reaches the next level.	C64	Platformer	https://img.itch.zone/aW1nLzIyNDIzNzU2LnBuZw==/315x250%23c/gH8igG.png	https://lowcarb.itch.io/hero-is-back-c64	/roms/HeroIsBack.d64	{"type": "bcd", "length": 3, "address": "0x1e2a", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-11 13:07:30.779	2026-02-11 13:07:30.779	\N	null
cml6h0azu000l5ii0zu11a1et	bagman-comes-back	Bagman Comes Back (PC)	This game is a homage to Bagman, an arcade game released by Valadon Automation in 1982.	PC	Platformer	https://img.itch.zone/aW1nLzUwNzkyOTgucG5n/315x250%23c/YMRGlq.png	https://lowcarb.itch.io/bagman-comes-back		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.946	2026-02-11 14:15:17.153	https://www.youtube.com/watch?v=HVzHGuLwRXA	null
cml6h0atv000c5ii0pf14d12k	bagman-strikes-back	Bagman Strikes Back (PC)	This game is a tribute to Bagman, an arcade game released by Valadon Automation in 1982. It is also the sequel to Bagman Comes Back.	PC	Platformer	https://img.itch.zone/aW1nLzk3ODk4OTkucG5n/315x250%23c/wOKM4e.png	https://lowcarb.itch.io/bagman-strikes-back-pc-version		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-03 10:43:23.731	2026-02-11 14:16:40.627	https://www.youtube.com/watch?v=H06rj4o-v78	null
cmle7xnjd000004jp3abseel9	croins	Croins (Amiga)	Destroy all the Croin Asteroids and eliminate the enemy ships you will meet within them. Every four stages or so you'll have to face and destroy an enemy mother-ship. In the subsequent stage you will need to pick up as many diamonds as possible before time runs out.	Amiga	Shoot'em Up	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODQucG5n/794x1000/3JjZc1.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": ""}	2026-02-08 20:51:33.097	2026-02-08 20:53:19.874	\N	\N
cml6h0b2i000p5ii0pt91pgjo	divoc-91	Divoc-91 (PC)	This game is inspired by Gyruss, an arcade game designed by Yoshiki Okamoto and released by Konami in 1983.	PC	Shooter	https://img.itch.zone/aW1nLzQ0NjYzNjAucG5n/315x250%23c/DGfSxL.png	https://lowcarb.itch.io/divoc-91		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.041	2026-02-11 14:17:11.026	https://www.youtube.com/watch?v=3ysukAcDHTM	null
cmle8cz2o000004l1jqrk63ja	hyper-viper-amiga	Hyper Viper (Amiga)		Amiga	Arcade	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODUucG5n/794x1000/DmoAry.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": ""}	2026-02-08 21:03:27.888	2026-02-14 20:09:14.848	https://www.youtube.com/watch?v=qklVnnpDSsg	null
cml6h0b6h000v5ii0v6hhjrjm	randompac	RandomPac (PC)	RandomPac is a tribute to Pac-Man (Pakkuman), an arcade game released by Namco in 1980.	PC	Action	https://img.itch.zone/aW1nLzMyNDAwMzcucG5n/315x250%23c/DQb5oV.png	https://lowcarb.itch.io/randompac		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.185	2026-02-11 14:18:22.803	https://www.youtube.com/watch?v=dMDR9rEJNeA&t=1s	null
cml6h0b0j000m5ii01rfty9cy	space-invaders	Space Invaders (PC)	This game is a tribute to Space Invaders, the famous arcade game created by Tomohiro Nishikado in 1978.	PC	Shooter	https://img.itch.zone/aW1nLzQ4MjU5MTIucG5n/315x250%23c/kn0shr.png	https://lowcarb.itch.io/space-invaders	/roms/SpaceInvaders.d64	{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.971	2026-02-11 14:18:41	https://www.youtube.com/watch?v=iuBUGMH_jXo	null
cmljuc9j8000004l4om67nvrw	santa-s-troubles-c64	Santa's Troubles (C64)	This game runs perfectly on both PAL and NTSC models of the Commodore 64.	C64	Platformer	https://img.itch.zone/aW1nLzE0MjgyMjg5LnBuZw==/315x250%23c/85aV%2FD.png	https://lowcarb.itch.io/santastroubles	/roms/santa'stroubles.d64	{"type": "bcd", "length": 3, "address": "0x0cd1", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-12 19:17:37.22	2026-02-12 19:17:37.22	\N	null
cml6h0b4j000s5ii0xycxm5j1	tutankham-returns	Tutankham Returns (PC)	This game is a homage to Tutankham, an arcade game developed by Konami in 1982.	PC	Action	https://img.itch.zone/aW1nLzM3MzE0MjcucG5n/315x250%23c/rJZufH.png	https://lowcarb.itch.io/tutankham-returns		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.115	2026-02-11 14:18:56.829	https://www.youtube.com/watch?v=HgkxAKum8i8	null
cmlh2ubxg000004l1447wdljr	lock-n-chase-c64	Lock'n'Chase (C64)	This game is a C64 conversion of Lock'n'Chase, an arcade game developed by DECO in 1981.	C64	Action	https://img.itch.zone/aW1nLzE1MDQyNDEzLnBuZw==/315x250%23c/k5lSfq.png	https://lowcarb.itch.io/locknchase-c64	/roms/Lock'n'Chase.d64	{"type": "bcd", "length": 3, "address": "0x1354", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-10 20:52:18.532	2026-02-10 20:52:18.532	\N	null
cml6h0ams00035ii0zh8m2be5	mike-mech-2-c64	Mike Mech 2 (C64)	This game runs perfectly on both PAL and NTSC models of the Commodore 64.	C64	Platformer	https://img.itch.zone/aW1nLzE5NzA0NjE5LnBuZw==/315x250%23c/nUGY6u.png	https://lowcarb.itch.io/mike-mech-2-c64	/roms/mikemech2.d64	{"type": "bcd", "length": 3, "address": "0x14d1", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 1}	2026-02-03 10:43:23.476	2026-02-11 20:31:36.124	\N	null
cml6h0b36000q5ii0qselshxr	pac-mazing	Pac-Mazing (PC)	Pac-Mazing is a homage to Pac-Mania, an arcade game developed by Namco in 1987.	PC	Action	https://img.itch.zone/aW1nLzQwMTY5MDQucG5n/315x250%23c/yKCGaV.png	https://lowcarb.itch.io/pac-mazing		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:24.066	2026-02-11 14:18:06.052	https://www.youtube.com/watch?v=qm2hCy934uw	null
cml6h0ari00095ii0lxek0i08	the-last-defender-c64	The Last Defender (C64)	This game runs perfectly on both PAL and NTSC models of the Commodore 64.	C64	Shooter	https://img.itch.zone/aW1nLzEyMDczMjQ3LnBuZw==/315x250%23c/Oc6AWY.png	https://lowcarb.itch.io/the-last-defender-c64	/roms/thelastdefender.d64	{"type": "bcd", "length": 3, "address": "0x0f69", "baseOffset": "0x4f9eb0", "endianness": "little", "multiplier": 10}	2026-02-03 10:43:23.646	2026-02-13 19:25:04.926	\N	null
cml6h0b17000n5ii0can5bu03	amiga-games-pack	Amiga games pack	These are the games I programmed in the years 1995/1998 for the Commodore Amiga.	Amiga	Retro	https://img.itch.zone/aW1nLzQ2NDQzODEucG5n/315x250%23c/4Z0T%2FY.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": ""}	2026-02-03 10:43:23.995	2026-02-14 20:08:43.275	https://www.youtube.com/watch?v=qklVnnpDSsg	null
cmlmqshdw000004jywq4w8two	kangy	Kangy	The likeable Kangy, a cute kangaroo, has to make his way around screen after screen of platforms littered with fruit and populated with nasty creatures. The fruit must be collected and deposited in wooden boxes in order for Kangy to progress to the next screen.	Amiga	Platform	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODYucG5n/794x1000/QFPZOO.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 20:01:33.956	2026-02-14 20:09:27.187	https://www.youtube.com/watch?v=qklVnnpDSsg	null
cmlmq3bjb000004l48xyn7hrf	marietto-amiga	Marietto (Amiga)	This game is the conversion of the original Marietto game I programmed for the Commodore Amiga in 1997.	Amiga	Action	https://img.itch.zone/aW1nLzMyNTgwOTEucG5n/315x250%23c/YTUeul.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 19:41:59.975	2026-02-14 20:09:43.501	https://www.youtube.com/watch?v=qklVnnpDSsg	null
cmlmr1a27000104jycalcg57z	slalom-speciale	Slalom speciale	In it you ski around the flags on the way to the finish line and try to get the best time possible, with penalties for missed flags, it supports up to 8 players.	Amiga	Sports	https://img.itch.zone/aW1hZ2UvODI4NzAzLzQ2NDQwODcucG5n/794x1000/J6809B.png	https://lowcarb.itch.io/amiga-games-pack		{"type": "byte", "length": 1, "address": "", "baseOffset": "", "endianness": "big", "multiplier": 1}	2026-02-14 20:08:24.367	2026-02-14 20:10:19.573	https://www.youtube.com/watch?v=qklVnnpDSsg	null
\.


--
-- Data for Name: Score; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."Score" (id, value, "userId", "gameSlug", "createdAt", "updatedAt", difficulty) FROM stdin;
cmlf3g24b0001eai0545os2na	260	cml6jh92s000004jo4swszcwv	dig-dug-revival-c64	2026-02-09 11:33:39.899	2026-02-09 11:33:39.899	0
cmlfkiuu8000104lbvb1s0wgc	10280	cmlfkiu9e000004lberwxslcj	dig-dug-revival-c64	2026-02-09 19:31:43.904	2026-02-09 19:31:43.904	0
cmlfmwd4a000104jrbv2ksido	7210	cmldv9ajt000004jsu6myau9h	bagman-strikes-back-c64	2026-02-09 20:38:13.354	2026-02-09 20:38:13.354	0
cmlfnhur3000104lb8xrpb3d9	15160	cmldv9ajt000004jsu6myau9h	bagman-comes-back-c64	2026-02-09 20:54:55.982	2026-02-09 20:54:55.982	0
cmlglfo7l000104jrihybnur7	105640	cmlglfn80000004jrrnaxl2nv	bagman-strikes-back-c64	2026-02-10 12:45:01.137	2026-02-10 12:45:01.137	0
cmlh0jhwh000104jv4mtwvmwz	7620	cmldv9ajt000004jsu6myau9h	dig-dug-c64	2026-02-10 19:47:53.825	2026-02-10 19:47:53.825	0
cmlh143g2000304jvq3hj458y	3210	cmldv9ajt000004jsu6myau9h	lady-pac-c64	2026-02-10 20:03:54.866	2026-02-10 20:03:54.866	0
cmlh2z5fm000204l1d9fg986s	3160	cmldv9ajt000004jsu6myau9h	lock-n-chase-c64	2026-02-10 20:56:03.394	2026-02-10 20:56:03.394	0
cmli1t2zj000304l5nu1pj3le	4355	cmldv9ajt000004jsu6myau9h	h-e-r-o-is-back-c64	2026-02-11 13:11:06.847	2026-02-11 13:11:06.847	0
cmlifndla000104jgg4cmxk01	119130	cmlfkiu9e000004lberwxslcj	bagman-comes-back-c64	2026-02-11 19:38:35.278	2026-02-11 19:38:35.278	0
cmlihqpcf000304jve4wawv8p	1150	cmldv9ajt000004jsu6myau9h	mike-mech-2-c64	2026-02-11 20:37:09.711	2026-02-11 20:37:09.711	0
cmlii48u0000504jvy9xc72ww	2810	cmldv9ajt000004jsu6myau9h	randompac-c64	2026-02-11 20:47:41.495	2026-02-11 20:47:41.495	0
cmljuhnbi000204l4j3bbgtlu	3330	cmldv9ajt000004jsu6myau9h	santa-s-troubles-c64	2026-02-12 19:21:48.366	2026-02-12 19:21:48.366	0
cmljus5st000404l4aolverf4	4080	cmldv9ajt000004jsu6myau9h	scout-the-stray-c64	2026-02-12 19:29:58.877	2026-02-12 19:29:58.877	0
cmljv9s8p000804l4ob1012r7	230	cmldv9ajt000004jsu6myau9h	space-invaders-one-button-c64	2026-02-12 19:43:41.113	2026-02-12 19:43:41.113	0
cmlla5lp3000104jsftwn097i	950	cmldv9ajt000004jsu6myau9h	the-last-defender-c64	2026-02-13 19:28:06.423	2026-02-13 19:28:06.423	0
cmllaii5c000104l5xwwe12ae	1220	cmldv9ajt000004jsu6myau9h	tutankham-c64	2026-02-13 19:38:08.352	2026-02-13 19:38:08.352	0
cmllaw6g6000304l5yhjjk9y8	1340	cmldv9ajt000004jsu6myau9h	tutankham-returns-c64	2026-02-13 19:48:46.374	2026-02-13 19:48:46.374	0
cmlfbpdom000104lda4ywj6lp	262190	cmldv9ajt000004jsu6myau9h	dig-dug-revival-c64	2026-02-09 15:24:51.718	2026-02-13 20:45:10.132	0
cmljv27vq000604l4j27436rq	2250	cmldv9ajt000004jsu6myau9h	space-invaders-c64	2026-02-12 19:37:48.134	2026-02-13 22:15:17.952	0
cmlih6mc4000104jv539swmxx	17100	cmldv9ajt000004jsu6myau9h	mike-mech-c64	2026-02-11 20:21:32.692	2026-02-14 15:08:09.625	0
cmlpevw9k000104lagdp8af8i	4970	cmlpevvo5000004lapkhmf6qq	mike-mech-c64	2026-02-16 16:51:36.344	2026-02-16 16:51:36.344	0
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
cml6jh92s000004jo4swszcwv	Christian Carminati	03chriscar@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocKce4TYhvGRb7rR6hyOHTBVjxSTcuuG3a_d32LIuzPhUDhbxg=s96-c	2026-02-03 11:52:33.844	2026-02-09 11:33:39.533
cmlglfn80000004jrrnaxl2nv	Stefano Carminati	stmscarminati@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIY1tl-7OF6XcCHu7LtynKlmcBLrPRhSrg0RcR-3FkP5DnthA=s96-c	2026-02-10 12:44:59.855	2026-02-10 12:44:59.855
cmlfkiu9e000004lberwxslcj	Luca Carminati	lucacarminati1967@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocK18CYWh1a9HyRUK_WX5Ad6F8ou5YkpVipCVRn7yqVO3sNHUg=s96-c	2026-02-09 19:31:43.154	2026-02-11 19:38:34.335
cmldv9ajt000004jsu6myau9h	Stefano CAR	scarminati458@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocIjCE8oN6B0OaWknnDb7dGAaXvwQ5u-NfUfrI46WfQIi37-HpI=s96-c	2026-02-08 14:56:41.128	2026-02-14 15:08:08.722
cmlpevvo5000004lapkhmf6qq	Massimo Carminati	max.carminati99@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocJCPhIAf-G2KKlqdeRMp8TCvlK7q__bJ1hD-dM93OklumpjbA=s96-c	2026-02-16 16:51:35.573	2026-02-16 16:51:35.573
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
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

\unrestrict 1W2cgQFuEjdCSGFHgRYGHaBzpc2YIJLkl50TPNaNrKu8sJeH5o7pVqQjyJbjADg

