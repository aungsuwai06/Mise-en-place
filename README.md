# Mise en Place — World Recipes 🍽️

A PHP + MySQL web application for browsing 300+ world recipes (via TheMealDB API),
with user authentication (register / login / logout).

---

## Project Structure

```
mise-en-place/
├── docker-compose.yml       # Orchestrates web + mysql + phpmyadmin
├── php/
│   └── Dockerfile           # PHP 8.2 + Apache + PDO/MySQL
├── mysql/
│   └── init.sql             # Creates user_login DB + users table
└── src/                     # All PHP/CSS/JS served by Apache
    ├── login.php
    ├── register.php
    ├── logout.php
    ├── recipe-website.php   # Main page (auth required)
    ├── recipe.php           # Single recipe detail (auth required)
    ├── db_connect.php       # PDO connection singleton
    ├── functions.php        # h(), setToken(), checkToken(), validation()
    ├── header.php           # Authenticated nav bar
    ├── header_guest.php     # Logo-only bar for login/register
    ├── footer.php
    ├── css/
    │   └── styles.css
    └── js/
        └── recipes.js       # TheMealDB API client + UI logic
```

---

## Quick Start (Docker)

### Prerequisites
- Docker Desktop (or Docker Engine + Compose v2)

### Steps

```bash
# 1. Clone or extract this project
cd mise-en-place

# 2. Start all services
docker compose up --build -d

# 3. Wait ~15 seconds for MySQL to initialise, then open:
#    App        → http://localhost:8080
#    phpMyAdmin → http://localhost:8081
```

### Stop
```bash
docker compose down          # keep DB data
docker compose down -v       # also delete DB volume
```

---

## Bugs Fixed

| File | Bug | Fix |
|------|-----|-----|
| `login.php` / `register.php` | Stray ` ``` ` triple-backtick fences inside HTML | Removed |
| `login.php` / `register.php` | `include("header copy.php")` — space in filename breaks PHP | Renamed to `header_guest.php` |
| `recipe-website.php` | CSS href `/CodeUnited/css/styles.css` (absolute dev path) | Changed to `css/styles.css` |
| `logout.php` | Redirected to `register.php` after logout | Fixed to `login.php` |
| `recipe.php` | Raw `$_GET['id']` injected into API URL (SSRF / crash risk) | `filter_input(FILTER_VALIDATE_INT)` + null guard |
| `recipe.php` | No check for API returning null — fatal crash | Added `$apiError` path with user-friendly message |
| `recipe.php` | Auth guard redirected to `register.php` | Fixed to `login.php` |
| `recipies.js` | Filename typo (`recipies`) | Renamed to `recipes.js` |
| `recipies.js` | No error handling on `api()` calls | `try/catch` + user-visible error messages on all async functions |
| `db_connect.php` | `charset=utf8` (3-byte) | Upgraded to `charset=utf8mb4` |
| `functions.php` | CSRF token compared with `!==` (timing-safe issue) | Changed to `hash_equals()` |
| `docker-compose.yml` | `build: ./php` context pointed at root | Added `./php/` subfolder; added MySQL `healthcheck` so web container waits |
| `recipes.php` / `categories.php` | Unused static data files (never included anywhere) | Removed (TheMealDB API provides all data dynamically) |
| `welcome.php` | Orphan page — duplicate of recipe-website.php | Removed |

---

## Tech Stack

- **PHP 8.2** (Apache via Docker)
- **MySQL 8.0** with PDO prepared statements
- **Bootstrap 4.5** (auth forms only)
- **TheMealDB** public REST API (no key required)
- **Vanilla JS** — no build step needed
