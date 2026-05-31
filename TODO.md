# TODO — Match Leave Backend API Contract

- [ ] Step 1: Update `schemas.py` to add an approval request schema for absences that uses `AbsenceStatus` values (`approved`/`rejected`) and request body `{ "status": ... }`.
- [ ] Step 2: Update `POST /absences/` in `backend/main.py` to explicitly write `resolved=false`, set/format notifications with exact `notification_type`, `title`, and `content`, and set `is_read=false` explicitly.
- [ ] Step 3: Update HOD notification logic/content to exactly match spec wording.
- [x] Step 4: Update `PUT /absences/{absence_id}/approve` in `backend/main.py` to use the new schema and to enforce exact error messages and status transitions.

- [ ] Step 5: Ensure `GET /absences/my` response shape matches the required fields.
- [ ] Step 6: Run a quick backend start/import check.

