
-- Update the password for user 'oddit' to 'bypass'
-- First, we need to generate the SHA-256 hash for 'bypass'
-- The hash for 'bypass' is: 8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd92adbce1c29b4d1

UPDATE terminal_users 
SET password_hash = '8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd92adbce1c29b4d1'
WHERE username = 'oddit';
