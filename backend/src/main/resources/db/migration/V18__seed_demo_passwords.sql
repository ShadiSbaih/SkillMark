-- V18: Set default password for demo accounts and ensure Maya is an admin
UPDATE users 
SET password_hash = crypt('Skillmark2024!', gen_salt('bf'))
WHERE email IN (
    'maya.owner@skillmark.local', 
    'omar.learner@skillmark.local', 
    'lina.learner@skillmark.local'
);

-- Ensure Maya has the ADMIN role so she can access the admin dashboard
UPDATE users
SET role = 'ADMIN'
WHERE email = 'maya.owner@skillmark.local';
