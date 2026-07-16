# Auth-Gated App Testing Playbook (Emergent Google Auth)

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date().toISOString(),
  build_count: 0,
  has_free_build: true
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```
NOTE: In this app, users use the `id` field (uuid), and user_sessions.user_id references users.id.

## Step 2: Test Backend API
```bash
curl -X GET "https://<app>/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://<app>/api/builds" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing (Playwright)
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "<app-domain>",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://<app>/dashboard")
```

## Checklist
- Session user_id matches user's id exactly
- All queries use {"_id": 0} projection
- /api/auth/me returns user data (not 401)
- Dashboard loads without redirect to login
- Logout deletes session and clears cookie

## Success Indicators
- /api/auth/me returns user data
- Dashboard loads without redirect
- CRUD operations work

## Failure Indicators
- "User not found" errors, 401 responses, redirect to login page

## Cleanup
```bash
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\.user\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```
