-- V17: Ensure the primary admin user exists and always has the ADMIN role
INSERT INTO users (
    name,
    email,
    password_hash,
    status,
    role,
    email_verified_at,
    created_at,
    updated_at
)
VALUES (
    'Admin (Shadi)',
    'shadisbaih20014@gmail.com',
    crypt('Skillmark2024!', gen_salt('bf')),
    'ACTIVE',
    'ADMIN',
    now(),
    now(),
    now()
)
ON CONFLICT (email) DO UPDATE
SET role = 'ADMIN',
    updated_at = now();
