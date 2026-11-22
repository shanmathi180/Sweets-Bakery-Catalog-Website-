/*
# Restrict profiles INSERT to safe columns

## Overview
Revokes the broad INSERT grant on profiles and re-grants INSERT on only the safe
columns (id, full_name, phone, avatar_url). This prevents a user from setting
is_admin=true during sign-up.

## Security
- Users can INSERT (id, full_name, phone, avatar_url) but NOT is_admin.
- is_admin defaults to false and can only be changed by service_role.
*/

REVOKE INSERT ON profiles FROM authenticated;
GRANT INSERT (id, full_name, phone, avatar_url) ON profiles TO authenticated;
