/**
 * End-to-end test script for the Professionals API.
 *
 * Run the server first (npm run dev), then in a second terminal: npm test
 *
 * It talks to the real API over HTTP, exactly like a browser or Postman would,
 * and checks that every route replies with the status code and data we expect.
 * The last section connects to MongoDB directly to check the `creator` relation.
 *
 * HEADS UP: this writes to the REAL database in your .env — it creates documents
 * and then deletes them again. Everything it makes is tagged with a per-run id,
 * and cleanup only ever removes what this run created.
 */

// Load .env so we default to the same PORT the server actually uses.
require("dotenv").config();

const BASE_URL =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const API = `${BASE_URL}/api`;

// ---------------------------------------------------------------------------
// Tiny test helpers (no test framework, so the script has zero dependencies)
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(method, path, body) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(`${API}${path}`, options);

  // Some replies have no body (or a non-JSON one); don't let that throw.
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { status: response.status, data };
}

// A valid-looking ObjectId that is (almost certainly) not in the database.
const MISSING_ID = "000000000000000000000000";

// Unique email per run so re-running the script doesn't hit "User already exists".
const runId = Date.now();
const testEmail = `student${runId}@test.com`;
const testPassword = "secret123";

// Every document this script creates gets recorded here so cleanup can delete
// exactly what we made — and nothing else that happens to be in the database.
const createdProfessionalIds = [];

// The schema wants a description of at least 20 characters, so keep one valid
// sample in a constant rather than retyping it in every test.
const TEST_DESCRIPTION =
  "An experienced professional used only by the automated tests.";

// Builds a complete, valid request body. Pass overrides to break exactly one
// field at a time — that way a failing test proves the rule it's named after,
// instead of failing because some unrelated field was missing.
function validProfessional(overrides = {}) {
  return {
    name: "Jane Doe",
    title: "Software Engineer",
    email: "jane@example.com",
    description: TEST_DESCRIPTION,
    ...overrides,
  };
}

// Opens one shared database connection, reusing it if we already have one.
async function connectDb() {
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState === 1) return mongoose;
  // Same DNS workaround as server.js — without it, resolving the Atlas address
  // times out on some networks.
  require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
  await mongoose.connect(process.env.MONGO_URI);
  return mongoose;
}

// ---------------------------------------------------------------------------
// Professionals CRUD
// ---------------------------------------------------------------------------

async function testProfessionals() {
  console.log("\nPROFESSIONALS — create");

  const created = await request("POST", "/professionals", validProfessional());
  check("POST valid returns 201", created.status === 201, `got ${created.status}`);
  check("POST returns the new document with an _id", Boolean(created.data?._id));
  check("POST stores the values we sent", created.data?.name === "Jane Doe" && created.data?.title === "Software Engineer");
  check("POST stores every field, not just name/title", created.data?.email === "jane@example.com" && created.data?.description === TEST_DESCRIPTION);
  check("POST adds timestamps", Boolean(created.data?.createdAt));

  const id = created.data?._id;
  if (id) createdProfessionalIds.push(id);
  if (!id) {
    console.log("  !! No id returned — skipping the rest of the CRUD tests.");
    return;
  }

  const missingFields = await request("POST", "/professionals", { name: "Only A Name" });
  check("POST without title/email/description returns 400", missingFields.status === 400, `got ${missingFields.status}`);

  // The schema's email rule rejects this. Mongoose throws a ValidationError, which
  // the route's catch turns into a 500 — a 400 would describe it more accurately,
  // and turning that into a 400 is left as an exercise (see the README).
  const badEmail = await request("POST", "/professionals", validProfessional({ email: "not-an-email" }));
  check("POST with a malformed email is rejected", badEmail.status >= 400, `got ${badEmail.status}`);
  if (badEmail.status === 500) {
    console.log("  NOTE  validation failure answers 500; ideally a validation error is 400.");
  }

  const shortName = await request("POST", "/professionals", validProfessional({ name: "Jo" }));
  check("POST with a too-short name is rejected", shortName.status >= 400, `got ${shortName.status}`);

  const shortDescription = await request("POST", "/professionals", validProfessional({ description: "Too short" }));
  check("POST with a too-short description is rejected", shortDescription.status >= 400, `got ${shortDescription.status}`);

  // title is free text now — anything sensible must be accepted, with no fixed list.
  const freeTextTitle = await request("POST", "/professionals", validProfessional({ title: "Ophthalmologist" }));
  check("POST accepts any job title (no enum any more)", freeTextTitle.status === 201, `got ${freeTextTitle.status}`);
  if (freeTextTitle.data?._id) createdProfessionalIds.push(freeTextTitle.data._id);

  console.log("\nPROFESSIONALS — read");

  const all = await request("GET", "/professionals");
  check("GET all returns 200", all.status === 200, `got ${all.status}`);
  check("GET all returns an array", Array.isArray(all.data));
  check("GET all includes the document we just created", Array.isArray(all.data) && all.data.some((p) => p._id === id));

  const one = await request("GET", `/professionals/${id}`);
  check("GET by id returns 200", one.status === 200, `got ${one.status}`);
  check("GET by id returns the right document", one.data?._id === id);

  const notFound = await request("GET", `/professionals/${MISSING_ID}`);
  check("GET by unknown id returns 404", notFound.status === 404, `got ${notFound.status}`);

  // "not-an-id" isn't a valid ObjectId at all, so Mongoose throws a CastError
  // before it ever queries. The catch turns that into a 500.
  const malformed = await request("GET", "/professionals/not-an-id");
  check("GET with a malformed id is rejected", malformed.status >= 400, `got ${malformed.status}`);
  if (malformed.status === 500) {
    console.log("  NOTE  malformed id answers 500; a bad id from the client is really a 400.");
  }

  console.log("\nPROFESSIONALS — update");

  const updated = await request("PUT", `/professionals/${id}`, validProfessional({
    name: "Jane Updated",
    title: "Lead Engineer",
  }));
  check("PUT returns 200", updated.status === 200, `got ${updated.status}`);
  check("PUT returns the UPDATED document (new: true)", updated.data?.name === "Jane Updated", `got ${updated.data?.name}`);
  check("PUT changed the title too", updated.data?.title === "Lead Engineer");

  const badUpdate = await request("PUT", `/professionals/${id}`, { name: "Only Name" });
  check("PUT without the other fields returns 400", badUpdate.status === 400, `got ${badUpdate.status}`);

  // runValidators: true means schema rules apply on update as well as create.
  const invalidUpdate = await request("PUT", `/professionals/${id}`, validProfessional({ email: "still-not-an-email" }));
  check("PUT with a malformed email is rejected (runValidators)", invalidUpdate.status >= 400, `got ${invalidUpdate.status}`);

  const updateMissing = await request("PUT", `/professionals/${MISSING_ID}`, validProfessional({ name: "Ghost User" }));
  check("PUT on an unknown id returns 404", updateMissing.status === 404, `got ${updateMissing.status}`);

  console.log("\nPROFESSIONALS — delete");

  const deleted = await request("DELETE", `/professionals/${id}`);
  check("DELETE returns 200", deleted.status === 200, `got ${deleted.status}`);

  const afterDelete = await request("GET", `/professionals/${id}`);
  check("GET after DELETE returns 404", afterDelete.status === 404, `got ${afterDelete.status}`);

  const deleteMissing = await request("DELETE", `/professionals/${MISSING_ID}`);
  check("DELETE on an unknown id returns 404", deleteMissing.status === 404, `got ${deleteMissing.status}`);
}

// ---------------------------------------------------------------------------
// Auth (register + login)
// ---------------------------------------------------------------------------

// A JWT is three base64 segments joined by dots. The middle one is the payload.
// It is signed, not encrypted, so anyone can read it — which is why passwords
// and secrets must never go in there.
function decodeJwtPayload(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    return null;
  }
}

async function testAuth() {
  console.log("\nAUTH — register");

  const registered = await request("POST", "/register", {
    email: testEmail,
    password: testPassword,
  });
  check("register returns 201", registered.status === 201, `got ${registered.status} ${JSON.stringify(registered.data)}`);
  check("register returns the new user's id", Boolean(registered.data?.user?.id));
  check("register NEVER returns the password", registered.data?.user?.password === undefined);

  const duplicate = await request("POST", "/register", { email: testEmail, password: testPassword });
  check("registering the same email twice returns 400", duplicate.status === 400, `got ${duplicate.status}`);
  check("duplicate gives a readable message", duplicate.data?.message === "User already exists", `got "${duplicate.data?.message}"`);

  // Emails are lowercased before saving AND before searching, so changing the
  // case must still count as the same account.
  const duplicateUpper = await request("POST", "/register", {
    email: testEmail.toUpperCase(),
    password: testPassword,
  });
  check("register is case-insensitive about the email", duplicateUpper.status === 400, `got ${duplicateUpper.status}`);

  const noPassword = await request("POST", "/register", { email: `x${runId}@test.com` });
  check("register without a password returns 400", noPassword.status === 400, `got ${noPassword.status}`);

  const shortPassword = await request("POST", "/register", { email: `y${runId}@test.com`, password: "123" });
  check("register with a short password returns 400", shortPassword.status === 400, `got ${shortPassword.status}`);

  console.log("\nAUTH — login");

  const loggedIn = await request("POST", "/login", { email: testEmail, password: testPassword });
  check("login returns 200", loggedIn.status === 200, `got ${loggedIn.status} ${JSON.stringify(loggedIn.data)}`);
  check("login returns a token", typeof loggedIn.data?.token === "string");

  const payload = loggedIn.data?.token ? decodeJwtPayload(loggedIn.data.token) : null;
  check("the token carries the user's email", payload?.email === testEmail, `got ${payload?.email}`);
  check("the token carries the user's id (needed for `creator`)", Boolean(payload?.id));
  check("the token does NOT carry the password", payload?.password === undefined);
  check("the token has an expiry", Boolean(payload?.exp));

  const upperLogin = await request("POST", "/login", { email: testEmail.toUpperCase(), password: testPassword });
  check("login works with a differently-cased email", upperLogin.status === 200, `got ${upperLogin.status}`);

  const wrongPassword = await request("POST", "/login", { email: testEmail, password: "wrongpassword" });
  check("login with the wrong password returns 400", wrongPassword.status === 400, `got ${wrongPassword.status}`);
  check("wrong password does NOT return a token", wrongPassword.data?.token === undefined);

  const unknownUser = await request("POST", "/login", { email: `nobody${runId}@test.com`, password: testPassword });
  check("login as an unknown user returns 400", unknownUser.status === 400, `got ${unknownUser.status}`);

  const noFields = await request("POST", "/login", {});
  check("login with no fields returns 400", noFields.status === 400, `got ${noFields.status}`);
}

// ---------------------------------------------------------------------------
// The creator relation (checked against the database, not the API, because no
// route sets `creator` yet — that needs auth middleware.)
// ---------------------------------------------------------------------------

async function testCreatorRelation() {
  console.log("\nMODEL — the creator relation");

  const User = require("../models/user");
  const Professional = require("../models/professional");

  await connectDb();

  const user = await User.create({
    email: `creator${runId}@test.com`,
    password: "not-a-real-hash",
  });

  const professional = await Professional.create(
    validProfessional({ name: "Owned Professional", creator: user._id }),
  );
  createdProfessionalIds.push(professional._id);
  check("a professional can store a creator", String(professional.creator) === String(user._id));

  // populate() follows the ref and swaps the stored id for the real user document.
  const populated = await Professional.findById(professional._id).populate("creator", "email");
  check("populate('creator') fetches the linked user", populated.creator?.email === `creator${runId}@test.com`, `got ${populated.creator?.email}`);

  // creator is intentionally optional for now, so this must still succeed.
  const orphan = await Professional.create(validProfessional({ name: "No Owner" }));
  createdProfessionalIds.push(orphan._id);
  check("creator is optional (create without it still works)", Boolean(orphan._id));
}

// ---------------------------------------------------------------------------
// Removes everything this run created. Called from a `finally` block, so it
// still runs when a test throws half way through — otherwise a crashed run
// would leave stray documents behind in a database everyone shares.
// ---------------------------------------------------------------------------

async function cleanup() {
  const mongoose = require("mongoose");
  try {
    await connectDb();
    const User = require("../models/user");
    const Professional = require("../models/professional");

    if (createdProfessionalIds.length > 0) {
      await Professional.deleteMany({ _id: { $in: createdProfessionalIds } });
    }
    // Only this run's users: the id in the email is the timestamp from startup.
    await User.deleteMany({ email: { $regex: `${runId}@test\\.com$` } });
    console.log("\n....  cleaned up this run's test data");
  } catch (error) {
    console.error(`\n!!    cleanup failed — check the database manually: ${error.message}`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

// ---------------------------------------------------------------------------

async function main() {
  console.log(`Testing ${BASE_URL}`);

  // Fail early with a clear message if the server isn't running.
  try {
    await fetch(`${API}/professionals`);
  } catch {
    console.error(`\nCannot reach ${BASE_URL}. Start the server first: npm run dev`);
    process.exit(1);
  }

  try {
    await testProfessionals();
    await testAuth();
    await testCreatorRelation();
  } finally {
    // Runs even if a test above throws, so we never leave test data behind.
    await cleanup();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("\nThe test script itself crashed:", error);
  process.exit(1);
});
