# Week 6 — nine tasks

The design and the markup are done. Every CSS class you need is already in
`src/App.css`, so you should not have to write any CSS. What is missing is the
React.

```bash
npm install
npm run dev
```

Work through the tasks in order. The app runs after every one of them.

---

### 1 — Event handling

`src/components/ProfessionalCard.jsx`

Make the **Contact** button print that professional's name in the console —
`Contacting John Doe`. Each card must log its own name.

### 2 — useState

`src/components/ProfessionalCard.jsx` · temporary

Add a click counter to the card. First do it wrong on purpose: a plain
`let count = 0` and a button that increments it. Watch the console count up
while the page never changes, and work out why. Then fix it with `useState`.
Delete the counter once you've seen the difference.

### 3 — Conditional rendering

`src/components/ProfessionalCard.jsx`

Make **Show info** work. The description starts hidden; clicking shows it and
clicking again hides it; the label changes to **Hide info**. Opening one card
must not open the other two.

### 4 — Lifting state up

`src/App.jsx`, `src/components/ProfessionalCard.jsx`

Make **Delete** remove the card. The list of professionals has to move into
state in `App` — a card cannot delete itself out of a list it doesn't own.
Pass a delete function down as a prop. Deleting one card must not disturb the
others: if another card is showing its info, it stays open.

### 5 — Derived state

`src/App.jsx`

Make the search box filter the cards as you type, by name, ignoring case.
When nothing matches, show `No professionals found` using
`<p className="state-message">`. Do not put the filtered list in state — work
it out while the page renders.

### 6 — Controlled form

`src/components/ProfessionalForm.jsx`, `src/App.jsx`

Make the form add a new professional. All four fields controlled by React and
held in **one object** of state, with **one** change handler for all of them.
Submitting adds a card and clears the form. The page must not reload.

### 7 — Validation

`src/components/ProfessionalForm.jsx`

Refuse to add a professional when the form is wrong:

- **Name** — cannot be empty
- **Title** — at least 3 characters
- **Email** — must look like an email address
- **Description** — at least 20 characters

Show each message under the field it belongs to, using
`<span className="form-error">`. Check on submit, not while they are typing.

### 8 — Editing

`src/App.jsx`, `src/components/ProfessionalForm.jsx`

Make **Edit** work. Clicking it fills the form with that professional's
details, the heading becomes `Edit professional`, the button becomes
`Save Changes`, and a **Cancel** button appears — only while editing. Saving
updates the existing card instead of adding a second one.

### 9 — Confirm delete

`src/App.jsx`

Ask before deleting, naming the professional: `Delete John Doe?`. Cancelling
leaves the list untouched. If you delete the professional you were editing,
the form goes back to "Add a professional".
