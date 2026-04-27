# myLEDGER
_A Linked Entity Data & Governance Engine for Relationships_

myLEDGER is a private, self-hosted relationship CRM built to help you track the people in your network — organized by category and filtered by status.

---

## Features

### Contact Management
Each contact stores:
- **Name** (required)
- **Role** and **Company** — shown together as a subtitle on the card
- **Where Met** — displayed as a badge on the card
- **LinkedIn**, **Email**, **Phone** — rendered as clickable links with icons
- **Status** — `Actual` (confirmed contact) or `Potential` (someone you intend to connect with)
- **Categories** — a contact can belong to one or more categories simultaneously
- **Notes** — free-form text entered one bullet per line; stored as an ordered list and rendered as bullet points on the card

Contacts can be created, edited, and deleted. Deleting prompts a confirmation before the record is removed.

### Category Management
- Create custom categories with unique names
- An **Other** category is always available as a fallback and is always sorted last
- Categories cannot be deleted while they have contacts assigned to them
- Drag-and-drop reordering of categories is supported — order is persisted to the database

### CRM Board View
The main view renders contacts organized into **category sections**. Within each section, contacts are split into two sub-groups:
- **Actual** — people you are actively connected with
- **Potential** — people you want to connect with

Contacts that belong to multiple categories appear under each of their assigned categories.

### Search & Filter
- **Search bar** — instantly filters contacts by name, company, or role (client-side, no round-trip)
- **Filter bar** — toggle one or more category filters; an "All" button clears all filters
- **Edit mode** on the filter bar enables drag-and-drop reordering of the category buttons; order changes are saved to the server immediately

### Floating Action Button (FAB)
A `+` button fixed to the bottom-right of the screen expands into two options:
- **+ Contact** — opens the Add/Edit Contact modal
- **+ Category** — opens the Add Category modal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router DOM v7 |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Backend | Express 5, Node.js, TypeScript (tsx) |
| Database | MongoDB |

---

## Data Model

### Contact
```
id, name, role, company, where_met, linkedin, email, phone,
category_ids[], status ('actual' | 'potential'),
created_at, updated_at, notes[]
```

### Note
```
id, contact_id, body, position
```

### Category
```
id, name, created_at
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories in saved order (Other always last) |
| POST | `/api/categories` | Create a new category |
| PUT | `/api/categories/order` | Persist drag-and-drop category order |
| DELETE | `/api/categories/:id` | Delete a category (blocked if contacts exist) |
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Create a new contact |
| PUT | `/api/contacts/:id` | Update an existing contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

---

## Running Locally

1. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `DB_NAME`.
2. Install dependencies:
   ```bash
   cd app && npm install
   ```
3. Start both client and server in development mode:
   ```bash
   npm run start
   ```
   The client runs via Vite with HMR; the server runs via `tsx` on the port defined by `SERVER_PORT` (default `8000`).

4. To build for production:
   ```bash
   npm run build
   ```
   The server then serves the compiled client from `client/dist`.
